import { useEffect, useMemo, useState } from 'react';
import { Plus, Save, RefreshCw } from 'lucide-react';
import { useBIMStore } from '../../store/bimStore';
import type { BIMEquipment } from '../../types/bim';

export function DesignControls() {
  const [isAddingEquipment, setIsAddingEquipment] = useState(false);
  const [isMovingEquipment, setIsMovingEquipment] = useState(false);
  const [newEquipmentData, setNewEquipmentData] = useState({
    name: '',
    type: 'server' as BIMEquipment['type'],
    rackId: '',
    rackUnit: 1,
    unitHeight: 2
  });
  const [moveData, setMoveData] = useState({
    newRackId: '',
    newRackUnit: 1
  });

  // Realistic equipment presets
  const equipmentPresets = {
    server: [
      { name: 'Dell PowerEdge R640', unitHeight: 1, power: 550 },
      { name: 'Dell PowerEdge R750', unitHeight: 2, power: 750 },
      { name: 'HP ProLiant DL380 Gen10', unitHeight: 2, power: 800 },
      { name: 'Dell PowerEdge R840', unitHeight: 4, power: 1600 }
    ],
    switch: [
      { name: 'Cisco Catalyst 9300', unitHeight: 1, power: 350 },
      { name: 'Cisco Nexus 9336C-FX2', unitHeight: 2, power: 650 },
      { name: 'Arista 7050SX3-48YC12', unitHeight: 1, power: 400 }
    ],
    router: [
      { name: 'Cisco ISR 4451', unitHeight: 2, power: 450 },
      { name: 'Juniper MX204', unitHeight: 2, power: 500 }
    ],
    storage: [
      { name: 'NetApp FAS8300', unitHeight: 2, power: 800 },
      { name: 'Pure Storage FlashArray//X90', unitHeight: 3, power: 1400 },
      { name: 'Dell EMC Unity XT 480', unitHeight: 2, power: 850 }
    ],
    ups: [
      { name: 'APC Smart-UPS SRT 3000', unitHeight: 2, power: 0 },
      { name: 'APC Smart-UPS SRT 6000', unitHeight: 4, power: 0 },
      { name: 'Eaton 9PX 3000RT', unitHeight: 3, power: 0 }
    ],
    firewall: [
      { name: 'Palo Alto PA-5220', unitHeight: 1, power: 300 },
      { name: 'Fortinet FortiGate 600E', unitHeight: 1, power: 280 },
      { name: 'Checkpoint 6600 Appliance', unitHeight: 2, power: 550 }
    ],
    pdu: [
      { name: 'APC AP8841 Metered PDU', unitHeight: 1, power: 0 },
      { name: 'Raritan PX3-5466', unitHeight: 1, power: 0 }
    ],
    'patch-panel': [
      { name: 'Panduit CP48WSBLY', unitHeight: 1, power: 0 },
      { name: 'Leviton 49255-H48', unitHeight: 1, power: 0 }
    ]
  } as const;

  const {
    currentSite,
    selectedEquipmentId,
    addEquipment,
    updateEquipmentStatus,
    moveEquipment,
    setMovePreview,
    applyDesignChanges,
    refreshSite
  } = useBIMStore();

  const selectedEquipment = currentSite?.equipment.find(e => e.id === selectedEquipmentId);
  const plannedMoveLabel = useMemo(() => {
    if (!currentSite || !selectedEquipment) return null;

    // If a move is already planned, show that.
    if (selectedEquipment.plannedMove) {
      const rackName = currentSite.racks.find(r => r.id === selectedEquipment.plannedMove?.targetRackId)?.name;
      return {
        rackName: rackName || selectedEquipment.plannedMove.targetRackId,
        unit: selectedEquipment.plannedMove.targetRackUnit,
      };
    }

    // If the status is "modified" (Move Equipment), at minimum show current location as destination
    // until the user selects a target.
    if (selectedEquipment.fourDStatus === 'modified') {
      const rackName = currentSite.racks.find(r => r.id === selectedEquipment.rackId)?.name;
      return {
        rackName: rackName || selectedEquipment.rackId,
        unit: selectedEquipment.rackUnit,
      };
    }

    return null;
  }, [currentSite, selectedEquipment]);

  const moveTargetLabel = useMemo(() => {
    if (!currentSite || !moveData.newRackId) return null;
    const rackName = currentSite.racks.find(r => r.id === moveData.newRackId)?.name;
    return {
      rackName: rackName || moveData.newRackId,
      unit: moveData.newRackUnit,
    };
  }, [currentSite, moveData.newRackId, moveData.newRackUnit]);

  // Compute conflicts for the current move target.
  const moveConflict = useMemo(() => {
    if (!currentSite || !selectedEquipmentId || !selectedEquipment || !isMovingEquipment) return null;
    if (!moveData.newRackId) return null;

    const targetFrom = moveData.newRackUnit;
    const targetTo = moveData.newRackUnit + selectedEquipment.unitHeight - 1;

    const conflicts = currentSite.equipment
      .filter(e => e.id !== selectedEquipmentId)
      .filter(e => e.fourDStatus !== 'existing-removed')
      .filter(e => e.rackId === moveData.newRackId)
      .filter(e => {
        const from = e.rackUnit;
        const to = e.rackUnit + e.unitHeight - 1;
        return !(to < targetFrom || from > targetTo);
      });

    if (conflicts.length === 0) return null;

    // Show the first conflict (enough for the demo UX)
    const c = conflicts[0];
    const cFrom = c.rackUnit;
    const cTo = c.rackUnit + c.unitHeight - 1;
    return { blocker: c, targetFrom, targetTo, blockerFrom: cFrom, blockerTo: cTo };
  }, [currentSite, selectedEquipmentId, selectedEquipment, isMovingEquipment, moveData.newRackId, moveData.newRackUnit]);

  // Push move preview to the store so the 3D viewer can highlight target units.
  // We show the preview while actively moving OR while editing destination for an item whose status is "modified".
  useEffect(() => {
    const shouldPreview =
      !!selectedEquipmentId &&
      !!selectedEquipment &&
      (isMovingEquipment || selectedEquipment.fourDStatus === 'modified');

    if (!shouldPreview || !moveData.newRackId) {
      setMovePreview(null);
      return;
    }

    setMovePreview({
      equipmentId: selectedEquipmentId,
      targetRackId: moveData.newRackId,
      targetRackUnit: moveData.newRackUnit,
      hasConflict: !!moveConflict,
    });

    return () => {
      setMovePreview(null);
    };
  }, [selectedEquipmentId, selectedEquipment, isMovingEquipment, moveData.newRackId, moveData.newRackUnit, moveConflict, setMovePreview]);

  const handleAddEquipment = () => {
    if (!currentSite || !newEquipmentData.name || !newEquipmentData.rackId) return;

    const rack = currentSite.racks.find(r => r.id === newEquipmentData.rackId);
    if (!rack) return;

    // Find the preset for this equipment
    const preset = equipmentPresets[newEquipmentData.type as keyof typeof equipmentPresets]?.find((p: any) => p.name === newEquipmentData.name);
    const unitHeight = preset?.unitHeight || newEquipmentData.unitHeight;
    const powerConsumption = preset?.power || 500;

    const equipment: BIMEquipment = {
      id: `eq-${Date.now()}`,
      name: newEquipmentData.name,
      type: newEquipmentData.type,
      manufacturer: newEquipmentData.name.split(' ')[0] || 'Generic',
      model: newEquipmentData.name.split(' ').slice(1).join(' ') || newEquipmentData.name,
      rackId: newEquipmentData.rackId,
      rackUnit: newEquipmentData.rackUnit,
      unitHeight: unitHeight,
      position: {
        x: rack.position.x,
        // Correct Y position calculation based on rack height of 2.0 units and 42U
        y: (newEquipmentData.rackUnit - 1) * (2.0 / 42) + (unitHeight * (2.0 / 42) / 2),
        z: rack.position.z
      },
      dimensions: { 
        width: 0.48, 
        height: unitHeight * (2.0 / 42), // Each U is 2.0/42 of rack height
        depth: 0.8 
      },
      fourDStatus: 'proposed',
      powerConsumption: powerConsumption,
      serialNumber: `SN-NEW-${Date.now()}`,
      assetTag: `AT-NEW-${Date.now()}`
    };

    addEquipment(equipment);
    setIsAddingEquipment(false);
    setNewEquipmentData({ name: '', type: 'server', rackId: '', rackUnit: 1, unitHeight: 2 });
  };

  const handleStatusChange = (status: BIMEquipment['fourDStatus']) => {
    if (selectedEquipmentId) {
      // If selecting "Modified", show move interface instead
      if (status === 'modified') {
        // Mark as modified for visual semantics (planning a move), but don't relocate until Apply.
        updateEquipmentStatus(selectedEquipmentId, 'modified');
        setIsMovingEquipment(true);
        setMoveData({
          newRackId: selectedEquipment?.rackId || '',
          newRackUnit: selectedEquipment?.rackUnit || 1
        });
      } else {
        // Leaving move mode:
        // - If a valid target is chosen, record a planned move.
        // - Always apply status immediately (independent of move planning).
        if (isMovingEquipment) {
          if (moveData.newRackId && selectedEquipment && !moveConflict) {
            moveEquipment(selectedEquipmentId, moveData.newRackId, moveData.newRackUnit);
          }
          setIsMovingEquipment(false);
          setMovePreview(null);
        }
        updateEquipmentStatus(selectedEquipmentId, status);
      }
    }
  };

  // When a modified (Move Equipment) item is selected outside move-mode, seed the destination editor.
  useEffect(() => {
    if (!currentSite || !selectedEquipmentId || !selectedEquipment) return;
    if (isMovingEquipment) return;
    if (selectedEquipment.fourDStatus !== 'modified') return;

    const targetRackId = selectedEquipment.plannedMove?.targetRackId ?? selectedEquipment.rackId;
    const targetRackUnit = selectedEquipment.plannedMove?.targetRackUnit ?? selectedEquipment.rackUnit;
    setMoveData({ newRackId: targetRackId, newRackUnit: targetRackUnit });
  }, [currentSite, selectedEquipmentId, selectedEquipment, isMovingEquipment]);


  return (
    <div className="space-y-4">
        {!isAddingEquipment ? (
          <button
            onClick={() => setIsAddingEquipment(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <Plus size={18} />
            Add Equipment
          </button>
        ) : (
          <div className="space-y-2 p-3 bg-gray-50 rounded">
            <select
              value={newEquipmentData.type}
              onChange={(e) => {
                const type = e.target.value as BIMEquipment['type'];
                const presets = equipmentPresets[type as keyof typeof equipmentPresets] || [];
                const firstPreset = presets[0];
                setNewEquipmentData({ 
                  ...newEquipmentData, 
                  type,
                  name: firstPreset?.name || '',
                  unitHeight: firstPreset?.unitHeight || 2
                });
              }}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              <option value="server">Server</option>
              <option value="switch">Switch</option>
              <option value="router">Router</option>
              <option value="storage">Storage</option>
              <option value="ups">UPS</option>
              <option value="firewall">Firewall</option>
              <option value="pdu">PDU</option>
              <option value="patch-panel">Patch Panel</option>
            </select>
            
            <select
              value={newEquipmentData.name}
              onChange={(e) => {
                const preset = equipmentPresets[newEquipmentData.type as keyof typeof equipmentPresets]?.find((p: any) => p.name === e.target.value);
                setNewEquipmentData({ 
                  ...newEquipmentData, 
                  name: e.target.value,
                  unitHeight: preset?.unitHeight || 2
                });
              }}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              <option value="">Select Equipment Model</option>
              {equipmentPresets[newEquipmentData.type as keyof typeof equipmentPresets]?.map((preset: any) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name} ({preset.unitHeight}U, {preset.power}W)
                </option>
              ))}
            </select>
            
            {newEquipmentData.name && (
              <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                {(() => {
                  const preset = equipmentPresets[newEquipmentData.type as keyof typeof equipmentPresets]?.find((p: any) => p.name === newEquipmentData.name);
                  return preset ? (
                    <div>
                      <div><strong>Height:</strong> {preset.unitHeight}U ({(preset.unitHeight * 44.5).toFixed(1)}mm)</div>
                      <div><strong>Power:</strong> {preset.power > 0 ? `${preset.power}W` : 'Passive device'}</div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
            <select
              value={newEquipmentData.rackId}
              onChange={(e) => setNewEquipmentData({ ...newEquipmentData, rackId: e.target.value })}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              <option value="">Select Rack</option>
              {currentSite?.racks.map(rack => (
                <option key={rack.id} value={rack.id}>{rack.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Rack Unit"
              value={newEquipmentData.rackUnit}
              onChange={(e) => setNewEquipmentData({ ...newEquipmentData, rackUnit: parseInt(e.target.value) })}
              className="w-full px-2 py-1 border rounded text-sm"
              min="1"
              max="42"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddEquipment}
                className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Add
              </button>
              <button
                onClick={() => setIsAddingEquipment(false)}
                className="flex-1 px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {selectedEquipment && !isMovingEquipment && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">Selected Equipment</h4>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {selectedEquipment.type}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-800">{selectedEquipment.name}</p>
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>Rack:</strong> {currentSite?.racks.find(r => r.id === selectedEquipment.rackId)?.name}</div>
              <div><strong>Unit:</strong> U{selectedEquipment.rackUnit}</div>
              <div><strong>Status:</strong> <span className="capitalize">{selectedEquipment.fourDStatus}</span></div>
              {plannedMoveLabel && (
                <div><strong>Planned move:</strong> {plannedMoveLabel.rackName} @ U{plannedMoveLabel.unit}</div>
              )}
            </div>
            <div className="flex gap-2">
              <select
                value={selectedEquipment.fourDStatus}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="existing-retained">Existing-Retained</option>
                <option value="existing-removed">Existing-Removed</option>
                <option value="proposed">Proposed</option>
                <option value="future">Future</option>
                <option value="modified">Move Equipment</option>
              </select>
            </div>

            {selectedEquipment.fourDStatus === 'modified' && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-gray-700">Destination</div>
                <select
                  value={moveData.newRackId}
                  onChange={(e) => setMoveData({ ...moveData, newRackId: e.target.value })}
                  className="w-full px-2 py-1 border rounded text-sm"
                >
                  <option value="">Select Rack</option>
                  {currentSite?.racks.map(rack => (
                    <option key={rack.id} value={rack.id}>{rack.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={moveData.newRackUnit}
                  onChange={(e) => setMoveData({ ...moveData, newRackUnit: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 border rounded text-sm"
                  min="1"
                  max="42"
                />

                {moveTargetLabel && (
                  <div className="text-xs text-blue-900 bg-blue-100 border border-blue-200 rounded p-2">
                    <div><strong>Target:</strong> {moveTargetLabel.rackName} @ U{moveTargetLabel.unit}</div>
                    <div className="opacity-80">Arrow/highlight is shown in 3D while editing.</div>
                  </div>
                )}

                {moveConflict && (
                  <div className="text-xs bg-red-50 border border-red-200 text-red-800 rounded p-2">
                    <div className="font-semibold">Conflict detected</div>
                    <div>
                      Target: U{moveConflict.targetFrom}–U{moveConflict.targetTo}
                    </div>
                    <div>
                      Blocked by: {moveConflict.blocker.name} (U{moveConflict.blockerFrom}–U{moveConflict.blockerTo})
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!selectedEquipmentId || !moveData.newRackId || !!moveConflict) return;
                    moveEquipment(selectedEquipmentId, moveData.newRackId, moveData.newRackUnit);
                  }}
                  className="w-full px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  disabled={!moveData.newRackId || !!moveConflict}
                >
                  Save Destination
                </button>
              </div>
            )}
          </div>
        )}

        {selectedEquipment && isMovingEquipment && (
          <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">Move Equipment</h4>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                Modified
              </span>
            </div>
            <p className="text-sm font-medium text-gray-800">{selectedEquipment.name}</p>

            {/* Allow changing status even while planning a move */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">4D Status:</label>
              <select
                value={selectedEquipment.fourDStatus === 'modified' ? 'existing-retained' : selectedEquipment.fourDStatus}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="existing-retained">Existing-Retained</option>
                <option value="existing-removed">Existing-Removed</option>
                <option value="proposed">Proposed</option>
                <option value="future">Future</option>
              </select>
            </div>

            <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
              <div><strong>Current Location:</strong></div>
              <div>Rack: {currentSite?.racks.find(r => r.id === selectedEquipment.rackId)?.name}</div>
              <div>Unit: U{selectedEquipment.rackUnit}</div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">New Location:</label>
              <select
                value={moveData.newRackId}
                onChange={(e) => setMoveData({ ...moveData, newRackId: e.target.value })}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="">Select Rack</option>
                {currentSite?.racks.map(rack => (
                  <option key={rack.id} value={rack.id}>{rack.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="New Rack Unit"
                value={moveData.newRackUnit}
                onChange={(e) => setMoveData({ ...moveData, newRackUnit: parseInt(e.target.value) })}
                className="w-full px-2 py-1 border rounded text-sm"
                min="1"
                max="42"
              />
            </div>

            {moveTargetLabel && (
              <div className="text-xs text-purple-900 bg-purple-100 border border-purple-200 rounded p-2">
                <div><strong>Target:</strong> {moveTargetLabel.rackName} @ U{moveTargetLabel.unit}</div>
              </div>
            )}

            {moveConflict && (
              <div className="text-xs bg-red-50 border border-red-200 text-red-800 rounded p-2">
                <div className="font-semibold">Conflict detected</div>
                <div>
                  Target: U{moveConflict.targetFrom}–U{moveConflict.targetTo}
                </div>
                <div>
                  Blocked by: {moveConflict.blocker.name} (U{moveConflict.blockerFrom}–U{moveConflict.blockerTo})
                </div>
              </div>
            )}

            {!moveConflict && moveData.newRackId && (
              <div className="text-xs bg-purple-100 border border-purple-200 text-purple-900 rounded p-2">
                <div className="font-semibold">Move planned</div>
                <div>This relocation will be committed when you click <strong>Apply Design Changes</strong>.</div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsMovingEquipment(false);
                  setMovePreview(null);
                }}
                className="flex-1 px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="pt-3 border-t space-y-2">
          <button
            onClick={applyDesignChanges}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Save size={18} />
            Apply Design Changes
          </button>
          
          <button
            onClick={refreshSite}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh View
          </button>
        </div>
      </div>
  );
}