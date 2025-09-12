# FitTracker Icon & Splash Screen Update Guide

## Current Issue
The app is using generic "double T" splash screens instead of your orange-themed FitTracker branding.

## Solution Steps

### Step 1: Generate New Icons
1. Open the icon generator: `file:///d:/workout-logger/icon-generator.html` (already opened in Simple Browser)
2. The generator shows:
   - App Icon (512x512) with orange background (#ea580c)
   - Splash Screen (1080x1920) with FitTracker branding
3. Click "Download App Icon" and "Download Splash Screen" buttons

### Step 2: Replace Splash Screens
The downloaded splash.png needs to be copied to these Android folders:
```
android/app/src/main/res/drawable/splash.png
android/app/src/main/res/drawable-land-hdpi/splash.png
android/app/src/main/res/drawable-land-mdpi/splash.png
android/app/src/main/res/drawable-land-xhdpi/splash.png
android/app/src/main/res/drawable-land-xxhdpi/splash.png
android/app/src/main/res/drawable-land-xxxhdpi/splash.png
android/app/src/main/res/drawable-port-hdpi/splash.png
android/app/src/main/res/drawable-port-mdpi/splash.png
android/app/src/main/res/drawable-port-xhdpi/splash.png
android/app/src/main/res/drawable-port-xxhdpi/splash.png
android/app/src/main/res/drawable-port-xxxhdpi/splash.png
```

### Step 3: Update App Icons (Optional)
Replace the current app icon with the new orange-themed one:
```
public/fittracker-app-icon.png
android/app/src/main/res/mipmap-*/ic_launcher.png
```

### Step 4: Rebuild App
After updating icons:
```bash
pnpm run build
npx cap sync android
npx cap open android
```

Then build a new APK in Android Studio.

## What's Updated
- ✅ Capacitor config updated with splash screen settings
- ✅ Orange background color (#ea580c) configured
- ✅ Icon generator created with FitTracker branding
- ✅ Splash screen will show orange background with white FT logo

## Automatic Features
- Splash screen duration: 2 seconds
- Auto-hide: enabled
- Orange background: #ea580c (matches app theme)
- Full screen: enabled
- Immersive: enabled (hides status bar during splash)
