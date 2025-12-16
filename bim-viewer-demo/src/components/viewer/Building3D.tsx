import { Box } from '@react-three/drei';
import type { Building } from '../../types/bim';

interface Building3DProps {
  building: Building;
  visible: boolean;
}

export function Building3D({ building, visible }: Building3DProps) {
  if (!visible) return null;

  return (
    <Box
      args={[building.dimensions.width, building.dimensions.height, building.dimensions.depth]}
      position={[
        building.position.x,
        building.position.y + building.dimensions.height / 2,
        building.position.z
      ]}
    >
      <meshStandardMaterial
        color="#e0e0e0"
        opacity={0.1}
        transparent
        wireframe
      />
    </Box>
  );
}