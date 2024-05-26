const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let users = {};

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('login', (userId) => {
    users[userId] = socket.id;
  });

  socket.on('call', (data) => {
    io.to(users[data.to]).emit('call', {
      from: data.from,
      signal: data.signal,
    });
  });

  socket.on('answer', (data) => {
    io.to(users[data.to]).emit('answer', {
      signal: data.signal,
      from: data.from,
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('message', (data) => {
    io.emit('message', data);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3001');
});
