import React, { useEffect, useRef } from 'react'

function Video({ stream, socket, userIdProp, setVideoStreams,localVidTag }) {

    let videoRef = useRef(null);

    

    useEffect(() => {
        if(videoRef.current && stream){
            videoRef.current.srcObject = stream
        }

    }, [stream])

  return (
        <video src="" ref={videoRef} autoPlay muted className='rounded-lg h-[400px]'/>
  )
}

export default Video