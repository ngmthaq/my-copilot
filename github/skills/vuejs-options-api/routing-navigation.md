---
name: vuejs-options-api-routing-navigation
description: "Vue 3 Options API routing — Vue Router 4: route configuration in src/router/, dynamic segments, navigation guards, nested layouts, protected routes, URL params and query params. Use when: setting up routing; building nested layouts; protecting routes by auth."
---

# Vue 3 Options API Routing & Navigation Skill

## Overview

This project uses **Vue Router 4** with a centralized route configuration in `src/router/`. The router is typed and supports named routes, dynamic segments, nested layouts, and navigation guards.

Install: `npm install vue-router`

---

## 1. Router Setup (src/router/index.ts)

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";

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
      component: () => import("@/layouts/AuthLayout.vue"),
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
<script lang="ts">
import { defineComponent } from "vue";
import AppBar from "@/components/AppBar/AppBar.vue";

export default defineComponent({
  name: "MainLayout",
  components: { AppBar },
});
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
<script lang="ts">
import { defineComponent } from "vue";
import { userService } from "@/services";
import type { User } from "@/types";

export default defineComponent({
  name: "UserDetailPage",
  data() {
    return {
      user: null as User | null,
      isLoading: true,
    };
  },
  computed: {
    userId(): string {
      return this.$route.params.userId as string;
    },
  },
  watch: {
    // ✅ Re-fetch when the route param changes (e.g., navigating between users)
    userId: {
      handler() {
        this.fetchUser();
      },
      immediate: true,
    },
  },
  methods: {
    async fetchUser() {
      this.isLoading = true;
      this.user = await userService.getUser(this.userId);
      this.isLoading = false;
    },
  },
});
</script>

<template>
  <p v-if="isLoading">Loading...</p>
  <h1 v-else-if="user">{{ user.name }}</h1>
</template>
```

---

## 6. Query Params (Search Params)

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SearchPage",
  computed: {
    // ✅ Read query params — always strings or string[]
    page(): number {
      return Number(this.$route.query.page ?? 1);
    },
    q(): string {
      return (this.$route.query.q as string) ?? "";
    },
  },
  methods: {
    // ✅ Update query params without full navigation
    updateSearch(newQ: string) {
      this.$router.push({
        query: { ...this.$route.query, page: 1, q: newQ },
      });
    },
  },
});
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

## 8. In-Component Navigation Guards

Options API components can define per-route guards directly.

```vue
<script lang="ts">
import { defineComponent } from "vue";
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

export default defineComponent({
  name: "EditPage",
  data() {
    return {
      hasUnsavedChanges: false,
    };
  },
  // ✅ Runs before navigating away from this component's route
  beforeRouteLeave(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
    if (this.hasUnsavedChanges) {
      const confirmed = window.confirm("You have unsaved changes. Leave anyway?");
      if (!confirmed) return next(false);
    }
    next();
  },
  // ✅ Runs when the route changes but the same component is reused
  beforeRouteUpdate(to: RouteLocationNormalized) {
    const newId = to.params.userId as string;
    this.fetchUser(newId);
  },
});
</script>
```

---

## 9. Programmatic Navigation

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "NavigationExample",
  methods: {
    goToUser(userId: string) {
      // ✅ Navigate by name (preferred — type-safe)
      this.$router.push({ name: "user-detail", params: { userId } });
    },
    searchUsers(query: string) {
      // ✅ Navigate with query params
      this.$router.push({ name: "users", query: { page: 1, q: query } });
    },
    replaceLogin() {
      // ✅ Replace current history entry
      this.$router.replace({ name: "login" });
    },
    goBack() {
      // ✅ Go back
      this.$router.back();
    },
  },
});
</script>
```

---

## 10. RouterLink — Declarative Navigation

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

## 11. Route Meta for Page Title

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
