import React, { useEffect, useRef } from 'react';

const VideoChat = () => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);

    useEffect(() => {
        const startVideoChat = async () => {
            const localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            localVideoRef.current.srcObject = localStream;

            const iceServers = {
                iceServers: [
                    {
                        urls: 'stun:stun.l.google.com:19302',
                    },
                ],
            };

            peerConnection.current = new RTCPeerConnection(iceServers);
            localStream.getTracks().forEach((track) => {
                peerConnection.current.addTrack(track, localStream);
            });

            peerConnection.current.ontrack = (event) => {
                remoteVideoRef.current.srcObject = event.streams[0];
            };

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    // Send the candidate to the remote peer
                }
            };

            // Add your signaling logic here to exchange offer and answer between peers
        };

        startVideoChat();
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
