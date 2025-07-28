#!/bin/bash

echo "🚀 Building TomaShops for Google Play Store..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run build
npx cap clean android

# Sync web assets to Android
echo "📱 Syncing web assets to Android..."
npx cap sync android

# Build Android APK
echo "🔨 Building Android APK..."
cd android
./gradlew assembleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"
    echo "📦 AAB location: android/app/build/outputs/bundle/release/app-release.aab"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Test the APK on a device"
    echo "2. Upload AAB to Google Play Console"
    echo "3. Fill in store listing details"
    echo "4. Submit for review"
else
    echo "❌ Build failed!"
    exit 1
fi 