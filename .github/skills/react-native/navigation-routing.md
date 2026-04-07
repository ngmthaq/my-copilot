---
name: react-native-navigation-routing
description: "React Native navigation — Expo Router file-based routing: app/ directory, Stack/Tabs/Drawer navigators, dynamic routes, modals, auth guards, deep linking, and type-safe navigation. Use when: setting up navigation; building tabs, stacks, or modals; protecting routes by auth."
---

# React Native Navigation & Routing Skill

## Overview

This project uses **Expo Router** for file-based routing. Routes are auto-discovered from the `app/` directory. Expo Router is built on React Navigation and provides type-safe, file-system-based routing.

Install: `npx expo install expo-router expo-linking expo-constants`

---

## 1. Root Layout (app/\_layout.tsx)

The root layout wraps all screens with providers and global configuration.

```typescript
// app/_layout.tsx
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "@/providers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PaperProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </Stack>
        </PaperProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

---

## 2. File-Based Route Naming

| File path                | URL path     | Purpose                         |
| ------------------------ | ------------ | ------------------------------- |
| `app/_layout.tsx`        | (all routes) | Root layout wrapping everything |
| `app/(tabs)/_layout.tsx` | (tab group)  | Bottom tab navigator config     |
| `app/(tabs)/index.tsx`   | `/`          | Home tab                        |
| `app/(tabs)/explore.tsx` | `/explore`   | Explore tab                     |
| `app/(auth)/_layout.tsx` | (auth group) | Stack layout for auth screens   |
| `app/(auth)/login.tsx`   | `/login`     | Login screen                    |
| `app/users/index.tsx`    | `/users`     | Users list screen               |
| `app/users/[id].tsx`     | `/users/:id` | User detail (dynamic route)     |
| `app/modal.tsx`          | `/modal`     | Modal screen                    |
| `app/+not-found.tsx`     | `*`          | 404 catch-all                   |

**Groups** (`(tabs)`, `(auth)`) do not add a URL segment — they only define layout wrappers.

---

## 3. Tab Navigator

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6200ee",
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="compass" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
```

---

## 4. Stack Navigator (Auth Group)

```typescript
// app/(auth)/_layout.tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
```

---

## 5. Route Files vs Screen Components

Route files (`app/`) are thin wrappers. Screen UI lives in `src/screens/`.

```typescript
// src/screens/HomeScreen/HomeScreen.tsx ← actual UI
import { View, Text, StyleSheet } from "react-native";

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold" },
});
```

```typescript
// app/(tabs)/index.tsx ← thin route wrapper
import { HomeScreen } from "@/screens";
export default HomeScreen;
```

---

## 6. Dynamic Route Params

```typescript
// app/users/[id].tsx
import { useLocalSearchParams } from "expo-router";
import { UserDetailScreen } from "@/screens";

export default function UserDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <UserDetailScreen userId={id} />;
}
```

```typescript
// src/screens/UserDetailScreen/UserDetailScreen.tsx
import { useUser } from "@/queries";

interface UserDetailScreenProps {
  userId: string;
}

export function UserDetailScreen({ userId }: UserDetailScreenProps) {
  const { data: user, isLoading } = useUser(userId);

  if (isLoading) return <ActivityIndicator />;
  return <Text>{user?.name}</Text>;
}
```

---

## 7. Navigation

```typescript
import { useRouter, Link } from "expo-router";

// Imperative navigation
const router = useRouter();
router.push("/users/123");          // push onto stack
router.replace("/login");           // replace current screen
router.back();                      // go back
router.dismissAll();                // dismiss all modals

// Declarative navigation
<Link href="/users/123">
  <Text>View User</Text>
</Link>

// With params
router.push({ pathname: "/users/[id]", params: { id: "123" } });
```

---

## 8. Modal Screen

```typescript
// app/modal.tsx
import { useRouter } from "expo-router";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal</Text>
      <Pressable onPress={() => router.back()}>
        <Text>Close</Text>
      </Pressable>
    </View>
  );
}
```

Present it from anywhere: `router.push("/modal");`

---

## 9. Auth Guard (Redirect)

```typescript
// app/_layout.tsx
import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAtomValue } from "jotai";
import { isLoggedInAtom } from "@/stores";

function useProtectedRoute() {
  const isLoggedIn = useAtomValue(isLoggedInAtom);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!isLoggedIn && !inAuthGroup) {
      // Redirect unauthenticated users to login
      router.replace("/login");
    } else if (isLoggedIn && inAuthGroup) {
      // Redirect authenticated users to home
      router.replace("/");
    }
  }, [isLoggedIn, segments]);
}

export default function RootLayout() {
  useProtectedRoute();

  return (
    <Stack>
      {/* ... */}
    </Stack>
  );
}
```

---

## 10. Nested Layouts

```
app/
├── (tabs)/
│   ├── _layout.tsx          # Tab navigator
│   ├── index.tsx            # Home tab
│   └── settings/
│       ├── _layout.tsx      # Stack inside settings tab
│       ├── index.tsx        # /settings
│       └── notifications.tsx # /settings/notifications
```

```typescript
// app/(tabs)/settings/_layout.tsx
import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
    </Stack>
  );
}
```
