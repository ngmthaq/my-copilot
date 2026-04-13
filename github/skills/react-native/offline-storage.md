---
name: react-native-offline-storage
description: "React Native offline storage — AsyncStorage, MMKV, expo-sqlite, choosing the right storage solution, and data persistence patterns. Use when: storing data locally; caching API responses; managing user preferences; offline-first patterns."
---

# React Native Offline & Storage Skill

## Overview

This skill covers local data persistence options in React Native (Expo) — from simple key-value storage to embedded SQL databases.

---

## 1. Choosing the Right Storage

| Storage      | Best for                                         | Size limit         | Speed     |
| ------------ | ------------------------------------------------ | ------------------ | --------- |
| AsyncStorage | Simple key-value (preferences, flags)            | ~6MB (Android)     | Moderate  |
| MMKV         | High-frequency key-value (tokens, cache)         | No practical limit | Very fast |
| expo-sqlite  | Structured data, complex queries, large datasets | Limited by disk    | Fast      |
| SecureStore  | Sensitive data (tokens, passwords)               | ~2KB per item      | Moderate  |

---

## 2. AsyncStorage

Simple async key-value store. Good for user preferences and small data.

Install: `npx expo install @react-native-async-storage/async-storage`

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

// Store a string
await AsyncStorage.setItem("username", "alice");

// Store an object (must serialize)
await AsyncStorage.setItem("user", JSON.stringify({ id: "1", name: "Alice" }));

// Read a string
const username = await AsyncStorage.getItem("username");

// Read an object
const raw = await AsyncStorage.getItem("user");
const user = raw ? JSON.parse(raw) : null;

// Remove
await AsyncStorage.removeItem("username");

// Clear all
await AsyncStorage.clear();

// Multi operations
await AsyncStorage.multiSet([
  ["key1", "value1"],
  ["key2", "value2"],
]);

const results = await AsyncStorage.multiGet(["key1", "key2"]);
// results = [["key1", "value1"], ["key2", "value2"]]
```

### Jotai + AsyncStorage

```typescript
// src/stores/settingsAtom.ts
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

const storage = createJSONStorage<boolean>(() => AsyncStorage);

export const onboardingCompleteAtom = atomWithStorage<boolean>("onboarding-complete", false, storage);
```

---

## 3. MMKV

Ultra-fast key-value storage using memory-mapped files. Synchronous API.

Install: `npx expo install react-native-mmkv`

```typescript
// src/utils/storage.ts
import { MMKV } from "react-native-mmkv";

export const storage = new MMKV();

// String
storage.set("username", "alice");
const username = storage.getString("username");

// Number
storage.set("count", 42);
const count = storage.getNumber("count");

// Boolean
storage.set("dark-mode", true);
const isDark = storage.getBoolean("dark-mode");

// Delete
storage.delete("username");

// Check existence
const exists = storage.contains("username");

// List all keys
const keys = storage.getAllKeys();

// Clear all
storage.clearAll();
```

### Jotai + MMKV

```typescript
// src/stores/themeAtom.ts
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { storage } from "@/utils/storage";

const mmkvStorage = createJSONStorage<"light" | "dark">(() => ({
  getItem: (key) => {
    const value = storage.getString(key);
    return value ?? null;
  },
  setItem: (key, value) => {
    storage.set(key, value);
  },
  removeItem: (key) => {
    storage.delete(key);
  },
}));

export const themeAtom = atomWithStorage<"light" | "dark">("app-theme", "light", mmkvStorage);
```

---

## 4. expo-sqlite

Embedded SQLite database for structured data and complex queries.

Install: `npx expo install expo-sqlite`

```typescript
// src/utils/database.ts
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("app.db");

// Create table
export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// Insert
export function addTodo(title: string): number {
  const result = db.runSync("INSERT INTO todos (title) VALUES (?)", [title]);
  return result.lastInsertRowId;
}

// Select all
export function getAllTodos(): Todo[] {
  return db.getAllSync<Todo>("SELECT * FROM todos ORDER BY created_at DESC");
}

// Select one
export function getTodo(id: number): Todo | null {
  return db.getFirstSync<Todo>("SELECT * FROM todos WHERE id = ?", [id]);
}

// Update
export function toggleTodo(id: number) {
  db.runSync("UPDATE todos SET completed = NOT completed WHERE id = ?", [id]);
}

// Delete
export function deleteTodo(id: number) {
  db.runSync("DELETE FROM todos WHERE id = ?", [id]);
}

interface Todo {
  id: number;
  title: string;
  completed: number;
  created_at: string;
}
```

### Using with TanStack Query

```typescript
// src/queries/useTodos.ts
import { useQuery } from "@tanstack/react-query";
import { getAllTodos } from "@/utils/database";

export function useTodos() {
  return useQuery({
    queryKey: ["todos"],
    queryFn: () => getAllTodos(),
  });
}
```

```typescript
// src/mutations/useAddTodo.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTodo } from "@/utils/database";

export function useAddTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => Promise.resolve(addTodo(title)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
```

---

## 5. Offline-First Pattern

Cache API responses locally and serve from cache when offline.

```typescript
// src/hooks/useOfflineQuery.ts
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNetworkStatus } from "@/hooks";

export function useOfflineQuery<T>(queryKey: string[], queryFn: () => Promise<T>) {
  const isConnected = useNetworkStatus();
  const cacheKey = `cache:${queryKey.join(":")}`;

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (isConnected) {
        const data = await queryFn();
        // Cache the fresh data
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      }

      // Offline: read from cache
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached) as T;

      throw new Error("No cached data available");
    },
  });
}
```

---

## 6. Database Initialization

Initialize the database at app startup:

```typescript
// app/_layout.tsx
import { useEffect, useState } from "react";
import { initDatabase } from "@/utils/database";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase();
    setDbReady(true);
  }, []);

  if (!dbReady) return null;

  return <Stack />;
}
```
