import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import { connectToSocket } from "./controllers/socketManager.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server); 

// Setting the port
app.set("port", process.env.PORT || 8000);

// Middleware for CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// User routes
app.use("/api/v1/users", userRoutes);

// Database connection and server start function
const start = async () => {
    try {
        const connectionDb = await mongoose.connect("mongodb://127.0.0.1:27017/Zoom", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);

        // Start the server after the database is connected
        server.listen(app.get("port"), () => {
            console.log(`LISTENING ON PORT ${app.get("port")}`);
        });
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1); // Exit the process if there is a database connection error
    }
};

// Start the app
start();
