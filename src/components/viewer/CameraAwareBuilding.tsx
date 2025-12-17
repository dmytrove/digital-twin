import { useThree, useFrame } from '@react-three/fiber';
import { useState, useRef } from 'react';
import * as THREE from 'three';

interface BuildingProps {
  building: {
    width: number;
    height: number;
    depth: number;
  };
}

export function CameraAwareBuilding({ building }: BuildingProps) {
  const { camera } = useThree();
  // Simple static opacity for now to avoid re-render issues
  const wallOpacities = {
    front: 0.1,
    back: 0.4,
    left: 0.3,
    right: 0.2
  };

  // Validate building dimensions to prevent NaN
  const width = building?.width || 20;
  const height = building?.height || 3;
  const depth = building?.depth || 15;

  // Ensure valid numbers
  if (!isFinite(width) || !isFinite(height) || !isFinite(depth)) {
    console.error('Invalid building dimensions:', { width, height, depth });
    return null;
  }

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[width, 0.02, depth]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.1} roughness={0.9} />
      </mesh>
      
      {/* Ceiling */}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[width, 0.02, depth]} />
        <meshStandardMaterial 
          color="#e2e8f0" 
          transparent 
          opacity={0.3} 
          metalness={0.1} 
          roughness={0.9}
        />
      </mesh>
      
      {/* Front wall (negative Z) */}
      <mesh position={[0, height/2, -depth/2]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial 
          color="#e2e8f0" 
          transparent 
          opacity={wallOpacities.front}
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>
      
      {/* Back wall (positive Z) */}
      <mesh position={[0, height/2, depth/2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial 
          color="#e2e8f0" 
          transparent 
          opacity={wallOpacities.back}
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>
      
      {/* Left wall (negative X) */}
      <mesh position={[-width/2, height/2, 0]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial 
          color="#e2e8f0" 
          transparent 
          opacity={wallOpacities.left}
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>
      
      {/* Right wall (positive X) */}
      <mesh position={[width/2, height/2, 0]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial 
          color="#e2e8f0" 
          transparent 
          opacity={wallOpacities.right}
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>
      
      {/* Corner posts for structure definition */}
      {[
        [-width/2, -depth/2],
        [width/2, -depth/2],
        [-width/2, depth/2],
        [width/2, depth/2]
      ].map(([x, z], i) => (
        <mesh key={`corner-${i}`} position={[x, height/2, z]}>
          <boxGeometry args={[0.1, height, 0.1]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
      
    </group>
  );
}