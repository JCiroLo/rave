import { Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Effects from "@/components/effects";
import LightJam from "@/components/light-jam";
import UI from "@/components/ui";
import FactoryModel from "@/models/factory-model";
import GirlSmokingModel from "@/models/gitl-smoking-model";

const SceneContent = () => {
  return (
    <>
      {/* <ambientLight color={0xffffff} intensity={0.1} /> */}

      <pointLight color={0xffffff} intensity={5} position={[0, 0, -2]} />

      {/* <LightJam
        label="Light Corner"
        color="#f700ff"
        colorTarget="#66ff00"
        distance={15}
        distanceRange={[0, 15]}
        position={[1.8, -0.3, -4.9]}
        intensity={20}
        intensityRange={[0, 32]}
        speedFactor={1}
        phaseOffset={0.5}
        colorPulse={true}
        smooth={1}
        wave="saw"
      /> */}

      <LightJam
        label="Light Center"
        distance={15}
        position={[-1.8, -4.3, -0.5]}
        intensity={20}
        color="#8c00ff"
        colorTarget="#1500ff"
        intensityRange={[0, 32]}
        distanceRange={[0, 15]}
        speedFactor={1}
        smooth={1}
        colorPulse={true}
        phaseOffset={0}
        wave="saw"
      />

      <Suspense fallback={null}>
        <FactoryModel />
        <GirlSmokingModel
          position={[1.75, -4.86, -0.15]}
          rotation={[Math.PI * 0.1, Math.PI * 1.2, 0]}
          scale={0.75}
          animate
        />
      </Suspense>
    </>
  );
};

export default function App() {
  return (
    <>
      <UI />
      <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
        <Canvas
          camera={{
            position: [0.66, -3.21, 4.17],
            fov: 75,
          }}
          gl={{ antialias: false }}
          onCreated={({ camera }) => {
            const dir = new THREE.Vector3(0.53, 0.58, -0.62).normalize();
            const target = new THREE.Vector3().addVectors(camera.position, dir);

            camera.lookAt(target);
            camera.updateProjectionMatrix();
          }}
        >
          <color attach="background" args={["#000000"]} />

          <OrbitControls />

          <SceneContent />

          <Effects />
        </Canvas>
      </div>
    </>
  );
}
