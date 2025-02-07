require('./db/connection');
// const express = require("express");
// const cors = require('cors');

// require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
// const mongoose = require("mongoose");
const cors = require("cors");
const Chat = require("./models/Chat");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "http://localhost:5173" }
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log("MongoDB connected"))
//     .catch(err => console.log(err));

let users = {};

// Socket.io Events
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", async (userId) => {
        users[userId] = socket.id;
        await User.findByIdAndUpdate(userId, { isOnline: true });
        io.emit("updateUserStatus", { userId, isOnline: true });
    });

    socket.on("sendMessage", async (data) => {
        const { senderId, receiverId, message } = data;
        const chat = new Chat({ senderId, receiverId, message });
        await chat.save();

        if (users[receiverId]) {
            io.to(users[receiverId]).emit("receiveMessage", chat);
        }
    });

    socket.on("disconnect", async () => {
        const user = Object.keys(users).find((key) => users[key] === socket.id);
        if (user) {
            await User.findByIdAndUpdate(user, { isOnline: false });
            io.emit("updateUserStatus", { userId: user, isOnline: false });
            delete users[user];
        }
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
