---
name: react-native-deep-linking
description: "React Native deep linking — Expo Router deep links, URL scheme configuration, universal links (iOS), app links (Android), handling incoming links, and testing. Use when: setting up deep links; configuring universal links; handling incoming URLs."
---

# React Native Deep Linking Skill

## Overview

Expo Router provides built-in deep linking support. Every route in the `app/` directory is automatically a deep link target. This skill covers configuration for URL schemes, universal links (iOS), and app links (Android).

---

## 1. URL Scheme (Custom Scheme)

Every Expo app has a default URL scheme: `exp://` in development and `myapp://` in production.

### Configure Custom Scheme

```json
// app.json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

This enables `myapp://` links to open the app:

```
myapp://                        → app/(tabs)/index.tsx (/)
myapp://users/123               → app/users/[id].tsx (/users/123)
myapp://settings/notifications  → app/(tabs)/settings/notifications.tsx
```

---

## 2. Universal Links (iOS) / App Links (Android)

Allow `https://yoursite.com/users/123` to open the app directly.

### Configuration (app.config.ts)

```typescript
// app.config.ts
export default {
  expo: {
    scheme: "myapp",
    ios: {
      associatedDomains: ["applinks:yoursite.com"],
    },
    android: {
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "yoursite.com",
              pathPrefix: "/",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    plugins: ["expo-router"],
  },
};
```

### Server-Side: Apple App Site Association (iOS)

Host at `https://yoursite.com/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.yourcompany.myapp",
        "paths": ["/users/*", "/settings/*", "/chat/*"]
      }
    ]
  }
}
```

### Server-Side: Digital Asset Links (Android)

Host at `https://yoursite.com/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.yourcompany.myapp",
      "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
    }
  }
]
```

---

## 3. Route Mapping

Expo Router maps URLs to files automatically:

| Deep Link URL                    | Route File               |
| -------------------------------- | ------------------------ |
| `myapp://`                       | `app/(tabs)/index.tsx`   |
| `myapp://explore`                | `app/(tabs)/explore.tsx` |
| `myapp://users/123`              | `app/users/[id].tsx`     |
| `https://yoursite.com/users/123` | `app/users/[id].tsx`     |
| `myapp://chat/456?msg=hello`     | `app/chat/[id].tsx`      |

---

## 4. Handling Incoming Links

Expo Router handles deep links automatically when route files exist. For custom handling:

```typescript
// src/hooks/useDeepLink.ts
import { useEffect } from "react";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";

export function useDeepLink() {
  const router = useRouter();

  useEffect(() => {
    // Handle link that opened the app (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Handle link while app is open (warm start)
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  function handleDeepLink(url: string) {
    const parsed = Linking.parse(url);
    console.log("Deep link:", parsed);

    // Custom logic based on the path
    if (parsed.path?.startsWith("users/")) {
      const userId = parsed.path.replace("users/", "");
      router.push(`/users/${userId}`);
    }
  }
}
```

---

## 5. Accessing Query Parameters

```typescript
// Deep link: myapp://users/123?tab=posts&sort=recent
// Route: app/users/[id].tsx

import { useLocalSearchParams } from "expo-router";

export default function UserDetailRoute() {
  const { id, tab, sort } = useLocalSearchParams<{
    id: string;
    tab?: string;
    sort?: string;
  }>();

  // id = "123", tab = "posts", sort = "recent"
}
```

---

## 6. Creating Deep Links Programmatically

```typescript
import * as Linking from "expo-linking";

// Create a deep link URL
const url = Linking.createURL("/users/123", {
  queryParams: { tab: "posts" },
});
// Development: exp://192.168.1.1:8081/--/users/123?tab=posts
// Production:  myapp://users/123?tab=posts

// Open an external URL
await Linking.openURL("https://google.com");

// Open app settings
await Linking.openSettings();
```

---

## 7. Testing Deep Links

### Development (Expo Go)

```bash
# iOS Simulator
xcrun simctl openurl booted "exp://192.168.1.1:8081/--/users/123"

# Android Emulator
adb shell am start -a android.intent.action.VIEW -d "exp://192.168.1.1:8081/--/users/123" host.exp.exponent
```

### Production Build

```bash
# iOS Simulator
xcrun simctl openurl booted "myapp://users/123"

# Android Emulator
adb shell am start -a android.intent.action.VIEW -d "myapp://users/123" com.yourcompany.myapp
```

### Universal Links Test

```bash
# iOS
xcrun simctl openurl booted "https://yoursite.com/users/123"

# Android
adb shell am start -a android.intent.action.VIEW -d "https://yoursite.com/users/123" com.yourcompany.myapp
```

---

## 8. Deep Link + Push Notification

Combine deep linking with push notifications:

```typescript
// When sending a push notification, include a deep link
{
  "to": "ExponentPushToken[xxxx]",
  "title": "New message",
  "body": "Alice sent you a message",
  "data": {
    "url": "/chat/456"
  }
}

// In notification response handler
Notifications.addNotificationResponseReceivedListener((response) => {
  const url = response.notification.request.content.data?.url;
  if (url) router.push(url as string);
});
```
