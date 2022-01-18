const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 3000 || process.env.PORT;
const botName = "Privo Bot";

app.use(express.static(path.join(__dirname, "public")));
console.clear();

io.on("connection", socket => {
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);

        console.log(getCurrentUser(socket.id));

        io.to(user.room).emit("message", formatMessage(`${user.username}`, msg));
    });

    socket.on("roomUsers", ({ room, users }) => {
        outputRoomName(room);
        outputUsers(users);
    });

    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        socket.emit("message", formatMessage(botName, "Benvenuto su Privo!"));

        socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} has joined the chat...`));

        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    socket.on("disconnect", () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat...`));

            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});