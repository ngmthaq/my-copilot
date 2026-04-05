---
name: reactjs-routing-navigation
description: "React.js routing — TanStack Router with file-based routing: route files in src/routes/, type-safe Link/useNavigate/useParams, nested layouts, protected routes via beforeLoad, URL params and search params. Use when: setting up routing; building nested layouts; protecting routes by auth."
---

# React.js Routing & Navigation Skill

## Overview

This project uses **TanStack Router** with Vite's file-based routing plugin. Routes are auto-discovered from `src/routes/`. The router is fully type-safe — `Link`, `useNavigate`, and `useParams` are all typed from your file structure.

Install: `npm install @tanstack/react-router`
Vite plugin: `npm install -D @tanstack/router-plugin`

---

## 1. Vite Plugin Setup

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite(), // ✅ must be before react()
    react(),
  ],
});
```

The plugin auto-generates `src/routeTree.gen.ts` whenever you add/change route files. Never edit this file manually.

---

## 2. Router Instance (src/main.tsx)

```typescript
// src/main.tsx
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

// Type registration for full type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
```

---

## 3. File-Based Route Naming

| File path                        | URL path          | Purpose                         |
| -------------------------------- | ----------------- | ------------------------------- |
| `src/routes/__root.tsx`          | (all routes)      | Root layout wrapping everything |
| `src/routes/index.tsx`           | `/`               | Home page                       |
| `src/routes/about.tsx`           | `/about`          | About page                      |
| `src/routes/users/index.tsx`     | `/users`          | Users list page                 |
| `src/routes/users/$userId.tsx`   | `/users/:userId`  | User detail page                |
| `src/routes/_auth.tsx`           | (pathless layout) | Auth guard layout               |
| `src/routes/_auth/dashboard.tsx` | `/dashboard`      | Protected page                  |
| `src/routes/$.tsx`               | `*` (catch-all)   | 404 not found page              |

Pathless layouts (prefixed with `_`) wrap child routes without adding a URL segment.

---

## 4. Root Layout (src/routes/\_\_root.tsx)

```typescript
// src/routes/__root.tsx
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppBar } from "@/components/AppBar";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <AppBar />
      <main>
        <Outlet /> {/* child routes render here */}
      </main>
    </>
  );
}
```

---

## 5. Route Files vs Page Components

**Route files** (`src/routes/`) are thin wrappers — they only handle TanStack Router config (path, loaders, guards, search params). The actual UI lives in **page components** (`src/pages/`).

```
routes/index.tsx          ← router config only (createFileRoute, beforeLoad, etc.)
pages/HomePage.tsx        ← real UI component
```

```typescript
// src/pages/HomePage.tsx — the actual UI
export function HomePage() {
  return <h1>Home</h1>;
}

// src/routes/index.tsx — thin router wrapper
import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages";

export const Route = createFileRoute("/")({
  component: HomePage,
});
```

```typescript
// src/pages/DashboardPage.tsx
export function DashboardPage() {
  return <h1>Dashboard</h1>;
}

// src/routes/_auth/dashboard.tsx
import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages";

export const Route = createFileRoute("/_auth/dashboard")({
  component: DashboardPage,
});
```

This separation keeps route files small and makes page components independently testable.

---

## 6. Dynamic Route Params

```typescript
// src/pages/UserDetailPage.tsx
import { Route } from "@/routes/users/$userId"; // import route for useParams
import { useUser } from "@/queries";

export function UserDetailPage() {
  // ✅ Fully typed — userId is string, guaranteed to exist
  const { userId } = Route.useParams();
  const { data: user, isLoading } = useUser(userId);

  if (isLoading) return <p>Loading...</p>;
  return <h1>{user?.name}</h1>;
}
```

```typescript
// src/routes/users/$userId.tsx
import { createFileRoute } from "@tanstack/react-router";
import { UserDetailPage } from "@/pages";

export const Route = createFileRoute("/users/$userId")({
  component: UserDetailPage,
});
```

---

## 7. Search Params (Query Strings)

```typescript
// src/routes/users/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// ✅ Define and validate search params with a schema
const searchSchema = z.object({
  page: z.number().catch(1),
  q: z.string().catch(""),
});

export const Route = createFileRoute("/users/")({  // trailing slash for index
  validateSearch: searchSchema,
  component: UsersPage,
});

