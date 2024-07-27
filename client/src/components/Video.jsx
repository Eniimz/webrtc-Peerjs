import React, { useEffect, useRef } from 'react'

function Video({ stream, socket, userIdProp, setVideoStreams }) {

    let videoRef = useRef(null);

    useEffect(() => {
        socket.on("user-disconnected", userId => {

            console.log("I ran on user disconnected, outside if")

            console.log("The user dicsonnected: ", userId);

            console.log("The passes userProp: ", userIdProp)

            if(userIdProp === userId){

                setVideoStreams((prevStreams) => prevStreams.filter((data) => data.userId !== userId))

                console.log("I ran on user-disconnected (inside if userid == prop)")

                // videoRef.current.remove();
                

            }

            
        })
    })

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