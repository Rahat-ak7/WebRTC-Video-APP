import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../services/peer";
import "../css/RoomScreen.css";
import { useNavigate } from "react-router-dom";

const RoomScreen = () => {
  const navigate = useNavigate();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const socket = useSocket();

  //Functions:
  //Joined
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`This Email ${email} Joined the Room `);
    setRemoteSocketId(id);
  }, []);
  //call:
  const handleCallUser = useCallback(async () => {
    //Get The user Stream
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { toRemote: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  //Hnadle incoming call
  const handleIncomingCall = useCallback(
    async ({ fromCurrent, offer }) => {
      setRemoteSocketId(fromCurrent);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: fromCurrent, ans });
    },
    [socket]
  );

  //send steams:
  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);
  //Hnadle accepted call
  const handleCallAccepted = useCallback(
    ({ fromCurrent, ans }) => {
      peer.setLocalDescription(ans);
      console.log("call accepted");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegNeedIncoming = useCallback(
    async ({ fromCurrent, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: fromCurrent, ans });
    },
    [socket]
  );

  const handleNegNeedfinal = useCallback(async ({ ans }) => {
    console.log("🚀 ~ handleNegNeedfinal ~ ans:", ans);
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = await ev.streams;

      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegNeedIncoming);
    socket.on("peer:nego:final", handleNegNeedfinal);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegNeedIncoming);
      socket.off("peer:nego:final", handleNegNeedfinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegNeedIncoming,
    handleNegNeedfinal,
  ]);

  // Handle End Call
  const handleEndCall = () => {
    // Stop all tracks of the local stream
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }

    // Stop all tracks of the remote stream (if any)
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }

    navigate("/"); // Change '/home' to your desired route
  };
  return (
    // <>
    //   <h1>{remoteSocketId ? "Connected" : "No One in the Room"} </h1>
    //   {myStream && <button onClick={sendStreams}>send Stream</button>}
    //   {remoteSocketId && <button onClick={handleCallUser}>Call</button>}
    //   {myStream && (
    //     <>
    //       <h2>My Screen</h2>
    //       <ReactPlayer
    //         playing
    //         muted
    //         height="200px"
    //         width="300px"
    //         url={myStream}
    //       />
    //     </>
    //   )}
    //   {remoteStream && (
    //     <>
    //       <h2>Remote Screen</h2>
    //       <ReactPlayer
    //         playing
    //         muted
    //         height="200px"
    //         width="300px"
    //         url={remoteStream}
    //       />
    //     </>
    //   )}
    // </>
    <div className="room-container">
      <h1 className="room-status">
        {remoteSocketId ? (
          "Connected"
        ) : (
          <div className="no-one-in-room-container">
            <h2 className="no-one-heading">No One in the Room</h2>
            <p className="wait-message">
              Please wait while others join the room...
            </p>
          </div>
        )}
      </h1>
      <div className="video-container">
        {myStream && (
          <div className="video-section">
            <h2>My Screen</h2>
            <ReactPlayer
              playing
              muted
              height="200px"
              width="300px"
              url={myStream}
            />
          </div>
        )}
        {remoteStream && (
          <div className="video-section">
            <h2>Remote Screen</h2>
            <ReactPlayer
              playing
              muted
              height="200px"
              width="300px"
              url={remoteStream}
            />
          </div>
        )}
      </div>
      <div className="controls">
        {myStream && (
          <button onClick={sendStreams} className="control-button">
            Send Stream
          </button>
        )}
        {remoteSocketId && (
          <button onClick={handleCallUser} className="control-button">
            Call
          </button>
        )}
        {(remoteSocketId || myStream) && (
          <button
            onClick={handleEndCall}
            className="control-button end-call-button"
          >
            End Call
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomScreen;
