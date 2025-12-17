import { Plane, Box } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import type { Building } from '../../types/bim';

interface Building3DProps {
  building: Building;
  visible: boolean;
}

// Shared geometries for building components - created once
const sharedBuildingGeometries = {
  floor: new THREE.BoxGeometry(1, 0.1, 1),
  wall: new THREE.PlaneGeometry(1, 1),
  post: new THREE.BoxGeometry(0.02, 1, 0.02)
};

// Cleanup on module unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    Object.values(sharedBuildingGeometries).forEach(geo => geo.dispose());
  });
}

export function Building3D({ building, visible }: Building3DProps) {
  if (!visible) return null;

  const { x, y, z } = building.position;
  const { width, height, depth } = building.dimensions;

  const wallColor = '#e2e8f0';
  const wallOpacity = 0.15;
  const edgeColor = '#64748b';

  // Memoize corner positions
  const corners = useMemo(() => [
    [-width/2, -depth/2],
    [width/2, -depth/2],
    [-width/2, depth/2],
    [width/2, depth/2]
  ], [width, depth]);

  return (
    <group position={[x, y, z]}>
      {/* Floor */}
      <Box
        args={[width, 0.1, depth]}
        position={[0, -0.05, 0]}
      >
        <meshStandardMaterial 
          color="#cbd5e1"
          opacity={0.3}
          transparent
          side={THREE.DoubleSide}
        />
      </Box>

      {/* Ceiling */}
      <Box
        args={[width, 0.1, depth]}
        position={[0, height, 0]}
      >
        <meshStandardMaterial 
          color={wallColor}
          opacity={wallOpacity}
          transparent
          side={THREE.DoubleSide}
        />
      </Box>

      {/* Walls - using Plane for better performance */}
      {/* Front Wall */}
      <Plane
        args={[width, height]}
        position={[0, height / 2, -depth / 2]}
      >
        <meshStandardMaterial
          color={wallColor}
          opacity={wallOpacity}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </Plane>

      {/* Back Wall */}
      <Plane
        args={[width, height]}
        position={[0, height / 2, depth / 2]}
        rotation={[0, Math.PI, 0]}
      >
        <meshStandardMaterial
          color={wallColor}
          opacity={wallOpacity}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </Plane>

      {/* Left Wall */}
      <Plane
        args={[depth, height]}
        position={[-width / 2, height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <meshStandardMaterial
          color={wallColor}
          opacity={wallOpacity}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </Plane>

      {/* Right Wall */}
      <Plane
        args={[depth, height]}
        position={[width / 2, height / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <meshStandardMaterial
          color={wallColor}
          opacity={wallOpacity}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </Plane>

      {/* Corner posts - simplified, no edge lines */}
      {corners.map(([xOffset, zOffset], index) => (
        <Box
          key={`corner-${index}`}
          args={[0.05, height, 0.05]}
          position={[xOffset, height/2, zOffset]}
        >
          <meshStandardMaterial color={edgeColor} opacity={0.5} transparent />
        </Box>
      ))}
    </group>
  );
}
