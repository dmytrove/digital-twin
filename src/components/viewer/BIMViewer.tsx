import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Plane } from '@react-three/drei';
import { useMemo, memo, useEffect } from 'react';
import { useBIMStore } from '../../store/bimStore';
import { Equipment3D } from './Equipment3D';
import { SimplifiedRack } from './SimplifiedRack';
import { Building3D } from './Building3D';

// WebGL Context Recovery Component
const WebGLContextHandler = () => {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    
    const handleContextLost = (event: Event) => {
      console.warn('WebGL context lost. Preventing default behavior...');
      event.preventDefault();
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored.');
      window.location.reload(); // Simple reload on context restore
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);

  return null;
};

const BIMViewerComponent = () => {
  const { currentSite, layerVisibility, buildingVisible, selectEquipment } = useBIMStore();
  
  // Handle background click to deselect equipment
  const handleBackgroundClick = () => {
    selectEquipment(null);
  };

  // Filter visible equipment based on layer visibility
  const visibleEquipment = useMemo(() => {
    if (!currentSite) return [];
    return currentSite.equipment.filter(equipment => layerVisibility[equipment.fourDStatus]);
  }, [currentSite?.equipment, layerVisibility]);

  // Filter visible racks based on layer visibility
  const visibleRacks = useMemo(() => {
    if (!currentSite) return [];
    return currentSite.racks.filter(rack => layerVisibility[rack.fourDStatus]);
  }, [currentSite?.racks, layerVisibility]);

  if (!currentSite) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No site selected
      </div>
    );
  }


  return (
    <Canvas 
      style={{ background: '#f8fafc', touchAction: 'none' }}
      shadows={false}
      gl={{
        powerPreference: 'default',
        antialias: false,
        preserveDrawingBuffer: false,
        alpha: false,
        depth: true,
        stencil: false,
        failIfMajorPerformanceCaveat: false,
        precision: 'mediump'
      }}
      dpr={1}
      frameloop="always"
    >
      {/* WebGL Context Recovery Handler */}
      <WebGLContextHandler />
      
      {/* Performance Monitoring - temporarily disabled */}
      
      <PerspectiveCamera 
        makeDefault 
        position={[0, 15, 20]} 
        fov={50}
        near={0.1}
        far={1000}
      />
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05} 
        maxPolarAngle={Math.PI / 2.2}
        maxDistance={100}
        minDistance={2}
        makeDefault
      />
      
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.0} 
      />
      <directionalLight position={[-10, 10, -5]} intensity={0.3} />

      <Plane 
        args={[100, 100]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]}
        receiveShadow
        onClick={handleBackgroundClick}
      >
        <meshStandardMaterial color="#f8fafc" />
      </Plane>

      {/* Grid helper for debugging - minimal GPU impact */}
      <gridHelper args={[30, 30, '#cccccc', '#eeeeee']} position={[0, 0, 0]} onClick={handleBackgroundClick} />
      
      {/* Axes helper for debugging */}
      <axesHelper args={[5]} onClick={handleBackgroundClick} />

      {/* Building shell - controlled by buildingVisible state */}
      {currentSite.building && (
        <Building3D 
          building={currentSite.building} 
          visible={buildingVisible}
        />
      )}

      {/* Simplified rack frames */}
      {visibleRacks.map(rack => (
        <SimplifiedRack key={rack.id} rack={rack} />
      ))}

      {visibleEquipment.map(equipment => (
        <Equipment3D
          key={equipment.id}
          equipment={equipment}
          visible={true}
        />
      ))}
    </Canvas>
  );
};

// Memoize the BIM viewer to prevent unnecessary re-renders
export const BIMViewer = memo(BIMViewerComponent);