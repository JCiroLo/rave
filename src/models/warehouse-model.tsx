import { useGLTF } from "@react-three/drei";

type WarehouseModelProps = JSX.IntrinsicElements["group"] & {
  path?: string;
};

export default function WarehouseModel({
  path = "/models/warehouse.glb",
  ...props
}: WarehouseModelProps) {
  const { scene } = useGLTF(path);

  return <primitive object={scene} {...props} />;
}

useGLTF.preload("/models/warehouse.glb");
