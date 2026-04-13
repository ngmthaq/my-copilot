---
name: vuejs-mock-api
description: "Vue 3 API mocking — static JSON files in src/mocks/: folder structure, naming conventions, and switching between mock and real API via environment variable. Use when: building UI before the real API is ready; testing components without a live backend."
---

# Vue 3 Mock API Skill

## Overview

This skill covers mocking API responses with **static JSON files** in `src/mocks/`. In development, the `Api` class reads an env flag and loads the matching JSON file instead of hitting the real server. No extra libraries needed.

---

## 1. Folder Structure

```
src/
└── mocks/
    ├── users.json          # GET /api/users
    ├── user.json           # GET /api/users/:id
    ├── auth.login.json     # POST /api/auth/login
    └── index.ts            # Re-export all mock data
```

Name files after the resource and HTTP method when there are multiple operations on the same resource: `resource.action.json`.

---

## 2. JSON Files

```json
// src/mocks/users.json
{
  "data": [
    { "id": "1", "name": "Alice", "email": "alice@example.com", "role": "admin" },
    { "id": "2", "name": "Bob", "email": "bob@example.com", "role": "user" }
  ],
  "message": "OK",
  "success": true
}
```

```json
// src/mocks/user.json
{
  "data": { "id": "1", "name": "Alice", "email": "alice@example.com", "role": "admin" },
  "message": "OK",
  "success": true
}
```

```json
// src/mocks/auth.login.json
{
  "data": { "token": "mock-jwt-token", "userId": "1" },
  "message": "Login successful",
  "success": true
}
```

```typescript
// src/mocks/index.ts
export { default as usersMock } from "./users.json";
export { default as userMock } from "./user.json";
export { default as authLoginMock } from "./auth.login.json";
```

---

## 3. Environment Variable

```bash
# .env.development
VITE_USE_MOCK=true

# .env.production
VITE_USE_MOCK=false
```

---

## 4. Use Mock Data in Query Composables

Check the env flag inside `queryFn`. If mocking is enabled, return the JSON directly instead of calling the API.

```typescript
// src/queries/useUsers.ts
import { useQuery } from "@tanstack/vue-query";
import { authApi } from "@/utils/authApi";
import type { User, ApiResponse } from "@/types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<User[]> => {
      if (USE_MOCK) {
        const { usersMock } = await import("@/mocks");
        return usersMock.data;
      }
      return authApi.get<ApiResponse<User[]>>("/users").then((r) => r.data.data);
    },
  });
}
```

```typescript
// src/queries/useUser.ts
import { useQuery } from "@tanstack/vue-query";
import { authApi } from "@/utils/authApi";
import type { User, ApiResponse } from "@/types";
import type { MaybeRef } from "vue";
import { toValue, computed } from "vue";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export function useUser(id: MaybeRef<string>) {
  return useQuery({
    queryKey: computed(() => ["users", toValue(id)]),
    queryFn: async (): Promise<User> => {
      if (USE_MOCK) {
        const { userMock } = await import("@/mocks");
        return userMock.data;
      }
      return authApi.get<ApiResponse<User>>(`/users/${toValue(id)}`).then((r) => r.data.data);
    },
    enabled: computed(() => Boolean(toValue(id))),
  });
}
```

---

## 5. Use Mock Data in Mutation Composables

For mutations, return the mock response and still call `invalidateQueries` so the UI behaves realistically.

```typescript
// src/mutations/useCreateUser.ts
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { authApi } from "@/utils/authApi";
import type { User, ApiResponse } from "@/types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<User, "id">): Promise<User> => {
      if (USE_MOCK) {
        // Simulate a created user with a fake id
        return { id: crypto.randomUUID(), ...payload };
      }
      return authApi.post<ApiResponse<User>>("/users", payload).then((r) => r.data.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```
