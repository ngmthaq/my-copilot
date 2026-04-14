---
name: react-native-modern-hook-mastery
description: "React Native hooks — useState, useEffect, useRef, useMemo, useCallback, useContext, custom hooks, and RN-specific hooks. Use when: managing component state; handling side effects; optimizing renders; building reusable logic."
---

# React Native Modern Hook Mastery

## Overview

This skill covers React hooks in the context of React Native — standard hooks, RN-specific patterns, and custom hook design.

---

## 1. useState

```typescript
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);

// ✅ Functional update for state that depends on previous value
setCount((prev) => prev + 1);

// ✅ Lazy initializer for expensive computation
const [data, setData] = useState(() => parseExpensiveData(rawData));
```

---

## 2. useEffect

```typescript
// Run on mount only
useEffect(() => {
  loadInitialData();
}, []);

// Run when dependency changes
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// Cleanup (subscriptions, timers, event listeners)
useEffect(() => {
  const subscription = eventEmitter.addListener("update", handler);
  return () => subscription.remove();
}, []);
```

### RN-Specific: AppState Listener

```typescript
import { AppState, type AppStateStatus } from "react-native";

export function useAppState(onChange: (state: AppStateStatus) => void) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      onChangeRef.current(state);
    });
    return () => subscription.remove();
  }, []);
}

// Usage
useAppState((state) => {
  if (state === "active") refetchData();
});
```

---

## 3. useRef

```typescript
import { useRef } from "react";
import { TextInput } from "react-native";

// ✅ Reference to a native component
const inputRef = useRef<TextInput>(null);

// Focus programmatically
inputRef.current?.focus();

// ✅ Mutable value that doesn't trigger re-renders
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

---

## 4. useMemo & useCallback

```typescript
// ✅ useMemo — cache expensive computation
const filteredUsers = useMemo(
  () => users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase())),
  [users, query],
);

// ✅ useCallback — stable function reference for child components
const handlePress = useCallback(() => {
  router.push(`/users/${userId}`);
}, [userId]);
```

**When to use:**

- `useMemo`: expensive filters, sorts, or transformations in render
- `useCallback`: functions passed as props to `React.memo`-wrapped children or FlatList `renderItem`

---

## 5. useContext

```typescript
import { createContext, useContext, type ReactNode } from "react";

interface ThemeContextType {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const toggle = useCallback(() => setIsDark((p) => !p), []);

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

---

## 6. Custom Hooks

### useDebounce

```typescript
// src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### useKeyboard

```typescript
// src/hooks/useKeyboard.ts
import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export function useKeyboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setIsVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return { isVisible, keyboardHeight };
}
```

### useDimensions

```typescript
// src/hooks/useDimensions.ts
import { useState, useEffect } from "react";
import { Dimensions, type ScaledSize } from "react-native";

export function useDimensions() {
  const [dimensions, setDimensions] = useState(() => Dimensions.get("window"));

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      "change",
      ({ window }: { window: ScaledSize }) => {
        setDimensions(window);
      },
    );
    return () => subscription.remove();
  }, []);

  return dimensions;
}
```

### useNetworkStatus

```typescript
// src/hooks/useNetworkStatus.ts
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  return isConnected;
}
```

---

## 7. Hook Rules Reminder

- Only call hooks at the top level (not inside loops, conditions, or nested functions)
- Only call hooks inside React function components or custom hooks
- Custom hooks must start with `use`
- Declare all dependencies in `useEffect`/`useMemo`/`useCallback` dependency arrays
