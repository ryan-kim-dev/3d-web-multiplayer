import { Server } from "socket.io";

const characters = [];

// WebSocket 서버
const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

io.listen(3001);

io.on("connection", (socket) => {
  console.log(`connected ${socket.id}`);

  // console.log(characters);
  // io.emit("characters", characters);

  // * 캐릭터 위치 업데이트
  socket.on("update", (data) => {
    const character = characters.find((item) => item.key === socket.id);

    if (character.position.some((v, i) => v !== data.position[i]))
      character.talk = ""; // 캐릭터가 이동하면 메세지가 사라지도록

    character.animationName = data.animationName;
    character.position = data.position;
    character.rotationY = data.rotationY;

    //io.emit("characters", characters)
    socket.broadcast.emit("characters", characters);
  });

  // * 채팅 메세지
  socket.on("talk", (msg) => {
    const ch = characters.find((item) => item.key === socket.id);
    ch.talk = msg;

    io.emit("characters", characters);
  });

  // * 로그인
  socket.on("join", (name) => {
    characters.push({
      key: socket.id,
      name: name,
      animationName: "Idle",
      position: [Math.random() * 10 - 5, 1, Math.random() * 10 - 5],
      rotationY: (Math.PI / 180) * (Math.random() * 360),
      talk: "",
    });
    io.emit("characters", characters);
    console.log(characters);
  });

  socket.on("disconnect", () => {
    console.log(`disconnected ${socket.id}`);

    characters.splice(
      characters.findIndex((item) => item.key === socket.id),
      1
    );

    io.emit("characters", characters);
  });
});

/**
  setInterval(() => {
    // 보통은 위 서버코드처럼 서버에서 클라이언트로 많이 자주 보내지 않음
    초당 60번, 초당 30번 등으로 서버측에서 응답량 제한해둠
  } [])
 */
