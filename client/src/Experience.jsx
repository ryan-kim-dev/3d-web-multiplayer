// 내장 라이브러리 importss
import { useEffect, useRef } from "react";
// 외부 라이브러리 imports
import {
  Environment,
  OrbitControls,
  Sky,
  SoftShadows,
} from "@react-three/drei";
import * as THREE from "three";
import { DEG2RAD } from "three/src/math/MathUtils";
import { useFrame, useThree } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import {
  Bloom,
  EffectComposer,
  N8AO,
  TiltShift2,
} from "@react-three/postprocessing";
// import { Perf } from "r3f-perf";
import { useAtom } from "jotai";
// 내부 파일 imports
import Character from "./Character";
import { Model } from "./Stage";
import { Colleague } from "./Colleague";
import { castAtom, socket } from "./ServerConnector";

// const Colleagues = [
//     { name: "영희", animationName: "Idle", position: [2.5, 1, 0], rotation: DEG2RAD * 0 },
//     { name: "철수", animationName: "Run", position: [-2.5, 1, 0], rotation: DEG2RAD * 45 },
//     { name: "민재", animationName: "Walk", position: [0, 1, 2.5], rotation: DEG2RAD * 228 },
// ]

function FollowShadowLight({ refLight, refCharacterRigid }) {
  // 이 함수는 커스텀 훅으로 빼는게 좀 더 좋다
  useFrame(() => {
    if (refCharacterRigid.current) {
      const { x: cx, y: cy, z: cz } = refCharacterRigid.current.translation(); // 강체의 위치값
      const cPos = new THREE.Vector3(cx, cy, cz); // 벡터 타입으로 만들기
      /** 조명 방향의 역방향인 방향 벡터 */
      const lightRevDir = new THREE.Vector3(0, 1, 1).normalize();
      /** 카메라의 새로운 위치 */
      const newPos = lightRevDir.multiplyScalar(2).add(cPos);

      if (refLight.current) {
        refLight.current.position.copy(newPos);
        refLight.current.target.position.copy(cPos);
      }
    }
  });
}

export default function Experience() {
  const [cast] = useAtom(castAtom);
  // console.log(cast)

  const refLight = useRef();
  const refCharacterRigid = useRef();
  const refOrbitControls = useRef();
  const scene = useThree((state) => state.scene);
  const refShadowCameraHelper = useRef();

  useEffect(() => {
    refShadowCameraHelper.current = new THREE.CameraHelper(
      refLight.current.shadow.camera
    );
    // scene.add(refShadowCameraHelper.current);
    scene.add(refLight.current.target);

    // Clean-up 함수
    return () => {
      // scene.remove(refShadowCameraHelper.current);
      scene.remove(refLight.current.target);
    };
  }, [refLight.current]);

  return (
    <>
      {/* <Perf /> */}
      <OrbitControls ref={refOrbitControls} />

      <Sky />

      <EffectComposer>
        <N8AO distanceFalloff={1} aoRadius={0.3} intensity={1} />
        <Bloom mipmapBlur intensity={0.5} />
        <TiltShift2 blur={0.05} />
      </EffectComposer>

      <ambientLight intensity={0.2} />
      <directionalLight
        ref={refLight}
        castShadow
        position={[0, 1.7, 2]}
        intensity={2}
        // shadow-normalBias={0.1}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.01}
        shadow-camera-far={10}
      />
      <FollowShadowLight
        refLight={refLight}
        refCharacterRigid={refCharacterRigid}
      />
      <Environment preset="city" />

      <Physics>
        {/* <Character ref={refCharacterRigid} name="홍길동" refOrbitControls={refOrbitControls}  /> */}
        {/* <Colleague name="일지매1" position={[2.5, 4, 0]} rotationY={45 * DEG2RAD} />
            <Colleague name="일지매2" position={[-2.5, 4, 0]} rotationY={-45 * DEG2RAD} /> */}
        {cast.map((item, idx) => {
          if (item.key === socket.id) {
            return (
              <Character
                ref={refCharacterRigid}
                refOrbitControls={refOrbitControls}
                {...item}
              />
            );
          } else {
            return <Colleague {...item} />;
          }
        })}

        {/* <RigidBody>
                <mesh receiveShadow rotation-x={-90 * DEG2RAD} scale={100}>
                    <planeGeometry />
                    <meshStandardMaterial color="#5d6d7s2" />
                </mesh>
            </RigidBody> */}

        <RigidBody type="fixed" colliders="trimesh">
          <Model />
        </RigidBody>
      </Physics>

      <SoftShadows size={3} focus={0} samples={8} />
    </>
  );
}
