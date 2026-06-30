import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.soulsite.app',
  appName: 'SoulSite',
  webDir: 'build',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com', 'apple.com'],
    },
  },
};

export default config;
