
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
    
    // Determine if we are running inside Android Capacitor (usually localhost or similar)
    const isCapacitor = window.hasOwnProperty('Capacitor') || protocol === 'capacitor:';

    // If we're on a tunnel (like serveo), use the same host for the backend
    if (hostname.includes('serveo.net') || hostname.includes('localtunnel.me') || hostname.includes('pinggy')) {
        return `${protocol}//${window.location.host}`;
    }
    
    // If we are on Android/Capacitor, localhost refers to the phone itself. 
    // We MUST use the PC's actual LAN IP to reach the backend.
    if (isCapacitor || hostname === 'localhost') {
        // Use the actual LAN IP of the computer running the server
        return `http://10.44.99.244:8000`;
    }

    // Default LAN IP fallback
    return `http://${hostname}:8000`;
  }
  // Default server-side
  return 'http://10.44.99.244:8000';
};

// Always use the dynamic URL to prevent mobile offline errors
export const API_BASE_URL = getApiBaseUrl();
