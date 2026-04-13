---
name: vuejs-routing-navigation
description: "Vue 3 routing — Vue Router 4: route configuration in src/router/, dynamic segments, navigation guards, nested layouts, protected routes, URL params and query params. Use when: setting up routing; building nested layouts; protecting routes by auth."
---

# Vue 3 Routing & Navigation Skill

## Overview

This project uses **Vue Router 4** with a centralized route configuration in `src/router/`. The router is typed and supports named routes, dynamic segments, nested layouts, and navigation guards.

Install: `npm install vue-router`

---

## 1. Router Setup (src/router/index.ts)

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import("@/layouts/MainLayout.vue"),
      children: [
        {
          path: "",
          name: "home",
          component: () => import("@/pages/HomePage/HomePage.vue"),
        },
        {
          path: "about",
          name: "about",
          component: () => import("@/pages/AboutPage/AboutPage.vue"),
        },
      ],
    },
    {
      path: "/auth",
      component: () => import("@/layouts/AuthLayout.vue"), // auth guard layout
      meta: { requiresAuth: true },
      children: [
        {
          path: "dashboard",
          name: "dashboard",
          component: () => import("@/pages/DashboardPage/DashboardPage.vue"),
        },
      ],
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/pages/LoginPage/LoginPage.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/pages/NotFoundPage/NotFoundPage.vue"),
    },
  ],
});
```

---

## 2. Register Router (src/main.ts)

```typescript
// src/main.ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import { router } from "@/router";
import App from "./App.vue";

const app = createApp(App);
app.use(createPinia()); // ✅ Pinia must be registered before router guards use stores
app.use(router);
app.mount("#app");
```

---

## 3. Route Naming Conventions

| Route name    | Path              | Purpose          |
| ------------- | ----------------- | ---------------- |
| `home`        | `/`               | Home page        |
| `about`       | `/about`          | About page       |
| `users`       | `/users`          | Users list page  |
| `user-detail` | `/users/:userId`  | User detail page |
| `dashboard`   | `/auth/dashboard` | Protected page   |
| `login`       | `/login`          | Login page       |
| `not-found`   | `/:pathMatch(.*)` | 404 catch-all    |

Use **named routes** for all navigation — avoids breaking changes when paths change.

---

## 4. Layouts (Nested Route Wrappers)

Layouts wrap child routes without adding a URL segment.

```vue
<!-- src/layouts/MainLayout.vue -->
<script setup lang="ts">
import AppBar from "@/components/AppBar/AppBar.vue";
</script>

<template>
  <AppBar />
  <main>
    <RouterView />
    <!-- child routes render here -->
  </main>
</template>
```

```vue
<!-- src/App.vue — root RouterView -->
<template>
  <RouterView />
</template>
```

---

## 5. Dynamic Route Params

```typescript
// src/router/index.ts
{
  path: "users/:userId",
  name: "user-detail",
  component: () => import("@/pages/UserDetailPage/UserDetailPage.vue"),
}
```

```vue
<!-- src/pages/UserDetailPage/UserDetailPage.vue -->
<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed } from "vue";
import { useUser } from "@/queries";

const route = useRoute();
// ✅ Typed as string | string[] — cast to string for single param
const userId = computed(() => route.params.userId as string);

const { data: user, isLoading } = useUser(userId);
</script>

<template>
  <p v-if="isLoading">Loading...</p>
  <h1 v-else>{{ user?.name }}</h1>
</template>
```

---

## 6. Query Params (Search Params)

```vue
<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const router = useRouter();

// ✅ Read query params — always strings or string[]
const page = computed(() => Number(route.query.page ?? 1));
const q = computed(() => (route.query.q as string) ?? "");

// ✅ Update query params without full navigation
const updateSearch = (newQ: string) => {
  router.push({ query: { ...route.query, page: 1, q: newQ } });
};
</script>
```

---

## 7. Navigation Guards (Protected Routes)

Use a global `beforeEach` guard in `src/router/guards.ts`.

```typescript
// src/router/guards.ts
import type { Router } from "vue-router";
import { useAuthStore } from "@/stores";

export function setupRouterGuards(router: Router) {
  router.beforeEach((to) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      // Redirect to login, preserve intended destination
      return { name: "login", query: { redirect: to.fullPath } };
    }

    if (to.name === "login" && authStore.isLoggedIn) {
      // Already logged in — redirect away from login
      return { name: "dashboard" };
    }
  });
}
```

```typescript
// src/router/index.ts — register guards
import { setupRouterGuards } from "./guards";

// ... createRouter(...)
setupRouterGuards(router);

export { router };
```

```typescript
// Route meta typing (src/router/index.ts or src/types/router.d.ts)
declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    title?: string;
  }
}
```

---

## 8. Programmatic Navigation

```typescript
import { useRouter } from "vue-router";

const router = useRouter();

// ✅ Navigate by name (preferred — type-safe)
router.push({ name: "user-detail", params: { userId: "123" } });

// ✅ Navigate with query params
router.push({ name: "users", query: { page: 2, q: "alice" } });

// ✅ Replace current history entry
router.replace({ name: "login" });

// ✅ Go back
router.back();
```

---

## 9. RouterLink — Declarative Navigation

```vue
<template>
  <!-- ✅ Named route (preferred) -->
  <RouterLink :to="{ name: 'user-detail', params: { userId: user.id } }">
    {{ user.name }}
  </RouterLink>

  <!-- ✅ Active class — automatically applied when route matches -->
  <RouterLink :to="{ name: 'dashboard' }" active-class="nav--active"> Dashboard </RouterLink>
</template>
```

---

## 10. Route Meta for Page Title

```typescript
// src/router/guards.ts
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | MyApp` : "MyApp";
});
```

```typescript
// Route definition with title
{
  path: "dashboard",
  name: "dashboard",
  component: DashboardPage,
  meta: { requiresAuth: true, title: "Dashboard" },
}
```
