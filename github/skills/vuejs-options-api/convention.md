---
name: vuejs-options-api-convention
description: "Vue 3 Options API conventions — project structure, naming rules, file organization, TypeScript usage, and import order. Use when: setting up a new project; deciding where to put files; naming components, mixins, or utilities."
---

# Vue 3 Options API Conventions Skill

> **Prerequisite:** Also load [javascript/convention.md](../javascript/convention.md) for base formatting, Prettier, naming, import organization, EditorConfig, and ESLint rules, and [typescript/convention.md](../typescript/convention.md) for TypeScript-specific rules. This file covers Vue-specific conventions only.

## Overview

This skill covers the naming rules, file layout, and TypeScript conventions used across Vue 3 Options API projects. Follow these to keep the codebase consistent and easy to navigate.

---

## 1. Project Structure

```
src/
├── assets/          # Static assets (CSS, images)
├── components/      # Reusable UI components
│   ├── AppButton/
│   │   ├── AppButton.vue
│   │   ├── AppButton.test.ts
│   │   ├── AppButton.stories.ts
│   │   └── index.ts # Re-export
│   └── index.ts     # Re-export all components
├── constants/       # Application constants
│   ├── apiConstants.ts
│   └── index.ts     # Re-export all constants
├── forms/           # Zod validation schemas
│   ├── loginSchema.ts
│   └── index.ts     # Re-export all schemas
├── mixins/          # Shared Options API logic (reusable across components)
│   ├── paginationMixin.ts
│   └── index.ts     # Re-export all mixins
├── layouts/         # Layout components
│   ├── MainLayout.vue
│   └── index.ts     # Re-export all layouts
├── pages/           # Page-level components (imported by route files)
│   ├── HomePage/
│   │   ├── HomePage.vue
│   │   ├── HomePage.test.ts
│   │   └── index.ts # Re-export
│   ├── DashboardPage/
│   │   ├── DashboardPage.vue
│   │   ├── DashboardPage.test.ts
│   │   └── index.ts # Re-export
│   └── index.ts     # Re-export all pages
├── plugins/         # Vue plugins (provide/inject globals, Vuetify setup, etc.)
│   ├── vuetify.ts
│   └── index.ts     # Re-export all plugins
├── router/          # Vue Router configuration
│   ├── index.ts     # Router instance + createRouter
│   └── guards.ts    # Navigation guards
├── services/        # API service classes (encapsulate Axios calls)
│   ├── userService.ts
│   └── index.ts     # Re-export all services
├── stores/          # Pinia stores
│   ├── auth.store.ts
│   └── index.ts     # Re-export all stores
├── types/           # TypeScript type definitions
│   ├── user.ts
│   └── index.ts     # Re-export all types
├── utils/           # Utility functions
│   ├── api.ts       # Axios base class
│   ├── authApi.ts   # Axios authenticated class
│   └── index.ts     # Re-export all utilities
├── i18n/            # vue-i18n config and translation namespaces
│   ├── index.ts     # i18n initialization
│   └── locales/
│       ├── en/
│       │   └── common.json
│       └── vi/
│           └── common.json
├── App.vue
└── main.ts
```

---

## 2. Naming Rules

| Item              | Convention              | Example                      |
| ----------------- | ----------------------- | ---------------------------- |
| Component file    | PascalCase              | `UserCard.vue`               |
| Component name    | PascalCase              | `name: "UserCard"`           |
| Mixin file        | camelCase + Mixin       | `paginationMixin.ts`         |
| Mixin export      | camelCase               | `paginationMixin`            |
| Service file      | camelCase + Service     | `userService.ts`             |
| Utility file      | camelCase               | `formatDate.ts`              |
| Store file        | camelCase + `.store.ts` | `auth.store.ts`              |
| Store id          | kebab-case              | `"auth"`, `"shopping-cart"`  |
| Form schema file  | camelCase + Schema      | `loginSchema.ts`             |
| Plugin file       | camelCase               | `vuetify.ts`                 |
| Page file         | PascalCase + Page       | `DashboardPage.vue`          |
| Constant file     | camelCase               | `apiConstants.ts`            |
| Constant variable | UPPER_SNAKE_CASE        | `MAX_RETRY_COUNT`            |
| Type / Interface  | PascalCase              | `UserProfile`, `ApiResponse` |

