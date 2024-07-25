import { current } from '@reduxjs/toolkit';
import React, { useRef } from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { connect } from 'socket.io-client';

function Room() {

  let [videoStreams, setVideoStreams] = useState([])

  let userIdRef = useRef(null);

  const peers = {};
  
  let videoTag = useRef(null)

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
          // setVideoStreams((prevVideoStreams) => [
          //   ...prevVideoStreams,
          //   { userId: userIdRef.current, remoteVideoStream: localVideoStream }, // stream is remote (2nd peer)
          // ])  
        })

      console.log("The one before peer.on('call').....is running yes")

    

      })

    })

    socket.on("user-disconnected", userId => {

      console.log("The following user disconnedted: ", userId)
      console.log("The videoStream array just before finding index: ", videoStreams)
      const foundIndex = videoStreams.findIndex((videoData) => videoData.userId === userId )

      console.log("The found Index: ", foundIndex)
        
      remoteVideoRefs.current[foundIndex].el.remove();

      remoteVideoRefs.current = remoteVideoRefs.current.filter((data) => data.index !== foundIndex)

      setVideoStreams((prevVideoStreams) => {  

        return prevVideoStreams.filter((videoData) => videoData.userId !== userId )

      });


    })  


  }, [])

  useEffect(() => {

    if(videoStreams[0]){
      console.log("The data inside videoStream: ", videoStreams[0].remoteVideoStream.id)
    }

    videoStreams = videoStreams.reduce((acc, current) => {

      const x = acc.find((stream) => stream.remoteVideoStream.id === current.remoteVideoStream.id)

      if(!x){
        acc.push(current)
      }

      return acc

    }, [])

    remoteVideoRefs.current.splice(-1, 1)

    remoteVideoRefs.current = remoteVideoRefs.current.reduce((acc, current) => {

      const x = acc.find(data => data.index === current.index)

      if(!x){
        acc.push(current) 
      }

      return acc;

    }, [])

    if(remoteVideoRefs.current.length > 2){
      remoteVideoRefs.current.splice(-1, 1)
    }

    console.log("the remote Ref array after reduce: ", remoteVideoRefs.current)

    if(remoteVideoRefs.current && videoStreams.length > 0){
      remoteVideoRefs.current[remoteVideoRefs.current.length - 1].el.srcObject = videoStreams[videoStreams.length - 1].remoteVideoStream;
    }

    console.log("The videoStreams array after reduce: ", videoStreams)
    
  }, [videoStreams])




  let connectToNewUser = (userId, stream) => {

    const call = peer.call(userId, stream)

    peers[userId] = call;

    call.on('stream', remoteVideoStream => {

      console.log("The calling peer ran on receiving remote Stream")

      setVideoStreams((prevVideoStreams) => [
        ...prevVideoStreams,
        { userId, remoteVideoStream }, // stream is remote (2nd peer)
      ])  

      

    })

    call.on('close', () => {

      
      // remoteVideoRefs.current.remove();
      
      // peer.destroy()
      
    })

  }

  useEffect(() => {

    console.log("VideoStreams array: ", videoStreams)
    console.log("remoteVideoStreams Ref: ", remoteVideoRefs)
    console.log("The peers[userId]: ", peers)

  }, [videoStreams])
  
  let addLocalVideoStream = (stream) => {
    videoTag.current.srcObject = stream;
  }

  let addToRef = (el, index, videoStream) => {
    
    console.log("The added element to refArray: ", el)

    if(el && !remoteVideoRefs.current.includes())
      remoteVideoRefs.current.push({el, index})
    

  }
  

  return (
    <div className='flex gap-2 flex-wrap bg-slate-500 h-screen' >

      <video ref={videoTag} autoPlay muted className='local-vid '></video>

      {videoStreams &&
        (
          videoStreams.map( (videoStream, index) => (
            <video src="" ref={(el) => addToRef(el, index)} data-identifier={videoStream?.userId} muted autoPlay></video>
        ))
      )
      }

    </div>
  )
}

export default Room