import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Layers, Settings } from 'lucide-react';
import { BIMViewer } from '../components/viewer/BIMViewer';
import { LayerControls } from '../components/controls/LayerControls';
import { ColorControls } from '../components/controls/ColorControls';
import { ViewControls } from '../components/controls/ViewControls';
import { DesignControls } from '../components/controls/DesignControls';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { useBIMStore } from '../store/bimStore';
import { useEffect, useState } from 'react';

export function SitePage() {
  const { siteId } = useParams();
  const { sites, currentSite, loadSites, selectSite, selectedEquipmentId } = useBIMStore();
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [layersVisible, setLayersVisible] = useState(false);

  // Load sites first, then select the specific site
  useEffect(() => {
    // If sites haven't been loaded yet, load them first
    if (sites.length === 0) {
      loadSites();
    }
  }, [sites.length, loadSites]);

  // Once sites are loaded, select the current site
  useEffect(() => {
    if (siteId && sites.length > 0) {
      selectSite(siteId);
    }
  }, [siteId, sites.length, selectSite]);

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
    <div className="viewport-full bg-gray-100">
      {/* 3D Viewer - Full Screen */}
      <div className="absolute inset-0">
        <BIMViewer />
      </div>

      {/* Navigation Overlay - Top Left */}
      <div className="absolute top-4 left-4 z-20">
        <div className="glass-panel p-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            <ArrowLeft size={18} />
            Back to Map
          </Link>
        </div>
      </div>

      {/* Site Info Overlay - Top Center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="glass-panel px-4 py-3">
          <h1 className="text-lg font-bold text-gray-800 text-center">{currentSite.name}</h1>
          <p className="text-xs text-gray-600 text-center">
            {currentSite.address}, {currentSite.city}, {currentSite.state}
          </p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              {currentSite.racks.length} Racks
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
              {currentSite.equipment.length} Equipment
            </span>
          </div>
        </div>
      </div>

      {/* Left Sliding Panel - Layers & Controls */}
      <div 
        className={`absolute left-0 top-20 bottom-0 z-10 transition-transform duration-300 ease-in-out ${
          layersVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '380px' }}
      >
        <div className="h-full overflow-y-auto bg-white shadow-2xl border-r border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Layers size={20} className="text-blue-600" />
              Layers & View
            </h2>
            <button
              onClick={() => setLayersVisible(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Hide panel"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
          </div>
          <LayerControls />
          <ColorControls />
          <ViewControls />
        </div>
      </div>

      {/* Left Panel Toggle Button (when collapsed) */}
      {!layersVisible && (
        <button
          onClick={() => setLayersVisible(true)}
          className="absolute left-0 top-32 z-10 bg-white rounded-r-lg shadow-lg px-2 py-4 border-t border-r border-b hover:bg-gray-50 transition-colors"
          title="Show Layers & Controls"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      )}

      {/* Right Sliding Panel - Design Controls (only when equipment selected) */}
      {selectedEquipmentId && (
        <div 
          className="absolute right-0 top-20 bottom-0 z-10 transition-transform duration-300 ease-in-out translate-x-0"
          style={{ width: '380px' }}
        >
          <div className="h-full overflow-y-auto bg-white shadow-2xl border-l border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Settings size={20} className="text-blue-600" />
                Design Controls
              </h2>
            </div>
            <DesignControls />
          </div>
        </div>
      )}

      {/* Bottom Inventory Panel */}
      <div 
        className={`slide-panel h-[300px] ${
          inventoryVisible ? 'bottom-0' : 'bottom-0 translate-y-full'
        }`}
      >
        {/* Inventory Toggle Handle */}
        <div className="bg-gray-100 border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-800">Equipment Inventory</h3>
            <span className="text-xs text-gray-500">
              {currentSite.equipment.length} items • Filtered by 4D status
            </span>
          </div>
          <button
            onClick={() => setInventoryVisible(!inventoryVisible)}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>Hide</span>
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Inventory Content */}
        <div className="h-full overflow-hidden" style={{ height: 'calc(100% - 40px)' }}>
          <InventoryTable />
        </div>
      </div>

      {/* Inventory Peek Handle (when collapsed) */}
      {!inventoryVisible && (
        <button
          onClick={() => setInventoryVisible(true)}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white rounded-t-lg shadow-lg px-4 py-2 border-t border-l border-r z-10 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Equipment Inventory ({currentSite.equipment.length})</span>
            <ChevronUp size={16} />
          </div>
        </button>
      )}

      {/* Performance Overlay - temporarily disabled */}
    </div>
  );
}