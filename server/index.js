const { Server } = require("socket.io");

//Port & CORS:
const io = new Server(8000, {
  cors: true,
});

//CONFIGURES:
const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

//SOCKET:
io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);

  //Specific Event (Request):
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(email, socket.id);
    //Accept Request To Join Room:
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  //Calling event:
  socket.on("user:call", ({ toRemote, offer }) => {
    io.to(toRemote).emit("incomming:call", { fromCurrent: socket.id, offer });
  });
  //Call Accepted event:
  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { fromCurrent: socket.id, ans });
  });
  //Nego event:
  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { fromCurrent: socket.id, offer });
  });
  //Nego event done:
  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { fromCurrent: socket.id, ans });
  });
});
