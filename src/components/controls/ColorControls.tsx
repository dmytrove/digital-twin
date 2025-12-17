import { Palette, Activity, User } from 'lucide-react';
import { useBIMStore } from '../../store/bimStore';

export function ColorControls() {
  const { colorMode, setColorMode } = useBIMStore();

  const colorModes = [
    { id: 'fourDStatus', label: '4D Status', icon: Palette, description: 'Color by deployment status' },
    { id: 'customer', label: 'Customer', icon: User, description: 'Color by customer (Demo)' },
    { id: 'powerConsumption', label: 'Power Usage', icon: Activity, description: 'Color by power consumption' },
  ];

  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      <h3 className="text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
        <Palette size={16} className="text-blue-600" />
        Color Coding
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {colorModes.map(mode => {
          const Icon = mode.icon;
          const isActive = colorMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => setColorMode(mode.id as any)}
              className={`pill-button ${
                isActive 
                  ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' 
                  : 'pill-button-active'
              }`}
              title={mode.description}
            >
              <Icon size={14} />
              <span>{mode.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}