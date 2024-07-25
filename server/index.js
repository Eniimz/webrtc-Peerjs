import express from 'express';
import http from 'http';
import { Server } from 'socket.io'
import { v4 as uuidV4 } from 'uuid'
import cors from 'cors'



const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    }
})


app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));



io.on('connection', (socket) => {

    console.log("A user connected")

    socket.on('join room', (roomId, userId) => {
        console.log(`roomId: ${roomId}`)
        socket.join(roomId);
        socket.to(roomId).emit('user connected', userId)

        socket.on('disconnect', () => {
            socket.to(roomId).emit("user-disconnected", userId)
        })
    })
 
})



server.listen(3000, () => {
    console.log("running on 3000")
})

