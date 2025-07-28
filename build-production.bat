@echo off
echo 🚀 Building TomaShops for Google Play Store...

REM Clean previous builds
echo 🧹 Cleaning previous builds...
call npm run build
call npx cap clean android

REM Sync web assets to Android
echo 📱 Syncing web assets to Android...
call npx cap sync android

REM Build Android APK
echo 🔨 Building Android APK...
cd android
call gradlew.bat assembleRelease

REM Check if build was successful
if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    echo 📦 APK location: android\app\build\outputs\apk\release\app-release.apk
    echo 📦 AAB location: android\app\build\outputs\bundle\release\app-release.aab
    echo.
    echo 🎯 Next steps:
    echo 1. Test the APK on a device
    echo 2. Upload AAB to Google Play Console
    echo 3. Fill in store listing details
    echo 4. Submit for review
) else (
    echo ❌ Build failed!
    exit /b 1
) 