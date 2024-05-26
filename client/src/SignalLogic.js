import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const VideoChat = () => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const socketRef = useRef(null);
    const [offer, setOffer] = useState(null);

    useEffect(() => {
        const startVideoChat = async () => {
            // Establish a WebSocket connection
            socketRef.current = io.connect('http://localhost:5000');

            // Get the local video and audio stream
            const localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            localVideoRef.current.srcObject = localStream;

            // Create a new peer connection
            const iceServers = {
                iceServers: [
                    {
                        urls: 'stun:stun.l.google.com:19302',
                    },
                ],
            };
            peerConnection.current = new RTCPeerConnection(iceServers);

            // Add the local stream tracks to the peer connection
            localStream.getTracks().forEach((track) => {
                peerConnection.current.addTrack(track, localStream);
            });

            // Handle incoming tracks from the remote peer
            peerConnection.current.ontrack = (event) => {
                remoteVideoRef.current.srcObject = event.streams[0];
            };

            // Handle ice candidates
            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socketRef.current.emit('icecandidate', event.candidate);
                }
            };

            // Handle offer creation
            socketRef.current.on('createoffer', async () => {
                const offer = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(new RTCSessionDescription({ type: 'offer', sdp: offer }));
                socketRef.current.emit('offer', offer);
            });

            // Handle offer receiving
            socketRef.current.on('offer', async (offer) => {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: offer }));
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(new RTCSessionDescription({ type: 'answer', sdp: answer }));
                socketRef.current.emit('answer', answer);
            });

            // Handle answer receiving
            socketRef.current.on('answer', async (answer) => {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answer }));
            });

            // Handle ice candidates receiving
            socketRef.current.on('icecandidate', async (candidate) => {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            });
        };

        startVideoChat();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    return (
        <div>
            <h2>Video Chat</h2>
            <video ref={localVideoRef} autoPlay playsInline muted />
            <video ref={remoteVideoRef} autoPlay playsInline />
        </div>
    );
};

export default VideoChat;