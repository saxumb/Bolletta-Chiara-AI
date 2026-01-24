
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bollettachiara.ai',
  appName: 'BollettaChiara AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  backgroundColor: '#f8fafc'
};

export default config;
