import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Link } from 'react-router-dom';

mapboxgl.accessToken = 'pk.eyJ1IjoidG9tYXNob3BzIiwiYSI6ImNtYXNqaWs5eTBtczEyaXB5M3RlanY5OHgifQ.sQV6DhzFb3EZofzjY8gt6Q';

interface Listing {
  id: string;
  title: string;
  latitude?: number;
  longitude?: number;
}

interface MapProps {
  listings?: Listing[];
  lng?: number;
  lat?: number;
  zoom?: number;
}

const Map: React.FC<MapProps> = ({ listings = [], lng = -85.7585, lat = 38.2527, zoom = 10 }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return; // prevent re-initializing
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom,
    });
    mapRef.current = map;
    return () => map.remove();
  }, [lng, lat, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;
    // Remove existing markers
    (mapRef.current as any)._markers = (mapRef.current as any)._markers || [];
    (mapRef.current as any)._markers.forEach((m: any) => m.remove());
    (mapRef.current as any)._markers = [];
    // Add new markers
    listings.forEach(listing => {
      if (listing.latitude && listing.longitude) {
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `<strong>${listing.title}</strong><br/>` +
          (listing.id ? `<a href='/listing/${listing.id}' style='color:#2563eb;text-decoration:underline;'>View Details</a>` : '');
        const marker = new mapboxgl.Marker()
          .setLngLat([listing.longitude, listing.latitude])
          .setPopup(new mapboxgl.Popup().setDOMContent(popupContent))
          .addTo(mapRef.current!);
        (mapRef.current as any)._markers.push(marker);
      }
    });
  }, [listings]);

  return <div ref={mapContainer} style={{ width: '100%', height: 400, borderRadius: 8, margin: '16px 0' }} />;
};

export default Map; 