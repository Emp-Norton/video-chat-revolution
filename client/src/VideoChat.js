import React, { useEffect, useRef } from 'react';
import { useSocket } from './SocketContext';

const VideoChat = ({ room }) => {
    const { socket, addSocketListener, emitSocketEvent } = useSocket();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);

    useEffect(() => {
        const iceServers = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ],
        };

        peerConnection.current = new RTCPeerConnection(iceServers);

        const handleIceCandidate = (event) => {
            if (event.candidate) {
                emitSocketEvent('ice-candidate', { room, candidate: event.candidate });
            }
        };

        const handleTrackEvent = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        peerConnection.current.onicecandidate = handleIceCandidate;
        peerConnection.current.ontrack = handleTrackEvent;

        const startVideoChat = async () => {
            const localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            localVideoRef.current.srcObject = localStream;

            localStream.getTracks().forEach((track) => {
                peerConnection.current.addTrack(track, localStream);
            });

            if (socket) {
                socket.emit('join', room);
            }
        };

        startVideoChat();

        addSocketListener('offer', async ({ offer }) => {
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);
                emitSocketEvent('answer', { room, answer });
            }
        });

        addSocketListener('answer', async ({ answer }) => {
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        addSocketListener('ice-candidate', ({ candidate }) => {
            if (peerConnection.current) {
                peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        return () => {
            if (peerConnection.current) {
                peerConnection.current.close();
            }
        };
    }, [socket, addSocketListener, emitSocketEvent, room]);

    const createOffer = async () => {
        if (peerConnection.current) {
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            emitSocketEvent('offer', { room, offer });
        }
    };

    return (
        <div>
            <h2>Video Chat</h2>
            <video ref={localVideoRef} autoPlay playsInline muted />
            <video ref={remoteVideoRef} autoPlay playsInline />
            <button onClick={createOffer}>Start Call</button>
        </div>
    );
};

export default VideoChat;
