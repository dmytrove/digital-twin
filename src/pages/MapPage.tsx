import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Globe } from 'lucide-react';
import { useBIMStore } from '../store/bimStore';
import { InteractiveMap } from '../components/map/InteractiveMap';

export function MapPage() {
  const navigate = useNavigate();
  const { sites, loadSites, selectSite } = useBIMStore();

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  const handleSiteClick = (siteId: string) => {
    selectSite(siteId);
    navigate(`/site/${siteId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">Data Center Locations</h1>
          </div>
          <p className="text-gray-600">Click on any data center marker to explore the facility in 3D</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <InteractiveMap sites={sites} onSiteSelect={handleSiteClick} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map(site => (
            <div
              key={site.id}
              onClick={() => handleSiteClick(site.id)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <MapPin className="text-blue-600 mt-1" size={20} />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{site.name}</h3>
                  <p className="text-sm text-gray-600">{site.address}</p>
                  <p className="text-sm text-gray-600">{site.city}, {site.state}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    <span>{site.racks.length} Racks</span>
                    <span className="mx-2">•</span>
                    <span>{site.equipment.length} Equipment</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}