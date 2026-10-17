const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const players = {};
const colors = ['#e53e3e', '#3182ce', '#38a169', '#d69e2e', '#805ad5', '#e53e3e'];

io.on('connection', (socket) => {
    console.log('Bir oyuncu bağlandı:', socket.id);

    // Yeni bağlanan oyuncuya rastgele renk ve başlangıç konumu ver
    players[socket.id] = {
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        color: colors[Math.floor(Math.random() * colors.length)]
    };

    // Oyuncu hareket ettiğinde
    socket.on('move', (keys) => {
        const player = players[socket.id];
        if (!player) return;

        const speed = 5;
        if (keys.up && player.y > 0) player.y -= speed;
        if (keys.down && player.y < 570) player.y += speed;
        if (keys.left && player.x > 0) player.x -= speed;
        if (keys.right && player.x < 770) player.x += speed;
    });

    socket.on('disconnect', () => {
        console.log('Oyuncu ayrıldı:', socket.id);
        delete players[socket.id];
    });
});

// Sunucu saniyede 60 kez ekranı tüm oyuncular için günceller
setInterval(() => {
    io.emit('state', players);
}, 1000 / 60);

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Sunucu aktif: http://localhost:${PORT}`);
});