---
name: reactjs-api-integration
description: "React.js API integration — Axios instance, TanStack Query hooks in queries/ and mutations/ folders, loading/error states, and cache invalidation. Use when: fetching data from an API; handling loading and error states; invalidating cache after a mutation."
---

# React.js API Integration Skill

## Overview

This skill covers integrating with REST APIs using Axios and TanStack Query. Query hooks live in `src/queries/`, mutation hooks live in `src/mutations/`. The Axios instance lives in `src/utils/api.ts`.

Install: `npm install axios @tanstack/react-query`

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

  public get(url: string, params: Record<string, unknown> = {}, config: AxiosRequestConfig = {}) {
    return this.instance.get(url, { params, ...config });
  }

  public post(url: string, data: unknown = {}, config: AxiosRequestConfig = {}) {
    return this.instance.post(url, data, config);
  }

  public put(url: string, data: unknown = {}, config: AxiosRequestConfig = {}) {
    return this.instance.put(url, data, config);
  }

  public patch(url: string, data: unknown = {}, config: AxiosRequestConfig = {}) {
    return this.instance.patch(url, data, config);
  }

  public delete(url: string, params: Record<string, unknown> = {}, config: AxiosRequestConfig = {}) {
    return this.instance.delete(url, { params, ...config });
  }
}

export const api = new Api();
```

---

## 2. Extending Api \u2014 AuthApi with Token Injection

Create a subclass that adds auth interceptors. Use it for all endpoints that require authentication.

```typescript
// src/utils/authApi.ts
import { Api } from "./api";
import { tokenAtom } from "@/stores/authAtom";
import { getDefaultStore } from "jotai";

export class AuthApi extends Api {
  public constructor() {
    super();

    // Attach token from Jotai store to every request
    this.instance.interceptors.request.use((config) => {
      const token = getDefaultStore().get(tokenAtom);
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    // Handle 401 globally
    this.instance.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401) {
          getDefaultStore().set(tokenAtom, null);
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );
  }
}

export const authApi = new AuthApi();
```

```typescript
// src/stores/authAtom.ts
import { atomWithStorage } from "jotai/utils";

// Token persisted to localStorage automatically
export const tokenAtom = atomWithStorage<string | null>("auth-token", null);
```

Usage guide:

| Client    | Use for                                         |
| --------- | ----------------------------------------------- |
| `api`     | Public endpoints (login, register, public data) |
| `authApi` | Protected endpoints (requires auth token)       |

---

## 3. TanStack Query Setup

```typescript
// src/main.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

---

## 4. Query Hooks (src/queries/)

Each file exports one `useQuery` hook. Name the file after what it fetches.

```typescript
// src/queries/useUsers.ts
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/utils/authApi";
import type { User, ApiResponse } from "@/types/user";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => authApi.get<ApiResponse<User[]>>("/users").then((r) => r.data.data),
  });
}
```

```typescript
// src/queries/useUser.ts
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/utils/authApi";
import type { User, ApiResponse } from "@/types/user";

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => authApi.get<ApiResponse<User>>(`/users/${id}`).then((r) => r.data.data),
    enabled: Boolean(id), // ✅ skip if no id
  });
}
```

```typescript
// Usage in a component
import { useUsers } from "@/queries/useUsers";

export function UserList() {
  const { data: users, isLoading, isError } = useUsers();

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage />;

  return <ul>{users?.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

---

## 5. Mutation Hooks (src/mutations/)

Each file exports one `useMutation` hook. Invalidate related queries on success.

```typescript
// src/mutations/useCreateUser.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/utils/authApi";
import type { User, ApiResponse } from "@/types/user";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<User, "id">) =>
      authApi.post<ApiResponse<User>>("/users", payload).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

```typescript
// src/mutations/useDeleteUser.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

```typescript
// Usage in component
import { useCreateUser } from "@/mutations/useCreateUser";

export function CreateUserForm() {
  const { mutate: createUser, isPending } = useCreateUser();

  return (
    <button disabled={isPending} onClick={() => createUser({ name: "Alice", email: "alice@example.com", role: "user" })}>
      {isPending ? "Saving..." : "Create"}
    </button>
  );
}
```

---

## 6. Query Key Conventions

```typescript
queryKey: ["users"]; // all users
queryKey: ["users", userId]; // single user
queryKey: ["users", { page, q }]; // filtered list

// Invalidate all user queries at once
queryClient.invalidateQueries({ queryKey: ["users"] });
```
