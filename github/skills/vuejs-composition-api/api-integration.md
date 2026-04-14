---
name: vuejs-api-integration
description: "Vue 3 API integration — Axios instance, TanStack Vue Query composables in queries/ and mutations/, loading/error states, and cache invalidation. Use when: fetching data from an API; handling loading and error states; invalidating cache after a mutation."
---

# Vue 3 API Integration Skill

## Overview

This skill covers integrating with REST APIs using Axios and TanStack Vue Query. Query composables live in `src/queries/`, mutation composables live in `src/mutations/`. The Axios instance lives in `src/utils/api.ts`.

Install: `npm install axios @tanstack/vue-query`

---

## 1. Axios Class (src/utils/api.ts)

Use a class-based approach so the base `Api` can be extended to create specialized clients (e.g., `AuthApi` with token injection).

```typescript
// src/utils/api.ts
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

export class Api {
  protected instance: AxiosInstance;

  public constructor() {
    this.instance = axios.create();
    this.instance.defaults.baseURL = import.meta.env.VITE_PUBLIC_API_BASE_URL;
    this.instance.defaults.timeout = 30000;
  }

  public get<T>(
    url: string,
    params: Record<string, unknown> = {},
    config: AxiosRequestConfig = {},
  ) {
    return this.instance.get<T>(url, { params, ...config });
  }

  public post<T>(
    url: string,
    data: unknown = {},
    config: AxiosRequestConfig = {},
  ) {
    return this.instance.post<T>(url, data, config);
  }

  public put<T>(
    url: string,
    data: unknown = {},
    config: AxiosRequestConfig = {},
  ) {
    return this.instance.put<T>(url, data, config);
  }

  public patch<T>(
    url: string,
    data: unknown = {},
    config: AxiosRequestConfig = {},
  ) {
    return this.instance.patch<T>(url, data, config);
  }

  public delete<T>(
    url: string,
    params: Record<string, unknown> = {},
    config: AxiosRequestConfig = {},
  ) {
    return this.instance.delete<T>(url, { params, ...config });
  }
}

export const api = new Api();
```

---

## 2. Extending Api — AuthApi with Token Injection

Create a subclass that adds auth interceptors. Use it for all endpoints that require authentication.

```typescript
// src/utils/authApi.ts
import { Api } from "./api";
import { useAuthStore } from "@/stores/auth.store";

export class AuthApi extends Api {
  public constructor() {
    super();

    // Attach token from Pinia store to every request
    this.instance.interceptors.request.use((config) => {
      const authStore = useAuthStore();
      if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`;
      }
      return config;
    });

    // Handle 401 globally
    this.instance.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401) {
          const authStore = useAuthStore();
          authStore.logout();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );
  }
}

export const authApi = new AuthApi();
```

Usage guide:

| Client    | Use for                                         |
| --------- | ----------------------------------------------- |
| `api`     | Public endpoints (login, register, public data) |
| `authApi` | Protected endpoints (requires auth token)       |

---

## 3. TanStack Vue Query Setup

```typescript
// src/main.ts
import { createApp } from "vue";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import App from "./App.vue";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const app = createApp(App);
app.use(VueQueryPlugin, { queryClient });
app.mount("#app");
```

---

## 4. Query Composables (src/queries/)

Each file exports one `useQuery` composable. Name the file after what it fetches.

```typescript
// src/queries/useUsers.ts
import { useQuery } from "@tanstack/vue-query";
import { authApi } from "@/utils/authApi";
import type { User, ApiResponse } from "@/types/user";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () =>
      authApi.get<ApiResponse<User[]>>("/users").then((r) => r.data.data),
  });
}
```

```typescript
// src/queries/useUser.ts
import { useQuery } from "@tanstack/vue-query";
import { authApi } from "@/utils/authApi";
import type { User, ApiResponse } from "@/types/user";
import type { MaybeRef } from "vue";
import { toValue } from "vue";

export function useUser(id: MaybeRef<string>) {
  return useQuery({
    queryKey: computed(() => ["users", toValue(id)]),
    queryFn: () =>
      authApi
        .get<ApiResponse<User>>(`/users/${toValue(id)}`)
        .then((r) => r.data.data),
    enabled: computed(() => Boolean(toValue(id))), // ✅ skip if no id
  });
}
```

```vue
<!-- Usage in a component -->
<script setup lang="ts">
import { useUsers } from "@/queries/useUsers";

const { data: users, isLoading, isError } = useUsers();
</script>

<template>
  <Spinner v-if="isLoading" />
  <ErrorMessage v-else-if="isError" />
  <ul v-else>
    <li v-for="user in users" :key="user.id">{{ user.name }}</li>
  </ul>
</template>
```

---

## 5. Mutation Composables (src/mutations/)

Each file exports one `useMutation` composable. Invalidate related queries on success.

```typescript
// src/mutations/useCreateUser.ts
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { authApi } from "@/utils/authApi";
import type { User, ApiResponse } from "@/types/user";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<User, "id">) =>
      authApi
        .post<ApiResponse<User>>("/users", payload)
        .then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

```typescript
// src/mutations/useDeleteUser.ts
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { authApi } from "@/utils/authApi";

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => authApi.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

```vue
<!-- Usage in a component -->
<script setup lang="ts">
import { useCreateUser } from "@/mutations/useCreateUser";

const { mutate: createUser, isPending } = useCreateUser();
</script>

<template>
  <button
    :disabled="isPending"
    @click="
      createUser({ name: 'Alice', email: 'alice@example.com', role: 'user' })
    "
  >
    {{ isPending ? "Saving..." : "Create" }}
  </button>
</template>
```

---

## 6. Query Key Conventions

```typescript
queryKey: ["users"]; // all users
queryKey: ["users", userId]; // single user
queryKey: ["users", { page, q }]; // filtered list
```

Always wrap dynamic query keys with `computed()` in Vue composables so they react to changes:

```typescript
const userId = ref("1");

useQuery({
  queryKey: computed(() => ["users", userId.value]),
  queryFn: () => authApi.get(`/users/${userId.value}`).then((r) => r.data),
});
```

---

## 7. Reactive Query Params with computed

```typescript
// src/queries/useUsers.ts
import { useQuery } from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { computed, toValue } from "vue";
import { authApi } from "@/utils/authApi";

export function useUsers(page: MaybeRef<number>, q: MaybeRef<string>) {
  return useQuery({
    queryKey: computed(() => ["users", { page: toValue(page), q: toValue(q) }]),
    queryFn: () =>
      authApi
        .get("/users", { page: toValue(page), q: toValue(q) })
        .then((r) => r.data.data),
  });
}

// Usage — pass reactive refs directly
const page = ref(1);
const search = ref("");
const { data: users } = useUsers(page, search);

// When page.value or search.value changes, query automatically re-fetches
```
