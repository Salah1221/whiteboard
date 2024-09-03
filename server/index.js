import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { join } from "path";
import { config } from "dotenv";

config();

const app = express();
const server = createServer(app);
const io = new Server(server);

// Serve static files from the client directory
app.use(express.static(join(__dirname, "../client")));

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("draw", (data) => {
    // Broadcast the drawing data to all other clients
    socket.broadcast.emit("draw", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
