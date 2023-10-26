// 내장 라이브러리 imports
import { forwardRef, useEffect, useMemo, useRef } from 'react';
// 외부 라이브러리 imports
import {
  useGLTF,
  useAnimations,
  useKeyboardControls,
  Html,
} from '@react-three/drei';
// import { useControls } from "leva";
import { CapsuleCollider, RigidBody } from '@react-three/rapier';
import { useFrame, useGraph } from '@react-three/fiber';
import { DEG2RAD } from 'three/src/math/MathUtils';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
// 내부 파일 imports
import ApplyShadow from './ApplyShadow';
import './styles/Character.css';
import {
  CHARACTER_HEIGHT,
  CAPSULE_RADIUS,
  WALK_SPEED,
  RUN_SPEED,
} from './constants';
import { socket } from './ServerConnector';

// export function ApplyShadow({ refTarget }) {
//   useEffect(() => {
//     refTarget.current.traverse((obj) => {
//       if (obj.isMesh) {
//         obj.castShadow = true;
//         obj.receiveShadow = true;
//       }
//     });
//   }, []);
// }

function UpdateFrame({ actions, refModel, refRigid, refOrbitControls }) {
  // 캐릭터의 위치 이동을 위한 캐릭터의 속도값의 참조
  const refSpeed = useRef(0);
  const refExceedTime = useRef(0);
  // 키보드 컨트롤을 사용하기 위한 훅
  const [, getKeys] = useKeyboardControls();

  const refPlayingActionName = useRef();

  const playAction = (actionName) => {
    if (actionName === refPlayingActionName.current) return;

    const action = actions[actionName];
    const prevAction = actions[refPlayingActionName.current];

    action?.reset().fadeIn(0.5).play();
    prevAction?.fadeOut(0.5);

    refPlayingActionName.current = actionName;
  };

  /** 눌려진 키 방향으로 캐릭터가 바라보게 만들기 위한 함수 */
  const getDirectionOffset = (keys) => {
    let directionOffset = 0; // w
    if (keys.forward) {
      if (keys.leftward) {
        directionOffset = Math.PI / 4; // w+a (45)
      } else if (keys.rightward) {
        directionOffset = -Math.PI / 4; // w+d (-45)
      }
    } else if (keys.backward) {
      if (keys.leftward) {
        directionOffset = Math.PI / 4 + Math.PI / 2; // s+a (135)
      } else if (keys.rightward) {
        directionOffset = -Math.PI / 4 - Math.PI / 2; // s+d (-135)
      } else {
        directionOffset = Math.PI; // s (180)
      }
    } else if (keys.leftward) {
      directionOffset = Math.PI / 2; // a (90)
    } else if (keys.rightward) {
      directionOffset = -Math.PI / 2; // d (-90)
    }
    return directionOffset;
  };

  useFrame((state, delta) => {
    const keys = getKeys(); // 감지중인 전체 키들과 현재 입력되었는지 여부

    // 키 입력에 따라 Walk나 Run 액션을 실행, 아니면 Idle 상태
    if (keys.forward || keys.leftward || keys.rightward || keys.backward) {
      if (keys.walk) {
        // 걷는 애니메이션 플레이
        playAction('Walk');
        refSpeed.current = WALK_SPEED;
      } else {
        // 뛰는 애니메이션 플레이
        playAction('Run');
        refSpeed.current = RUN_SPEED;
      }
    } else {
      // Idle 애니메이션 플레이
      playAction('Idle');
      refSpeed.current = 0;
    }

    // 캐릭터가 카메라를 바라보는 방향으로 회전시키기
    const camera = state.camera;
    const model = refModel.current;
    const modelPosition = new THREE.Vector3();
    model.getWorldPosition(modelPosition);
    const angleCameraDirectionAxisY =
      Math.atan2(
        camera.position.x - modelPosition.x,
        camera.position.z - modelPosition.z
      ) +
      Math.PI +
      getDirectionOffset(keys);
    const rotationQuaternion = new THREE.Quaternion();
    rotationQuaternion.setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      angleCameraDirectionAxisY
    );
    model.quaternion.rotateTowards(rotationQuaternion, 5 * DEG2RAD);

    // 캐릭터의 위치 이동
    const walkDirection = new THREE.Vector3();
    camera.getWorldDirection(walkDirection);

    walkDirection.y = 0;
    walkDirection.normalize();
    walkDirection.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      getDirectionOffset(keys)
    );

    const dx = walkDirection.x * refSpeed.current * delta;
    const dz = walkDirection.z * refSpeed.current * delta;

    if (refRigid.current) {
      const cx = refRigid.current.translation().x + dx;
      const cy = refRigid.current.translation().y;
      const cz = refRigid.current.translation().z + dz;
      refRigid.current.setTranslation({ x: cx, y: cy, z: cz });

      // 카메라가 항상 캐릭터를 추적하도록 하기
      camera.position.x += dx;
      camera.position.z += dz;
      refOrbitControls.current?.target.set(cx, cy, cz);

      refExceedTime.current += delta;
      if (refExceedTime.current > 0.1) {
        socket.emit('update', {
          animationName: refPlayingActionName.current,
          position: [cx, cy, cz],
          rotationY: angleCameraDirectionAxisY,
        });
        refExceedTime.current = 0;
      }
    }
  });
}

