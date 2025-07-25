const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const players = {};
const hazards = [];

function createHazard() {
  // simple square moving in random direction
  const hazard = {
    id: Math.random().toString(36).substr(2, 9),
    x: Math.random() * 600,
    y: Math.random() * 400,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    size: 20
  };
  hazards.push(hazard);
}

setInterval(() => {
  if (hazards.length < 10) createHazard();
  hazards.forEach(h => {
    h.x += h.vx;
    h.y += h.vy;
    if (h.x < 0 || h.x > 780) h.vx *= -1;
    if (h.y < 0 || h.y > 580) h.vy *= -1;
  });
  io.emit('hazards', hazards);
}, 1000 / 30); // 30 fps update

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
  players[socket.id] = { x: 100, y: 100, hp: 100 };

  socket.emit('currentPlayers', players);
  socket.emit('hazards', hazards);
  socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] });

  socket.on('movement', (data) => {
    const player = players[socket.id];
    if (!player) return;
    if (data.left) player.x -= 3;
    if (data.up) player.y -= 3;
    if (data.right) player.x += 3;
    if (data.down) player.y += 3;
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
    delete players[socket.id];
    io.emit('disconnectPlayer', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
