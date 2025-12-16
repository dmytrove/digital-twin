import { useState } from 'react';
import { Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import { useBIMStore } from '../../store/bimStore';
import type { BIMEquipment } from '../../types/bim';

export function DesignControls() {
  const [isAddingEquipment, setIsAddingEquipment] = useState(false);
  const [newEquipmentData, setNewEquipmentData] = useState({
    name: '',
    type: 'server' as BIMEquipment['type'],
    rackId: '',
    rackUnit: 1
  });

  const {
    currentSite,
    selectedEquipmentId,
    addEquipment,
    removeEquipment,
    updateEquipmentStatus,
    applyDesignChanges,
    refreshSite
  } = useBIMStore();

  const selectedEquipment = currentSite?.equipment.find(e => e.id === selectedEquipmentId);

  const handleAddEquipment = () => {
    if (!currentSite || !newEquipmentData.name || !newEquipmentData.rackId) return;

    const rack = currentSite.racks.find(r => r.id === newEquipmentData.rackId);
    if (!rack) return;

    const equipment: BIMEquipment = {
      id: `eq-${Date.now()}`,
      name: newEquipmentData.name,
      type: newEquipmentData.type,
      manufacturer: newEquipmentData.name.split(' ')[0] || 'Generic',
      model: newEquipmentData.name,
      rackId: newEquipmentData.rackId,
      rackUnit: newEquipmentData.rackUnit,
      unitHeight: 2,
      position: {
        x: rack.position.x,
        y: (newEquipmentData.rackUnit - 1) * 0.0445 + 0.5,
        z: rack.position.z
      },
      dimensions: { width: 0.48, height: 0.089, depth: 0.8 },
      fourDStatus: 'proposed',
      powerConsumption: 500,
      serialNumber: `SN-NEW-${Date.now()}`,
      assetTag: `AT-NEW-${Date.now()}`
    };

    addEquipment(equipment);
    setIsAddingEquipment(false);
    setNewEquipmentData({ name: '', type: 'server', rackId: '', rackUnit: 1 });
  };

  const handleRemoveEquipment = () => {
    if (selectedEquipmentId) {
      removeEquipment(selectedEquipmentId);
    }
  };

  const handleStatusChange = (status: BIMEquipment['fourDStatus']) => {
    if (selectedEquipmentId) {
      updateEquipmentStatus(selectedEquipmentId, status);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-3">Design Controls</h3>
      
      <div className="space-y-3">
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
            <input
              type="text"
              placeholder="Equipment name"
              value={newEquipmentData.name}
              onChange={(e) => setNewEquipmentData({ ...newEquipmentData, name: e.target.value })}
              className="w-full px-2 py-1 border rounded text-sm"
            />
            <select
              value={newEquipmentData.type}
              onChange={(e) => setNewEquipmentData({ ...newEquipmentData, type: e.target.value as any })}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              <option value="server">Server</option>
              <option value="switch">Switch</option>
              <option value="router">Router</option>
              <option value="storage">Storage</option>
              <option value="ups">UPS</option>
            </select>
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

        {selectedEquipment && (
          <div className="space-y-2 p-3 bg-blue-50 rounded">
            <p className="text-sm font-medium">Selected: {selectedEquipment.name}</p>
            <div className="flex gap-2">
              <button
                onClick={handleRemoveEquipment}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                <Trash2 size={14} />
                Remove
              </button>
              <select
                value={selectedEquipment.fourDStatus}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                className="flex-1 px-2 py-1 border rounded text-sm"
              >
                <option value="existing-retained">Existing-Retained</option>
                <option value="existing-removed">Existing-Removed</option>
                <option value="proposed">Proposed</option>
                <option value="future">Future</option>
                <option value="modified">Modified</option>
              </select>
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
    </div>
  );
}