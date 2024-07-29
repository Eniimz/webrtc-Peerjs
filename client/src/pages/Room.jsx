import { current } from '@reduxjs/toolkit';
import React, { useRef } from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { connect } from 'socket.io-client';
import Video from '../components/Video';
import { Button } from '@/components/ui/button';
import { MdCallEnd } from 'react-icons/md';
import { FaMicrophone } from "react-icons/fa6";
import { HiSpeakerWave } from "react-icons/hi2";



function Room() {

  let [videoStreams, setVideoStreams] = useState([])
  let [newUserData, setNewUserData] = useState(null)
  let [streamAdded, setStreamAdded] = useState(false)

  
  let videoTag = useRef(null)
  let remoteVid = useRef(null)
  let call = useRef(null);

  const socket = useSelector(state => state.socket.socket)
  const peer = useSelector(state => state.peer.peer)
  const peerId = useSelector(state => state.peer.peerId)

  const navigate = useNavigate()

  useEffect(() => {

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then((stream) => {

      addLocalVideoStream(stream)

      socket.on('user connected', (userId) => {

        console.log("A new user joined the room: ", userId);

        connectToNewUser(userId, stream);

      })

      peer.on('call', call => {

        call.answer(stream)

        call.on('stream', (localVideoStream) => {

          console.log("The receiving call peer ran... on getting local stream")

          setNewUserData({userId: call.metadata.userId , remoteVideoStreamm: localVideoStream})

          console.log("INCOMMING CALL from the user: ", call.metadata.userId)

        })

      console.log("The one before peer.on('call').....is running yes")

      })

    })

    


  }, [])

  useEffect(() => {

    if(newUserData){
      console.log("The data inside videoStream: ", newUserData.remoteVideoStreamm.id)

      setVideoStreams((prevStreams) => [
        ...prevStreams,
        newUserData
      ])
    }


  }, [newUserData])


  useEffect(() => {
    console.log("The videoStream array: ", videoStreams)
  }, [videoStreams])


  let connectToNewUser = (userId, stream) => {

    call.current = peer.call(userId, stream, {
      metadata: { userId: peer.id }
    })

    call.current.on('stream', remoteVideoStreamm => {

      console.log("The calling peer ran on receiving remote Stream")

      setNewUserData({userId, remoteVideoStreamm})
      // setStreamAdded(prevValue => !prevValue)


    })

    call.current.on('close', () => {

      console.log("Call ended")

    })

  }

  
  let addLocalVideoStream = (stream) => {
    videoTag.current.srcObject = stream;
  }

  
  let handleEndCall = () => {

    console.log("End call clicked")
    console.log("Call obj: ", call.current)
    if(call.current){
      call.current.close();
      console.log("Call has ended")
    }
    navigate("/")

  }

  

  return (
    <div className='flex flex-col items-center bg-slate-500 h-screen justify-center py-4' >

      <div className='flex flex-col bg-black w-full h-full p-5'>
        <div className=' w-full h-full flex '>

          <div className='w-full flex flex-wrap gap-5 px-12 h-fit justify-center'>
            <video ref={videoTag} autoPlay muted className='local-vid rounded-lg h-[400px]' ></video>

            {
              videoStreams[0] && (videoStreams.map((videoData) => 
                <Video stream={videoData.remoteVideoStreamm} socket = {socket} userIdProp={videoData.userId} setVideoStreams={setVideoStreams}/>
              )
              )
            }
          </div>

        <div className='bg-red-600 w-[600px]'>
          ds
        </div>

        </div>


        <div className='w-full h-14 z-30 flex justify-center items-center'>
          <div className='w-1/2 flex justify-around items-center px-44'>

            <Button className="bg-slate-800 hover:border-2 hover:bg-slate-800 rounded-xl p-5"> { <HiSpeakerWave size={18} /> } </Button>

            <Button className="bg-red-500 hover:border-2 hover:border-white hover:bg-red-500 hover:transform-none rounded-xl p-5" onClick = {handleEndCall}> { <MdCallEnd size={28} /> } </Button>

            <Button className="bg-slate-800 hover:border-2 hover:bg-slate-800 hover:transform-none rounded-xl p-5" > <FaMicrophone size={18} /> </Button> 

          </div>
        </div>

      </div>



    </div>
  )
}

export default Room