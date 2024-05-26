import React, { useState } from 'react';
import { useSocket } from './SocketContext';

const TextChat = ({ room }) => {
    const socket = useSocket();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const sendMessage = () => {
        socket.emit('message', { room, message });
        setMessages([...messages, message]);
        setMessage('');
    };
    if (socket) {
        socket.on('message', (message) => {
            setMessages((msgs) => [...msgs, message]);
        });
    }
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
