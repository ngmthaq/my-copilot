---
name: reactjs-state-management
description: "React.js state management — local state, Context API (providers/), and Jotai atoms (stores/). Use when: deciding where to put state; sharing state across components; setting up global atoms with Jotai."
---

# React.js State Management Skill

## Overview

This skill covers when to use local state, Context API, and Jotai — and practical patterns for each.

Install Jotai: `npm install jotai`

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
const [isOpen, setIsOpen] = useState(false);
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

Best for values that change infrequently: auth user, theme, locale. ⚠️ Every Context consumer re-renders when the value changes — keep context values stable.

```typescript
// src/providers/AuthProvider.tsx
import { createContext, useContext, useState, ReactNode } from "react";
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

// ✅ Always export a safe hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
```

```typescript
// Register all providers in App.tsx or main.tsx
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

export function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </AuthProvider>
  );
}
```

---

## 4. Jotai — Global Atoms (src/stores/)

Jotai uses atomic state — each piece of state is an independent atom. Components subscribe only to the atoms they use, so only affected components re-render.

```typescript
// src/stores/authAtom.ts
import { atom } from "jotai";
import type { User } from "@/types/user";

// Primitive atom
export const userAtom = atom<User | null>(null);

// Derived (read-only) atom
export const isLoggedInAtom = atom((get) => get(userAtom) !== null);
export const userRoleAtom = atom((get) => get(userAtom)?.role ?? null);
```

```typescript
// src/stores/cartAtom.ts
import { atom } from "jotai";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const cartItemsAtom = atom<CartItem[]>([]);

// Derived: total price
export const cartTotalAtom = atom((get) =>
  get(cartItemsAtom).reduce((sum, i) => sum + i.price * i.quantity, 0),
);
```

```typescript
// Read and write an atom in a component
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { userAtom, isLoggedInAtom } from "@/stores/authAtom";

export function Header() {
  const isLoggedIn = useAtomValue(isLoggedInAtom); // read-only
  const setUser = useSetAtom(userAtom);            // write-only (no re-render on read)
  const [user, setUserFull] = useAtom(userAtom);   // read + write

  return (
    <header>
      {isLoggedIn ? (
        <button onClick={() => setUser(null)}>Logout</button>
      ) : (
        <a href="/login">Login</a>
      )}
    </header>
  );
}
```

---

## 5. Atom with Write Logic (Action Atom)

Use a writable derived atom to encapsulate mutation logic.

```typescript
// src/stores/cartAtom.ts
import { atom } from "jotai";

export const cartItemsAtom = atom<CartItem[]>([]);

// Write-only action atom
export const addToCartAtom = atom(null, (get, set, item: CartItem) => {
  const current = get(cartItemsAtom);
  const existing = current.find((i) => i.id === item.id);
  if (existing) {
    set(
      cartItemsAtom,
      current.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    );
  } else {
    set(cartItemsAtom, [...current, item]);
  }
});

export const clearCartAtom = atom(null, (_get, set) => set(cartItemsAtom, []));
```

```typescript
// Usage
const addToCart = useSetAtom(addToCartAtom);
const clearCart = useSetAtom(clearCartAtom);

addToCart({ id: "1", name: "Widget", price: 9.99, quantity: 1 });
```

---

## 6. Persist Atom to localStorage

```typescript
import { atomWithStorage } from "jotai/utils";

// Automatically reads/writes to localStorage
export const themeAtom = atomWithStorage<"light" | "dark">("theme", "light");
export const tokenAtom = atomWithStorage<string | null>("auth-token", null);
```

---

## 2. Local State — useState & useReducer

```typescript
// ✅ Simple: useState
const [isOpen, setIsOpen] = useState(false);
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
    case "SET_NAME": return { ...state, name: action.payload };
    case "SET_EMAIL": return { ...state, email: action.payload };
    case "RESET": return { name: "", email: "" };
    default: return state;
  }
}

export function ProfileForm() {
  const [state, dispatch] = useReducer(formReducer, { name: "", email: "" });

  return (
    <form>
      <input value={state.name} onChange={(e) => dispatch({ type: "SET_NAME", payload: e.target.value })} />
      <input value={state.email} onChange={(e) => dispatch({ type: "SET_EMAIL", payload: e.target.value })} />
      <button type="button" onClick={() => dispatch({ type: "RESET" })}>Reset</button>
    </form>
  );
}
```

---

## 3. Context API — Simple Global State

Best for low-frequency updates like auth or theme. ⚠️ Not ideal for high-frequency state (causes re-renders across all consumers).

```typescript
// src/store/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
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

// ✅ Safe hook with runtime check
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
```

```typescript
// Wrap the app (main.tsx or App.tsx)
<AuthProvider>
  <App />
</AuthProvider>

// Consume anywhere
const { user, logout } = useAuth();
```

---

## 4. Zustand — Scalable Global State

Install: `npm install zustand`

```typescript
// src/store/cartStore.ts
import { create } from "zustand";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      return { items: [...state.items, item] };
    }),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  clearCart: () => set({ items: [] }),

  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
```

```typescript
// Usage in any component — no Provider needed
function CartSummary() {
  const items = useCartStore((state) => state.items); // ✅ Selector — only re-renders when items changes
  const total = useCartStore((state) => state.total);
  const clearCart = useCartStore((state) => state.clearCart);

  return (
    <div>
      <p>{items.length} items — ${total()}</p>
      <button onClick={clearCart}>Clear</button>
    </div>
  );
}
```

> **Zustand tip:** Always select only what you need with a selector `(state) => state.items`. This prevents unnecessary re-renders.

---

## 5. Persist Zustand State to localStorage

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      /* ...same store... */
    }),
    { name: "cart-storage" }, // localStorage key
  ),
);
```
