import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
import "../css/LobbScreen.css"; // Importing the CSS file

function LobbyScreen() {
  // States:
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  // CONFIGURES:
  const socket = useSocket();
  const navigate = useNavigate();

  // FUNCTIONS:
  const handleFormSubmit = useCallback(
    (e) => {
      e.preventDefault();

      // Join the ROOM(event, data):
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  // Again Receive from Backend data:
  const HandleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", HandleJoinRoom);
    return () => {
      socket.off("room:join", HandleJoinRoom);
    };
  }, [socket, HandleJoinRoom]);

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">Join a Room</h1>
      <form className="lobby-form" onSubmit={handleFormSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email ID:</label>
          <input
            placeholder="jhon@gmail.com"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="room">Room Number:</label>
          <input
            placeholder="123"
            type="text"
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <button className="submit-button">Join</button>
      </form>
    </div>
  );
}

export default LobbyScreen;
