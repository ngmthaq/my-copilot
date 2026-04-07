---
name: react-native-push-notifications
description: "React Native push notifications — Expo Notifications: setup, push tokens, local and remote notifications, notification handling, scheduling, and channels. Use when: setting up push notifications; handling received notifications; scheduling local notifications."
---

# React Native Push Notifications Skill

## Overview

This skill covers push notifications in Expo using `expo-notifications`. Supports both local notifications and remote push (via Expo Push Service or FCM/APNs directly).

Install: `npx expo install expo-notifications expo-device expo-constants`

---

## 1. Configuration (app.config.ts)

```typescript
// app.config.ts
export default {
  expo: {
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/images/notification-icon.png",
          color: "#6200ee",
          sounds: [],
        },
      ],
    ],
    android: {
      googleServicesFile: "./google-services.json", // for FCM
    },
  },
};
```

---

## 2. Register for Push Notifications

```typescript
// src/utils/notifications.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Configure default notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn("Push notifications only work on physical devices");
    return null;
  }

  // Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not granted
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permission not granted");
    return null;
  }

  // Get Expo push token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = await Notifications.getExpoPushTokenAsync({ projectId });

  // Android: set notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6200ee",
    });
  }

  return token.data;
}
```

---

## 3. Notification Listeners

```typescript
// src/hooks/useNotifications.ts
import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import type { Subscription } from "expo-modules-core";

export function useNotifications() {
  const router = useRouter();
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  useEffect(() => {
    // Called when a notification is received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      console.log("Notification received:", data);
    });

    // Called when user taps a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      // Navigate based on notification data
      if (data.screen) {
        router.push(data.screen as string);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);
}
```

### Wire Up in Root Layout

```typescript
// app/_layout.tsx
import { useEffect } from "react";
import { registerForPushNotifications } from "@/utils/notifications";
import { useNotifications } from "@/hooks";
import { useSetAtom } from "jotai";
import { pushTokenAtom } from "@/stores";

export default function RootLayout() {
  const setPushToken = useSetAtom(pushTokenAtom);
  useNotifications();

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) {
        setPushToken(token);
        // Send token to your backend
        sendTokenToServer(token);
      }
    });
  }, []);

  return <Stack />;
}
```

---

## 4. Local Notifications

```typescript
import * as Notifications from "expo-notifications";

// Schedule immediately
export async function showLocalNotification(title: string, body: string, data?: Record<string, unknown>) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
      sound: "default",
    },
    trigger: null, // show immediately
  });
}

// Schedule with delay
export async function scheduleNotification(title: string, body: string, seconds: number) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: "default" },
    trigger: { seconds, repeats: false },
  });
}

// Schedule daily at a specific time
export async function scheduleDailyReminder(title: string, body: string, hour: number, minute: number) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: "default" },
    trigger: { hour, minute, repeats: true },
  });
}

// Cancel all scheduled notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
```

---

## 5. Sending Push via Expo Push API

Server-side example (Node.js):

```typescript
// Backend: send push notification
const pushToken = "ExponentPushToken[xxxx]";

await fetch("https://exp.host/--/api/v2/push/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    to: pushToken,
    title: "New Message",
    body: "You have a new message from Alice",
    data: { screen: "/chat/123" },
    sound: "default",
    badge: 1,
  }),
});
```

---

## 6. Badge Count

```typescript
import * as Notifications from "expo-notifications";

// Set badge count
await Notifications.setBadgeCountAsync(5);

// Get badge count
const count = await Notifications.getBadgeCountAsync();

// Clear badge
await Notifications.setBadgeCountAsync(0);
```

---

## 7. Android Notification Channels

```typescript
// Create channels for different notification types
await Notifications.setNotificationChannelAsync("messages", {
  name: "Messages",
  importance: Notifications.AndroidImportance.HIGH,
  sound: "default",
});

await Notifications.setNotificationChannelAsync("promotions", {
  name: "Promotions",
  importance: Notifications.AndroidImportance.LOW,
});

// Use a channel when scheduling
await Notifications.scheduleNotificationAsync({
  content: { title: "Sale!", body: "50% off today" },
  trigger: { channelId: "promotions" },
});
```
