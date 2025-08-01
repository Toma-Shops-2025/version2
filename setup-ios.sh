#!/bin/bash

echo "🍎 Setting up TomaShops for iOS App Store..."

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: iOS development requires macOS"
    echo "Please run this script on a Mac with Xcode installed"
    exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Error: Xcode is not installed"
    echo "Please install Xcode from the Mac App Store"
    exit 1
fi

# Install iOS platform if not already installed
if [ ! -d "ios" ]; then
    echo "📱 Adding iOS platform..."
    npm install @capacitor/ios
    npx cap add ios
fi

# Update capacitor config for iOS
echo "⚙️ Updating Capacitor configuration..."
cat > capacitor.config.ts << 'EOF'
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tomashops.videoapp',
  appName: 'TomaShops',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  ios: {
    bundleId: 'com.tomashops.videoapp',
    buildOptions: {
      // iOS specific build options
    }
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
EOF

# Build web assets
echo "🏗️ Building web assets..."
npm run build

# Sync to iOS
echo "🔄 Syncing to iOS..."
npx cap sync ios

# Open in Xcode
echo "🚀 Opening in Xcode..."
npx cap open ios

echo "✅ iOS setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure signing in Xcode"
echo "2. Set up your Apple Developer account"
echo "3. Create app record in App Store Connect"
echo "4. Build and archive your app"
echo "5. Submit for review"
echo ""
echo "📖 See IOS_APP_STORE_GUIDE.md for detailed instructions" 