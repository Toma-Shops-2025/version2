# TomaShops Pre-Release Testing Guide

## 🚨 CRITICAL: Before Building for Testers

### 1. Version Update Checklist
- [ ] Update `versionCode` in `android/app/build.gradle` (currently: 8)
- [ ] Update `versionName` if needed (currently: "1.0")
- [ ] Ensure all changes are committed and pushed

### 2. Pre-Build Testing Steps

#### A. Local Development Testing
```bash
# 1. Clean and rebuild
npm run build:prod
npx cap clean android
npx cap sync android

# 2. Test on local device/emulator
npx cap run android
```

#### B. Debug APK Testing
```bash
# Build debug APK for testing
cd android
./gradlew assembleDebug
```

**Test the debug APK on:**
- [ ] Your own device
- [ ] Different Android versions (7, 8, 9, 10, 11, 12, 13, 14)
- [ ] Different screen sizes
- [ ] Both WiFi and mobile data

### 3. Common Crash Causes & Fixes

#### A. ProGuard Issues (Most Common)
- ✅ **FIXED**: Added comprehensive ProGuard rules
- ✅ **FIXED**: Kept all necessary classes

#### B. Network Security Issues
- ✅ **FIXED**: `android:usesCleartextTraffic="false"`
- ✅ **FIXED**: Network security config present

#### C. Permission Issues
- ✅ **FIXED**: All necessary permissions declared

#### D. WebView Issues
- ✅ **FIXED**: JavaScript interface preserved
- ✅ **FIXED**: WebView classes kept

### 4. Release Build Testing

#### A. Build Release APK
```bash
# Clean everything first
cd android
./gradlew clean

# Build release APK
./gradlew assembleRelease
```

#### B. Test Release APK Locally
1. Install the release APK on your device
2. Test all major features:
   - [ ] App opens without crashing
   - [ ] Home page loads
   - [ ] Navigation works
   - [ ] Video playback works
   - [ ] User authentication works
   - [ ] Camera/video recording works
   - [ ] File uploads work
   - [ ] Messaging works
   - [ ] Notifications work

### 5. Internal Testing Checklist

#### A. Device Testing Matrix
Test on these devices/emulators:
- [ ] Samsung Galaxy (Android 10+)
- [ ] Google Pixel (Android 11+)
- [ ] OnePlus (Android 11+)
- [ ] Xiaomi (Android 10+)
- [ ] Huawei (Android 9+)
- [ ] Older device (Android 7-8)

#### B. Feature Testing
- [ ] App launch (cold start)
- [ ] App resume from background
- [ ] App with poor internet connection
- [ ] App with no internet connection
- [ ] App with low memory
- [ ] App with different screen orientations
- [ ] App with different text sizes

### 6. Build AAB for Google Play

#### A. Build AAB
```bash
cd android
./gradlew bundleRelease
```

#### B. Test AAB Locally
```bash
# Install bundletool
# Download from: https://github.com/google/bundletool/releases

# Generate APKs from AAB
java -jar bundletool-all-1.15.6.jar build-apks --bundle=app-release.aab --output=app-release.apks

# Install on device
java -jar bundletool-all-1.15.6.jar install-apks --apks=app-release.apks
```

### 7. Google Play Console Testing

#### A. Upload to Internal Testing
1. Upload AAB to Google Play Console
2. Add testers to internal testing track
3. Wait for processing (usually 10-30 minutes)

#### B. Tester Instructions
Send testers this message:
```
🎯 TomaShops Testing Instructions:

1. Download the app from the Google Play link
2. Install and open the app
3. Test these features:
   - App opens without crashing
   - Home page loads properly
   - Can navigate between pages
   - Can view videos
   - Can record videos
   - Can upload content
   - Can send messages
   - Can receive notifications

If the app crashes or doesn't open:
- Please send me the exact error message
- Tell me your device model and Android version
- Take a screenshot if possible

Thank you for testing! 🚀
```

### 8. Emergency Fixes

If testers report crashes:

#### A. Quick Debug Steps
1. Check Google Play Console for crash reports
2. Test on the same device model
3. Check if it's a specific Android version issue

#### B. Common Quick Fixes
1. **ProGuard issues**: Disable minification temporarily
2. **Memory issues**: Reduce app size
3. **Network issues**: Check API endpoints
4. **Permission issues**: Check runtime permissions

### 9. Build Commands Summary

```bash
# Full build process
npm run build:prod
npx cap clean android
npx cap sync android
cd android
./gradlew clean
./gradlew bundleRelease

# Test locally first
./gradlew assembleRelease
# Install and test the APK on your device

# Then upload AAB to Google Play Console
```

### 10. Success Criteria

The app is ready for testers when:
- [ ] Debug APK works on your device
- [ ] Release APK works on your device
- [ ] AAB installs and works on your device
- [ ] All major features work in release build
- [ ] No crashes during normal usage
- [ ] App opens within 5 seconds
- [ ] No memory leaks detected

## 🎯 Final Checklist Before Sending to Testers

- [ ] Version code updated
- [ ] All features tested in release build
- [ ] App opens without crashes
- [ ] AAB uploaded to Google Play Console
- [ ] Internal testing track configured
- [ ] Testers added to internal testing
- [ ] Tester instructions sent
- [ ] Backup plan ready if issues arise

## 🚨 If App Still Crashes

1. **Immediate**: Disable ProGuard minification
2. **Debug**: Add crash reporting (Firebase Crashlytics)
3. **Test**: Build without optimization
4. **Fix**: Address specific crash causes
5. **Re-test**: Full testing cycle again

Remember: It's better to delay testing than to give testers a broken app! 