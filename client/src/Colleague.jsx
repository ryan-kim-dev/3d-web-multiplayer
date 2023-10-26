// 내장 라이브러리 imports
import { useEffect, useMemo, useRef } from "react";
// 외부 라이브러리 imports
import * as THREE from "three";
import { useGLTF, useAnimations, Html } from "@react-three/drei";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { SkeletonUtils } from "three-stdlib";
import { useFrame, useGraph } from "@react-three/fiber";
import { DEG2RAD } from "three/src/math/MathUtils";
// 내부 파일 imports
import {
  CAPSULE_RADIUS,
  CHARACTER_HEIGHT,
  RUN_SPEED,
  WALK_SPEED,
} from "./constants";
import ApplyShadow from "./ApplyShadow";

function Animation({
  actions,
  refModel,
  refRigid,
  animationName,
  position,
  rotationY,
}) {
  useEffect(() => {
    const action = actions[animationName];
    action.reset().fadeIn(0.5).play();
    return () => {
      action.fadeOut(0.5);
    };
  }, [animationName]);

  useFrame((state, delta) => {
    // 회전
    if (refModel.current) {
      const rotationQuaternion = new THREE.Quaternion();
      rotationQuaternion.setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        rotationY
      );
      refModel.current.quaternion.rotateTowards(
        rotationQuaternion,
        5 * DEG2RAD
      );
    }
    // 위치
    if (refRigid.current) {
      /** 현재 캐릭터의 위치 */
      const t = refRigid.current.translation();
      const cp = new THREE.Vector3(t.x, t.y, t.z);
      const tp = new THREE.Vector3(position[0], position[1], position[2]);
      let speed =
        animationName === "Walk"
          ? WALK_SPEED
          : animationName === "Run"
          ? RUN_SPEED
          : 0;
      if (speed === 0 && cp.distanceTo(tp) > 0.1) speed = 2;

      const direction = tp.sub(cp).normalize();
      const dx = direction.x * (speed * delta);
      const dy = direction.y * (speed * delta);
      const dz = direction.z * (speed * delta);
      const cx = t.x + dx;
      const cy = t.y + dy;
      const cz = t.z + dz;

      refRigid.current.setTranslation({ x: cx, y: cy, z: cz });

      // refRigid.current.setTranslation({
      //     x: position[0],
      //     y: position[1],
      //     z: position[2],
      // })
    }
  });
}

export function Colleague({ talk = "", name = "익명", ...props }) {
  const refModel = useRef();
  const refRigid = useRef();
  //const { nodes, materials, animations } = useGLTF("/Robot.glb");
  const { scene, materials, animations } = useGLTF("/Robot.glb");
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);

  const { actions } = useAnimations(animations, refModel);

  useEffect(() => {
    refRigid.current.setTranslation({
      x: props.position[0],
      y: props.position[1],
      z: props.position[2],
    });
  }, []);

  useEffect(() => {
    // 현재 탭이 화면에 보여지고 있는지 아닌지 알아내기 위한 로직
    if (document.hidden) {
      // 기존 강의자료의 setKinematicTranslation 은 안됨!! setTranslation 써야함
      refRigid.current.setTranslation({
        x: props.position[0],
        y: props.position[1],
        z: props.position[2],
      });
    }
  });

  return (
    <>
      <RigidBody
        lockRotations
        lockTranslations
        ref={refRigid}
        colliders={false}
      >
        <CapsuleCollider
          args={[CHARACTER_HEIGHT / 2 - CAPSULE_RADIUS, CAPSULE_RADIUS]}
        />
        <group position-y={-CHARACTER_HEIGHT / 2} ref={refModel} dispose={null}>
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

      <Animation
        actions={actions}
        refModel={refModel}
        refRigid={refRigid}
        animationName={props.animationName}
        position={props.position}
        rotationY={props.rotationY}
      />

      <ApplyShadow refTarget={refModel} />
    </>
  );
}

useGLTF.preload("/Robot.glb");
