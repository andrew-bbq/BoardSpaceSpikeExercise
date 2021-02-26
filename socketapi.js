const io = require("socket.io")();
const socketapi = {
    io: io
};

// socket io logic goes here
io.on("connection", (socket) => {
    socket.on("SendMessage", (data) => {
        socket.broadcast.emit("ReceiveMessage", data);
    });
});

module.exports = socketapi;