import { useRef } from 'react';
import { Box, Text, Line } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';
import type { Rack } from '../../types/bim';

interface Rack3DProps {
  rack: Rack;
  visible: boolean;
}

export function Rack3D({ rack, visible }: Rack3DProps) {
  const meshRef = useRef<Mesh>(null);

  if (!visible) return null;

  const frameThickness = 0.02;
  const frameColor = '#2d3748';
  const labelColor = '#718096';
  
  // Calculate positions for rack frame
  const x = rack.position.x;
  const y = rack.position.y;
  const z = rack.position.z;
  const w = rack.dimensions.width;
  const h = rack.dimensions.height;
  const d = rack.dimensions.depth;

  // Create elevation marks every 5U
  const elevationMarks = [];
  const unitHeight = h / 42; // 42U rack standard
  
  for (let u = 0; u <= 42; u += 5) {
    const markY = y + u * unitHeight;
    elevationMarks.push(
      <group key={`mark-${u}`}>
        {/* Elevation line */}
        <Line
          points={[
            new Vector3(x - w/2 - 0.05, markY, z - d/2),
            new Vector3(x - w/2 - 0.02, markY, z - d/2)
          ]}
          color={labelColor}
          lineWidth={1}
        />
        {/* Elevation text */}
        {u > 0 && (
          <Text
            position={[x - w/2 - 0.1, markY, z - d/2]}
            fontSize={0.05}
            color={labelColor}
            anchorX="right"
            anchorY="middle"
          >
            {u}U
          </Text>
        )}
      </group>
    );
  }

  return (
    <group>
      {/* Vertical frame posts (4 corners) */}
      {/* Front-left post */}
      <Box
        args={[frameThickness, h, frameThickness]}
        position={[x - w/2, y + h/2, z - d/2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Front-right post */}
      <Box
        args={[frameThickness, h, frameThickness]}
        position={[x + w/2, y + h/2, z - d/2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Back-left post */}
      <Box
        args={[frameThickness, h, frameThickness]}
        position={[x - w/2, y + h/2, z + d/2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Back-right post */}
      <Box
        args={[frameThickness, h, frameThickness]}
        position={[x + w/2, y + h/2, z + d/2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </Box>

      {/* Horizontal frame rails (top and bottom) */}
      {/* Top front rail */}
      <Box
        args={[w, frameThickness, frameThickness]}
        position={[x, y + h, z - d/2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Top back rail */}
      <Box
        args={[w, frameThickness, frameThickness]}
        position={[x, y + h, z + d/2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Top left rail */}
      <Box
        args={[frameThickness, frameThickness, d]}
        position={[x - w/2, y + h, z]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Top right rail */}
      <Box
        args={[frameThickness, frameThickness, d]}
        position={[x + w/2, y + h, z]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Bottom front rail */}
      <Box
        args={[w, frameThickness, frameThickness]}
        position={[x, y, z - d/2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Bottom back rail */}
      <Box
        args={[w, frameThickness, frameThickness]}
        position={[x, y, z + d/2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Bottom left rail */}
      <Box
        args={[frameThickness, frameThickness, d]}
        position={[x - w/2, y, z]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Bottom right rail */}
      <Box
        args={[frameThickness, frameThickness, d]}
        position={[x + w/2, y, z]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </Box>

      {/* Rack label */}
      <Text
        position={[x, y + h + 0.15, z - d/2]}
        fontSize={0.08}
        color="#1a202c"
        anchorX="center"
        anchorY="middle"
      >
        {rack.name}
      </Text>

      {/* Elevation marks */}
      {elevationMarks}

      {/* Semi-transparent mesh for selection/highlight (optional) */}
      <Box
        ref={meshRef}
        args={[w - frameThickness*2, h - frameThickness*2, d - frameThickness*2]}
        position={[x, y + h/2, z]}
      >
        <meshStandardMaterial
          color="#94a3b8"
          opacity={0.05}
          transparent
          depthWrite={false}
        />
      </Box>
    </group>
  );
}