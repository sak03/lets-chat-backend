const socketIo = require("socket.io");

module.exports = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    const Chat = require("../models/Chat");
    const User = require("../models/User");

    let users = {};

    io.on("connection", (socket) => {
        console.log("✅ User connected:", socket.id);

        socket.on("join", async (userId) => {
            console.log(`📢 User joined: ${userId}`);
            if (!userId) return;
            users[userId] = socket.id;
            console.log(`🔵 User Joined: ${userId} | Socket ID: ${socket.id}`); // Debug
            console.log("🟢 Updated Users List:", users); // Debug users object
            await User.findByIdAndUpdate(userId, { isOnline: true });
            io.emit("updateUserStatus", { userId, isOnline: true });
        });

        // Send message event
        socket.on("sendMessage", async (data) => {
            console.log(`📩 Message sent:`, data);
            const { senderId, receiverId, message } = data;

            console.log("👥 Online Users:", users); // Debug users object

            const chat = new Chat({ senderId, receiverId, message });
            await chat.save();

            if (users[receiverId]) {
                console.log(`📨 Delivering to receiver: ${receiverId} at socket ${users[receiverId]}`);
                io.to(users[receiverId]).emit("receiveMessage", chat);
            } else {
                console.log(`❌ Receiver ${receiverId} is not online`);
            }
        });

        socket.on("disconnect", async () => {
            const user = Object.keys(users).find((key) => users[key] === socket.id);
            if (user) {
                console.log(`❌ User disconnected: ${user}`);
                await User.findByIdAndUpdate(user, { isOnline: false });
                io.emit("updateUserStatus", { userId: user, isOnline: false });
                delete users[user];
            }
        });
    });

    return io;
};
