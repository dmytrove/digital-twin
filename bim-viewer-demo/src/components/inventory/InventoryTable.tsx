import { useState } from 'react';
import { Table2, ChevronUp, ChevronDown } from 'lucide-react';
import { useBIMStore } from '../../store/bimStore';
import type { BIMEquipment } from '../../types/bim';

export function InventoryTable() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentSite, selectedEquipmentId, selectEquipment, colorScheme, layerVisibility } = useBIMStore();

  if (!currentSite) return null;

  const visibleEquipment = currentSite.equipment.filter(
    eq => layerVisibility[eq.fourDStatus]
  );

  const displayedEquipment = isExpanded ? visibleEquipment : visibleEquipment.slice(0, 5);

  const handleRowClick = (equipment: BIMEquipment) => {
    selectEquipment(equipment.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Table2 size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold">Equipment Inventory</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Show All ({visibleEquipment.length})
            </>
          )}
        </button>
      </div>
      
      <div className="overflow-x-auto">
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
            {displayedEquipment.map(equipment => (
              <tr
                key={equipment.id}
                onClick={() => handleRowClick(equipment)}
                className={`
                  border-b cursor-pointer hover:bg-gray-50 transition-colors
                  ${selectedEquipmentId === equipment.id ? 'bg-yellow-50' : ''}
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
      
      {!isExpanded && visibleEquipment.length > 5 && (
        <div className="p-2 text-center text-sm text-gray-500 border-t">
          Showing 5 of {visibleEquipment.length} items
        </div>
      )}
    </div>
  );
}