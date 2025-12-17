import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Site } from '../../types/bim';

// Fix for default markers in React-Leaflet - use local fallback for tracking prevention
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Create a simple SVG marker to avoid CORS/tracking prevention issues
const createSVGMarker = () => {
  const svgIcon = L.divIcon({
    html: `
      <div style="
        background: #3b82f6;
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        border: 2px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 6px;
          left: 6px;
        "></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });
  return svgIcon;
};

L.Icon.Default.mergeOptions({
  iconRetinaUrl: undefined,
  iconUrl: undefined, 
  shadowUrl: undefined,
});

interface InteractiveMapProps {
  sites: Site[];
  onSiteSelect: (siteId: string) => void;
}

export function InteractiveMap({ sites, onSiteSelect }: InteractiveMapProps) {
  // Center of the US
  const centerPosition: [number, number] = [39.8283, -98.5795];

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={centerPosition}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {sites.map(site => (
          <Marker
            key={site.id}
            position={[site.coordinates.lat, site.coordinates.lng]}
            icon={createSVGMarker()}
            eventHandlers={{
              click: () => onSiteSelect(site.id)
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg text-blue-600">{site.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{site.address}</p>
                <p className="text-sm text-gray-600">{site.city}, {site.state}</p>
                <div className="mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>🔧 {site.racks.length} Racks</span>
                    <span>⚡ {site.equipment.length} Equipment</span>
                  </div>
                </div>
                <button
                  onClick={() => onSiteSelect(site.id)}
                  className="mt-3 w-full px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  View Site →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}