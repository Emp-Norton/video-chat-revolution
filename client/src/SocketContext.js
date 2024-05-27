import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import {SOCKET_URL} from "./constants";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);
        return () => newSocket.close();
    }, []);

    const addSocketListener = (event, handler) => {
        if (socket) {
            socket.on(event, handler);
        }
    };

    const removeSocketListener = (event, handler) => {
        if (socket) {
            socket.off(event, handler);
        }
    };

    const emitSocketEvent = (event, data) => {
        if (socket) {
            socket.emit(event, data);
        }
    };

    return (
        <SocketContext.Provider value={{ socket, addSocketListener, removeSocketListener, emitSocketEvent }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