function UsersPage() {
  const { page, q } = Route.useSearch(); // ✅ typed from schema
  const navigate = Route.useNavigate();

  return (
    <div>
      <input
        value={q}
        onChange={(e) => navigate({ search: { page: 1, q: e.target.value } })
        }
      />
      <p>Page: {page}</p>
    </div>
  );
}
```

---

## 8. Protected Routes (Auth Guard)

Use a pathless layout route with `beforeLoad` to guard all child routes at once.

```typescript
// src/routes/_auth.tsx
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context }) => {
    // context is set on the router instance, e.g. { auth: { user } }
    if (!context.auth.user) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => <Outlet />,
});
```

```typescript
// src/routes/_auth/dashboard.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard")({
  component: () => <h1>Dashboard (protected)</h1>,
});
```

```typescript
// Provide auth context to the router in main.tsx
const router = createRouter({
  routeTree,
  context: {
    auth: { user: null }, // initial value, update with real auth state
  },
});
```

---

## 9. Navigation

```typescript
import { Link, useNavigate } from "@tanstack/react-router";

// ✅ Declarative — paths are type-checked
<Link to="/about">About</Link>
<Link to="/users/$userId" params={{ userId: "42" }}>User 42</Link>
<Link to="/users/" search={{ page: 2, q: "" }}>Page 2</Link>

// Active styling
<Link
  to="/dashboard"
  activeProps={{ style: { fontWeight: "bold" } }}
>
  Dashboard
</Link>
```

```typescript
// ✅ Programmatic
const navigate = useNavigate();

await login();
navigate({ to: "/dashboard" });
navigate({ to: "/users/$userId", params: { userId: "42" } });
navigate({ to: "/login", replace: true }); // replace history entry
```

---

## 10. 404 Not Found (src/routes/$.tsx)

```typescript
// src/routes/$.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$")({
  component: () => <h1>404 — Page not found</h1>,
});
```

```typescript
// src/routes/index.tsx
import { Routes, Route } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { HomePage } from "@/routes/HomePage";
import { AboutPage } from "@/routes/AboutPage";
import { NotFoundPage } from "@/routes/NotFoundPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
```

---

## 2. Nested Layouts

```typescript
// src/layouts/RootLayout.tsx
import { Outlet } from "react-router-dom";

export function RootLayout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet /> {/* Child routes render here */}
      </main>
      <Footer />
    </div>
  );
}
```

```typescript
// Nested structure example
<Routes>
  <Route path="/" element={<RootLayout />}>
    <Route index element={<HomePage />} />
    <Route path="dashboard" element={<DashboardLayout />}>
      <Route index element={<DashboardHome />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>
  </Route>
</Routes>
```

---

## 3. Protected Routes

```typescript
// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();

  // Not logged in — redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but wrong role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
```

```typescript
// Usage in router
<Routes>
  <Route path="/login" element={<LoginPage />} />

  {/* Any authenticated user */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Route>

  {/* Admin only */}
  <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
    <Route path="/admin" element={<AdminPage />} />
  </Route>
</Routes>
```

---

## 4. URL Params & Query Strings

```typescript
// Route definition
<Route path="/users/:userId" element={<UserDetailPage />} />
```

```typescript
// src/routes/UserDetailPage.tsx
import { useParams } from "react-router-dom";

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  return <div>User: {userId}</div>;
}
```

```typescript
// Reading query strings
import { useSearchParams } from "react-router-dom";

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const query = searchParams.get("q") ?? "";

  const updatePage = (newPage: number) =>
    setSearchParams({ q: query, page: String(newPage) });

  return <div>Page {page} | Query: {query}</div>;
}
```

---

## 5. Navigation

```typescript
import { useNavigate, Link, NavLink } from "react-router-dom";

// Programmatic navigation
export function LoginForm() {
  const navigate = useNavigate();

  async function handleSubmit() {
    await login();
    navigate("/dashboard"); // push to history
    // navigate(-1);        // go back
    // navigate("/login", { replace: true }); // replace instead of push
  }
}

// Declarative navigation
<Link to="/about">About</Link>

// NavLink — auto-applies active class
<NavLink
  to="/dashboard"
  className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
>
  Dashboard
</NavLink>
```

---

## 6. Lazy Loading Routes

Split large page components to reduce initial bundle size.

```typescript
import { lazy, Suspense } from "react";

const AdminPage = lazy(() => import("@/pages/AdminPage"));

<Route
  path="/admin"
  element={
    <Suspense fallback={<PageLoader />}>
      <AdminPage />
    </Suspense>
  }
/>
```
