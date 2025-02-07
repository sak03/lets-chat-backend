const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route GET /api/users
 * @desc Get all users except the logged-in user
 * @access Private
 */

router.get("/friends", authMiddleware, async (req, res) => {
    try {
        const loggedInUserId = req.user.id;

        // Find the logged-in user and populate their friends list
        const user = await User.findById(loggedInUserId).populate("friends", "name _id");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Get all users except the logged-in user
        const allUsers = await User.find({ _id: { $ne: loggedInUserId } }, "name _id");

        // Get IDs of friends
        const friendsList = user.friends.map(friend => friend._id.toString());

        // Separate users into `friends` and `others`
        const friends = allUsers.filter(user => friendsList.includes(user._id.toString()));
        const others = allUsers.filter(user => !friendsList.includes(user._id.toString()));

        res.json({ friends, others });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

/**
 * @route PUT /api/users/add-friend/:friendId
 * @desc Add a friend to the user's friend list
 * @access Private
 */
router.put("/add-friend/:friendId", authMiddleware, async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const friendId = req.params.friendId;

        if (loggedInUserId === friendId) {
            return res.status(400).json({ error: "You cannot add yourself as a friend." });
        }

        const user = await User.findById(loggedInUserId);
        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.friends.includes(friendId)) {
            user.friends.push(friendId);
            await user.save();
        }

        res.json({ message: "Friend added successfully", friends: user.friends });
    } catch (error) {
        res.status(500).json({ error: "Failed to add friend" });
    }
});

module.exports = router;

