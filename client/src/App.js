import React from 'react';
import SocketProvider from './SocketContext';
import TextChat from './TextChat';
import GlobalChat from './GlobalChat';
import VideoChat from './VideoChat';

const App = () => {
    return (
        <SocketProvider>
            <div>
                <h1>Video Chat App</h1>
                <TextChat room="room1" />
                <GlobalChat />
                <VideoChat room="room1" />
            </div>
        </SocketProvider>
    );
};

export default App;
