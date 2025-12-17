import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Plane } from '@react-three/drei';
import { useBIMStore } from '../../store/bimStore';
import { Equipment3D } from './Equipment3D';
import { Rack3D } from './Rack3D';
import { Building3D } from './Building3D';

export function BIMViewer() {
  const { currentSite, layerVisibility, buildingVisible } = useBIMStore();

  if (!currentSite) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No site selected
      </div>
    );
  }

  return (
    <Canvas 
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
      shadows
    >
      <PerspectiveCamera makeDefault position={[15, 10, 15]} />
      <OrbitControls enableDamping dampingFactor={0.05} />
      
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <directionalLight position={[-10, 10, -5]} intensity={0.6} />
      <pointLight position={[0, 15, 0]} intensity={0.4} />

      <Plane 
        args={[100, 100]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#f8fafc" />
      </Plane>

      <Grid
        args={[50, 50]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#cbd5e1"
        sectionSize={5}
        sectionThickness={1.5}
        sectionColor="#94a3b8"
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
      />

      <Building3D
        building={currentSite.building}
        visible={buildingVisible}
      />

      {currentSite.racks.map(rack => (
        <Rack3D
          key={rack.id}
          rack={rack}
          visible={layerVisibility[rack.fourDStatus]}
        />
      ))}

      {currentSite.equipment.map(equipment => (
        <Equipment3D
          key={equipment.id}
          equipment={equipment}
          visible={layerVisibility[equipment.fourDStatus]}
        />
      ))}
    </Canvas>
  );
}