const socket = io();

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const players = {};
let hazards = [];
let movement = { up: false, down: false, left: false, right: false };

window.addEventListener('keydown', e => {
  switch(e.key) {
    case 'ArrowUp': case 'w': movement.up = true; break;
    case 'ArrowDown': case 's': movement.down = true; break;
    case 'ArrowLeft': case 'a': movement.left = true; break;
    case 'ArrowRight': case 'd': movement.right = true; break;
  }
});

window.addEventListener('keyup', e => {
  switch(e.key) {
    case 'ArrowUp': case 'w': movement.up = false; break;
    case 'ArrowDown': case 's': movement.down = false; break;
    case 'ArrowLeft': case 'a': movement.left = false; break;
    case 'ArrowRight': case 'd': movement.right = false; break;
  }
});

socket.on('currentPlayers', data => {
  Object.assign(players, data);
});

socket.on('newPlayer', ({id, player}) => {
  players[id] = player;
});

socket.on('disconnectPlayer', id => {
  delete players[id];
});

socket.on('hazards', data => {
  hazards = data;
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'cyan';
  for (const id in players) {
    const p = players[id];
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'red';
  hazards.forEach(h => {
    ctx.fillRect(h.x, h.y, h.size, h.size);
  });
}

setInterval(() => {
  socket.emit('movement', movement);
  draw();
}, 1000 / 60);
