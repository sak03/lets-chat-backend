const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");

// Fetch chat history between two users
router.get("/chats/:userId/:friendId", async (req, res) => {
    try {
        const { userId, friendId } = req.params;

        const messages = await Chat.find({
            $or: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId }
            ]
        }).sort({ createdAt: 1 }); // Sort messages in chronological order

        res.json(messages);
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

module.exports = router;
