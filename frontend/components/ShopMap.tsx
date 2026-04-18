'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

interface Shop {
  id: number;
  name: string;
  distance: string;
  lat: number;
  lon: number;
  address: string;
  type?: string;
}

interface ShopMapProps {
  shops: Shop[];
  userLocation: { lat: number; lon: number } | null;
  mapProvider?: 'osm' | 'mapbox';
  mapboxToken?: string;
}

// Custom marker icons
const userIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#3B82F6" stroke="#fff" stroke-width="3"/>
    </svg>
  `)}`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const shopIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2C8.268 2 2 8.268 2 16c0 8 14 18 14 18s14-10 14-18c0-7.732-6.268-14-14-14z" fill="#22c55e" stroke="#fff" stroke-width="2"/>
      <circle cx="16" cy="15" r="4" fill="#fff"/>
    </svg>
  `)}`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function MapController({ center, zoom }: { center: L.LatLngExpression; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Dynamic import for Mapbox map to avoid SSR issues
const MapboxShopMapComponent = dynamic(
  () => import('./MapboxShopMap'),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center bg-sky-100"><div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" /></div> }
);

export default function ShopMap({ shops, userLocation, mapProvider = 'osm', mapboxToken = '' }: ShopMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const defaultCenter: L.LatLngExpression = [20.5937, 78.9629];
  const mapCenter: L.LatLngExpression = userLocation
    ? [userLocation.lat, userLocation.lon]
    : shops.length > 0
    ? [shops[0].lat, shops[0].lon]
    : defaultCenter;

  const mapZoom = userLocation ? 13 : shops.length > 0 ? 10 : 5;

  if (!isClient) {
    return (
      <div className="w-full h-[300px] sm:h-[350px] rounded-2xl bg-sky-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Use Mapbox if provider is mapbox AND token is available
  if (mapProvider === 'mapbox' && mapboxToken) {
    return (
      <MapboxShopMapComponent
        shops={shops}
        userLocation={userLocation}
        mapboxToken={mapboxToken}
      />
    );
  }

  // Default: OpenStreetMap (Leaflet)
  return (
    <div className="w-full h-[300px] sm:h-[350px] rounded-2xl overflow-hidden border border-sky-200 shadow-sm z-0">
      <MapContainer
        center={mapCenter as L.LatLngExpression}
        zoom={mapZoom}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={mapCenter} zoom={mapZoom} />
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
            <Popup>
              <strong>Your Location</strong><br />
              {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
            </Popup>
          </Marker>
        )}
        {shops.map((shop) => (
          <Marker key={shop.id} position={[shop.lat, shop.lon]} icon={shopIcon}>
            <Popup>
              <strong>{shop.name}</strong><br />
              Distance: {shop.distance}<br />
              {shop.address}
              <br />
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Get Directions
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
