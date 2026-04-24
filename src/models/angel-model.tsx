import { useGLTF } from "@react-three/drei";

type AngelModelProps = JSX.IntrinsicElements["group"] & {
  path?: string;
};

export default function AngelModel({
  path = "/models/angel.glb",
  ...props
}: AngelModelProps) {
  const { scene } = useGLTF(path);

  return <primitive object={scene} {...props} />;
}

useGLTF.preload("/models/angel.glb");
