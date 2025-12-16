import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useBIMStore } from '../store/bimStore';

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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Data Center Locations</h1>
        
        <div className="relative bg-white rounded-lg shadow-lg p-8">
          <div className="relative h-[600px] bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden">
            <svg
              viewBox="0 0 1000 600"
              className="absolute inset-0 w-full h-full"
            >
              <rect width="1000" height="600" fill="url(#grid)" />
              
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
                </pattern>
              </defs>

              <text x="500" y="30" textAnchor="middle" className="text-2xl font-semibold fill-gray-700">
                United States Data Centers
              </text>

              {sites.map((site, index) => {
                const x = 200 + (index % 3) * 300;
                const y = 200 + Math.floor(index / 3) * 200;
                
                return (
                  <g
                    key={site.id}
                    onClick={() => handleSiteClick(site.id)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r="40"
                      fill="#3b82f6"
                      stroke="#1e40af"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={y + 5}
                      textAnchor="middle"
                      className="text-white font-bold text-sm pointer-events-none"
                    >
                      {site.city}
                    </text>
                    <text
                      x={x}
                      y={y + 60}
                      textAnchor="middle"
                      className="text-gray-700 text-xs pointer-events-none"
                    >
                      {site.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  );
}