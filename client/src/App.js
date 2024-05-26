import React from 'react';
import SocketProvider from './SocketContext';
import TextChat from './TextChat';
import GlobalChat from './GlobalChat';

const App = () => {
  return (
      <SocketProvider>
        <div>
          <h1>Video Chat App</h1>
          <TextChat room="room1" />
          <GlobalChat />
        </div>
      </SocketProvider>
  );
};

export default App;
