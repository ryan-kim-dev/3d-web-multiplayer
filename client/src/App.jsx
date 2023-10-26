import "./styles/App.css";
import { Canvas } from "@react-three/fiber";
import Experience from "./Experience";
import { KeyboardControls, Loader } from "@react-three/drei";
import ServerConnector from "./ServerConnector";
import LoginOverlay, { userNameAtom } from "./LoginOverlay";
import TalkOverlay from "./TalkOverlay";
import { useAtom } from "jotai";

function App() {
  const [userName] = useAtom(userNameAtom);

  return (
    <>
      <ServerConnector />
      <KeyboardControls
        map={[
          { name: "forward", keys: ["KeyW", "ArrowUp"] },
          { name: "backward", keys: ["KeyS", "ArrowDown"] },
          { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
          { name: "rightward", keys: ["KeyD", "ArrowRight"] },
          { name: "walk", keys: ["Shift"] },
        ]}
      >
        <Canvas shadows>
          <Experience />
        </Canvas>

        <Loader />
      </KeyboardControls>
      {!userName && <LoginOverlay />}
      <TalkOverlay />
    </>
  );
}

export default App;