---

## 3. File Rules

- **One component per file.** Do not put multiple exported components in one `.vue` file.
- **Co-locate tests.** Keep `AppButton.test.ts` next to `AppButton.vue`.
- **Always create `index.ts`** in every folder to re-export its contents.
- **Use `<script lang="ts">`** with `export default defineComponent({})` in all SFCs.

### Components — subfolder index + top-level index

```vue
<!-- components/AppButton/AppButton.vue -->
<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "AppButton",
  props: {
    variant: {
      type: String as PropType<"primary" | "secondary" | "danger">,
      default: "primary",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["click"],
});
</script>

<template>
  <button :class="`btn btn--${variant}`" :disabled="disabled || loading">
    <span v-if="loading" class="spinner" />
    <slot v-else />
  </button>
</template>
```

```typescript
// components/AppButton/index.ts — re-export from the subfolder
export { default as AppButton } from "./AppButton.vue";

// components/index.ts — re-export every component
export { AppButton } from "./AppButton";
export { UserCard } from "./UserCard";
```

```typescript
// Usage — single clean import path
import { AppButton, UserCard } from "@/components";
```

### Pages — same subfolder structure as components

```typescript
// pages/HomePage/index.ts
export { default as HomePage } from "./HomePage.vue";

// pages/index.ts — re-export every page
export { HomePage } from "./HomePage";
export { DashboardPage } from "./DashboardPage";
```

### Services, mixins, stores, types, utils, constants, forms

Each of these folders must also have an `index.ts` that re-exports everything inside.

```typescript
// services/index.ts
export { userService } from "./userService";
export { authService } from "./authService";

// mixins/index.ts
export { paginationMixin } from "./paginationMixin";

// stores/index.ts
export { useAuthStore } from "./auth.store";
export { useCartStore } from "./cart.store";

// types/index.ts
export type { User, ApiResponse } from "./user";

// constants/index.ts
export { API_BASE_URL, MAX_RETRY_COUNT } from "./apiConstants";

// utils/index.ts
export { api } from "./api";
export { authApi } from "./authApi";

// forms/index.ts
export { loginInitialValues, loginValidationSchema } from "./loginSchema";
```

```typescript
// Usage — short, consistent imports everywhere
import { userService } from "@/services";
import { useAuthStore } from "@/stores";
```

---

## 4. TypeScript Conventions

```typescript
// ✅ Use PropType for typed props in Options API
import { defineComponent, type PropType } from "vue";

interface UserCardProps {
  userId: string;
  name: string;
  avatarUrl?: string;
}

export default defineComponent({
  name: "UserCard",
  props: {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      default: "/default-avatar.png",
    },
  },
  emits: {
    click: (id: string) => typeof id === "string",
    update: (value: string) => typeof value === "string",
  },
});
```

```typescript
// ✅ Type API responses in types/
// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
```

```typescript
// ✅ Type data() return value with an interface
interface UserPageData {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

export default defineComponent({
  data(): UserPageData {
    return {
      users: [],
      isLoading: false,
      error: null,
    };
  },
});
```

---

## 5. Import Order

Group imports in this order, separated by blank lines:

```typescript
// 1. Vue and framework
import { defineComponent, type PropType } from "vue";

// 2. Third-party libraries
import { mapState, mapActions } from "pinia";
import dayjs from "dayjs";

// 3. Internal absolute imports (@/) — always import from the folder index
import { userService } from "@/services";
import { useAuthStore } from "@/stores";
import { API_BASE_URL } from "@/constants";
import type { User } from "@/types";

// 4. Relative imports
import UserAvatar from "./UserAvatar.vue";
```

---

## 6. Path Aliases

Configure `@` to resolve to `src/` in `vite.config.ts`:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```
