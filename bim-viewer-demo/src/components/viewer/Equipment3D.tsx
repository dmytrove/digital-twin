import { useRef } from 'react';
import { Box } from '@react-three/drei';
import { Mesh } from 'three';
import type { BIMEquipment } from '../../types/bim';
import { useBIMStore } from '../../store/bimStore';

interface Equipment3DProps {
  equipment: BIMEquipment;
  visible: boolean;
}

export function Equipment3D({ equipment, visible }: Equipment3DProps) {
  const meshRef = useRef<Mesh>(null);
  const { selectEquipment, selectedEquipmentId, colorMode, colorScheme } = useBIMStore();
  const isSelected = selectedEquipmentId === equipment.id;

  const getColor = () => {
    if (colorMode === 'fourDStatus') {
      return colorScheme[equipment.fourDStatus];
    } else if (colorMode === 'powerConsumption') {
      const maxPower = 1500;
      const ratio = equipment.powerConsumption / maxPower;
      const r = Math.floor(255 * ratio);
      const g = Math.floor(255 * (1 - ratio));
      return `rgb(${r}, ${g}, 0)`;
    }
    return '#666666';
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    selectEquipment(equipment.id);
  };

  if (!visible) return null;

  return (
    <>
      <Box
        ref={meshRef}
        args={[equipment.dimensions.width, equipment.dimensions.height, equipment.dimensions.depth]}
        position={[equipment.position.x, equipment.position.y, equipment.position.z]}
        onClick={handleClick}
      >
        <meshStandardMaterial
          color={getColor()}
          emissive={isSelected ? '#ffff00' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </Box>
      
      {equipment.fourDStatus === 'modified' && equipment.previousPosition && (
        <Box
          args={[equipment.dimensions.width, equipment.dimensions.height, equipment.dimensions.depth]}
          position={[equipment.previousPosition.x, equipment.previousPosition.y, equipment.previousPosition.z]}
        >
          <meshStandardMaterial
            color={colorScheme[equipment.fourDStatus]}
            opacity={0.3}
            transparent
          />
        </Box>
      )}
    </>
  );
}