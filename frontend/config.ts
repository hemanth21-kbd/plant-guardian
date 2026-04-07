
// Configuration for the backend API URL

// IMPORTANT: For Android Emulator, change this to 'http://10.0.2.2:8000'
// IMPORTANT: For a Real Android Device, change this to your PC's IP address (e.g., 'http://192.168.1.5:8000')
// For local web development, 'http://localhost:8000' works fine.

// Production Backend
// IMPORTANT: Once you deploy to Render, paste your Render URL here:
// Example: export const API_BASE_URL = 'https://plant-guardian-backend-xxx.onrender.com';
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // If we're on a tunnel (like serveo), use the same host for the backend
    if (hostname.includes('serveo.net') || hostname.includes('localtunnel.me') || hostname.includes('pinggy')) {
        return `${protocol}//${window.location.host}`;
    }
    
    // Default to LAN IP if on LAN, otherwise localhost
    return `http://${hostname}:8000`;
  }
  return 'http://localhost:8000';
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_RENDER_API_URL || getApiBaseUrl();
