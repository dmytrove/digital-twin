import { Building2, Eye, EyeOff } from 'lucide-react';
import { useBIMStore } from '../../store/bimStore';

export function ViewControls() {
  const { buildingVisible, toggleBuilding } = useBIMStore();

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-3">View Options</h3>
      <button
        onClick={toggleBuilding}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          <Building2 size={20} className="text-gray-600" />
          <span className="font-medium">Building Shell</span>
        </div>
        {buildingVisible ? (
          <Eye size={18} className="text-blue-600" />
        ) : (
          <EyeOff size={18} className="text-gray-400" />
        )}
      </button>
    </div>
  );
}