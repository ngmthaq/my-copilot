---
name: reactjs-modern-hook-mastery
description: "React.js hooks — useState, useEffect, useRef, useMemo, useCallback, useContext, and custom hooks. Use when: working with any built-in hook; writing a custom hook; managing side effects or derived state."
---

# React.js Modern Hook Mastery Skill

## Overview

This skill covers every commonly used React hook with clear rules and examples. Use it when writing or debugging hooks, or when creating custom hooks.

---

## 1. useState

Manages local component state.

```typescript
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  // ✅ Use functional update when new state depends on old state
  const increment = () => setCount((prev) => prev + 1);

  return <button onClick={increment}>Count: {count}</button>;
}
```

```typescript
// ✅ Object state — always spread existing state before updating
const [form, setForm] = useState({ name: "", email: "" });

const updateName = (name: string) => setForm((prev) => ({ ...prev, name }));
```

---

## 2. useEffect

Runs side effects after render. Use for data fetching, subscriptions, and DOM mutations.

```typescript
import { useEffect, useState } from "react";

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false; // ✅ Prevent stale state on fast re-renders

    async function fetchUser() {
      const data = await getUser(userId);
      if (!cancelled) setUser(data);
    }

    fetchUser();

    return () => { cancelled = true; }; // cleanup
  }, [userId]); // ✅ Re-run only when userId changes

  return <div>{user?.name}</div>;
}
```

**Dependency array rules:**

| Array value    | Behavior                                   |
| -------------- | ------------------------------------------ |
| Omitted        | Runs after every render (⚠️ usually wrong) |
| `[]`           | Runs once on mount                         |
| `[dep1, dep2]` | Runs when any dep changes                  |

---

## 3. useRef

Holds a mutable value that does NOT trigger re-renders.

```typescript
import { useRef } from "react";

// ✅ Use case 1: Access a DOM element
export function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;
}

// ✅ Use case 2: Store a value without causing re-renders
export function Timer() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    intervalRef.current = setInterval(() => console.log("tick"), 1000);
  };

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return <><button onClick={start}>Start</button><button onClick={stop}>Stop</button></>;
}
```

---

## 4. useMemo

Caches an expensive computed value. Only recalculates when dependencies change.

```typescript
import { useMemo } from "react";

export function ProductList({ products, searchTerm }: Props) {
  // ✅ Only re-filters when products or searchTerm changes
  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [products, searchTerm]
  );

  return <ul>{filtered.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

> **Rule:** Don't over-use `useMemo`. Only add it when profiling shows a real performance problem.

---

## 5. useCallback

Caches a function reference. Useful when passing callbacks to memoized child components.

```typescript
import { useCallback } from "react";

export function Parent() {
  const [count, setCount] = useState(0);

  // ✅ Stable reference — MemoizedChild won't re-render needlessly
  const handleClick = useCallback(() => {
    console.log("clicked");
  }, []); // no dependencies — never changes

  return <MemoizedChild onClick={handleClick} />;
}
```

---

## 6. useContext

Reads a value from a React Context without prop drilling.

```typescript
import { createContext, useContext } from "react";

// 1. Define context shape
interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

// 2. Create context
const ThemeContext = createContext<ThemeContextType | null>(null);

// 3. Create a safe hook
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

// 4. Provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 5. Consumption
export function Header() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>Mode: {theme}</button>;
}
```

---

## 7. Custom Hooks

Extract reusable stateful logic into a `use*` function.

```typescript
// src/hooks/useLocalStorage.ts
import { useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  const set = (newValue: T) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, set] as const;
}

// Usage
const [token, setToken] = useLocalStorage<string | null>("auth-token", null);
```

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// Usage in search
const search = useDebounce(inputValue, 400);
```

---

## Hook Rules (Always Follow)

1. Call hooks **at the top level** of a component — never inside loops, conditions, or callbacks.
2. Call hooks only in **React function components** or other custom hooks.
3. Custom hooks must start with `use`.
4. Include all values used inside an effect in its dependency array.
