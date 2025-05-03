
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.91f2ef8fde6b45c0a6fa4fee6487478f',
  appName: 'fakudid-daily-reflections',
  webDir: 'dist',
  server: {
    url: 'https://91f2ef8f-de6b-45c0-a6fa-4fee6487478f.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
      signingType: "apksigner"
    }
  }
};

export default config;
