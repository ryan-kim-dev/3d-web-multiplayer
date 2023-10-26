// 내장 라이브러리 imports
import { useRef } from "react";
// 외부 라이브러리 imports

// 내부 파일 imports
import { socket } from "./ServerConnector";
import "./styles/TalkOverlay.css";

function TalkOverlay() {
  const refInput = useRef();

  const talk = () => {
    const talk = refInput.current.value.trim();
    if (talk.length > 0) {
      // 채팅 메세지 서버로 전송
      socket.emit("talk", talk);
      refInput.current.select();

      refInput.current.value = ""; // 채팅 메세지 전송 후 인풋창 비우기
    }
  };

  const keyDownEnter = (e) => {
    e.stopPropagation(); // 채팅 입력시 캐릭터 조작 막기
    if (e.code === "Enter") {
      talk();
    }
  };

  return (
    <div className="talk-layout">
      <input type="text" ref={refInput} onKeyDown={keyDownEnter} />
      <div className="send" onClick={talk}>
        전송
      </div>
    </div>
  );
}

export default TalkOverlay;
