---
name: react-native-api-integration
description: "React Native API integration — Axios instance, TanStack Query hooks in queries/ and mutations/ folders, loading/error states, and cache invalidation. Use when: fetching data from an API; handling loading and error states; invalidating cache after a mutation."
---

# React Native API Integration Skill

## Overview

This skill covers integrating with REST APIs using Axios and TanStack Query. Query hooks live in `src/queries/`, mutation hooks live in `src/mutations/`. The Axios instance lives in `src/utils/api.ts`.

Install: `npx expo install axios @tanstack/react-query`

---

## 1. Axios Class (src/utils/api.ts)

Use a class-based approach so the base `Api` can be extended to create specialized clients (e.g., `AuthApi` with token injection).

```typescript
// src/utils/api.ts
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl ?? "http://localhost:3000";

export class Api {
  protected instance: AxiosInstance;

  public constructor() {
    this.instance = axios.create();
    this.instance.defaults.baseURL = API_BASE_URL;
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

## 2. AuthApi with Token Injection (src/utils/authApi.ts)

```typescript
// src/utils/authApi.ts
import { Api } from "./api";
import { tokenAtom } from "@/stores/authAtom";
import { getDefaultStore } from "jotai";
import { router } from "expo-router";

export class AuthApi extends Api {
  public constructor() {
    super();

    this.instance.interceptors.request.use((config) => {
      const token = getDefaultStore().get(tokenAtom);
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.instance.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401) {
          getDefaultStore().set(tokenAtom, null);
          router.replace("/login");
        }
        return Promise.reject(error);
      },
    );
  }
}

export const authApi = new AuthApi();
```

| Client    | Use for                                         |
| --------- | ----------------------------------------------- |
| `api`     | Public endpoints (login, register, public data) |
| `authApi` | Protected endpoints (requires auth token)       |

---

## 3. TanStack Query Setup

Wire up in the root layout:

```typescript
// app/_layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
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
    enabled: Boolean(id),
  });
}
```

### Using in a Screen

```typescript
import { useUsers } from "@/queries";
import { FlatList, ActivityIndicator, Text, View } from "react-native";

export function UserListScreen() {
  const { data: users, isLoading, isError, refetch } = useUsers();

  if (isLoading) return <ActivityIndicator size="large" />;
  if (isError) return <Text>Failed to load users</Text>;

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Text>{item.name}</Text>}
      onRefresh={refetch}
      refreshing={isLoading}
    />
  );
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

interface CreateUserPayload {
  name: string;
  email: string;
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      authApi.post<ApiResponse<User>>("/users", payload).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

```typescript
// Usage in a screen
const createUser = useCreateUser();

const handleSubmit = (values: CreateUserFormValues) => {
  createUser.mutate(values, {
    onSuccess: () => router.back(),
    onError: (error) => Alert.alert("Error", error.message),
  });
};
```

---

## 6. Pagination with useInfiniteQuery

```typescript
// src/queries/useUsersInfinite.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { authApi } from "@/utils/authApi";
import type { User, PaginatedResponse } from "@/types/user";

export function useUsersInfinite() {
  return useInfiniteQuery({
    queryKey: ["users", "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      authApi.get<PaginatedResponse<User>>("/users", { page: pageParam, limit: 20 }).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.totalPages ? lastPage.meta.currentPage + 1 : undefined,
  });
}
```

```typescript
// Usage with FlatList
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useUsersInfinite();

const allUsers = data?.pages.flatMap((page) => page.data) ?? [];

<FlatList
  data={allUsers}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <UserCard user={item} />}
  onEndReached={() => hasNextPage && fetchNextPage()}
  onEndReachedThreshold={0.5}
  ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
/>
```

---

## 7. Optimistic Updates

```typescript
// src/mutations/useToggleFavorite.ts
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => authApi.post(`/favorites/${itemId}`),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ["items"] });
      const previous = queryClient.getQueryData<Item[]>(["items"]);

      queryClient.setQueryData<Item[]>(["items"], (old) =>
        old?.map((item) => (item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item)),
      );

      return { previous };
    },
    onError: (_err, _itemId, context) => {
      queryClient.setQueryData(["items"], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}
```

---

## 8. Refetch on App Focus

```typescript
// app/_layout.tsx
import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { focusManager } from "@tanstack/react-query";

function useOnlineManager() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status: AppStateStatus) => {
      focusManager.setFocused(status === "active");
    });
    return () => subscription.remove();
  }, []);
}
```
