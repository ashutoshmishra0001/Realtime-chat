// Import required modules
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server);

// Serve static files from "public" folder
app.use(express.static("public"));

// Handle socket connections
io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  // When a new user joins with a username
  socket.on("new user", (username) => {
    socket.username = username; // Save username to socket
    socket.broadcast.emit("system message", `${username} joined the chat.`);
  });

  // When a user sends a chat message
  socket.on("chat message", (data) => {
    const msg = {
      user: data.user,
      text: data.text,
      time: new Date().toISOString(), // Add timestamp
    };
    console.log("Sending message:", msg);
    io.emit("chat message", msg); // Send to all clients
  });

  // Typing notification to others
  socket.on("typing", (user) => {
    socket.broadcast.emit("typing", user);
  });

  // When a user disconnects
  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("system message", `${socket.username} left the chat.`);
    }
    console.log("🔴 A user disconnected");
  });
});

// Start the server on port 3000 or the environment's port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
