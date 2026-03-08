import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet-fix';
import { useSites } from '@/hooks/api';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  active: '#22c55e',
  inactive: '#ef4444',
  maintenance: '#f59e0b',
};

function createColoredIcon(color: string) {
  return new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

export default function SiteMap() {
  const { data: paginatedSites, isLoading } = useSites({ per_page: 100 });
  const sites = paginatedSites?.data || [];

  const sitesWithCoords = useMemo(
    () => sites.filter((s: any) => s.latitude != null && s.longitude != null),
    [sites]
  );

  const bounds = useMemo(() => {
    if (sitesWithCoords.length === 0) return null;
    const lats = sitesWithCoords.map((s: any) => s.latitude);
    const lngs = sitesWithCoords.map((s: any) => s.longitude);
    return L.latLngBounds(
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    );
  }, [sitesWithCoords]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sitesWithCoords.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-10">
        Aucun site avec coordonnees GPS.
      </p>
    );
  }

  // Default center: Gabon
  const defaultCenter: [number, number] = [-0.8037, 11.6094];

  return (
    <div className="rounded-lg overflow-hidden border" style={{ height: 500 }}>
      <MapContainer
        center={bounds ? bounds.getCenter() : defaultCenter}
        zoom={bounds ? undefined : 6}
        bounds={bounds || undefined}
        boundsOptions={{ padding: [50, 50] }}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {sitesWithCoords.map((site: any) => (
          <Marker
            key={site.id}
            position={[site.latitude, site.longitude]}
            icon={createColoredIcon(statusColors[site.status] || '#6b7280')}
          >
            <Popup>
              <div className="text-sm space-y-1">
                <div className="font-bold">{site.name}</div>
                <div className="text-xs text-gray-500">{site.code}</div>
                {site.address && <div className="text-xs">{site.address}</div>}
                <Badge
                  variant={site.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs mt-1"
                >
                  {site.status}
                </Badge>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
