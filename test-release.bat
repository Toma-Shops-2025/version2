@echo off
echo 🚀 TomaShops Pre-Release Testing Script
echo ========================================

echo.
echo Step 1: Building production version...
call npm run build:prod
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Production build failed!
    pause
    exit /b 1
)
echo ✅ Production build completed

echo.
echo Step 2: Cleaning Android project...
call npx cap clean android
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Android clean failed!
    pause
    exit /b 1
)
echo ✅ Android project cleaned

echo.
echo Step 3: Syncing with Android...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Android sync failed!
    pause
    exit /b 1
)
echo ✅ Android sync completed

echo.
echo Step 4: Building debug APK for testing...
cd android
call gradlew clean
call gradlew assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Debug APK build failed!
    pause
    exit /b 1
)
echo ✅ Debug APK built

echo.
echo Step 5: Building release APK for testing...
call gradlew assembleRelease
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Release APK build failed!
    pause
    exit /b 1
)
echo ✅ Release APK built

echo.
echo Step 6: Building AAB for Google Play...
call gradlew bundleRelease
if %ERRORLEVEL% NEQ 0 (
    echo ❌ AAB build failed!
    pause
    exit /b 1
)
echo ✅ AAB built

echo.
echo 🎉 All builds completed successfully!
echo.
echo Next steps:
echo 1. Install the debug APK on your device:
echo    adb install app\build\outputs\apk\debug\app-debug.apk
echo.
echo 2. Test the debug APK thoroughly
echo.
echo 3. If debug APK works, test the release APK:
echo    adb install app\build\outputs\apk\release\app-release.apk
echo.
echo 4. If release APK works, upload the AAB to Google Play Console:
echo    app\build\outputs\bundle\release\app-release.aab
echo.
echo ✅ Ready for testing!
pause 