function Character(
  { talk = '', name = '익명', refOrbitControls, ...props },
  refRigid
) {
  const refModel = useRef();
  // const refRigid = useRef()

  useEffect(() => {
    refRigid.current.setTranslation({
      x: props.position[0],
      y: props.position[1],
      z: props.position[2],
    });
  }, []);

  // const { nodes, materials, animations } = useGLTF("/Robot.glb");
  const { scene, materials, animations } = useGLTF('/Robot.glb');
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);

  const { actions } = useAnimations(animations, refModel);

  /*
    const animationNames = Object.keys(actions)
    console.log(animationNames)
    const { animationName } = useControls({
        animationName: { value: animationNames[0], options: animationNames }
    })
 
    useEffect(() => {
        const action = actions[animationName]
        action.reset().fadeIn(0.5).play()
        return () => {
            action.fadeOut(0.5)
        }
    }, [animationName])
    */

  return (
    <>
      <RigidBody lockRotations={true} ref={refRigid} colliders={false}>
        <CapsuleCollider
          args={[CHARACTER_HEIGHT / 2 - CAPSULE_RADIUS, CAPSULE_RADIUS]}
        />
        <group ref={refModel} position-y={-CHARACTER_HEIGHT / 2} dispose={null}>
          <group name="Scene">
            <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
              <skinnedMesh
                name="Alpha_Joints"
                geometry={nodes.Alpha_Joints.geometry}
                material={materials.Alpha_Joints_MAT}
                skeleton={nodes.Alpha_Joints.skeleton}
              />
              <skinnedMesh
                name="Alpha_Surface"
                geometry={nodes.Alpha_Surface.geometry}
                material={materials.Alpha_Body_MAT}
                skeleton={nodes.Alpha_Surface.skeleton}
              />
              <primitive object={nodes.mixamorigHips} />
            </group>
          </group>
        </group>
        <Html
          position-y={CHARACTER_HEIGHT / 2}
          center
          wrapperClass="character-name"
        >
          <div className="name">{name}</div>
          {talk && (
            <div key={talk} className="talk">
              {talk}
            </div>
          )}
        </Html>
      </RigidBody>

      <ApplyShadow refTarget={refModel} />
      <UpdateFrame
        refOrbitControls={refOrbitControls}
        actions={actions}
        refModel={refModel}
        refRigid={refRigid}
      />
    </>
  );
}

export default forwardRef(Character);

useGLTF.preload('/Robot.glb');
