#!/bin/bash

echo "🚀 TomaShops Pre-Release Testing Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

echo -e "${YELLOW}Step 1: Building production version...${NC}"
npm run build:prod
print_status $? "Production build completed"

echo -e "${YELLOW}Step 2: Cleaning Android project...${NC}"
npx cap clean android
print_status $? "Android project cleaned"

echo -e "${YELLOW}Step 3: Syncing with Android...${NC}"
npx cap sync android
print_status $? "Android sync completed"

echo -e "${YELLOW}Step 4: Building debug APK for testing...${NC}"
cd android
./gradlew clean
./gradlew assembleDebug
print_status $? "Debug APK built"

echo -e "${YELLOW}Step 5: Building release APK for testing...${NC}"
./gradlew assembleRelease
print_status $? "Release APK built"

echo -e "${YELLOW}Step 6: Building AAB for Google Play...${NC}"
./gradlew bundleRelease
print_status $? "AAB built"

echo -e "${GREEN}🎉 All builds completed successfully!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Install the debug APK on your device:"
echo "   adb install app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "2. Test the debug APK thoroughly"
echo ""
echo "3. If debug APK works, test the release APK:"
echo "   adb install app/build/outputs/apk/release/app-release.apk"
echo ""
echo "4. If release APK works, upload the AAB to Google Play Console:"
echo "   app/build/outputs/bundle/release/app-release.aab"
echo ""
echo -e "${GREEN}✅ Ready for testing!${NC}" 