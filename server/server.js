// server/server.js (ESM)
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import path from "path"; // ✅ THIS WAS MISSING

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import adminDocumentsRoutes from "./routes/adminDocumentsRoutes.js";
import geminiRoute from "./routes/geminiRoute.js";

import db from "./config/db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// existing REST routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/documents", documentRoutes);
app.use("/api/admin/documents", adminDocumentsRoutes);
app.use("/api/gemini", geminiRoute);


// serve uploaded files (so frontend can open document links)
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));





// Create HTTP server then attach socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

let activeUsers = 0;

io.on("connection", (socket) => {
  activeUsers++;
  console.log("⚡ Active users:", activeUsers);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`✅ User joined room ${room}`);
  });

  socket.on("sendMessage", (data) => {
    const { room, user, role, text, time } = data;

    // ✅ Save chat message to DB with role and timestamp
    db.query(
      "INSERT INTO chats (booking_id, sender, role, message, timestamp) VALUES (?, ?, ?, ?, ?)",
      [room, user, role || "User", text, new Date()],
      (err) => {
        if (err) console.error("❌ Error saving chat:", err);
        else console.log("💬 Chat saved:", { room, user, role, text });
      }
    );

    // ✅ Emit to everyone in the same room
    io.to(room).emit("receiveMessage", { user, role, text, time });
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit('hey', {signal: data.signalData, from: data.from});
  });

  socket.on("acceptCall", (data) => {
    io.to(data.to).emit('callAccepted', data.signal);
  });

  socket.on("disconnect", () => {
    activeUsers--;
    console.log("❌ User disconnected. Active users:", activeUsers);
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
