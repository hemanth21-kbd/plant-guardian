import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Map from 'react-map-gl/mapbox';
import { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Shop {
  id: number;
  name: string;
  distance: string;
  lat: number;
  lon: number;
  address: string;
  type?: string;
}

interface MapboxShopMapProps {
  shops: Shop[];
  userLocation: { lat: number; lon: number } | null;
  mapboxToken: string;
}

export default function MapboxShopMap({ shops, userLocation, mapboxToken }: MapboxShopMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Default view: India
  const defaultViewState = {
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 5
  };

  const viewState = userLocation
    ? {
        longitude: userLocation.lon,
        latitude: userLocation.lat,
        zoom: 12
      }
    : shops.length > 0
    ? {
        longitude: shops[0].lon,
        latitude: shops[0].lat,
        zoom: 10
      }
    : defaultViewState;

  if (!isClient) {
    return (
      <div className="w-full h-[300px] sm:h-[350px] rounded-2xl bg-sky-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] sm:h-[350px] rounded-2xl overflow-hidden border border-sky-200 shadow-sm">
      <Map
        {...viewState}
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: '100%', height: '100%' }}
        scrollZoom={true}
      >
        <NavigationControl position="top-right" />
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            longitude={userLocation.lon}
            latitude={userLocation.lat}
            anchor="bottom"
          >
            <div className="relative">
              <div className="w-8 h-8 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rotate-45" />
            </div>
            <Popup
              longitude={userLocation.lon}
              latitude={userLocation.lat}
              offset={[0, -20]}
              closeButton={false}
              closeOnClick={false}
            >
              <div className="text-sm font-medium">Your Location</div>
            </Popup>
          </Marker>
        )}

        {/* Shop markers */}
        {shops.map((shop) => (
          <Marker
            key={shop.id}
            longitude={shop.lon}
            latitude={shop.lat}
            anchor="bottom"
          >
            <div className="relative cursor-pointer">
              <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-500 rotate-45" />
            </div>
            <Popup
              longitude={shop.lon}
              latitude={shop.lat}
              offset={[0, -20]}
              closeButton={true}
            >
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-gray-800 text-sm">{shop.name}</h3>
                <p className="text-xs text-gray-600 mt-1">
                  📍 {shop.distance} away
                </p>
                <p className="text-xs text-gray-500 mt-1">{shop.address}</p>
                <p className="text-xs text-gray-400 mt-2 italic">{shop.type}</p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs text-blue-600 underline"
                >
                  Get Directions →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
