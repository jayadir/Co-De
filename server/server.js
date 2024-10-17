const express = require("express");
const http = require("http");
const app = express();
const cors=require('cors')
const { Server } = require("socket.io");
const port = 5000;
const server = http.createServer(app);
const io = new Server(server);
const redisClient = require("./redisClient");
app.use(cors())
const getRoomDetails = async (roomId) => {
  const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
  const participants = [];

  for (const client of clients) {
    const name = await redisClient.hget("participants", client);
    participants.push({
      id: client,
      name: name,
    });
  }

  return participants;
};

io.on("connection", (socket) => {
  console.log("User connected ", socket.id);
  socket.on("join-room", async (data) => {
    console.log(data);

    try {
      await redisClient.hset("participants", socket.id, data.name);
      console.log("Participant added to Redis");
    } catch (error) {
      console.error("Error adding participant to Redis", error);
    }

    socket.join(data.id);
    const participants = await getRoomDetails(data.id);
    console.log(participants);
    participants.forEach((participant) => {
      io.to(participant.id).emit("participant-joined", {
        participants,
        socketId: socket.id,
        name: data.name,
      });
    });
  });

  socket.on("disconnecting", async () => {
    const rooms = Array.from(socket.rooms);
    rooms.forEach(async (roomId) => {
      socket.in(roomId).emit("participant-left", {
        socketId: socket.id,
        name: await redisClient.hget("participants", socket.id),
      });
    });
    socket.leave();
    try {
      const exists = await redisClient.hexists("participants", socket.id);
      if (exists) {
        await redisClient.hdel("participants", socket.id);
        console.log(
          `Participant with socket ID ${socket.id} removed from Redis`
        );
      }
    } catch (error) {
      console.error("Error removing participant from Redis", error);
    }
  });
  socket.on("code-change", ({ roomId, code }) => {
    console.log("Code change event received");
    socket.in(roomId).emit("code-change", { code });
  });
  socket.on("sync-code", ({ code, to }) => {
    console.log("Sync code event received");
    socket.to(to).emit("code-change", { code });
  });
  socket.on("cursor-change", async ({ roomId, cursor }) => {
    console.log("Cursor change event received");
    const participant = await redisClient.hget("participants", socket.id);
    socket.in(roomId).emit("cursor-change", {
      cursor,
      participant,
    });
  });
});

server.listen(port,'0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
