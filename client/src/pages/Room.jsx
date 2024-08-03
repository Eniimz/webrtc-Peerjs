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
  
  let disconnectedUser = useRef(null)

  let videoTag = useRef(null)
  let videoContainer = useRef(null);
  let call = useRef(null);
  let receivingCall = useRef([])

  // let videoRefs = useRef({}) // this approach of retaining the refs of created videoElements works as well

  const socket = useSelector(state => state.socket.socket)
  const peer = useSelector(state => state.peer.peer)
  
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

        receivingCall.current.push(call);

        call.answer(stream)

        const video = document.createElement('video');

        video.id = call.metadata.userId;  // call.metadata.userId == id of the caller

        // videoRefs.current[call.metadata.userId] = video;

        console.log("Peer.id:(receiver) ", call.metadata.userId)

        video.classList.add("rounded-lg", "h-[400px]")

        call.on('stream', (localVideoStream) => { 

          video.srcObject = localVideoStream;
          video.addEventListener("loadedmetadata", () => {
            video.play();
          })
          videoContainer.current.append(video)  

          setTimeout(() => {
            const videoElement = document.getElementById(call.metadata.userId);
            console.log("DisconnectedUseREF: ", disconnectedUser.current)
            if (videoElement !== disconnectedUser.current){
              console.log('video element after appending: ', videoElement);
            }
          }, 100);

        })
      })

      socket.on("user-disconnected", (userId) => {

        console.log("The user disconnected: ", userId)
        
        /*const videoElement = videoRefs.current[userId] (SECOND APPROACH FOR RETAINING REMOTE VIDEO REFS)
        
        console.log("video element to be deleted: ", videoElement)  
        
        if(videoElement){
          videoElement.remove();  
          delete videoRefs.current[userId]
          }*/
         
        disconnectedUser.current = userId;

        const videoElement = document.getElementById(userId);

        console.log("The videoElement to be deleted: ", videoElement)

        if(videoElement){
          videoElement.remove()
        }

      })

    })

  }, [])

 

  let connectToNewUser = (userId, stream) => {

    call.current = peer.call(userId, stream, {
      metadata: { userId: peer.id }
    })

    const video = document.createElement('video');  
    // videoRefs.current[userId] = video;  (second approach for retaining video refs) 
    video.id = userId;                           
    video.classList.add("rounded-lg", "h-[400px]")

    /* x`x  
      Creating a video element before call.on("stream") as on one call it is receiving two remote
      streams, if put this statement inside two video elements are created as for two streams the callback
      function runs twice.
    */

    call.current.on('stream', remoteVideoStreamm => {

        console.log("The calling peer ran on receiving remote Stream")

        video.srcObject = remoteVideoStreamm
  
        video.addEventListener("loadedmetadata", () => {
          video.play()
        })
        
        videoContainer.current.append(video);


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
    console.log("receivingCall: ", receivingCall.current)

    if(call.current){
      call.current.close()
      socket.emit("leave-room")
      console.log("Call has ended")
      
    }

    if(receivingCall.current){
      
      receivingCall.current.forEach(call => call.close())

      socket.emit("leave-room") //this then disconnects the socket from the server side
      console.log("Call has ended")
    }
 
    if(videoTag.current && videoTag.current.srcObject){

      videoTag.current.srcObject.getTracks().forEach(track => track.stop())
      videoTag.current.srcObject = null;
      videoTag.current.remove()
    }

    navigate("/")

  }

  

  return (
    <div className='flex flex-col items-center bg-slate-500 h-screen justify-center py-4' >

      <div className='flex flex-col bg-green-600 w-full h-full p-5'>
        <div className=' w-full h-full flex '>

          <div className='w-full flex flex-wrap gap-5 px-12 h-fit justify-center' ref={videoContainer}>

            <video ref={videoTag} autoPlay muted className='local-vid rounded-lg h-[400px]' ></video>

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