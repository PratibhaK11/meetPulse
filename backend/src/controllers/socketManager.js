import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        // Helper function to find the room where the user is connected
        const findUserRoom = (socketId) => {
            return Object.keys(connections).find((room) => connections[room].includes(socketId));
        };

        socket.on("join-call", (path) => {
            if (!connections[path]) {
                connections[path] = [];
            }

            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();

            // Notify users in the room about the new connection
            connections[path].forEach((id) => io.to(id).emit("user-joined", socket.id, connections[path]));

            // Send existing messages to the new user
            if (messages[path]) {
                messages[path].forEach((message) =>
                    io.to(socket.id).emit("chat-message", message.data, message.sender, message['socket-id-sender'])
                );
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            const room = findUserRoom(socket.id);

            if (room) {
                if (!messages[room]) {
                    messages[room] = [];
                }

                const newMessage = { sender, data, 'socket-id-sender': socket.id };
                messages[room].push(newMessage);

                console.log(`Message from ${sender} in room ${room}: ${data}`);

                connections[room].forEach((id) => io.to(id).emit("chat-message", data, sender, socket.id));
            }
        });
        
        socket.on("disconnect", () => {
            const room = findUserRoom(socket.id);
            if (room) {
                const timeSpentOnline = Math.abs(timeOnline[socket.id] - new Date());
                console.log(`User ${socket.id} disconnected after ${timeSpentOnline / 1000} seconds`);

                // Notify remaining users
                connections[room].forEach((id) => io.to(id).emit("user-left", socket.id));

                // Remove the user from the connections array
                connections[room] = connections[room].filter((id) => id !== socket.id);

                // Clean up empty rooms
                if (connections[room].length === 0) {
                    delete connections[room];
                }

                delete timeOnline[socket.id]; // Remove time tracking for the disconnected user
            }
        });
    });

    return io;
};
