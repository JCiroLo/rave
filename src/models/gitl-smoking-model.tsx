import React from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";

type GirlSmokingModelProps = Partial<ThreeElements["primitive"]> & {
  animate?: boolean;
  path?: string;
  targetTime?: number;
};

export default function GirlSmokingModel({
  animate = false,
  path = "/models/girl_smoking.glb",
  targetTime = 0.0,
  ...props
}: GirlSmokingModelProps) {
  const { scene, animations } = useGLTF(path);
  const { actions, mixer } = useAnimations(animations, scene);

  React.useEffect(() => {
    if (!animate) return;

    const actionName = Object.keys(actions)[0];

    const action = actions[actionName];

    if (action) {
      action.play();

      if (targetTime) {
        // eslint-disable-next-line react-hooks/immutability
        action.paused = true;

        action.time = targetTime;

        mixer.update(0);
      }
    }

    return () => {
      mixer.stopAllAction();
    };
  }, [animate, targetTime, actions, mixer]);

  return <primitive {...props} object={scene} />;
}

useGLTF.preload("/models/girl_smoking.glb");
