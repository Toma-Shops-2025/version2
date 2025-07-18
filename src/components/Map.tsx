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
    // Group listings by coordinates
    const grouped: { [key: string]: Listing[] } = {};
    listings.forEach(listing => {
      if (listing.latitude && listing.longitude) {
        const key = `${listing.latitude},${listing.longitude}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(listing);
      }
    });
    // Add new markers
    Object.entries(grouped).forEach(([key, group]) => {
      const [latitude, longitude] = key.split(',').map(Number);
      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.innerHTML = group.map(listing =>
        `<strong>${listing.title}</strong><br/>` +
        (listing.id ? `<a href='/listing/${listing.id}' style='color:#2563eb;text-decoration:underline;'>View Details</a><br/>` : '')
      ).join('<hr style="margin:4px 0;">');
      // Create marker element with count badge
      const el = document.createElement('div');
      el.style.position = 'relative';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.background = '#2563eb';
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = 'white';
      el.style.fontWeight = 'bold';
      el.style.fontSize = '16px';
      el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
      el.innerText = group.length > 1 ? String(group.length) : '';
      if (group.length === 1) {
        el.innerHTML = `<svg width='20' height='20' fill='white' viewBox='0 0 20 20'><circle cx='10' cy='10' r='8' /></svg>`;
      }
      const marker = new mapboxgl.Marker(el)
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup().setDOMContent(popupContent))
        .addTo(mapRef.current!);
      (mapRef.current as any)._markers.push(marker);
    });
  }, [listings]);

  return <div ref={mapContainer} style={{ width: '100%', height: 400, borderRadius: 8, margin: '16px 0' }} />;
};

export default Map; 