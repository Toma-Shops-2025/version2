# iOS App Store Submission Guide for TomaShops

## 🍎 Prerequisites

### Apple Developer Account
- [ ] **Apple Developer Program Membership** ($99/year)
- [ ] **App Store Connect Access**
- [ ] **Xcode** (latest version)
- [ ] **macOS** (required for iOS development)

### Required Certificates & Profiles
- [ ] **Distribution Certificate** (iOS App Store)
- [ ] **Provisioning Profile** (App Store)
- [ ] **App ID** registered in Apple Developer Portal

## 📱 iOS App Setup

### 1. Add iOS Platform to Capacitor
```bash
# Install iOS platform
npm install @capacitor/ios
npx cap add ios

# Sync your web code to iOS
npx cap sync ios
```

### 2. Configure iOS Settings

#### Update capacitor.config.ts
```typescript
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
```

### 3. iOS App Configuration

#### Info.plist Requirements
```xml
<!-- Add to ios/App/App/Info.plist -->
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to take photos for listings</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access for video recordings</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to show nearby listings</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access to select images for listings</string>
```

#### Network Security (ATS)
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>tomashops.com</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <false/>
            <key>NSExceptionMinimumTLSVersion</key>
            <string>TLSv1.2</string>
        </dict>
    </dict>
</dict>
```

## 🏗️ Building for iOS

### 1. Build Web Assets
```bash
# Build your web app
npm run build

# Sync to iOS
npx cap sync ios
```

### 2. Open in Xcode
```bash
npx cap open ios
```

### 3. Configure in Xcode
- [ ] **Bundle Identifier**: `com.tomashops.videoapp`
- [ ] **Version**: `1.0.1`
- [ ] **Build**: `9`
- [ ] **Team**: Select your Apple Developer Team
- [ ] **Signing**: Automatic or Manual (recommended for App Store)

### 4. Build Archive
1. Select **Any iOS Device** as target
2. Go to **Product** → **Archive**
3. Wait for archive to complete

## 📋 App Store Connect Setup

### 1. Create App Record
1. Log into [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platforms**: iOS
   - **Name**: TomaShops
   - **Primary Language**: English
   - **Bundle ID**: `com.tomashops.videoapp`
   - **SKU**: `tomashops-ios-001`

### 2. App Information
- [ ] **App Name**: "TomaShops - Video 1st Marketplace"
- [ ] **Subtitle**: "Buy, sell, and discover with video"
- [ ] **Keywords**: "marketplace, video, buy, sell, local"
- [ ] **Description**: [Write compelling description]
- [ ] **Support URL**: `https://tomashops.com/support`
- [ ] **Marketing URL**: `https://tomashops.com`

### 3. App Store Graphics
- [ ] **App Icon**: 1024x1024 px
- [ ] **Screenshots**: 
  - iPhone 6.7" (1290x2796)
  - iPhone 6.5" (1242x2688)
  - iPhone 5.5" (1242x2208)
  - iPad Pro 12.9" (2048x2732)
- [ ] **App Preview Videos**: Optional but recommended

### 4. App Review Information
- [ ] **Contact Information**: Your contact details
- [ ] **Demo Account**: If app requires login
- [ ] **Notes**: Any special instructions for reviewers

## 🚀 Upload & Submit

### 1. Upload Build
1. In Xcode Organizer, select your archive
2. Click **Distribute App**
3. Select **App Store Connect**
4. Choose **Upload**
5. Follow the signing steps

### 2. Submit for Review
1. In App Store Connect, go to your app
2. Select the build you uploaded
3. Fill in all required information
4. Click **Submit for Review**

## ⏱️ Review Timeline
- **Typical Review Time**: 24-48 hours
- **Complex Apps**: Up to 1 week
- **Rejections**: Common, be prepared to fix issues

## 🚨 Common iOS Rejection Reasons
- [ ] **Missing Privacy Policy**
- [ ] **Incomplete App Information**
- [ ] **Poor App Performance**
- [ ] **Broken Links**
- [ ] **Missing Required Permissions**
- [ ] **App Crashes**
- [ ] **Inappropriate Content**

## 📞 Support
- **Apple Developer Support**: [developer.apple.com/support](https://developer.apple.com/support)
- **App Store Connect Help**: Available in App Store Connect
- **Review Guidelines**: [developer.apple.com/app-store/review/guidelines](https://developer.apple.com/app-store/review/guidelines)

---

**Note**: iOS App Store has stricter review guidelines than Google Play. Ensure your app follows all guidelines before submission. 