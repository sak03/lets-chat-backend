require('./connection/connection');
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const socketSetup = require("./routers/socket");

const authRouter = require('./routers/authRoutes');
const usersRoute = require("./routers/usersRoutes");
const chatRoutes = require("./routers/chatRoutes");

const app = express();
const server = http.createServer(app);

// app.use(cors({ origin: "*" }));
app.use(cors({
    origin: "http://localhost:3000", // Allow only frontend
    methods: ["GET", "POST"],
    credentials: true, // Allow cookies & auth headers
}));
app.use(express.json());


app.use('/api/', authRouter);

app.use("/api/users", usersRoute);

app.use("/api/chat", chatRoutes);

// Pass the `server` to socket setup
const io = socketSetup(server);

app.get('/', async (req, res) => {
    res.send("Server is working fine!!")
})

// Start Server
const PORT = 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
