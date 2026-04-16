// Configuration for the backend API URL

// We are hardcoding the API to connect directly to the successfully deployed Cloud Backend on Render.
// This completely bypasses all local network issues, Windows Firewall blocks, and IP address changes.
// It ensures that regardless of whether you are on an Android emulator, physical phone, or local computer,
// it connects smoothly to the live API!

export const API_BASE_URL = 'https://plant-guardian-backend.onrender.com';
