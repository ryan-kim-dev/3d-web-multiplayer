// 내장 라이브러리 imports
import { useEffect } from "react";
// 외부 라이브러리 imports
import { atom, useAtom } from "jotai";
import { io } from "socket.io-client";
// 내부 파일 imports

export const socket = io("http://localhost:3001");
export const castAtom = atom([]);

export default function ServerConnector() {
  const [cast, setCast] = useAtom(castAtom);

  useEffect(() => {
    const onConnect = () => {
      console.log("connected");
    };

    const onDisconnect = () => {
      console.log("disconnected");
    };

    const onCharacters = (value) => {
      setCast(value);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("characters", onCharacters);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("characters", onCharacters);
    };
  });
}
