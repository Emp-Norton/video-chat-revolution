import React, { useState } from 'react';
import { useSocket } from './SocketContext';
import { SOCKET_URL } from "./constants";

const TextChat = ({ room }) => {
    const socket = useSocket(SOCKET_URL);
    console.log(`Socket: ${socket}\nURL: ${SOCKET_URL}`)
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const sendMessage = () => {
        if (!socket.socket) return
        socket.emit('message', { room, message });
        setMessages([...messages, message]);
        setMessage('');
    };
    if (!socket.socket) return
        debugger;
        socket.on('message', (message) => {
            setMessages((msgs) => [...msgs, message]);
        });

    return (
        <div>
            <h2>Text Chat</h2>
            <div>
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default TextChat;
