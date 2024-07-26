import { current } from '@reduxjs/toolkit';
import React, { useRef } from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { connect } from 'socket.io-client';
import Video from '../components/Video';

function Room() {

  let [videoStreams, setVideoStreams] = useState([])
  let [newUserData, setNewUserData] = useState(null)

  
  let videoTag = useRef(null)
  let remoteVid = useRef(null)
  let [streamAdded, setStreamAdded] = useState(false)

  const socket = useSelector(state => state.socket.socket)
  const peer = useSelector(state => state.peer.peer)
  const peerId = useSelector(state => state.peer.peerId)

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

          setNewUserData({userId: call.peer , remoteVideoStreamm: localVideoStream})

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

    const call = peer.call(userId, stream)

    call.on('stream', remoteVideoStreamm => {

      console.log("The calling peer ran on receiving remote Stream")

      setNewUserData({userId, remoteVideoStreamm})
      // setStreamAdded(prevValue => !prevValue)

   

    })

    call.on('close', () => {

      
    })

  }


  
  let addLocalVideoStream = (stream) => {
    videoTag.current.srcObject = stream;
  }

  

  

  return (
    <div className='flex items-center gap-2 flex-wrap bg-slate-500 h-screen' >

      <video ref={videoTag} autoPlay muted className='local-vid '></video>

      {
        videoStreams[0] && (videoStreams.map((videoData) => 
          <Video stream={videoData.remoteVideoStreamm} socket = {socket} userIdProp={videoData.userId} setVideoStreams={setVideoStreams}/>
        )
        )
      }

    </div>
  )
}

export default Room