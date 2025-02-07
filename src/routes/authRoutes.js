const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/api/register", async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.json({ message: "User registered successfully" });
    } catch (error) {
        res.status(400).json({ error: "User already exists" });
    }
});

router.post("api/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, "SECRET_KEY", { expiresIn: "7d" });
    res.json({ token, userId: user._id, name: user.name });
});

module.exports = router;
