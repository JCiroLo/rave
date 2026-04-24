import * as THREE from "three";
import {
  Bloom,
  // DepthOfField,
  EffectComposer,
  // Vignette,
} from "@react-three/postprocessing";
import { useControls } from "leva";
// import { LensArrayEffect } from "@/shaders/lens-array-effect-shader";
import MetalCoreEffect from "@/shaders/metal-core-shader";
// import { CrtEffect } from "@/shaders/crt-effect-shader";
// import Posterizer from "@/shaders/posterizer-shader";

const Effects = () => {
  const metalCoreControls = useControls("Metal Core Effect", {
    exposure: { value: 1.1, min: 0, max: 2 },
    contrast: { value: 1.05, min: 0.5, max: 2 },
    saturation: { value: 0.9, min: 0, max: 2 },
    enablePixelate: true,
    pixelFactor: { value: 2.0, min: 1, max: 10 },
    enablePosterize: true,
    colorLevels: { value: 8.0, min: 2, max: 256, step: 1 },
    ditherStrength: { value: 0, min: 0, max: 1, step: 0.01 },
    chromAberration: { value: 0, min: 0, max: 10, step: 0.01 },
    vignetteStrength: { value: 1.0, min: 0, max: 10, step: 0.1 },
    grainStrength: { value: 0.2, min: 0, max: 10, step: 0.01 },
    tintColor: "#f2f5e6",
    tintStrength: { value: 0.15, min: 0, max: 1, step: 0.01 },
  });

  // const lenseArrayControls = useControls("Lens Array Effect", {
  //   gridSize: { value: 50.0, min: 1.0, max: 200, step: 1 },
  //   curvature: { value: 0.25, min: 0.0, max: 1.0, step: 0.01 },
  //   gridAngle: { value: 0.0, min: 0.0, max: Math.PI * 2, step: 0.01 },
  //   shape: { value: 0, options: { Circle: 0, Diamond: 1, Square: 2 } },
  //   scaleX: { value: 1.0, min: 0.1, max: 5.0, step: 0.1 },
  //   scaleY: { value: 1.0, min: 0.1, max: 5.0, step: 0.1 },
  //   stagger: true,
  // });

  const bloom = useControls("Bloom", {
    luminanceThreshold: { value: 0.5, min: 0, max: 1, step: 0.01 },
    luminanceSmoothing: { value: 0.9, min: 0, max: 1, step: 0.01 },
    height: { value: 300, min: 100, max: 1080, step: 1 },
    intensity: { value: 0.8, min: 0, max: 10, step: 0.01 },
  });

  const tintColor = new THREE.Color(metalCoreControls.tintColor);

  return (
    <EffectComposer>
      <MetalCoreEffect
        {...metalCoreControls}
        tintColor={new THREE.Vector3(tintColor.r, tintColor.g, tintColor.b)}
      />
      {/* <CrtEffect pixelSize={2.0} /> */}
      {/* <Posterizer noiseScale={1.2} colorLevels={10} ditherStrength={0.07} /> */}
      {/* <LensArrayEffect
        {...lenseArrayControls}
        scale={[lenseArrayControls.scaleX, lenseArrayControls.scaleY]}
      /> */}
      {/* <DepthOfField
        focusDistance={0}
        focalLength={0.02}
        bokehScale={2}
        height={480}
      /> */}
      <Bloom {...bloom} />
      {/* <Noise opacity={0.1} /> */}
      {/* <Vignette eskil={false} offset={0.1} darkness={1.1} /> */}
    </EffectComposer>
  );
};

export default Effects;
