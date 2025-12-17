import { Eye, EyeOff } from 'lucide-react';
import { useBIMStore } from '../../store/bimStore';
import type { FourDStatus } from '../../types/bim';

const layerInfo: Record<FourDStatus, { label: string; description: string }> = {
  'existing-retained': { label: 'Existing Retain', description: 'As-Is equipment to keep' },
  'existing-removed': { label: 'Existing Remove', description: 'Equipment to remove' },
  'proposed': { label: 'Proposed', description: 'New equipment to add' },
  'future': { label: 'Future', description: 'Reserved for future use' },
  'modified': { label: 'Modified', description: 'Relocated equipment' }
};

export function LayerControls() {
  const { layerVisibility, toggleLayer, colorScheme, colorMode, setColorMode } = useBIMStore();
  const isColorOn = colorMode === 'fourDStatus';

  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">4D Status Layers</h3>
        
        {/* Color toggle pill */}
        <button
          onClick={() => setColorMode(isColorOn ? 'customer' : 'fourDStatus')}
          className={`pill-button ${
            isColorOn 
              ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' 
              : 'pill-button-inactive'
          }`}
        >
          <div 
            className="w-3 h-3 rounded"
            style={{
              background: isColorOn 
                ? 'linear-gradient(135deg, #ef4444 0%, #ef4444 20%, #6b7280 20%, #6b7280 40%, #22c55e 40%, #22c55e 60%, #eab308 60%, #eab308 80%, #a855f7 80%, #a855f7 100%)'
                : '#9ca3af'
            }}
          />
          <span>Color: {isColorOn ? 'On' : 'Off'}</span>
        </button>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2 mt-1">
        {(Object.keys(layerInfo) as FourDStatus[]).map(status => {
          const isVisible = layerVisibility[status];
          return (
            <button
              key={status}
              onClick={() => toggleLayer(status)}
              className={`pill-button ${
                isVisible ? 'pill-button-active' : 'pill-button-inactive'
              }`}
              title={layerInfo[status].description}
            >
              <span 
                className={`
                  status-dot w-2 h-2 rounded-full transition-opacity
                  ${isColorOn ? 'opacity-100' : 'opacity-0'}
                `}
                style={{ backgroundColor: colorScheme[status] }}
              />
              <span>{layerInfo[status].label}</span>
              {isVisible ? (
                <Eye size={14} className="text-gray-500" />
              ) : (
                <EyeOff size={14} className="text-gray-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}