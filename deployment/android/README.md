# J.A.R.V.I.S. Android Capacitor Packaging Guide

This guide details packaging J.A.R.V.I.S. into an Android application (.apk) using Capacitor.

---

## 1. Prerequisites
- Node.js 18+ and npm
- Android Studio with Android SDK Platform 34+
- Java Development Kit (JDK 17 or 21)

---

## 2. Initialize Capacitor Android Project

In the root of the project:

```powershell
# 1. Build production web assets
npm --prefix frontend run build

# 2. Install Capacitor CLI & Android platform dependencies (if not already installed)
npm install @capacitor/core @capacitor/cli @capacitor/android

# 3. Add Android platform
npx cap add android

# 4. Sync web assets into Android project
npx cap sync android
```

---

## 3. Verify Android Permissions

Open `android/app/src/main/AndroidManifest.xml` and ensure audio and network permissions are present:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

---

## 4. Build APK

Open the Android project in Android Studio:
```powershell
npx cap open android
```
- Click **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
- Install the resulting `app-debug.apk` directly on your Android phone using `adb install app-debug.apk` or by sending it via USB/Google Drive.
