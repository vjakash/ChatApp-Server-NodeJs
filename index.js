const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('<h1>Hey Socket.io</h1>');
});
rooms = {};
clients = {};
io.on('connection', (socket) => {
    console.log(`${socket.id} connected to socket`);
    socket.on('create', (data) => {
        console.log(`user-${data.userName} joined Room-${data.roomName}`);
        if (rooms[data.roomName] === undefined) {
            rooms[data.roomName] = { users: [data.userName] };
        } else {
            rooms[data.roomName].users.push(data.userName);
        }
        clients[socket.id] = { roomName: data.roomName, userName: data.userName };
        socket.join(data.roomName);
        let users = rooms[clients[socket.id].roomName].users;
        io.sockets.in(clients[socket.id].roomName).emit('joined', users);
    })
    socket.on('sendMessage', (message) => {
        socket.to(clients[socket.id].roomName).emit('receiveMessage', message);
    })
    socket.on('disconnect', () => {
        if (clients[socket.id] !== undefined) {
            console.log(`user -${clients[socket.id].userName}  disconnected from room-${clients[socket.id].roomName}`);
            // console.log(rooms[clients[socket.id]["roomName"]]["users"]);
            let users = rooms[clients[socket.id].roomName]["users"];
            users.splice(users.indexOf(clients[socket.id].userName, 1));
            io.sockets.in(clients[socket.id].roomName).emit('joined', users);
            clients[socket.id] = undefined;
        }
    });
    socket.on('leave', () => {
        socket.disconnect();
    })
});
http.listen(port, () => {
    console.log('listening on *:' + port);
});