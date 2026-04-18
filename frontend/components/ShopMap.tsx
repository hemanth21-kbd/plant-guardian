'use client';

import React, { useEffect, useState } from 'react';
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
  mapboxToken: string;
}

// Dynamic import for Mapbox to avoid SSR issues
const MapboxShopMap = dynamic(
  () => import('./MapboxShopMap'),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-[300px] sm:h-[350px] rounded-2xl bg-sky-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
      </div>
    )
  }
);

export default function ShopMap({ shops, userLocation, mapboxToken }: ShopMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-[300px] sm:h-[350px] rounded-2xl bg-sky-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="w-full h-[300px] sm:h-[350px] rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-sm font-bold text-amber-800 text-center">Mapbox token required</p>
        <p className="text-xs text-amber-600 text-center mt-1">
          Add MAPBOX_TOKEN to your .env file to enable maps.
          <br />
          <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="underline">
            Get free token →
          </a>
        </p>
      </div>
    );
  }

  return (
    <MapboxShopMap
      shops={shops}
      userLocation={userLocation}
      mapboxToken={mapboxToken}
    />
  );
}
