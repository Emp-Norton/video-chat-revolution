import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const VideoChat = () => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const socketRef = useRef(null);

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

            // Create a peer connection
            const iceServers = {
                iceServers: [
                    {
                        urls: 'stun:stun.l.google.com:19302',
                    },
                ],
            };
            peerConnection.current = new RTCPeerConnection(iceServers);

            // Add the local stream to the peer connection
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
                    socketRef.current.emit('ice candidate', event.candidate);
                }
            };

            // Handle offer from the remote peer
            socketRef.current.on('offer', (offer) => {
                peerConnection.current.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: offer }));
                peerConnection.current.createAnswer()
                    .then((answer) => {
                        peerConnection.current.setLocalDescription(new RTCSessionDescription({ type: 'answer', sdp: answer }));
                        socketRef.current.emit('answer', answer);
                    })
                    .catch((error) => {
                        console.error('Error creating answer:', error);
                    });
            });

            // Handle answer from the remote peer
            socketRef.current.on('answer', (answer) => {
                peerConnection.current.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answer }));
            });

            // Handle ice candidates from the remote peer
            socketRef.current.on('ice candidate', (candidate) => {
                peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            });

            // Create and send an offer to the remote peer
            peerConnection.current.createOffer()
                .then((offer) => {
                    peerConnection.current.setLocalDescription(new RTCSessionDescription({ type: 'offer', sdp: offer }));
                    socketRef.current.emit('offer', offer);
                })
                .catch((error) => {
                    console.error('Error creating offer:', error);
                });
        };

        startVideoChat();

        return () => {
            if (peerConnection.current) {
                peerConnection.current.close();
            }
            if (socketRef.current) {
                socketRef.current.close();
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