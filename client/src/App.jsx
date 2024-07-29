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
import { useSelector, useDispatch } from 'react-redux';
import { Button } from "./components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { AlertCircle } from "lucide-react";

function App() {

  const [peerId, setpeerId] = useState(null);
  const [create, setCreate] = useState(false)
  const [input, setInput] = useState("");
  const [isRoomFull, setIsRoomFull] = useState(null)

  const navigate = useNavigate(); 
  
  const peer = new Peer()
  let socket = useRef(null)

  let roomLength = useRef(null);

  const dispatch = useDispatch();


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

    socket.current.emit('join room', roomId, peerId);

    navigate(`/room/${roomId}`);

  }

  const handleInput = (event) => {
    setInput(event.target.value)
  }


  const handleJoin = () => {

    socket.current.emit("check-length", input, peerId)  

    socket.current.on("room-length", (length) => {

      console.log("length passed in client: ", length)

      if(length === 4){
        console.log("4 members in room, room full")
        setIsRoomFull(true)
      }
      else{

        socket.current.emit('join room', input, peerId)

        navigate(`/room/${input}`);
        console.log("Room not full")

      }
    })


    

  }


  return (
    <>
      <div className='flex justify-center items-center bg-black h-screen'> 

        <div className="flex flex-col gap-5">

          {
            peerId && <h1 className="text-white">Peer Id: {peerId}</h1>
          }

          {isRoomFull && 
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                The room is already full!
              </AlertDescription>
            </Alert>

          }
          <div className="flex gap-5">
            <Button className="bg-red-600 hover:bg-red-500 p-7 rounded-sm font-bold" onClick={handleJoin}> Join Room </Button>
            <input type="text" value={input} onChange={(e) => handleInput(e)}/>
          </div>
          <Button className="bg-blue-500 p-6 rounded-sm hover:bg-blue-400 font-bold" onClick={handleCreate}> Create Room </Button>
        </div>

      </div>
    </>

  )
}

export default App

