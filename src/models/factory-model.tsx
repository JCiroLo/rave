import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";

type FactoryModelProps = Partial<ThreeElements["primitive"]> & {
  path?: string;
};

export default function FactoryModel({
  path = "/models/factory.glb",
  ...props
}: FactoryModelProps) {
  const { scene } = useGLTF(path);

  return <primitive object={scene} {...props} />;
}

useGLTF.preload("/models/factory.glb");
