---
name: vuejs-options-api-state-management
description: "Vue 3 Options API state management — local data, provide/inject (plugins/), and Pinia stores (stores/) with mapState/mapActions. Use when: deciding where to put state; sharing state across components; setting up global stores with Pinia in Options API."
---

# Vue 3 Options API State Management Skill

## Overview

This skill covers when to use local data, provide/inject, and Pinia — and practical Options API patterns for each.

Install Pinia: `npm install pinia`

---

## 1. When to Use What

```
Is the state only used by one component or its direct children?
│
├── YES → data() (local state)
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

## 2. Local State — data()

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TogglePanel",
  data() {
    return {
      isOpen: false,
    };
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen;
    },
  },
});
</script>

<template>
  <button @click="toggle">{{ isOpen ? "Close" : "Open" }}</button>
  <div v-if="isOpen"><slot /></div>
</template>
```

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FormExample",
  data() {
    return {
      form: {
        name: "",
        email: "",
        isLoading: false,
      },
    };
  },
  methods: {
    resetForm() {
      // ✅ Reset by reassigning the object
      this.form = { name: "", email: "", isLoading: false };
    },
  },
});
</script>
```

---

## 3. provide / inject — App-wide Services (src/plugins/)

Best for injecting services or values that don't change frequently: API clients, themes.

```typescript
// src/plugins/apiPlugin.ts
import type { App } from "vue";
import { Api } from "@/utils/api";

export function installApiPlugin(app: App) {
  const api = new Api();
  app.provide("api", api);
}
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

```vue
<!-- Usage in a component — inject the provided value -->
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UserFetcher",
  inject: ["api"],
  async created() {
    const response = await (this as any).api.get("/users");
    console.log(response.data);
  },
});
</script>
```

```typescript
// ✅ Typed inject with default
inject: {
  api: {
    from: "api",
    default: () => new Api(),
  },
},
```

> **Rule:** For type safety with inject, consider declaring a type augmentation or using a typed helper.

---

## 4. Pinia — Global Stores (src/stores/)

Pinia supports two store styles. For Options API consumers, the **options store** style feels more natural, but either style works with `mapState`/`mapActions`.

### Options Store Style

```typescript
// src/stores/auth.store.ts
import { defineStore } from "pinia";
import type { User } from "@/types/user";

interface AuthState {
  user: User | null;
  token: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem("auth-token"),
  }),
  getters: {
    isLoggedIn: (state) => state.user !== null,
    userRole: (state) => state.user?.role ?? null,
  },
  actions: {
    login(userData: User, authToken: string) {
      this.user = userData;
      this.token = authToken;
      localStorage.setItem("auth-token", authToken);
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("auth-token");
    },
  },
});
```

```typescript
// src/stores/cart.store.ts
import { defineStore } from "pinia";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

export const useCartStore = defineStore("cart", {
  state: (): CartState => ({
    items: [],
  }),
  getters: {
    total: (state) => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    itemCount: (state) => state.items.length,
  },
  actions: {
    addItem(item: CartItem) {
      const existing = this.items.find((i) => i.id === item.id);
      if (existing) {
        existing.quantity++;
      } else {
        this.items.push(item);
      }
    },
    clear() {
      this.items = [];
    },
  },
});
```

### Using Pinia in Options API — mapState / mapActions

```vue
<script lang="ts">
import { defineComponent } from "vue";
import { mapState, mapActions } from "pinia";
import { useAuthStore } from "@/stores";

export default defineComponent({
  name: "AppHeader",
  computed: {
    // ✅ Map Pinia getters and state to computed properties
    ...mapState(useAuthStore, ["user", "isLoggedIn", "userRole"]),
  },
  methods: {
    // ✅ Map Pinia actions to methods
    ...mapActions(useAuthStore, ["logout"]),
  },
});
</script>

<template>
  <header>
    <span v-if="isLoggedIn">{{ user?.name }} ({{ userRole }})</span>
    <button v-if="isLoggedIn" @click="logout">Logout</button>
    <RouterLink v-else to="/login">Login</RouterLink>
  </header>
</template>
```

```vue
<!-- ✅ Multiple stores in one component -->
<script lang="ts">
import { defineComponent } from "vue";
import { mapState, mapActions } from "pinia";
import { useAuthStore, useCartStore } from "@/stores";

export default defineComponent({
  name: "CheckoutPage",
  computed: {
    ...mapState(useAuthStore, ["user", "isLoggedIn"]),
    ...mapState(useCartStore, ["items", "total", "itemCount"]),
  },
  methods: {
    ...mapActions(useCartStore, ["clear"]),
  },
});
</script>
```

### Direct Store Access (Alternative)

```vue
<script lang="ts">
import { defineComponent } from "vue";
import { useAuthStore } from "@/stores";

export default defineComponent({
  name: "ProfilePage",
  computed: {
    authStore() {
      return useAuthStore();
    },
    user() {
      return this.authStore.user;
    },
    isLoggedIn() {
      return this.authStore.isLoggedIn;
    },
  },
  methods: {
    logout() {
      this.authStore.logout();
    },
  },
});
</script>
```

> **Rule:** Prefer `mapState`/`mapActions` for cleaner code. Use direct store access when you need to call multiple actions in sequence or need the store instance.

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
export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: null,
  }),
  // ... getters, actions
  persist: {
    key: "auth-store",
    paths: ["token"], // ✅ Only persist the token, not the full user object
  },
});
```
