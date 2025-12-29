import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.plantfertilizer.app',
  appName: 'PlantFertilizerAI',
  webDir: 'out',
  server: {
    url: 'https://plant-guardian-five.vercel.app',
    cleartext: true
  }
};

export default config;
