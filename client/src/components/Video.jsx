import React, { useEffect, useRef } from 'react'

function Video({ stream }) {

    let videoRef = useRef(null);

    useEffect(() => {
        if(videoRef.current && stream){
            videoRef.current.srcObject = stream
        }
    }, [stream])

  return (
        <video src="" ref={videoRef} autoPlay muted/>
  )
}

export default Video