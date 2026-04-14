---
name: react-native-platform-integration
description: "React Native platform integration — Expo modules for camera, image picker, location, permissions, file system, haptics, secure storage, device info, and platform-specific code. Use when: accessing device APIs; handling permissions; reading/writing files; adapting UI per platform."
---

# React Native Platform Integration Skill

## Overview

This skill covers accessing native device APIs using Expo modules. Expo's managed workflow provides pre-built modules that eliminate the need for native code in most cases.

---

## 1. Permissions

```typescript
// src/utils/permissions.ts
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Camera from "expo-camera";
import { Alert, Linking } from "react-native";

export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await Camera.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Permission Required",
      "Camera access is needed. Please enable it in Settings.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ],
    );
    return false;
  }
  return true;
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission Required", "Location access is needed.");
    return false;
  }
  return true;
}
```

Install: `npx expo install expo-camera expo-location`

---

## 2. Image Picker

```typescript
// src/hooks/useImagePicker.ts
import * as ImagePicker from "expo-image-picker";

export function useImagePicker() {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return null;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  return { pickImage, takePhoto };
}
```

Install: `npx expo install expo-image-picker`

---

## 3. Location

```typescript
// src/hooks/useLocation.ts
import { useState, useEffect } from "react";
import * as Location from "expo-location";

interface LocationState {
  latitude: number;
  longitude: number;
  isLoading: boolean;
  error: string | null;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: 0,
    longitude: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocation((prev) => ({
          ...prev,
          isLoading: false,
          error: "Permission denied",
        }));
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        isLoading: false,
        error: null,
      });
    })();
  }, []);

  return location;
}
```

---

## 4. File System

```typescript
import * as FileSystem from "expo-file-system";

// Read a file
const content = await FileSystem.readAsStringAsync(
  FileSystem.documentDirectory + "data.json",
);

// Write a file
await FileSystem.writeAsStringAsync(
  FileSystem.documentDirectory + "data.json",
  JSON.stringify(data),
);

// Download a file
const download = await FileSystem.downloadAsync(
  "https://example.com/file.pdf",
  FileSystem.documentDirectory + "file.pdf",
);
console.log("Downloaded to:", download.uri);

// Check if file exists
const info = await FileSystem.getInfoAsync(
  FileSystem.documentDirectory + "data.json",
);
if (info.exists) {
  // file exists
}

// Delete a file
await FileSystem.deleteAsync(FileSystem.documentDirectory + "data.json", {
  idempotent: true,
});
```

Install: `npx expo install expo-file-system`

---

## 5. Secure Storage

For sensitive data like tokens, use `expo-secure-store` instead of AsyncStorage.

```typescript
import * as SecureStore from "expo-secure-store";

// Store a value
await SecureStore.setItemAsync("auth-token", token);

// Retrieve a value
const token = await SecureStore.getItemAsync("auth-token");

// Delete a value
await SecureStore.deleteItemAsync("auth-token");
```

Install: `npx expo install expo-secure-store`

### Jotai + SecureStore

```typescript
// src/stores/secureAuthAtom.ts
import { atom } from "jotai";
import * as SecureStore from "expo-secure-store";

const tokenBaseAtom = atom<string | null>(null);

// Initialize from SecureStore on first read
export const tokenAtom = atom(
  (get) => get(tokenBaseAtom),
  async (_get, set, newValue: string | null) => {
    set(tokenBaseAtom, newValue);
    if (newValue) {
      await SecureStore.setItemAsync("auth-token", newValue);
    } else {
      await SecureStore.deleteItemAsync("auth-token");
    }
  },
);
```

---

## 6. Haptics

```typescript
import * as Haptics from "expo-haptics";

// Light tap feedback
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Medium impact
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Success notification
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Selection feedback
await Haptics.selectionAsync();
```

Install: `npx expo install expo-haptics`

---

## 7. Device Info

```typescript
import * as Device from "expo-device";
import Constants from "expo-constants";

// Device info
console.log(Device.brand); // "Apple"
console.log(Device.modelName); // "iPhone 15"
console.log(Device.osName); // "iOS"
console.log(Device.osVersion); // "17.0"
console.log(Device.isDevice); // true (false on simulator)

// App info
console.log(Constants.expoConfig?.name); // App name
console.log(Constants.expoConfig?.version); // App version
```

Install: `npx expo install expo-device expo-constants`

---

## 8. Sharing & Clipboard

```typescript
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";

// Share a file
await Sharing.shareAsync(fileUri, {
  mimeType: "application/pdf",
  dialogTitle: "Share PDF",
});

// Copy to clipboard
await Clipboard.setStringAsync("Hello, world!");

// Read from clipboard
const text = await Clipboard.getStringAsync();
```

Install: `npx expo install expo-sharing expo-clipboard`

---

## 9. Platform-Specific Code

```typescript
import { Platform } from "react-native";

// Inline conditional
const padding = Platform.OS === "ios" ? 20 : 16;

// Platform.select
const fontFamily = Platform.select({
  ios: "Helvetica Neue",
  android: "Roboto",
  default: "System",
});

// Platform-specific files
// Component.ios.tsx  — used on iOS
// Component.android.tsx — used on Android
// Component.tsx — fallback
```

---

## 10. App Configuration (app.json / app.config.ts)

```typescript
// app.config.ts
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "MyApp",
  slug: "my-app",
  version: "1.0.0",
  extra: {
    apiBaseUrl: process.env.API_BASE_URL ?? "http://localhost:3000",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-camera",
      { cameraPermission: "Allow $(PRODUCT_NAME) to access your camera." },
    ],
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Allow $(PRODUCT_NAME) to use your location.",
      },
    ],
  ],
});
```
