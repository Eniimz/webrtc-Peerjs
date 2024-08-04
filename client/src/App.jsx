import { useEffect, useState } from "react"
import uuid from 'react-uuid'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import Room from "./pages/Room";
import { useRef } from "react";
import { Peer } from 'peerjs'
import { populateSocket} from "./redux/socketSlice";
import { populatePeer, populatePeerId } from "./redux/peerSlice";
import { populateUsername, populateRoomId, populateRemoteUsername } from "./redux/userSlice";
import { useSelector, useDispatch } from 'react-redux';
import { Button } from "./components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { AlertCircle } from "lucide-react";

function App() {

  const [peerId, setpeerId] = useState(null);
  const [create, setCreate] = useState(false)
  const [input, setInput] = useState("");
  const [isRoomFull, setIsRoomFull] = useState(null)
  const [joinClicked, setJoinClicked] = useState(false)
  const [username, setUsername] = useState(null)
  const [roomId, setRoomId] = useState(null)

  const navigate = useNavigate(); 
  const dispatch = useDispatch();
  
  let socket = useRef(null)
  let roomLength = useRef(null);

  
  const peer = new Peer()

  useEffect(() => {

    socket.current = io("http://localhost:3000")
    

    console.log("Use Effect ran..(socket)")

    dispatch(populateSocket(socket.current));
    dispatch(populatePeer(peer))

  }, [])

  

  useEffect(() => {

    console.log("use Effect (peerjs) ran... ")

    peer.on('open', (id) => {
      console.log("This my peer id: ", id)
      setpeerId(id)
      dispatch(populatePeerId(id));
    })
    

  }, [])
  
  
  const handleCreate = async () => {

    let roomId = uuid();

    dispatch(populateUsername(username))
    setRoomId(roomId)
    socket.current.emit('join room', roomId, peerId, username);

    navigate(`/room/${roomId}`);

  }

  const handleInput = (event) => {
    setInput(event.target.value)
  }

  useEffect(() => {
    socket.current.on("room-length", (length) => {

      console.log("length passed in client: ", length)
  
      if(length === 4){
        console.log("4 members in room, room full")
        setIsRoomFull(true)
      }
      else{
        
        socket.current.emit('join room', input, peerId, username)
        navigate(`/room/${input}`);
        console.log("Room not full")
      }
      })

      return () => {
        socket.current.off("room-length")
      }

  }, [joinClicked])

  useEffect(() => {

    console.log("roomId in useEffect: ", roomId)
    dispatch(populateRoomId(roomId))

  }, [roomId])

  const handleJoin = () => {

    dispatch(populateUsername(username))
    console.log("username entered: ", username)
    socket.current.emit("username added", input, username, peerId)
    
    socket.current.emit("check-length", input, peerId)  //which then emits room-length event
    setJoinClicked((prevValue) => !prevValue)

  }


  return (
    <>
      <div className='flex justify-center items-center bg-[#09090b] h-screen'> 

        <div className="flex flex-col gap-5 border p-10 rounded-md bg-background">

          {
            peerId && <h1 className="text-white">Peer Id: {peerId}</h1>
          }

          {
          isRoomFull && 
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                The room is already full!
              </AlertDescription>
            </Alert>

          }

          
          <input type="text" placeholder="Enter your name..." className="rounded-lg text-black p-3" onChange={(e) => setUsername(e.target.value)}/>
          
          <div className="flex gap-5">
            <Button className="bg-primary hover:bg-primary/90 p-7 font-bold text-foreground rounded-lg" onClick={handleJoin}> Join Room </Button>
            <input className="rounded-lg text-black" type="text" value={input} onChange={(e) => handleInput(e)} />
          </div>

          <Button className="bg-primary-special p-6 rounded-lg hover:bg-primary-special/90 font-bold text-foreground" onClick={handleCreate}> Create Room </Button>
        </div>

      </div>
    </>

  )
}

export default App

