const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('New client connected');
  if (socket) {
    socket.on('join', (room) => {
      socket.join(room);
    });

    socket.on('message', (data) => {
      io.to(data.room).emit('message', data.message);
    });

    // Handle WebRTC signaling messages
    socket.on('offer', (data) => {
      io.to(data.room).emit('offer', data.offer);
    });

    socket.on('answer', (data) => {
      io.to(data.room).emit('answer', data.answer);
    });

    socket.on('ice-candidate', (data) => {
      io.to(data.room).emit('ice-candidate', data.candidate);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
