import React from "react";
import * as THREE from "three";
import { useHelper } from "@react-three/drei";
import { useControls } from "leva";
import useLightJam, { type LightJamOptions } from "@/hooks/use-light-jam";

type LightJamProps = {
  label: string;
  position: [number, number, number];
  intensity: number;
  distance: number;
  color: string;
  helper?: boolean;
} & Omit<LightJamOptions, "colorBase">;

const LightJam: React.FC<LightJamProps> = ({
  label,
  position,
  intensity,
  distance,
  color,
  helper,
  ...jamOptions
}) => {
  const lightRef = React.useRef<THREE.PointLight>(null!);

  useHelper(helper && lightRef, THREE.DirectionalLightHelper, 0.5, color);

  const lightControls = useControls(label, {
    position: { value: position, step: 0.1 },
    distance: { value: distance, min: 0, max: 100 },
    intensity: { value: intensity, min: 0, max: 100 },
    color: { value: color },
  });

  useLightJam(lightRef, { ...jamOptions, colorBase: lightControls.color });

  return (
    <pointLight
      ref={lightRef}
      color={lightControls.color}
      intensity={lightControls.intensity}
      distance={lightControls.distance}
      position={lightControls.position}
    />
  );
};

export default LightJam;
