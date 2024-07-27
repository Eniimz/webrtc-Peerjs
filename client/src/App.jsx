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

function App() {

  const [peerId, setpeerId] = useState(null);
  const [create, setCreate] = useState(false)
  const [input, setInput] = useState("");

  const navigate = useNavigate(); 
  
  const peer = new Peer()
  let socket = useRef(null)

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

    socket.current.emit('join room', input, peerId)
    navigate(`/room/${input}`);
  }


  return (
    <>
      <div className='flex justify-center items-center bg-black h-screen'>

        <div className="flex flex-col gap-5">
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

