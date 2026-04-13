---
name: vuejs-state-management
description: "Vue 3 state management — local state, provide/inject (plugins/), and Pinia stores (stores/). Use when: deciding where to put state; sharing state across components; setting up global stores with Pinia."
---

# Vue 3 State Management Skill

## Overview

This skill covers when to use local state, provide/inject, and Pinia — and practical patterns for each.

Install Pinia: `npm install pinia`

---

## 1. When to Use What

```
Is the state only used by one component or its direct children?
│
├── YES → ref / reactive (local state)
│
└── NO — Is it shared across many parts of the app?
    │
    ├── Shared non-reactive values (app-wide services)?
    │   └── provide/inject → register in src/plugins/ or App.vue
    │
    └── Reactive global state (cart, UI flags, user session)?
        └── Pinia store → put stores in src/stores/
```

---

## 2. Local State — ref & reactive

```typescript
// ✅ Simple: ref
const isOpen = ref(false);
```

```typescript
// ✅ Complex shape: reactive
const form = reactive({
  name: "",
  email: "",
  isLoading: false,
});

// Mutate directly — no spread needed
form.name = "Alice";
form.isLoading = true;

// ✅ Reset by reassigning all properties (reactive object must be mutated, not replaced)
Object.assign(form, { name: "", email: "", isLoading: false });
```

---

## 3. provide / inject — App-wide Services (src/plugins/)

Best for injecting services or values that don't change frequently: router, i18n, API clients.

```typescript
// src/plugins/apiPlugin.ts
import type { App } from "vue";
import { Api } from "@/utils/api";

const API_KEY = Symbol("api") as InjectionKey<Api>;

export function installApiPlugin(app: App) {
  const api = new Api();
  app.provide(API_KEY, api);
}

export { API_KEY };
```

```typescript
// src/main.ts
import { createApp } from "vue";
import { installApiPlugin } from "@/plugins/apiPlugin";
import App from "./App.vue";

const app = createApp(App);
installApiPlugin(app);
app.mount("#app");
```

```typescript
// Usage in a component — inject the provided value
import { inject } from "vue";
import { API_KEY } from "@/plugins/apiPlugin";

const api = inject(API_KEY);
// api is typed as Api | undefined — provide a fallback or assert
```

> **Rule:** Use typed `InjectionKey<T>` symbols so TypeScript knows the injected type.

---

## 4. Pinia — Global Stores (src/stores/)

Pinia uses modular stores — each piece of global state is an independent store. Components subscribe only to the stores they use.

```typescript
// src/stores/auth.store.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "@/types/user";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("auth-token"));

  // Getters (computed)
  const isLoggedIn = computed(() => user.value !== null);
  const userRole = computed(() => user.value?.role ?? null);

  // Actions
  function login(userData: User, authToken: string) {
    user.value = userData;
    token.value = authToken;
    localStorage.setItem("auth-token", authToken);
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem("auth-token");
  }

  return { user, token, isLoggedIn, userRole, login, logout };
});
```

```typescript
// src/stores/cart.store.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);

  // Derived state
  const total = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0));

  function addItem(item: CartItem) {
    const existing = items.value.find((i) => i.id === item.id);
    if (existing) {
      existing.quantity++;
    } else {
      items.value.push(item);
    }
  }

  function clear() {
    items.value = [];
  }

  return { items, total, addItem, clear };
});
```

```vue
<!-- Usage in a component -->
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores";

const authStore = useAuthStore();

// ✅ Use storeToRefs to destructure reactive state (preserves reactivity)
const { user, isLoggedIn } = storeToRefs(authStore);

// ✅ Actions are plain functions — destructure directly (no storeToRefs needed)
const { logout } = authStore;
</script>

<template>
  <header>
    <button v-if="isLoggedIn" @click="logout">Logout</button>
    <RouterLink v-else to="/login">Login</RouterLink>
  </header>
</template>
```

> **Rule:** Always use `storeToRefs()` to destructure reactive state. Destructuring actions directly is fine since they are plain functions.

---

## 5. Pinia Store Registration

```typescript
// src/main.ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

const app = createApp(App);
app.use(createPinia()); // ✅ Register Pinia before mounting
app.mount("#app");
```

```typescript
// src/stores/index.ts — re-export all stores
export { useAuthStore } from "./auth.store";
export { useCartStore } from "./cart.store";
```

---

## 6. Persist Store to localStorage

Use `pinia-plugin-persistedstate` for automatic persistence.

Install: `npm install pinia-plugin-persistedstate`

```typescript
// src/main.ts
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
```

```typescript
// src/stores/auth.store.ts
export const useAuthStore = defineStore(
  "auth",
  () => {
    const token = ref<string | null>(null);
    const user = ref<User | null>(null);
    // ... actions
    return { token, user };
  },
  {
    persist: {
      key: "auth-store",
      paths: ["token"], // ✅ Only persist the token, not the full user object
    },
  },
);
```
