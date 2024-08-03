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

const rooms = {}

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));



io.on('connection', (socket) => {

    console.log("A user connected")

    socket.on('join room', (roomId, userId) => {    
        
        if(!rooms[roomId]){
            rooms[roomId] = [];
        }

        if(rooms[roomId].length === 1){
            socket.emit("room-full")
        }

        if(userId){
            rooms[roomId].push(userId)
        }

        console.log(`roomId: ${roomId}`)

        socket.emit("roomUsers", rooms[roomId])

        socket.join(roomId);
        socket.to(roomId).emit('user connected', userId)

        socket.on("leave-room", () => {

            socket.disconnect() //disconnecting socket on the server side
            
        })
        

        socket.on('disconnect', () => {
            
            rooms[roomId] = rooms[roomId].filter( (id) => {
                console.log("id: ", id );
                console.log("userId: ", userId)

                return id !== userId
            })

            console.log("room after disconnected", rooms[roomId])

            socket.to(roomId).emit("user-disconnected", userId)
        })
    })

    socket.on("check-length", (roomId, peerId) => {

        console.log("roomsArray: ", rooms[roomId])
        console.log("room array length: ",rooms[roomId].length);

        socket.emit("room-length", rooms[roomId].length)    

    })
 
})



server.listen(3000, () => {
    console.log("running on 3000")
})

