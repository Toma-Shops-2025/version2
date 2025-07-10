import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  onChange: (loc: { latitude: number; longitude: number; address: string }) => void;
}

const DEFAULT_LAT = 38.2527;
const DEFAULT_LNG = -85.7585;
const DEFAULT_ADDRESS = 'Louisville, Kentucky';

const LocationPicker: React.FC<LocationPickerProps> = ({ latitude, longitude, address, onChange }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const geocoderRef = useRef<any>(null);

  useEffect(() => {
    let didCancel = false;
    async function setupMap() {
      let lat = latitude ?? DEFAULT_LAT;
      let lng = longitude ?? DEFAULT_LNG;
      let addr = address ?? DEFAULT_ADDRESS;
      // Try to get user location
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          addr = 'Current Location';
        } catch {}
      }
      if (didCancel) return;
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: 10,
      });
      geocoderRef.current = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: true,
      });
      mapRef.current.addControl(geocoderRef.current);
      geocoderRef.current.on('result', (e: any) => {
        const { center, place_name } = e.result;
        onChange({ latitude: center[1], longitude: center[0], address: place_name });
      });
      // Initial value
      onChange({ latitude: lat, longitude: lng, address: addr });
      // Allow pin drop
      mapRef.current.on('click', (e) => {
        const { lngLat } = e;
        new mapboxgl.Marker().setLngLat(lngLat).addTo(mapRef.current!);
        onChange({ latitude: lngLat.lat, longitude: lngLat.lng, address: 'Dropped Pin' });
      });
    }
    setupMap();
    return () => {
      didCancel = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <div className="mb-2 font-semibold">Search for your address and drop a pin:</div>
      <div ref={mapContainer} style={{ width: '100%', height: 300, borderRadius: 8, margin: '8px 0' }} />
    </div>
  );
};

export default LocationPicker; 