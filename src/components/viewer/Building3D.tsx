import { Box, Plane } from '@react-three/drei';
import * as THREE from 'three';
import type { Building } from '../../types/bim';

interface Building3DProps {
  building: Building;
  visible: boolean;
}

export function Building3D({ building, visible }: Building3DProps) {
  if (!visible) return null;

  const x = building.position.x;
  const y = building.position.y;
  const z = building.position.z;
  const width = building.dimensions.width;
  const height = building.dimensions.height;
  const depth = building.dimensions.depth;

  const wallThickness = 0.1;
  const wallColor = '#e2e8f0';
  const wallOpacity = 0.2;
  const edgeColor = '#64748b';

  return (
    <group>
      {/* Floor - slightly below y=0 to prevent z-fighting */}
      <Box
        args={[width, wallThickness, depth]}
        position={[x, y - 0.05, z]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#cbd5e1"
          opacity={0.3}
          transparent
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </Box>

      {/* Ceiling */}
      <Box
        args={[width, wallThickness, depth]}
        position={[x, y + height, z]}
        receiveShadow
      >
        <meshStandardMaterial 
          color={wallColor}
          opacity={wallOpacity}
          transparent
          side={THREE.DoubleSide}
        />
      </Box>

      {/* Front Wall */}
      <Plane
        args={[width, height]}
        position={[x, y + height / 2, z - depth / 2]}
        receiveShadow
        castShadow
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
        position={[x, y + height / 2, z + depth / 2]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
        castShadow
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
        position={[x - width / 2, y + height / 2, z]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
        castShadow
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
        position={[x + width / 2, y + height / 2, z]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          color={wallColor}
          opacity={wallOpacity}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </Plane>

      {/* Edge Lines for better definition */}
      {/* Bottom edges */}
      <lineSegments>
        <edgesGeometry
          attach="geometry"
          args={[
            new THREE.BoxGeometry(width, wallThickness, depth)
          ]}
        />
        <lineBasicMaterial attach="material" color={edgeColor} />
      </lineSegments>

      {/* Top edges */}
      <group position={[x, y + height, z]}>
        <lineSegments>
          <edgesGeometry
            attach="geometry"
            args={[
              new THREE.BoxGeometry(width, wallThickness, depth)
            ]}
          />
          <lineBasicMaterial attach="material" color={edgeColor} />
        </lineSegments>
      </group>

      {/* Vertical corner edges */}
      {[
        [-width/2, -depth/2],
        [width/2, -depth/2],
        [-width/2, depth/2],
        [width/2, depth/2]
      ].map(([xOffset, zOffset], index) => (
        <Box
          key={`corner-${index}`}
          args={[0.02, height, 0.02]}
          position={[x + xOffset, y + height/2, z + zOffset]}
        >
          <meshStandardMaterial color={edgeColor} opacity={0.5} transparent />
        </Box>
      ))}

      {/* Grid lines on floor for reference */}
      <gridHelper
        args={[Math.max(width, depth), 20, '#94a3b8', '#e2e8f0']}
        position={[x, y + 0.001, z]}
        rotation={[0, 0, 0]}
      />
    </group>
  );
}