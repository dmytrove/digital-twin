import { Table2 } from 'lucide-react';
import { useBIMStore } from '../../store/bimStore';
import type { BIMEquipment } from '../../types/bim';

export function InventoryTable() {
  const { currentSite, selectedEquipmentId, selectEquipment, colorScheme, layerVisibility } = useBIMStore();

  if (!currentSite) return null;

  const visibleEquipment = currentSite.equipment.filter(
    eq => layerVisibility[eq.fourDStatus]
  );

  const handleRowClick = (equipment: BIMEquipment) => {
    selectEquipment(equipment.id);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between p-3 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <Table2 size={18} className="text-blue-600" />
          <h3 className="text-base font-semibold">Equipment Inventory</h3>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
            {visibleEquipment.length} items
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Rack</th>
              <th className="px-3 py-2 text-left">Unit</th>
              <th className="px-3 py-2 text-left">4D Status</th>
              <th className="px-3 py-2 text-left">Power (W)</th>
              <th className="px-3 py-2 text-left">Serial #</th>
            </tr>
          </thead>
          <tbody>
            {visibleEquipment.map(equipment => (
              <tr
                key={equipment.id}
                onClick={() => handleRowClick(equipment)}
                className={`
                  border-b cursor-pointer hover:bg-gray-50 transition-colors
                  ${selectedEquipmentId === equipment.id ? 'bg-yellow-50 font-semibold' : ''}
                `}
              >
                <td className="px-3 py-2 font-medium">{equipment.name}</td>
                <td className="px-3 py-2 capitalize">{equipment.type}</td>
                <td className="px-3 py-2">
                  {currentSite.racks.find(r => r.id === equipment.rackId)?.name || equipment.rackId}
                </td>
                <td className="px-3 py-2">U{equipment.rackUnit}</td>
                <td className="px-3 py-2">
                  <span
                    className="px-2 py-1 rounded text-xs text-white font-medium"
                    style={{ backgroundColor: colorScheme[equipment.fourDStatus] }}
                  >
                    {equipment.fourDStatus}
                  </span>
                </td>
                <td className="px-3 py-2">{equipment.powerConsumption}</td>
                <td className="px-3 py-2 text-xs font-mono">{equipment.serialNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}