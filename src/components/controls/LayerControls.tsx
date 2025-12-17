import { Eye, EyeOff } from 'lucide-react';
import { useBIMStore } from '../../store/bimStore';
import type { FourDStatus } from '../../types/bim';

const layerInfo: Record<FourDStatus, { label: string; description: string }> = {
  'existing-retained': { label: 'Existing To Be Retained', description: 'As-Is equipment to keep' },
  'existing-removed': { label: 'Existing To Be Removed', description: 'Equipment to remove' },
  'proposed': { label: 'Proposed', description: 'New equipment to add' },
  'future': { label: 'Future', description: 'Reserved for future use' },
  'modified': { label: 'Modified', description: 'Relocated equipment' }
};

export function LayerControls() {
  const { layerVisibility, toggleLayer, colorScheme } = useBIMStore();

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-3">4D Status Layers</h3>
      <div className="space-y-2">
        {(Object.keys(layerInfo) as FourDStatus[]).map(status => (
          <div
            key={status}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
            onClick={() => toggleLayer(status)}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colorScheme[status] }}
              />
              <div>
                <div className="font-medium text-sm">{layerInfo[status].label}</div>
                <div className="text-xs text-gray-500">{layerInfo[status].description}</div>
              </div>
            </div>
            {layerVisibility[status] ? (
              <Eye size={18} className="text-blue-600" />
            ) : (
              <EyeOff size={18} className="text-gray-400" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}