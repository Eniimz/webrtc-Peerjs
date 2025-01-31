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
const users = {}
const usersInRooms = {}
let addedUser;


app.use(cors({
    origin: 'http://client:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));



io.on('connection', (socket) => {

    console.log("A user connected")

    socket.on('join room', (roomId, userId, localUser) => {    
        
        if(!rooms[roomId]){
            rooms[roomId] = [];
        }

        if(userId){
            rooms[roomId].push(userId)
        }

        // console.log(`roomId: ${roomId}`)

        socket.emit("roomUsers", rooms[roomId])

        socket.join(roomId);


        socket.to(roomId).emit('user connected', userId)

        socket.emit('roomId', roomId)



        socket.on("leave-room", () => {

            socket.disconnect() //disconnecting socket on the server side
            
        })
        

        socket.on('disconnect', () => {
            
            rooms[roomId] = rooms[roomId].filter( (id) => {
                // console.log("id: ", id );
                // console.log("userId: ", userId)

                return id !== userId
            })
            
            let foundUsername = users[userId];

            let message = foundUsername ? `${foundUsername} left the room` : `A guest left the room`

                             
            socket.to(roomId).emit("user-disconnected", userId, message)

        })

        
    })

    

    socket.on("check-length", (roomId, peerId) => {

        // console.log("roomsArray: ", rooms[roomId])
        // console.log("room array length: ",rooms[roomId].length);

        if(rooms[roomId]){
            socket.emit("room-length", rooms[roomId].length)    
        }
        else{
            socket.emit("room doesnt exist")
        }

    })

    socket.on("username added", (roomId, username, userId) => { // when checking length is 4   < 4 ? no

        users[userId] = username
        console.log("Added user: ", username)
        // console.log("rooms[roomid].length: ", rooms[roomId]?.length)   //join room not emitted yet where user is added to array

        socket.to(roomId).emit("remote username", username)    
        
        let user = username ? `${username} joined the room` : `A guest joined the room`;

        if(rooms[roomId] && rooms[roomId].length < 4){
            socket.to(roomId).emit("user added message", user)
        }
        

    })

    
 
})



server.listen(3000, () => {
    console.log("running on 3000")
})

