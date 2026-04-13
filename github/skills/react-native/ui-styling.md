---
name: react-native-ui-styling
description: "React Native UI & styling — React Native Paper components, StyleSheet, theming, dark mode, responsive design, and common UI patterns. Use when: styling components; using Paper components; setting up themes; building responsive layouts."
---

# React Native UI & Styling Skill

## Overview

This skill covers styling React Native apps using **React Native Paper** (Material Design 3) and the built-in `StyleSheet` API. Paper provides pre-built accessible components; StyleSheet handles custom layouts.

Install: `npx expo install react-native-paper react-native-safe-area-context`

---

## 1. Paper Provider Setup

```typescript
// app/_layout.tsx
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { useAtomValue } from "jotai";
import { themeAtom } from "@/stores";

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#6200ee",
    secondary: "#03dac6",
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#bb86fc",
    secondary: "#03dac6",
  },
};

export default function RootLayout() {
  const theme = useAtomValue(themeAtom);
  const paperTheme = theme === "dark" ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <Stack />
    </PaperProvider>
  );
}
```

---

## 2. Using Paper Theme in Components

```typescript
import { useTheme } from "react-native-paper";
import type { MD3Theme } from "react-native-paper";

export function ProfileCard() {
  const theme = useTheme<MD3Theme>();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>Profile</Text>
    </View>
  );
}
```

---

## 3. Common Paper Components

```typescript
import {
  Button,
  TextInput,
  Card,
  Avatar,
  Chip,
  FAB,
  Snackbar,
  Dialog,
  Portal,
  Searchbar,
  Divider,
  List,
  Switch,
  Badge,
  ProgressBar,
  ActivityIndicator,
} from "react-native-paper";

// Button variants
<Button mode="contained" onPress={onSave}>Save</Button>
<Button mode="outlined" onPress={onCancel}>Cancel</Button>
<Button mode="text" onPress={onSkip}>Skip</Button>

// TextInput
<TextInput
  label="Email"
  mode="outlined"
  value={email}
  onChangeText={setEmail}
  left={<TextInput.Icon icon="email" />}
  right={<TextInput.Icon icon="close" onPress={() => setEmail("")} />}
/>

// Card
<Card>
  <Card.Cover source={{ uri: imageUrl }} />
  <Card.Title title="Title" subtitle="Subtitle" />
  <Card.Content>
    <Text>Card body text</Text>
  </Card.Content>
  <Card.Actions>
    <Button>Cancel</Button>
    <Button mode="contained">OK</Button>
  </Card.Actions>
</Card>

// FAB
<FAB
  icon="plus"
  style={styles.fab}
  onPress={onCreate}
/>

// Snackbar
<Snackbar
  visible={showSnackbar}
  onDismiss={() => setShowSnackbar(false)}
  duration={3000}
  action={{ label: "Undo", onPress: onUndo }}
>
  Item deleted
</Snackbar>
```

---

## 4. Dialog (with Portal)

```typescript
import { Portal, Dialog, Button, Text } from "react-native-paper";

export function ConfirmDialog({ visible, onDismiss, onConfirm, title, message }) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text>{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={onConfirm}>Confirm</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
```

---

## 5. StyleSheet Patterns

```typescript
import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
  // ✅ Flex layout
  container: {
    flex: 1,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  // ✅ Shadows (platform-specific)
  card: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // ✅ Typography
  title: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
});
```

---

## 6. Responsive Design

```typescript
import { useWindowDimensions } from "react-native";

export function ResponsiveGrid({ children }) {
  const { width } = useWindowDimensions();

  const numColumns = width >= 768 ? 3 : width >= 480 ? 2 : 1;
  const itemWidth = (width - 16 * (numColumns + 1)) / numColumns;

  return (
    <FlatList
      data={children}
      numColumns={numColumns}
      key={numColumns} // ✅ force re-render when columns change
      renderItem={({ item }) => (
        <View style={{ width: itemWidth, margin: 8 }}>{item}</View>
      )}
    />
  );
}
```

---

## 7. Safe Area Handling

```typescript
import { SafeAreaView } from "react-native-safe-area-context";

export function ScreenWrapper({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {children}
    </SafeAreaView>
  );
}
```

---

## 8. Dark Mode Toggle

```typescript
// src/stores/themeAtom.ts
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

const storage = createJSONStorage<"light" | "dark">(() => AsyncStorage);
export const themeAtom = atomWithStorage<"light" | "dark">("app-theme", "light", storage);
```

```typescript
// Usage
import { useAtom } from "jotai";
import { Switch } from "react-native-paper";
import { themeAtom } from "@/stores";

export function ThemeToggle() {
  const [theme, setTheme] = useAtom(themeAtom);

  return (
    <Switch
      value={theme === "dark"}
      onValueChange={() => setTheme(theme === "dark" ? "light" : "dark")}
    />
  );
}
```

---

## 9. Styling Best Practices

- Use `StyleSheet.create` instead of inline objects for performance
- Use `gap` for spacing between flex children (RN 0.71+)
- Use `useTheme()` from Paper for consistent theming instead of hardcoded colors
- Use `Platform.select` for platform-specific styles
- Use `useWindowDimensions()` for responsive layouts instead of `Dimensions.get("window")` (reactive to changes)
- Keep styles at the bottom of the file or in a separate `.styles.ts` file for large components
