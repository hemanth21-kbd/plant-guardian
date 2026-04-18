// Configuration for the backend API URL
export const API_BASE_URL = 'https://plant-guardian-backend.onrender.com';

// Thunderforest API key (optional - get free key at thunderforest.com)
// If not provided, falls back to OpenStreetMap tiles
export const THUNDERFOREST_API_KEY = process.env.THUNDERFOREST_API_KEY || '';

// Map tile provider: 'osm' | 'thunderforest'
export const MAP_PROVIDER = (process.env.MAP_PROVIDER || 'osm') as 'osm' | 'thunderforest';

