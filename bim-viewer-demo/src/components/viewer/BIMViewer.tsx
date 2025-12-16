import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
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
    <Canvas className="bg-gray-900">
      <PerspectiveCamera makeDefault position={[15, 10, 15]} />
      <OrbitControls enableDamping dampingFactor={0.05} />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, 10, -5]} intensity={0.5} />

      <Grid
        args={[50, 50]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#333333"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#555555"
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