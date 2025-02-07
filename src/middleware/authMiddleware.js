const jwt = require("jsonwebtoken");

// const JWT_SECRET = "aVeryStrongRandomSecretKey123!@#";


const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract token from "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const JWT_SECRET = "aVeryStrongRandomSecretKey123!@#";
        const decoded = jwt.verify(token, JWT_SECRET);

        // console.log("Decoded Token:", decoded); // Debugging
        req.user = decoded; // Attach user data to request object
        next();
    } catch (error) {
        console.error("JWT Error:", error.message);
        res.status(400).json({ error: "Invalid token" });
    }
};

module.exports = authMiddleware;
