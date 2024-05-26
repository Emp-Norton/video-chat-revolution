import React, { useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

const GlobalChat = () => {
    const socket = useSocket();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const sendMessage = () => {
        socket.emit('message', { room: 'global', message });
        setMessages([...messages, message]);
        setMessage('');
    };

    useEffect(() => {
        if (!socket) return;

        socket.emit('join', 'global');
        socket.on('message', (message) => {
            setMessages((msgs) => [...msgs, message]);
        })

    }, [socket]);


    return (
        <div>
            <h2>Global Chat</h2>
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

export default GlobalChat;
