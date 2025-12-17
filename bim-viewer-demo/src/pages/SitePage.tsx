import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BIMViewer } from '../components/viewer/BIMViewer';
import { LayerControls } from '../components/controls/LayerControls';
import { ColorControls } from '../components/controls/ColorControls';
import { ViewControls } from '../components/controls/ViewControls';
import { DesignControls } from '../components/controls/DesignControls';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { useBIMStore } from '../store/bimStore';
import { useEffect } from 'react';

export function SitePage() {
  const { siteId } = useParams();
  const { currentSite, selectSite } = useBIMStore();

  useEffect(() => {
    if (siteId) {
      selectSite(siteId);
    }
  }, [siteId, selectSite]);

  if (!currentSite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Site not found</p>
          <Link to="/" className="text-blue-600 hover:underline">
            Return to map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Map
              </Link>
              <div className="border-l pl-4">
                <h1 className="text-2xl font-bold text-gray-800">{currentSite.name}</h1>
                <p className="text-sm text-gray-600">
                  {currentSite.address}, {currentSite.city}, {currentSite.state}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                {currentSite.racks.length} Racks
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                {currentSite.equipment.length} Equipment
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200" style={{ height: '600px' }}>
              <BIMViewer />
            </div>
            
            <InventoryTable />
          </div>

          <div className="space-y-4">
            <LayerControls />
            <ColorControls />
            <ViewControls />
            <DesignControls />
          </div>
        </div>
      </div>
    </div>
  );
}