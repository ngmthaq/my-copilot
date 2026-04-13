---
name: vuejs-options-api-integration
description: "Vue 3 Options API API integration — Axios instance, service classes in src/services/, API calls in component methods, loading/error state management, and data fetching patterns. Use when: fetching data from an API; handling loading and error states; structuring API calls."
---

# Vue 3 Options API API Integration Skill

## Overview

This skill covers integrating with REST APIs using Axios and service classes. Service classes live in `src/services/`. API calls are made in component methods or lifecycle hooks. The Axios instance lives in `src/utils/api.ts`.

Install: `npm install axios`

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

  public get<T>(url: string, params: Record<string, unknown> = {}, config: AxiosRequestConfig = {}) {
    return this.instance.get<T>(url, { params, ...config });
  }

  public post<T>(url: string, data: unknown = {}, config: AxiosRequestConfig = {}) {
    return this.instance.post<T>(url, data, config);
  }

  public put<T>(url: string, data: unknown = {}, config: AxiosRequestConfig = {}) {
    return this.instance.put<T>(url, data, config);
  }

  public patch<T>(url: string, data: unknown = {}, config: AxiosRequestConfig = {}) {
    return this.instance.patch<T>(url, data, config);
  }

  public delete<T>(url: string, params: Record<string, unknown> = {}, config: AxiosRequestConfig = {}) {
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

## 3. Service Classes (src/services/)

Encapsulate API calls in service classes. Each service corresponds to a resource or domain.

```typescript
// src/services/userService.ts
import { authApi } from "@/utils/authApi";
import type { User, ApiResponse } from "@/types";

class UserService {
  async getUsers(page = 1, pageSize = 10): Promise<{ data: User[]; total: number }> {
    const response = await authApi.get<ApiResponse<{ items: User[]; total: number }>>("/users", {
      page,
      pageSize,
    });
    return { data: response.data.data.items, total: response.data.data.total };
  }

  async getUser(id: string): Promise<User> {
    const response = await authApi.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  }

  async createUser(payload: Omit<User, "id">): Promise<User> {
    const response = await authApi.post<ApiResponse<User>>("/users", payload);
    return response.data.data;
  }

  async updateUser(id: string, payload: Partial<User>): Promise<User> {
    const response = await authApi.put<ApiResponse<User>>(`/users/${id}`, payload);
    return response.data.data;
  }

  async deleteUser(id: string): Promise<void> {
    await authApi.delete(`/users/${id}`);
  }
}

export const userService = new UserService();
```

```typescript
// src/services/authService.ts
import { api } from "@/utils/api";
import type { ApiResponse } from "@/types";

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
    const response = await api.post<ApiResponse<LoginResponse>>("/auth/login", payload);
    return response.data.data;
  }

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  }
}

export const authService = new AuthService();
```

```typescript
// src/services/index.ts
export { userService } from "./userService";
export { authService } from "./authService";
```

---

## 4. Data Fetching in Components

### Fetch on created (no DOM needed)

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
      error: null as string | null,
    };
  },
  async created() {
    await this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await userService.getUsers();
        this.users = result.data;
      } catch (err: any) {
        this.error = err.message ?? "Failed to fetch users";
      } finally {
        this.isLoading = false;
      }
    },
  },
});
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error" class="error">{{ error }}</div>
  <ul v-else>
    <li v-for="user in users" :key="user.id">{{ user.name }}</li>
  </ul>
</template>
```

### Fetch with reactive route params

```vue
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
      error: null as string | null,
    };
  },
  computed: {
    userId(): string {
      return this.$route.params.userId as string;
    },
  },
  watch: {
    userId: {
      async handler(newId: string) {
        this.isLoading = true;
        this.error = null;
        try {
          this.user = await userService.getUser(newId);
        } catch (err: any) {
          this.error = err.message ?? "Failed to fetch user";
        } finally {
          this.isLoading = false;
        }
      },
      immediate: true,
    },
  },
});
</script>
```

---

## 5. Mutation Pattern — Create, Update, Delete

```vue
<script lang="ts">
import { defineComponent } from "vue";
import { userService } from "@/services";

export default defineComponent({
  name: "CreateUserButton",
  data() {
    return {
      isPending: false,
    };
  },
  methods: {
    async createUser() {
      this.isPending = true;
      try {
        await userService.createUser({
          name: "Alice",
          email: "alice@example.com",
          role: "user",
        });
        // ✅ Navigate or refresh data after success
        this.$router.push({ name: "users" });
      } catch (err: any) {
        alert(err.message ?? "Failed to create user");
      } finally {
        this.isPending = false;
      }
    },
  },
});
</script>

<template>
  <button :disabled="isPending" @click="createUser">
    {{ isPending ? "Saving..." : "Create" }}
  </button>
</template>
```

---

## 6. Pagination + Search Pattern

```vue
<script lang="ts">
import { defineComponent } from "vue";
import { userService } from "@/services";
import type { User } from "@/types";

export default defineComponent({
  name: "UsersListPage",
  data() {
    return {
      users: [] as User[],
      isLoading: false,
      error: null as string | null,
      page: 1,
      pageSize: 10,
      totalItems: 0,
      searchTerm: "",
    };
  },
  computed: {
    totalPages(): number {
      return Math.ceil(this.totalItems / this.pageSize);
    },
  },
  watch: {
    page() {
      this.fetchUsers();
    },
    searchTerm() {
      this.page = 1; // reset to first page on new search
      this.fetchUsers();
    },
  },
  async created() {
    await this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await userService.getUsers(this.page, this.pageSize);
        this.users = result.data;
        this.totalItems = result.total;
      } catch (err: any) {
        this.error = err.message ?? "Failed to fetch users";
      } finally {
        this.isLoading = false;
      }
    },
  },
});
</script>

<template>
  <input v-model="searchTerm" placeholder="Search..." />
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">{{ error }}</div>
  <template v-else>
    <ul>
      <li v-for="user in users" :key="user.id">{{ user.name }}</li>
    </ul>
    <div>
      <button :disabled="page <= 1" @click="page--">Previous</button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++">Next</button>
    </div>
  </template>
</template>
```

---

## 7. Loading / Error State Pattern

Every component that fetches data should manage three states:

```typescript
data() {
  return {
    result: null as DataType | null,    // the fetched data
    isLoading: false,                    // true while the API call is in flight
    error: null as string | null,        // error message if the call fails
  };
},
```

```vue
<template>
  <Spinner v-if="isLoading" />
  <ErrorMessage v-else-if="error" :message="error" />
  <div v-else>
    <!-- Render the data -->
  </div>
</template>
```
