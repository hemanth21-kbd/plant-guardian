'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { THUNDERFOREST_API_KEY, MAP_PROVIDER } from '../config';

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
}

// Custom user location marker icon
const userIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#3B82F6" stroke="#fff" stroke-width="3"/>
    </svg>
  `)}`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Custom shop marker icon
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

// Component to recenter map when location changes
function MapController({ center, zoom }: { center: L.LatLngExpression; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Get tile URL based on provider
function getTileUrl(): string {
  const provider = MAP_PROVIDER || 'osm';
  
  if (provider === 'thunderforest' && THUNDERFOREST_API_KEY) {
    // Thunderforest API key format: {apikey}/{style}/{z}/{x}/{y}.png
    // Style options: cycle, transport, transport-dark, landscape, outdoors, etc.
    // Using 'cycle' style (most neutral)
    return `https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=${THUNDERFOREST_API_KEY}`;
  }
  
  // Default: OpenStreetMap (no key required)
  return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
}

function getTileAttribution(): string {
  const provider = MAP_PROVIDER || 'osm';
  
  if (provider === 'thunderforest' && THUNDERFOREST_API_KEY) {
    return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.thunderforest.com/">Thunderforest</a>';
  }
  
  return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
}

export default function ShopMap({ shops, userLocation }: ShopMapProps) {
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

  const tileUrl = getTileUrl();
  const attribution = getTileAttribution();
  const isThunderforest = MAP_PROVIDER === 'thunderforest' && THUNDERFOREST_API_KEY;

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
          attribution={attribution}
          url={tileUrl}
        />
        
        <MapController center={mapCenter} zoom={mapZoom} />

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
            <Popup>
              <strong>Your Location</strong><br />
              {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
            </Popup>
          </Marker>
        )}

        {/* Shop markers */}
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
