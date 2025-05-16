import express from "express";
import { createServer } from "node:http"; // it connects socket instance and express instance
import { Server } from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app); // that means..jab hum sevrer chalayenge tb app and io donon chalega server pr
// const io = new Server(server);
const io = connectToSocket(server);
app.set("port", process.env.PORT || 8000);
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
app.get("/home", (req, res) => {
  return res.json({ Hello: "world" });
});

app.use("/api/v1/users", userRoutes);

const start = async () => {
  const connectionDb = await mongoose.connect(
    "mongodb+srv://syk2448:MyZoomApp@cluster0.ugscdkx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  );
  console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);
  server.listen(app.get("port"), () => {
    console.log("Listening on port 8000");
  });
};

start();
