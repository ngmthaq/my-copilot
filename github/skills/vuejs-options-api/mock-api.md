---
name: vuejs-options-api-mock-api
description: "Vue 3 Options API API mocking — static JSON files in src/mocks/: folder structure, naming conventions, and switching between mock and real API via environment variable. Use when: building UI before the real API is ready; testing components without a live backend."
---

# Vue 3 Options API Mock API Skill

## Overview

This skill covers mocking API responses with **static JSON files** in `src/mocks/`. In development, service classes check an env flag and load the matching JSON file instead of hitting the real server. No extra libraries needed.

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
    {
      "id": "1",
      "name": "Alice",
      "email": "alice@example.com",
      "role": "admin"
    },
    { "id": "2", "name": "Bob", "email": "bob@example.com", "role": "user" }
  ],
  "message": "OK",
  "success": true
}
```

```json
// src/mocks/user.json
{
  "data": {
    "id": "1",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "admin"
  },
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

## 4. Use Mock Data in Service Classes

Check the env flag inside each service method. If mocking is enabled, return the JSON directly instead of calling the API.

```typescript
// src/services/userService.ts
import { authApi } from "@/utils/authApi";
import type { User, ApiResponse } from "@/types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

class UserService {
  async getUsers(): Promise<User[]> {
    if (USE_MOCK) {
      const { usersMock } = await import("@/mocks");
      return usersMock.data as User[];
    }
    const response = await authApi.get<ApiResponse<User[]>>("/users");
    return response.data.data;
  }

  async getUser(id: string): Promise<User> {
    if (USE_MOCK) {
      const { userMock } = await import("@/mocks");
      return userMock.data as User;
    }
    const response = await authApi.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  }

  async createUser(payload: Omit<User, "id">): Promise<User> {
    if (USE_MOCK) {
      // Simulate a created user with a fake id
      return { id: crypto.randomUUID(), ...payload } as User;
    }
    const response = await authApi.post<ApiResponse<User>>("/users", payload);
    return response.data.data;
  }

  async updateUser(id: string, payload: Partial<User>): Promise<User> {
    if (USE_MOCK) {
      const { userMock } = await import("@/mocks");
      return { ...userMock.data, ...payload } as User;
    }
    const response = await authApi.put<ApiResponse<User>>(
      `/users/${id}`,
      payload,
    );
    return response.data.data;
  }

  async deleteUser(id: string): Promise<void> {
    if (USE_MOCK) {
      return; // No-op for mock
    }
    await authApi.delete(`/users/${id}`);
  }
}

export const userService = new UserService();
```

```typescript
// src/services/authService.ts
import { api } from "@/utils/api";
import type { ApiResponse } from "@/types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  userId: string;
}

class AuthService {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    if (USE_MOCK) {
      const { authLoginMock } = await import("@/mocks");
      return authLoginMock.data;
    }
    const response = await api.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      payload,
    );
    return response.data.data;
  }
}

export const authService = new AuthService();
```

---

## 5. Component Usage — Unchanged

Components call service methods the same way regardless of mock mode. The mock logic is encapsulated in the service layer.

```vue
<script lang="ts">
import { defineComponent } from "vue";
import { userService } from "@/services";
import type { User } from "@/types";

export default defineComponent({
  name: "UsersPage",
  data() {
    return {
      users: [] as User[],
      isLoading: false,
    };
  },
  async created() {
    this.isLoading = true;
    try {
      // ✅ Works the same with mock or real API
      this.users = await userService.getUsers();
    } finally {
      this.isLoading = false;
    }
  },
});
</script>
```
