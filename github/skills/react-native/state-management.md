---
name: react-native-state-management
description: "React Native state management — local state, Context API (providers/), and Jotai atoms (stores/). Use when: deciding where to put state; sharing state across components; setting up global atoms with Jotai."
---

# React Native State Management Skill

## Overview

This skill covers when to use local state, Context API, and Jotai — and practical patterns for each in React Native.

Install Jotai: `npx expo install jotai`

---

## 1. When to Use What

```
Is the state only used by one component or its direct children?
│
├── YES → useState (or useReducer for complex shapes)
│
└── NO — Is it shared across many parts of the app?
    │
    ├── Shared non-reactive values (auth user, theme)?
    │   └── Context API → put provider in src/providers/
    │
    └── Reactive global state (cart, UI flags, user session)?
        └── Jotai atoms → put atoms in src/stores/
```

---

## 2. Local State — useState & useReducer

```typescript
// ✅ Simple: useState
const [isVisible, setIsVisible] = useState(false);
```

```typescript
// ✅ Complex shape: useReducer
type Action =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_EMAIL"; payload: string }
  | { type: "RESET" };

interface FormState {
  name: string;
  email: string;
}

function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload };
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "RESET":
      return { name: "", email: "" };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(formReducer, { name: "", email: "" });
```

---

## 3. Context API — Providers (src/providers/)

Best for values that change infrequently: auth user, theme, locale.

```typescript
// src/providers/AuthProvider.tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "@/types/user";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const login = (user: User) => setUser(user);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
```

Wire it up in the root layout:

```typescript
// app/_layout.tsx
import { AuthProvider } from "@/providers";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack />
    </AuthProvider>
  );
}
```

---

## 4. Jotai Atoms (src/stores/)

Use Jotai for reactive global state that many components subscribe to.

### Basic Atom

```typescript
// src/stores/authAtom.ts
import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "@/types/user";

// ✅ Persisted token atom — survives app restarts
const storage = createJSONStorage<string | null>(() => AsyncStorage);
export const tokenAtom = atomWithStorage<string | null>(
  "auth-token",
  null,
  storage,
);

// ✅ In-memory atom
export const currentUserAtom = atom<User | null>(null);
```

### Derived Atom

```typescript
// src/stores/authAtom.ts
import { atom } from "jotai";

export const isLoggedInAtom = atom((get) => get(tokenAtom) !== null);
```

### Read-Write Atom

```typescript
// src/stores/cartAtom.ts
import { atom } from "jotai";
import type { CartItem } from "@/types/cart";

const cartItemsAtom = atom<CartItem[]>([]);

export const cartTotalAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

export const addToCartAtom = atom(null, (get, set, newItem: CartItem) => {
  const items = get(cartItemsAtom);
  const existing = items.find((i) => i.id === newItem.id);

  if (existing) {
    set(
      cartItemsAtom,
      items.map((i) =>
        i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    );
  } else {
    set(cartItemsAtom, [...items, { ...newItem, quantity: 1 }]);
  }
});
```

### Using Atoms in Components

```typescript
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { tokenAtom, isLoggedInAtom, addToCartAtom } from "@/stores";

// ✅ Read + write
const [token, setToken] = useAtom(tokenAtom);

// ✅ Read-only (no re-render on write)
const isLoggedIn = useAtomValue(isLoggedInAtom);

// ✅ Write-only (no re-render on read)
const addToCart = useSetAtom(addToCartAtom);
```

---

## 5. Jotai + AsyncStorage Persistence

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

const asyncStorage = createJSONStorage<string>(() => AsyncStorage);

// Value is persisted to AsyncStorage under the key "app-theme"
export const themeAtom = atomWithStorage<"light" | "dark">(
  "app-theme",
  "light",
  asyncStorage,
);
```

Install: `npx expo install @react-native-async-storage/async-storage`

---

## 6. Decision Summary

| Need                                   | Solution                         | Location         |
| -------------------------------------- | -------------------------------- | ---------------- |
| Local UI toggle, input value           | `useState`                       | Component        |
| Complex local state with actions       | `useReducer`                     | Component        |
| Auth user, theme (infrequent changes)  | Context API                      | `src/providers/` |
| Reactive global state (cart, UI flags) | Jotai atoms                      | `src/stores/`    |
| Persisted state (token, preferences)   | `atomWithStorage` + AsyncStorage | `src/stores/`    |
| Server state (API data)                | TanStack Query                   | `src/queries/`   |
