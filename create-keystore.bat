@echo off
echo 🔐 Creating Android Keystore for App Signing...
echo.

REM Set keystore details
set KEYSTORE_PATH=C:\Users\T O M A\OneDrive\Documents\my-app-release-key
set KEYSTORE_ALIAS=tomashops-key
set KEYSTORE_PASSWORD=tomashops2024
set KEY_PASSWORD=tomashops2024

echo 📍 Keystore Path: %KEYSTORE_PATH%
echo 🏷️  Keystore Alias: %KEYSTORE_ALIAS%
echo.

REM Create directory if it doesn't exist
if not exist "C:\Users\T O M A\OneDrive\Documents" mkdir "C:\Users\T O M A\OneDrive\Documents"

REM Generate keystore
echo 🔑 Generating keystore...
keytool -genkey -v -keystore "%KEYSTORE_PATH%" -alias %KEYSTORE_ALIAS% -keyalg RSA -keysize 2048 -validity 10000 -storepass %KEYSTORE_PASSWORD% -keypass %KEY_PASSWORD% -dname "CN=TomaShops, OU=Development, O=TomaShops, L=Louisville, S=Kentucky, C=US"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Keystore created successfully!
    echo.
    echo 📝 Next steps:
    echo 1. Copy these environment variables to your .env file:
    echo    KEYSTORE_PATH=%KEYSTORE_PATH%
    echo    KEYSTORE_ALIAS=%KEYSTORE_ALIAS%
    echo    KEYSTORE_PASSWORD=%KEYSTORE_PASSWORD%
    echo    KEY_PASSWORD=%KEY_PASSWORD%
    echo.
    echo 2. Run build-production.bat to create signed APK
    echo 3. Upload to Google Play Console
) else (
    echo ❌ Keystore creation failed!
    echo Make sure you have Java JDK installed and keytool is in your PATH
)

pause 