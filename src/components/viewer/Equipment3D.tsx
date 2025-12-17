import { useRef, memo, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BIMEquipment } from '../../types/bim';
import { useBIMStore } from '../../store/bimStore';

// Geometry cache to avoid recreation - keyed by dimensions
const geometryCache = new Map<string, THREE.BoxGeometry>();

// Cleanup geometry cache on module unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    geometryCache.forEach(geo => geo.dispose());
    geometryCache.clear();
  });
}

// Helper to get or create geometry based on dimensions
function getGeometry(width: number, height: number, depth: number): THREE.BoxGeometry {
  const key = `${width.toFixed(3)}-${height.toFixed(3)}-${depth.toFixed(3)}`;
  
  if (!geometryCache.has(key)) {
    geometryCache.set(key, new THREE.BoxGeometry(width, height, depth));
  }
  
  return geometryCache.get(key)!;
}

interface Equipment3DProps {
  equipment: BIMEquipment;
  visible: boolean;
}

const Equipment3DComponent = ({ equipment, visible }: Equipment3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const highlightMeshRef = useRef<THREE.Mesh>(null);
  const selectionEdgesRef = useRef<THREE.LineSegments>(null);
  const { selectEquipment, selectedEquipmentId, colorMode, colorScheme } = useBIMStore();
  const isSelected = selectedEquipmentId === equipment.id;

  // Normalize footprint: per demo requirement, only height should vary.
  const STANDARD_EQUIPMENT_WIDTH = 0.48;
  const STANDARD_EQUIPMENT_DEPTH = 0.8;

  // Get geometry based on equipment dimensions (with normalized footprint)
  // Note: In Three.js BoxGeometry(width, height, depth):
  // - width = X axis (horizontal across rack front, should be ~0.48m for 19" standard)
  // - height = Y axis (vertical, varies by rack units 1U-4U)
  // - depth = Z axis (front-to-back into rack)
  const geometry = useMemo(() => {
    // Height still comes from data (unitHeight driven). Footprint is standardized.
    const width = STANDARD_EQUIPMENT_WIDTH;
    const height = Number.isFinite(equipment.dimensions.height) && equipment.dimensions.height > 0 
      ? equipment.dimensions.height 
      : 0.048;
    const depth = STANDARD_EQUIPMENT_DEPTH;
    
    return getGeometry(width, height, depth);
  }, [equipment.dimensions.height]);

  // Create edges geometry - always show for contrast
  const edgesGeometry = useMemo(() => {
    return new THREE.EdgesGeometry(geometry, 15);
  }, [geometry]);

  // Create selection edges geometry - thicker/brighter for selected items
  const selectionEdgesGeometry = useMemo(() => {
    if (isSelected) {
      return new THREE.EdgesGeometry(geometry, 15);
    }
    return null;
  }, [isSelected, geometry]);

  // Cleanup edges geometries when component unmounts or selection changes
  useEffect(() => {
    return () => {
      if (edgesGeometry) {
        edgesGeometry.dispose();
      }
      if (selectionEdgesGeometry) {
        selectionEdgesGeometry.dispose();
      }
    };
  }, [edgesGeometry, selectionEdgesGeometry]);

  // Animate selected equipment edges - pulsing effect
  useFrame((state) => {
    if (isSelected && selectionEdgesRef.current) {
      const time = state.clock.getElapsedTime();
      const pulsate = Math.sin(time * 3) * 0.5 + 0.5; // Oscillates between 0 and 1
      
      // Animate opacity
      const material = selectionEdgesRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.5 + pulsate * 0.5; // Range: 0.5 to 1.0
      
      // Animate scale slightly
      const scaleValue = 1.002 + pulsate * 0.003; // Range: 1.002 to 1.005
      selectionEdgesRef.current.scale.setScalar(scaleValue);
    }
    
    if (isSelected && highlightMeshRef.current) {
      const time = state.clock.getElapsedTime();
      const pulsate = Math.sin(time * 2) * 0.5 + 0.5; // Slower pulsing for highlight
      
      // Animate highlight opacity
      const material = highlightMeshRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = 0.2 + pulsate * 0.2; // Range: 0.2 to 0.4
    }
  });

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
      <group>
        {/* Main equipment box */}
        <mesh
          ref={meshRef}
          geometry={geometry}
          position={[equipment.position.x, equipment.position.y, equipment.position.z]}
          onClick={handleClick}
          frustumCulled={true}
        >
          <meshStandardMaterial
            color={getColor()}
            metalness={0.1}
            roughness={0.7}
            polygonOffset={true}
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        </mesh>
        
        {/* Always show bright edges for contrast between items - offset to prevent z-fighting */}
        <lineSegments
          position={[
            equipment.position.x, 
            equipment.position.y, 
            equipment.position.z
          ]}
          scale={1.001} // Slightly larger to prevent z-fighting
        >
          <primitive object={edgesGeometry} attach="geometry" />
          <lineBasicMaterial 
            color="#e0e0e0"
            opacity={0.8}
            transparent={true}
            depthTest={true}
          />
        </lineSegments>
        
        {/* Highlight selected equipment faces with semi-transparent overlay */}
        {isSelected && (
          <mesh
            ref={highlightMeshRef}
            geometry={geometry}
            position={[equipment.position.x, equipment.position.y, equipment.position.z]}
            scale={1.003} // Slightly larger to show highlight over equipment
          >
            <meshStandardMaterial
              color="#fbbf24"
              transparent={true}
              opacity={0.3}
              depthTest={true}
              emissive="#fbbf24"
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
        
        {/* Animated edges for selected equipment */}
        {isSelected && selectionEdgesGeometry && (
          <lineSegments
            ref={selectionEdgesRef}
            position={[
              equipment.position.x, 
              equipment.position.y, 
              equipment.position.z
            ]}
            scale={1.002} // Even larger to stay on top
          >
            <primitive object={selectionEdgesGeometry} attach="geometry" />
            <lineBasicMaterial 
              color="#fbbf24"
              linewidth={3}
              depthTest={true}
              transparent={true}
              opacity={1.0}
            />
          </lineSegments>
        )}
        
        {/* Text component removed - causes GPU memory issues */}
        {/* Equipment info now shown in UI overlay instead */}
      </group>
      
      {/* Disable previous position rendering for performance */}
    </>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const Equipment3D = memo(Equipment3DComponent, (prevProps, nextProps) => {
  return (
    prevProps.equipment.id === nextProps.equipment.id &&
    prevProps.visible === nextProps.visible &&
    prevProps.equipment.fourDStatus === nextProps.equipment.fourDStatus
  );
});