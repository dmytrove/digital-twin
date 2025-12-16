import { useRef } from 'react';
import { Box } from '@react-three/drei';
import { Mesh } from 'three';
import type { Rack } from '../../types/bim';
// import { useBIMStore } from '../../store/bimStore';

interface Rack3DProps {
  rack: Rack;
  visible: boolean;
}

export function Rack3D({ rack, visible }: Rack3DProps) {
  const meshRef = useRef<Mesh>(null);
  // const { colorScheme } = useBIMStore();

  if (!visible) return null;

  return (
    <Box
      ref={meshRef}
      args={[rack.dimensions.width, rack.dimensions.height, rack.dimensions.depth]}
      position={[rack.position.x, rack.position.y + rack.dimensions.height / 2, rack.position.z]}
    >
      <meshStandardMaterial
        color="#333333"
        opacity={0.3}
        transparent
        wireframe
      />
    </Box>
  );
}