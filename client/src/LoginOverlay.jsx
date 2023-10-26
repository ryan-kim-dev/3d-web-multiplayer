// 내장 라이브러리 imports
import { useEffect, useRef } from "react";
// 외부 라이브러리 imports
import { useAtom, atom } from "jotai";
// 내부 파일 imports
import "./styles/LoginOverlay.css";
import { socket } from "./ServerConnector";

export const userNameAtom = atom();

function LoginOverlay() {
  const [, setUserName] = useAtom(userNameAtom);
  const refInput = useRef();

  const handleClickLogin = () => {
    const userName = refInput.current.value.trim();
    setUserName(userName);

    if (userName.length <= 0) return alert("사용자명을 입력하세요!");
    socket.emit("join", userName);
  };

  useEffect(() => {
    // 최초 렌더링 시 포커스가 인풋 영역으로 가도록 함
    refInput.current.focus();
  }, []);

  return (
    <div className="login-layout">
      <form>
        <div className="name">이름</div>
        <input type="text" ref={refInput} />
      </form>
      <button className="login" onClick={handleClickLogin}>
        로그인
      </button>
    </div>
  );
}

export default LoginOverlay;
