import { Building2, Eye, EyeOff } from 'lucide-react';
import { useBIMStore } from '../../store/bimStore';

export function ViewControls() {
  const { buildingVisible, toggleBuilding } = useBIMStore();

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
        <Building2 size={16} className="text-blue-600" />
        View Options
      </h3>
      <button
        onClick={toggleBuilding}
        className={`pill-button ${
          buildingVisible ? 'pill-button-active' : 'pill-button-inactive'
        }`}
      >
        <span>Building Shell</span>
        {buildingVisible ? (
          <Eye size={14} className="text-gray-500" />
        ) : (
          <EyeOff size={14} className="text-gray-400" />
        )}
      </button>
    </div>
  );
}