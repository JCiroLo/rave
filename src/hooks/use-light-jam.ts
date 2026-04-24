import { type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import useSettingsStore from "@/stores/settings-store";
import { useShallow } from "zustand/shallow";

type WaveType = "sin" | "square" | "saw" | "triangle" | "noise" | "pulse";

export type LightJamOptions = {
  speedFactor?: number;
  phaseOffset?: number;
  wave?: WaveType;
  intensityRange?: [number, number];
  distanceRange?: [number, number];
  colorPulse?: boolean;
  colorBase?: string | number | THREE.Color;
  colorTarget?: string | number | THREE.Color;
  smooth?: number;
};

const waveFunctions = {
  sin: (t: number) => (Math.sin(t) + 1) * 0.5,
  square: (t: number) => (Math.sin(t) > 0 ? 1 : 0),
  saw: (t: number) => (t / (2 * Math.PI)) % 1,
  triangle: (t: number) => 1 - Math.abs(((t / Math.PI) % 2) - 1),
  noise: (t: number) => (Math.sin(t * 12.9898) * 43758.5453) % 1,
  pulse: (t: number) => (Math.sin(t) > 0.95 ? 1 : 0),
};

function useLightJam(
  lightRef: RefObject<THREE.PointLight>,
  options: LightJamOptions = {}
) {
  const {
    speedFactor = 1,
    phaseOffset = 0,
    wave = "sin",
    intensityRange = [0.5, 2],
    distanceRange = [4, 8],
    colorPulse = false,
    colorBase = "#ffffff",
    colorTarget = "#ffffff",
    smooth = 0.15,
  } = options;

  const { bpm, isPlaying } = useSettingsStore(
    useShallow((state) => ({
      bpm: state.bpm,
      isPlaying: state.isPlaying,
    }))
  );

  const bps = bpm / 60;
  const frequency = bps * speedFactor;
  const baseColor = new THREE.Color(colorBase);
  const targetColor = new THREE.Color(colorTarget);
  const tempColor = new THREE.Color();

  useFrame(({ clock }) => {
    const light = lightRef.current;

    if (!light) return;

    if (!isPlaying) {
      light.intensity = intensityRange[1];
      light.distance = distanceRange[1];

      if (colorPulse) {
        light.color.copy(new THREE.Color(0xffffff));
      }

      return;
    }

    const t = clock.getElapsedTime();

    const cycle = t * frequency * Math.PI * 2;

    const phase = cycle + phaseOffset * Math.PI * 2;

    const pulse = waveFunctions[wave](phase);

    const [iMin, iMax] = intensityRange;
    const targetIntensity = iMin + (iMax - iMin) * pulse;
    light.intensity += (targetIntensity - light.intensity) * smooth;

    const [dMin, dMax] = distanceRange;
    const targetDistance = dMin + (dMax - dMin) * pulse;
    light.distance += (targetDistance - light.distance) * smooth;

    if (colorPulse) {
      tempColor.copy(baseColor).lerp(targetColor, pulse);
      light.color.lerp(tempColor, smooth);
    }
  });
}

export default useLightJam;
