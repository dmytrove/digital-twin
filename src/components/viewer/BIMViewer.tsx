import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Plane, TransformControls } from '@react-three/drei';
import { useMemo, memo, useEffect, useRef, useCallback } from 'react';
import { useBIMStore } from '../../store/bimStore';
import { Equipment3D } from './Equipment3D';
import { SimplifiedRack } from './SimplifiedRack';
import { Building3D } from './Building3D';
import type { BIMEquipment } from '../../types/bim';
import * as THREE from 'three';

type SnapResult = {
  rackId: string;
  rackUnit: number;
  worldPos: THREE.Vector3;
  hasConflict: boolean;
} | null;

// Simple animated overlay for move previews (highlight + ghosts + arrow)
const MovePreviewOverlay = memo(function MovePreviewOverlay() {
  const { currentSite, movePreview, selectedEquipmentId } = useBIMStore();

  // Keep equipment footprint constant in 3D (only height varies).
  // This must match Equipment3D + synthetic data.
  const STANDARD_EQUIPMENT_WIDTH = 0.48;
  const STANDARD_EQUIPMENT_DEPTH = 0.8;

  const pulseRef = useRef<{ t: number }>({ t: 0 });
  const highlightMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const ghostTargetMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const arrowMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const edgeMatRef = useRef<THREE.LineBasicMaterial | null>(null);

  useFrame((_state, delta) => {
    pulseRef.current.t += delta;
    const t = pulseRef.current.t;
    // Smooth, non-distracting pulse in [0..1]
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.6);

    if (highlightMatRef.current) {
      // Keep opacity subtle but noticeable
      highlightMatRef.current.opacity = THREE.MathUtils.lerp(0.12, 0.28, pulse);
      highlightMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(0.15, 0.55, pulse);
    }
    if (ghostTargetMatRef.current) {
      ghostTargetMatRef.current.opacity = THREE.MathUtils.lerp(0.16, 0.32, pulse);
    }
    if (arrowMatRef.current) {
      arrowMatRef.current.opacity = THREE.MathUtils.lerp(0.55, 0.95, pulse);
      arrowMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(0.2, 0.6, pulse);
    }
    if (edgeMatRef.current) {
      edgeMatRef.current.opacity = THREE.MathUtils.lerp(0.55, 1.0, pulse);
    }
  });

  const data = useMemo(() => {
    if (!currentSite) return null;

    // Prefer live preview (while user is actively choosing a destination).
    // Fallback: show persisted plannedMove for the selected equipment.
    const activePreview = movePreview
      ? movePreview
      : (() => {
          if (!selectedEquipmentId) return null;
          const sel = currentSite.equipment.find(e => e.id === selectedEquipmentId);
          if (!sel?.plannedMove) return null;
          return {
            equipmentId: sel.id,
            targetRackId: sel.plannedMove.targetRackId,
            targetRackUnit: sel.plannedMove.targetRackUnit,
            hasConflict: undefined,
          };
        })();

    if (!activePreview) return null;

    const moving = currentSite.equipment.find(e => e.id === activePreview.equipmentId);
    const sourceRack = moving ? currentSite.racks.find(r => r.id === moving.rackId) : undefined;
    const targetRack = currentSite.racks.find(r => r.id === activePreview.targetRackId);
    if (!moving || !targetRack) return null;

    const totalUnits = targetRack.totalUnits || 42;
  const startUnit = Math.max(1, Math.min(totalUnits, activePreview.targetRackUnit));
    const endUnit = Math.min(totalUnits, startUnit + moving.unitHeight - 1);
    const unitHeight = targetRack.dimensions.height / totalUnits;

    const highlightHeight = (endUnit - startUnit + 1) * unitHeight;
    const yLocal = -targetRack.dimensions.height / 2 + (startUnit - 1) * unitHeight + highlightHeight / 2;
    const targetY = targetRack.position.y + targetRack.dimensions.height / 2 + yLocal;

    // Conflicts (viewer can recompute, but we also accept the UI hint)
    const conflicts = currentSite.equipment
      .filter((e: BIMEquipment) => e.id !== moving.id)
      .filter((e: BIMEquipment) => e.fourDStatus !== 'existing-removed')
      .filter((e: BIMEquipment) => e.rackId === targetRack.id)
      .filter((e: BIMEquipment) => {
        const from = e.rackUnit;
        const to = e.rackUnit + e.unitHeight - 1;
        return !(to < startUnit || from > endUnit);
      });
  const hasConflict = activePreview.hasConflict ?? (conflicts.length > 0);

    const targetPos: [number, number, number] = [targetRack.position.x, targetY, targetRack.position.z];
    const sourcePos: [number, number, number] = [moving.position.x, moving.position.y, moving.position.z];

    // Build a smooth curve from source to target
    const mid: THREE.Vector3 = new THREE.Vector3(
      (sourcePos[0] + targetPos[0]) / 2,
      Math.max(sourcePos[1], targetPos[1]) + 1.2,
      (sourcePos[2] + targetPos[2]) / 2
    );
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...sourcePos),
      mid,
      new THREE.Vector3(...targetPos)
    );
    const points = curve.getPoints(32);
    const arrowPath = new THREE.CatmullRomCurve3(points);
    const arrowTube = new THREE.TubeGeometry(arrowPath, 64, 0.055, 10, false);

    // Arrow head oriented towards target
    const tangent = curve.getTangent(1);
    const arrowHeadPos = curve.getPoint(1);
    const dir = new THREE.Vector3(tangent.x, tangent.y, tangent.z).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    return {
      moving,
      sourceRack,
      targetRack,
      startUnit,
      endUnit,
      hasConflict,
      targetPos,
      sourcePos,
      highlight: {
        position: [targetRack.position.x, targetY, targetRack.position.z] as [number, number, number],
        size: [targetRack.dimensions.width * 1.06, highlightHeight * 1.03, targetRack.dimensions.depth * 1.06] as [number, number, number],
      },
      arrow: {
        tube: arrowTube,
        headPos: [arrowHeadPos.x, arrowHeadPos.y, arrowHeadPos.z] as [number, number, number],
        headQuat: [quat.x, quat.y, quat.z, quat.w] as [number, number, number, number],
      },
    };
  }, [currentSite, movePreview, selectedEquipmentId]);

  if (!data) return null;

  const baseColor = data.hasConflict ? '#dc2626' : '#16a34a';

  return (
    <group>
      {/* Target U-range highlight: fill + bright outline */}
      <mesh position={data.highlight.position}>
        <boxGeometry args={data.highlight.size} />
        <meshStandardMaterial
          color={baseColor}
          transparent
          opacity={data.hasConflict ? 0.28 : 0.18}
          depthWrite={false}
          emissive={baseColor}
          emissiveIntensity={0.25}
          ref={highlightMatRef}
        />
      </mesh>
      <lineSegments position={data.highlight.position}>
        <edgesGeometry args={[new THREE.BoxGeometry(...data.highlight.size)]} />
        <lineBasicMaterial color={baseColor} transparent opacity={0.95} ref={edgeMatRef} />
      </lineSegments>

      {/* Ghost at target location */}
      <mesh position={data.targetPos}>
        <boxGeometry args={[STANDARD_EQUIPMENT_WIDTH, data.moving.dimensions.height, STANDARD_EQUIPMENT_DEPTH]} />
        <meshStandardMaterial
          color={baseColor}
          transparent
          opacity={data.hasConflict ? 0.18 : 0.25}
          depthWrite={false}
          ref={ghostTargetMatRef}
        />
      </mesh>

      {/* Emphasize original location */}
      <mesh position={data.sourcePos}>
        <boxGeometry args={[STANDARD_EQUIPMENT_WIDTH, data.moving.dimensions.height, STANDARD_EQUIPMENT_DEPTH]} />
        <meshStandardMaterial
          color="#2563eb"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>

      {/* Organic arrow (thick tube + small head) */}
      <mesh>
        <primitive object={data.arrow.tube} attach="geometry" />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={0.35}
          transparent
          opacity={0.9}
          depthWrite={false}
          ref={arrowMatRef}
        />
      </mesh>
      <mesh position={data.arrow.headPos} quaternion={new THREE.Quaternion(...data.arrow.headQuat)}>
        <coneGeometry args={[0.07, 0.22, 12]} />
        <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.4} transparent opacity={0.9} />
      </mesh>
    </group>
  );
});

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
  const {
    currentSite,
    layerVisibility,
    buildingVisible,
    selectEquipment,
    selectedEquipmentId,
    setMovePreview,
    moveEquipment,
    updateEquipmentStatus,
  } = useBIMStore();

  const controlsRef = useRef<any>(null);
  const dragObjectRef = useRef<THREE.Object3D>(null);
  const lastSnapRef = useRef<SnapResult>(null);

  // Constants must match synthetic data + Equipment3D.
  const STANDARD_EQUIPMENT_WIDTH = 0.48;
  const STANDARD_EQUIPMENT_DEPTH = 0.8;
  
  // Handle background click to deselect equipment
  const handleBackgroundClick = () => {
    selectEquipment(null);
  };

  // Filter visible equipment based on layer visibility
  const visibleEquipment = useMemo(() => {
    if (!currentSite) return [];
    return currentSite.equipment.filter(equipment => layerVisibility[equipment.fourDStatus]);
  }, [currentSite?.equipment, layerVisibility]);

  const selectedEquipment = useMemo(() => {
    if (!currentSite || !selectedEquipmentId) return null;
    return currentSite.equipment.find(e => e.id === selectedEquipmentId) ?? null;
  }, [currentSite, selectedEquipmentId]);

  // Filter visible racks based on layer visibility
  const visibleRacks = useMemo(() => {
    if (!currentSite) return [];
    return currentSite.racks.filter(rack => layerVisibility[rack.fourDStatus]);
  }, [currentSite?.racks, layerVisibility]);

  const snapToRackUnits = useCallback((worldPos: THREE.Vector3): SnapResult => {
    if (!currentSite || !selectedEquipment) return null;

    // Pick closest rack by XZ distance.
    let bestRack = null as any;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const rack of currentSite.racks) {
      // Allow snapping even if rack is currently hidden by layers (designer may want to move to it).
      const dx = worldPos.x - rack.position.x;
      const dz = worldPos.z - rack.position.z;
      const d2 = dx * dx + dz * dz;
      if (d2 < bestDist) {
        bestDist = d2;
        bestRack = rack;
      }
    }
    if (!bestRack) return null;

    const totalUnits = bestRack.totalUnits || 42;
    const unitHeight = bestRack.dimensions.height / totalUnits;

    // Map Y into rack-local unit index.
    // Rack is centered around rack.position.y with height bestRack.dimensions.height.
    const rackBottomY = bestRack.position.y; // in this demo racks are at y=0 and extend upwards
    const localY = worldPos.y - rackBottomY;
    let unit = Math.floor(localY / unitHeight) + 1;
    unit = Math.max(1, Math.min(totalUnits, unit));

    // Clamp so it fits equipment height
    unit = Math.min(unit, totalUnits - selectedEquipment.unitHeight + 1);

    // Compute snapped world position (center of occupied U-range)
    const snappedY = rackBottomY + (unit - 1) * unitHeight + (selectedEquipment.unitHeight * unitHeight) / 2;
    const snapped = new THREE.Vector3(bestRack.position.x, snappedY, bestRack.position.z);

    // Conflict check: overlap in unit range at destination
    const startUnit = unit;
    const endUnit = unit + selectedEquipment.unitHeight - 1;
    const conflicts = currentSite.equipment
      .filter(e => e.id !== selectedEquipment.id)
      .filter(e => e.fourDStatus !== 'existing-removed')
      .filter(e => e.rackId === bestRack.id)
      .filter(e => {
        const from = e.rackUnit;
        const to = e.rackUnit + e.unitHeight - 1;
        return !(to < startUnit || from > endUnit);
      });

    return {
      rackId: bestRack.id,
      rackUnit: unit,
      worldPos: snapped,
      hasConflict: conflicts.length > 0,
    };
  }, [currentSite, selectedEquipment]);

  // Keep the gizmo's proxy object in sync when selection changes.
  useEffect(() => {
    if (!selectedEquipment || !dragObjectRef.current) {
      lastSnapRef.current = null;
      return;
    }

    dragObjectRef.current.position.set(
      selectedEquipment.position.x,
      selectedEquipment.position.y,
      selectedEquipment.position.z
    );

    // Seed preview from current selection location.
    const seedSnap = snapToRackUnits(dragObjectRef.current.position);
    lastSnapRef.current = seedSnap;
    if (seedSnap) {
      setMovePreview({
        equipmentId: selectedEquipment.id,
        targetRackId: seedSnap.rackId,
        targetRackUnit: seedSnap.rackUnit,
        hasConflict: seedSnap.hasConflict,
      });
    } else {
      setMovePreview(null);
    }
  }, [selectedEquipment, setMovePreview, snapToRackUnits]);

  // Build a move highlight box when user is previewing a move action.
  // Move preview visuals rendered by overlay component

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

      {/* 3D Move gizmo for selected equipment */}
      {selectedEquipment && (
        <TransformControls
          ref={controlsRef}
          object={dragObjectRef.current ?? undefined}
          mode="translate"
          showX
          showZ
          showY={false}
          size={0.85}
          enabled
          onMouseDown={() => {
            // (Optional) we could disable orbit controls here if we keep a ref to them.
          }}
          onObjectChange={() => {
            if (!dragObjectRef.current) return;

            // Constrain to XZ plane of rack grid; Y will be snapped.
            const p = dragObjectRef.current.position;
            // Prevent dragging below floor
            p.y = Math.max(0.01, p.y);

            const snap = snapToRackUnits(p);
            if (!snap) return;

            lastSnapRef.current = snap;

            // Snap the proxy object for a "magnetic" feel.
            p.set(snap.worldPos.x, snap.worldPos.y, snap.worldPos.z);

            setMovePreview({
              equipmentId: selectedEquipment.id,
              targetRackId: snap.rackId,
              targetRackUnit: snap.rackUnit,
              hasConflict: snap.hasConflict,
            });
          }}
          onMouseUp={() => {
            // Commit a planned move when drag ends.
            if (!selectedEquipment) return;
            const snap = lastSnapRef.current;
            if (!snap) {
              setMovePreview(null);
              return;
            }
            if (snap.hasConflict) {
              // Don't commit invalid moves; keep preview so user sees the issue.
              return;
            }

            // Mark as modified for UX and store the planned destination.
            updateEquipmentStatus(selectedEquipment.id, 'modified');
            moveEquipment(selectedEquipment.id, snap.rackId, snap.rackUnit);
          }}
        />
      )}
      
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
      
  {/* Axes helper removed (debug-only) */}

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

      {/* Move-preview overlay: clearer target highlight + ghost source/target + arrow */}
      <MovePreviewOverlay />

      {visibleEquipment.map(equipment => (
        <Equipment3D
          key={equipment.id}
          equipment={equipment}
          visible={true}
        />
      ))}

      {/* Proxy object for TransformControls to attach to */}
      {selectedEquipment && (
        <group>
          <object3D ref={dragObjectRef} />

          {/* Small, subtle handle marker at the proxy position */}
          <mesh
            position={[selectedEquipment.position.x, selectedEquipment.position.y, selectedEquipment.position.z]}
            onClick={(e) => {
              e.stopPropagation();
              selectEquipment(selectedEquipment.id);
            }}
          >
            <boxGeometry args={[STANDARD_EQUIPMENT_WIDTH, selectedEquipment.dimensions.height, STANDARD_EQUIPMENT_DEPTH]} />
            <meshStandardMaterial color="#000000" transparent opacity={0.0} />
          </mesh>
        </group>
      )}
    </Canvas>
  );
};

// Memoize the BIM viewer to prevent unnecessary re-renders
export const BIMViewer = memo(BIMViewerComponent);