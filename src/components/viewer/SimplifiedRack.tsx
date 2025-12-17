import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useMemo, memo } from 'react';
import type { Rack } from '../../types/bim';

interface SimplifiedRackProps {
  rack: Rack;
}

// Create canvas texture for label
function createLabelTexture(text: string, fontSize: number = 32, color: string = '#000000'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  
  // Set canvas size - wider for longer text
  canvas.width = 256;
  canvas.height = 64;
  
  // Configure text
  context.font = `bold ${fontSize}px sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  // Measure text to ensure it fits
  const metrics = context.measureText(text);
  const textWidth = metrics.width;
  const maxWidth = canvas.width - 20; // Leave padding
  
  // Scale down font if text is too wide
  let adjustedFontSize = fontSize;
  if (textWidth > maxWidth) {
    adjustedFontSize = Math.floor(fontSize * (maxWidth / textWidth));
    context.font = `bold ${adjustedFontSize}px sans-serif`;
  }
  
  // Draw background (pure white)
  context.fillStyle = 'rgba(255, 255, 255, 0.95)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw border (dark for contrast)
  context.strokeStyle = 'rgba(0, 0, 0, 0.6)';
  context.lineWidth = 3;
  context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
  
  // Draw text (black for maximum contrast)
  context.fillStyle = color;
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Cache for label textures
const textureCache = new Map<string, THREE.CanvasTexture>();

function getLabelTexture(text: string, fontSize: number = 32, color: string = '#000000'): THREE.CanvasTexture {
  const key = `${text}-${fontSize}-${color}`;
  if (!textureCache.has(key)) {
    textureCache.set(key, createLabelTexture(text, fontSize, color));
  }
  return textureCache.get(key)!;
}

// Single shared geometry for all rack frames - created once
const frameGeometry = new THREE.BoxGeometry(0.6, 2, 1);
const frameEdges = new THREE.EdgesGeometry(frameGeometry);

// Cleanup on module unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    frameGeometry.dispose();
    frameEdges.dispose();
  });
}

const SimplifiedRackComponent = ({ rack }: SimplifiedRackProps) => {
  const { x, y, z } = rack.position;
  const { camera } = useThree();
  
  // Calculate distance for performance optimization
  const distance = useMemo(() => {
    return camera.position.distanceTo(new THREE.Vector3(x, y + 1, z));
  }, [camera.position.x, camera.position.y, camera.position.z, x, y, z]);
  
  // Distance-based label visibility
  const showRackLabel = distance < 30 && distance > 2; // Hide when too close or too far
  const showUnitLabels = distance < 15 && distance > 2; // Only when very close, but not too close
  
  const rackHeight = 2.0;
  const totalUnits = 42;
  const unitHeight = rackHeight / totalUnits;
  
  // Create sprite-based unit labels using instancing
  const unitLabelSprites = useMemo(() => {
    if (!showUnitLabels) return null;
    
    const sprites = [];
    const labelInterval = 6; // Show every 6th U (U6, U12, U18, U24, U30, U36, U42)
    
    for (let u = labelInterval; u <= totalUnits; u += labelInterval) {
      const yPos = -1 + (u * unitHeight);
      
      sprites.push(
        <sprite
          key={`u-${u}`}
          position={[-0.35, yPos, 0]}
          scale={[0.25, 0.0625, 1]}
        >
          <spriteMaterial
            map={getLabelTexture(`U${u}`, 36)}
            transparent={true}
            opacity={0.95}
            depthTest={true}
            depthWrite={false}
          />
        </sprite>
      );
    }
    
    return sprites;
  }, [showUnitLabels, totalUnits, unitHeight]);
  
  return (
    <group position={[x, y + 1, z]}>
      {/* Semi-transparent box for better visibility */}
      <mesh>
        <boxGeometry args={[0.6, 2, 1]} />
        <meshStandardMaterial 
          color="#94a3b8" 
          transparent 
          opacity={0.15}
          wireframe={false}
          polygonOffset={true}
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>
      
      {/* Bright edges for rack frame - highly visible */}
      <lineSegments scale={1.002}>
        <edgesGeometry args={[frameGeometry]} />
        <lineBasicMaterial 
          color="#ffffff" 
          linewidth={2}
          opacity={1.0}
          transparent={false}
          depthTest={true}
        />
      </lineSegments>
      
      {/* Rack label - sprite based, only when close enough */}
      {showRackLabel && (
        <sprite
          position={[0, 1.15, 0]}
          scale={[0.5, 0.125, 1]}
        >
          <spriteMaterial
            map={getLabelTexture(rack.name || rack.id, 36, '#000000')}
            transparent={true}
            opacity={0.95}
            depthTest={true}
            depthWrite={false}
          />
        </sprite>
      )}
      
      {/* U elevation labels - sprite based, only when very close */}
      {unitLabelSprites}
    </group>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export const SimplifiedRack = memo(SimplifiedRackComponent, (prev, next) => {
  return prev.rack.id === next.rack.id && 
         prev.rack.position.x === next.rack.position.x &&
         prev.rack.position.y === next.rack.position.y &&
         prev.rack.position.z === next.rack.position.z;
});