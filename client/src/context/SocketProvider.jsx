import React, { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

//CONFIGURE'S:
const SocketContext = createContext(null);

// SOCKET CUSTOM HOOK:
export const useSocket = () => {
  const useSocket = useContext(SocketContext);
  return useSocket;
};

//SOCKET PROVIDER:
export const SocketProvider = (props) => {
  const socket = useMemo(() => io("localhost:8000"), []);
  return (
    <>
      <SocketContext.Provider value={socket}>
        {props.children}
      </SocketContext.Provider>
    </>
  );
};
