# Google Play Store Submission Checklist

## ✅ Technical Requirements (COMPLETED)

### App Configuration
- [x] App ID: `com.tomashops.videoapp` (consistent across files)
- [x] App Name: "TomaShops Video1stMarketplace"
- [x] Version Code: 8
- [x] Version Name: "1.0.1"
- [x] Target SDK: 35 (Android 14)
- [x] Min SDK: 23 (Android 6.0)

### Security
- [x] HTTPS enforced (`usesCleartextTraffic="false"`)
- [x] Network security configuration added
- [x] ProGuard enabled for release builds
- [x] Code obfuscation configured

### App Assets
- [x] App icons (all required sizes)
- [x] Splash screen configured
- [x] Privacy Policy page
- [x] Terms of Service page

## 📋 Store Listing Requirements

### App Information
- [ ] **App Title**: "TomaShops - Video 1st Marketplace"
- [ ] **Short Description**: 80 characters max
- [ ] **Full Description**: 4000 characters max
- [ ] **App Category**: Shopping or Social
- [ ] **Content Rating**: Complete questionnaire

### Graphics
- [ ] **Feature Graphic**: 1024 x 500 px
- [ ] **App Screenshots**: 2-8 screenshots per device type
  - [ ] Phone screenshots (16:9 or 9:16)
  - [ ] 7-inch tablet screenshots
  - [ ] 10-inch tablet screenshots
- [ ] **App Icon**: 512 x 512 px (already have)

### Content
- [ ] **Privacy Policy URL**: Link to your privacy policy
- [ ] **App Access**: If app requires special access
- [ ] **Content Descriptions**: For mature content if applicable

## 🔧 Build & Upload

### Generate Release Build
```bash
# On Windows:
build-production.bat

# On Mac/Linux:
chmod +x build-production.sh
./build-production.sh
```

### Upload to Play Console
1. [ ] Sign in to Google Play Console
2. [ ] Create new app or select existing
3. [ ] Upload AAB file: `android/app/build/outputs/bundle/release/app-release.aab`
4. [ ] Fill in store listing information
5. [ ] Complete content rating questionnaire
6. [ ] Set up pricing & distribution
7. [ ] Submit for review

## 📱 Testing Checklist

### Before Submission
- [ ] Test on multiple Android devices/versions
- [ ] Test all app features work correctly
- [ ] Test with slow internet connection
- [ ] Test app permissions work properly
- [ ] Test app handles errors gracefully
- [ ] Verify all links work (Privacy, Terms, etc.)

### Common Rejection Reasons to Avoid
- [ ] App crashes on startup
- [ ] App doesn't work without internet
- [ ] App requests unnecessary permissions
- [ ] App contains broken links
- [ ] App violates content policies
- [ ] App doesn't match store listing description

## 🎯 Post-Submission

### Monitor Review Process
- [ ] Check Play Console for review status
- [ ] Respond to any review feedback
- [ ] Prepare for potential rejection and fixes

### Launch Preparation
- [ ] Plan app launch strategy
- [ ] Prepare marketing materials
- [ ] Set up analytics tracking
- [ ] Plan user support system

## 📞 Support Information

### Contact Details
- **Support Email**: support@tomashops.com
- **Privacy Policy**: Available in app
- **Terms of Service**: Available in app
- **App Website**: [Add your website URL]

### Technical Support
- **Build Issues**: Check build logs
- **Play Console Issues**: Contact Google Play support
- **App Issues**: Test thoroughly before submission

---

**Note**: This checklist should be completed before submitting to Google Play Store. Keep a copy of this checklist and update it as you complete each item. 