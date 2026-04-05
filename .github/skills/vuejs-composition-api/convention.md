---
name: vuejs-convention
description: "Vue 3 Composition API conventions — project structure, naming rules, file organization, TypeScript usage, and import order. Use when: setting up a new project; deciding where to put files; naming components, composables, or utilities."
---

# Vue 3 Composition API Conventions Skill

## Overview

This skill covers the naming rules, file layout, and TypeScript conventions used across Vue 3 projects. Follow these to keep the codebase consistent and easy to navigate.

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
├── forms/           # VeeValidate form configs and Zod validation schemas
│   ├── loginSchema.ts
│   └── index.ts     # Re-export all schemas
├── composables/     # Custom Vue composables (equivalent of React hooks)
│   ├── useDebounce.ts
│   └── index.ts     # Re-export all composables
├── layouts/         # Layout components
│   ├── MainLayout.vue
│   └── index.ts     # Re-export all layouts
├── mutations/       # TanStack Vue Query mutation composables
│   ├── useCreateUser.ts
│   └── index.ts     # Re-export all mutation composables
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
├── queries/         # TanStack Vue Query query composables
│   ├── useUsers.ts
│   └── index.ts     # Re-export all query composables
├── router/          # Vue Router configuration
│   ├── index.ts     # Router instance + createRouter
│   └── guards.ts    # Navigation guards
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

| Item                | Convention              | Example                        |
| ------------------- | ----------------------- | ------------------------------ |
| Component file      | PascalCase              | `UserCard.vue`                 |
| Component name      | PascalCase              | `defineComponent` name         |
| Composable file     | camelCase               | `useAuth.ts`                   |
| Composable name     | `use` prefix            | `useAuth`, `useUserData`       |
| Utility file        | camelCase               | `formatDate.ts`                |
| Store file          | camelCase + `.store.ts` | `auth.store.ts`                |
| Store function      | `use` prefix + `Store`  | `useAuthStore`, `useCartStore` |
| Query composable    | camelCase               | `useUsers.ts`                  |
| Mutation composable | camelCase               | `useCreateUser.ts`             |
| Form schema file    | camelCase + Schema      | `loginSchema.ts`               |
| Plugin file         | camelCase               | `vuetify.ts`                   |
| Page file           | PascalCase + Page       | `DashboardPage.vue`            |
| Constant file       | camelCase               | `apiConstants.ts`              |
| Constant variable   | UPPER_SNAKE_CASE        | `MAX_RETRY_COUNT`              |
| Type / Interface    | PascalCase              | `UserProfile`, `ApiResponse`   |

---

## 3. File Rules

- **One component per file.** Do not put multiple exported components in one `.vue` file.
- **Co-locate tests.** Keep `AppButton.test.ts` next to `AppButton.vue`.
- **Always create `index.ts`** in every folder to re-export its contents.
- **Use `<script setup lang="ts">`** in all SFCs — no Options API.

### Components — subfolder index + top-level index

```vue
<!-- components/AppButton/AppButton.vue -->
<script setup lang="ts">
interface Props {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
}

defineProps<Props>();
defineEmits<{ click: [] }>();
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

### Queries, mutations, composables, stores, types, utils, constants, forms

Each of these folders must also have an `index.ts` that re-exports everything inside.

```typescript
// queries/index.ts
export { useUsers } from "./useUsers";
export { useUser } from "./useUser";

// mutations/index.ts
export { useCreateUser } from "./useCreateUser";
export { useDeleteUser } from "./useDeleteUser";

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

// composables/index.ts
export { useDebounce } from "./useDebounce";
export { useLocalStorage } from "./useLocalStorage";

// forms/index.ts
export { loginInitialValues, loginValidationSchema } from "./loginSchema";
```

```typescript
// Usage — short, consistent imports everywhere
import { useUsers } from "@/queries";
import { useCreateUser } from "@/mutations";
import { useAuthStore } from "@/stores";
import { authApi } from "@/utils";
import type { User } from "@/types";
```

---

## 4. TypeScript Conventions

```typescript
// ✅ Use interface for component props (in <script setup> use defineProps<Props>())
interface UserCardProps {
  userId: string;
  name: string;
  avatarUrl?: string; // Optional with ?
}

// ✅ Use defineProps with generic syntax — no runtime props declaration needed
const props = defineProps<UserCardProps>();

// ✅ Use defineEmits with generic syntax
const emit = defineEmits<{
  click: [id: string];
  update: [value: string];
}>();
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
// ✅ withDefaults for default prop values
const props = withDefaults(defineProps<UserCardProps>(), {
  avatarUrl: "/default-avatar.png",
});
```

---

## 5. Import Order

Group imports in this order, separated by blank lines:

```typescript
// 1. Vue and framework
import { ref, computed, onMounted } from "vue";
import { defineComponent } from "vue";

// 2. Third-party libraries
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";

// 3. Internal absolute imports (@/) — always import from the folder index
import { useUsers } from "@/queries";
import { useCreateUser } from "@/mutations";
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
