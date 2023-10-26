import { useEffect } from "react";

export default function ApplyShadow({ refTarget }) {
  useEffect(() => {
    refTarget.current.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, []);
}
