import { Palette } from 'lucide-react';
import { useBIMStore } from '../../store/bimStore';

export function ColorControls() {
  const { colorMode, setColorMode } = useBIMStore();

  const colorModes = [
    { value: 'fourDStatus', label: '4D Status', description: 'Color by deployment status' },
    { value: 'customer', label: 'Customer', description: 'Color by customer (Demo)' },
    { value: 'powerConsumption', label: 'Power Usage', description: 'Color by power consumption' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <Palette size={20} className="text-blue-600" />
        <h3 className="text-lg font-semibold">Color Coding</h3>
      </div>
      <div className="space-y-2">
        {colorModes.map(mode => (
          <label
            key={mode.value}
            className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
          >
            <input
              type="radio"
              name="colorMode"
              value={mode.value}
              checked={colorMode === mode.value}
              onChange={() => setColorMode(mode.value as any)}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-sm">{mode.label}</div>
              <div className="text-xs text-gray-500">{mode.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}