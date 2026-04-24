import { useGLTF } from "@react-three/drei";

type FactoryModelProps = JSX.IntrinsicElements["group"] & {
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
