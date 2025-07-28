import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tomashops.videoapp',
  appName: 'TomaShops',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
      android: {
      buildOptions: {
        keystorePath: process.env.KEYSTORE_PATH || 'C:\\Users\\T O M A\\OneDrive\\Documents\\my-app-release-key',
        keystoreAlias: process.env.KEYSTORE_ALIAS || 'your-keystore-alias',
        keystorePassword: process.env.KEYSTORE_PASSWORD || 'your-keystore-password',
        keystoreAliasPassword: process.env.KEY_PASSWORD || 'your-key-password',
      }
    },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#14b8a6",
      showSpinner: true,
      spinnerColor: "#ffffff"
    }
  }
};

export default config;
