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
import { FaMicrophoneSlash } from "react-icons/fa";
import { HiSpeakerWave, HiMiniSpeakerXMark } from "react-icons/hi2";



function Room() {  

  const [isMute, setIsMute] = useState(false)
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [endCallClicked, setEndCallClicked] = useState(false)
  const [message, setMessage] = useState(null)
  const [allMessages, setAllMessages] = useState([])
  const [remoteUsername,  setRemoteUsername] = useState(null)
  
  let videoTag = useRef(null)
  let videoContainer = useRef(null);
  let call = useRef(null);
  let receivingCall = useRef([])
  let roomIdRef = useRef(null)
  let remoteUsernameRef = useRef(null)
  let callerUsernameRef = useRef(null)

  
  let videoRefs = useRef({}) // this approach of retaining the refs of created videoElements works as well
  
  const socket = useSelector(state => state.socket.socket)
  const peer = useSelector(state => state.peer.peer)
  const username = useSelector(state => state.user.name)
  
  
  const navigate = useNavigate()

  useEffect(() => {

    socket.on("roomId", (roomId) => {
      roomIdRef.current = roomId
      console.log("RECEIVED THE ROOMID: ", roomIdRef.current)
    })

    socket.on("callerUsername", (username) => {
      console.log("Running callerusername listner: ", username)
      callerUsernameRef.current = username
    }) 


    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then((stream) => {

      addLocalVideoStream(stream)

      socket.on('user connected', (userId) => {

        console.log("A new user joined the room: ", userId);

        // setMessage(`A new user joined the room: ${userId}`)


        connectToNewUser(userId, stream);

      })

      peer.on('call', call => {

        console.log("the on call ran")

        receivingCall.current.push(call);

        call.answer(stream)

        

        const videoBox = document.createElement('div')
        const video = document.createElement('video');  
        const label = document.createElement('p')
        label.innerHTML = call.metadata.username;

        videoBox.id = call.metadata.userId;  // call.metadata.userId == id of the caller

        videoRefs.current[call.metadata.userId] = videoBox;

        videoBox.classList.add("relative")
        video.classList.add("rounded-lg", "h-[360px]")
        label.classList.add("absolute", "bottom-3", "left-3", "text-white", "bg-gray-900", "p-1.5", "rounded-md", "opacity-80")

        videoBox.append(video)
        videoBox.append(label)

        console.log("Peer.id:(receiver) ", call.metadata.userId)

        video.classList.add("rounded-lg", "h-[360px]")

        call.on('stream', (localVideoStream) => { 

          video.srcObject = localVideoStream;
          video.addEventListener("loadedmetadata", () => {
            video.play();
          })
          videoContainer.current.append(videoBox)  

          setTimeout(() => {
            const videoElement = document.getElementById(call.metadata.userId);
            console.log("DisconnectedUseREF: ", disconnectedUser.current)
            if (videoElement !== disconnectedUser.current){
              console.log('video element after appending: ', videoElement);
            }
          }, 100);

        })
      })

      socket.on("user-disconnected", (userId, message) => {

        console.log("The user disconnected: ", userId)
        console.log("The username disconnected: ", username)
        
        /*const videoElement = videoRefs.current[userId] (SECOND APPROACH FOR RETAINING REMOTE VIDEO REFS)
        
        console.log("video element to be deleted: ", videoElement)  
        
        if(videoElement){
          videoElement.remove();  
          delete videoRefs.current[userId]
        }*/  

        setAllMessages((prevMessages => [
          ...prevMessages,
          message
        ]))

        const videoElement = document.getElementById(userId);

        console.log("The videoElement to be deleted: ", videoElement)

        if(videoElement){
          videoElement.remove()
        }

      })

      

      socket.on("user added message", userMessage => {
        
        setAllMessages((prevMessages) => [
          ...prevMessages,
          userMessage
        ])
      })
      
    })

  }, [])
  
  useEffect(() => {

    socket.on("remote username", (remoteUser) => {
      setRemoteUsername(remoteUser)
      remoteUsernameRef.current = remoteUser
      console.log("REMOTEUSERNAMEREF RECEIVED: ", remoteUsernameRef.current) 
   })
  }, [])
 

  let connectToNewUser = (userId, stream) => {

    call.current = peer.call(userId, stream, {
      metadata: {
         userId: peer.id,
         username: username 

      }
    })

    const videoBox = document.createElement('div')
    const video = document.createElement('video');  
    const label = document.createElement('p')
    label.innerHTML = remoteUsernameRef.current;

    console.log("The REMOTEUSERNAMEREF.CURRENT: ", remoteUsernameRef.current)

    videoRefs.current[userId] = videoBox; // (second approach for retaining video refs) 
    videoBox.id = userId;                           
    videoBox.classList.add("relative")
    video.classList.add("rounded-lg", "h-[360px]")
    label.classList.add("absolute", "bottom-3", "left-3", "text-white", "bg-gray-900", "p-1.5", "rounded-md", "opacity-80")

    videoBox.append(video)
    videoBox.append(label)

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
        
        videoContainer.current.append(videoBox);
        


    })

    call.current.on('close', () => {

      console.log("Call ended")

    })

  }

  
  let addLocalVideoStream = (stream) => {
    videoTag.current.srcObject = stream;
  }


  let handleEndCall = () => {

    setEndCallClicked(true)
    console.log("End call clicked")
    console.log("Call obj: ", call.current)
    console.log("receivingCall: ", receivingCall.current)
    console.log("checking RoomIdRef.current: ", roomIdRef.current)

    // socket.emit("user disconnected message", roomIdRef.current, peer.id)

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

  let handleSpeaker = (mute) => {

    Object.values(videoRefs.current).forEach(video => {
      if(video && video.srcObject){
        video.srcObject.getAudioTracks().forEach(track => {
          track.enabled = mute
        })
      }
    })
    setIsMute(!isMute)

  }

  let handleMic = (mute) => {

    videoTag.current.srcObject.getAudioTracks().forEach(track => {
      track.enabled = mute
    })

    setIsMicMuted(!isMicMuted)

  }

  useEffect(() => {

    console.log("All VideoRefs: ", videoRefs)

  }, [isMute])

  return (
    <div className='flex flex-col items-center bg-[#09090b] h-screen justify-center py-4' >

      <div className='flex flex-col w-full h-full p-5 gap-3'>

        <div className='w-full h-full flex rounded-lg gap-5'>

          <div className='w-full h-full flex bg-background border rounded-lg p-4'>

            <div className='w-full flex flex-wrap gap-5 px-12 h-fit justify-center' ref={videoContainer}>
              <div className='relative bg-red-500 rounded-3xl overflow-hidden'>
                <video ref={videoTag} autoPlay muted className='local-vid rounded-3xl' width= "480"></video>
                <p className='absolute bottom-3 left-3 text-white bg-gray-900 p-1.5 rounded-md opacity-80'> {username}</p>
              </div>

            </div>

          </div>

          <div className='w-[600px] rounded-lg bg-background border overflow-y-auto no-scrollbar '>
              {
                allMessages &&
                allMessages.map((message, index) => (

                  <p className='m-3 p-4 rounded-lg border bg-[#09090b]' key={index}>{message}</p>

                ))
              }
          </div>

        </div>


        <div className='w-full h-14 z-30 flex justify-center items-center'>
          <div className='w-1/2 flex justify-around items-center px-44 '>

            <Button className="bg-slate-800 hover:border-2 hover:bg-slate-800 rounded-xl p-5" onClick = {() => handleSpeaker(isMute)}> { isMute ? <HiMiniSpeakerXMark size={18} color='white'/> : <HiSpeakerWave size={18} color='white'/> } </Button>

            <Button className="bg-red-500 hover:border-2 hover:border-white hover:bg-red-500 hover:transform-none rounded-xl p-5" onClick = {handleEndCall}> { <MdCallEnd size={28} color='white'/> } </Button>

            <Button className="bg-slate-800 hover:border-2 hover:bg-slate-800 hover:transform-none rounded-xl p-5" onClick = {() => handleMic(isMicMuted)}> {isMicMuted ? <FaMicrophoneSlash size={18} color='white'/> : <FaMicrophone size={18} color='white'/>} </Button> 

          </div>
        </div>

      </div>



    </div>
  )
}

export default Room