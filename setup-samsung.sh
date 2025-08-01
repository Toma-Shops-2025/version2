#!/bin/bash

echo "📱 Setting up TomaShops for Samsung Galaxy Store..."

# Check if Android SDK is available
if ! command -v adb &> /dev/null; then
    echo "⚠️ Warning: Android SDK not found in PATH"
    echo "Make sure Android Studio is installed and ANDROID_HOME is set"
fi

# Build for Samsung
echo "🏗️ Building for Samsung Galaxy Store..."

# Build web assets
npm run build

# Sync to Android
npx cap sync android

# Build APK for Samsung
cd android
./gradlew assembleRelease

echo "✅ Build complete!"
echo ""
echo "📦 APK location: app/build/outputs/apk/release/app-release.apk"
echo ""
echo "📋 Next steps for Samsung Galaxy Store:"
echo "1. Create Samsung Developer account"
echo "2. Sign Samsung Developer Agreement"
echo "3. Upload APK to Samsung Developer Console"
echo "4. Provide Korean and English content"
echo "5. Complete store listing information"
echo "6. Submit for review"
echo ""
echo "📖 See SAMSUNG_GALAXY_STORE_GUIDE.md for detailed instructions"
echo ""
echo "🌏 Samsung Galaxy Store Benefits:"
echo "- 100+ million Samsung users"
echo "- Less competition than Google Play"
echo "- Strong presence in Korea and Asia"
echo "- Better app discovery"
echo "- Good monetization potential" 