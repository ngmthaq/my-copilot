---
name: react-native-convention
description: "React Native (Expo) conventions — project structure, naming rules, file organization, TypeScript usage, and import order. Use when: setting up a new project; deciding where to put files; naming components, hooks, or utilities."
---

# React Native Conventions Skill

> **Prerequisite:** Also load [javascript/convention.md](../javascript/convention.md) for base formatting, Prettier, naming, import organization, EditorConfig, and ESLint rules, and [typescript/convention.md](../typescript/convention.md) for TypeScript-specific rules. This file covers React Native-specific conventions only.

## Overview

This skill covers the naming rules, file layout, and TypeScript conventions used across React Native (Expo) projects. Follow these to keep the codebase consistent and easy to navigate.

---

## 1. Project Structure

```
app/                     # Expo Router file-based routes
├── (tabs)/              # Tab group layout
│   ├── _layout.tsx      # Tab navigator config
│   ├── index.tsx        # Home tab (/)
│   ├── explore.tsx      # Explore tab (/explore)
│   └── profile.tsx      # Profile tab (/profile)
├── (auth)/              # Auth group (no tab bar)
│   ├── _layout.tsx      # Stack layout for auth screens
│   ├── login.tsx        # /login
│   └── register.tsx     # /register
├── users/
│   ├── index.tsx        # /users
│   └── [id].tsx         # /users/:id
├── modal.tsx            # Modal screen
├── _layout.tsx          # Root layout (providers, fonts, splash)
├── +not-found.tsx       # 404 catch-all
└── +html.tsx            # Custom HTML wrapper (web only)
src/
├── components/          # Reusable UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts     # Re-export
│   └── index.ts         # Re-export all components
├── constants/           # Application constants
│   ├── apiConstants.ts
│   ├── Colors.ts        # Theme colors
│   └── index.ts
├── forms/               # Formik form configs and Zod validation schemas
│   ├── loginSchema.ts
│   └── index.ts
├── hooks/               # Custom React hooks
│   ├── useDebounce.ts
│   └── index.ts
├── mutations/           # TanStack Query mutation hooks
│   ├── useCreateUser.ts
│   └── index.ts
├── providers/           # Context providers (ThemeProvider, AuthProvider)
│   ├── AuthProvider.tsx
│   └── index.ts
├── queries/             # TanStack Query query hooks
│   ├── useUsers.ts
│   └── index.ts
├── screens/             # Screen-level components (imported by route files)
│   ├── HomeScreen/
│   │   ├── HomeScreen.tsx
│   │   ├── HomeScreen.test.tsx
│   │   └── index.ts
│   └── index.ts
├── stores/              # Jotai atoms and derived atoms
│   ├── authAtom.ts
│   └── index.ts
├── types/               # TypeScript type definitions
│   ├── user.ts
│   └── index.ts
└── utils/               # Utility functions
    ├── api.ts           # Axios base class
    ├── authApi.ts       # Axios authenticated class
    └── index.ts
assets/                  # Static assets (images, fonts)
├── images/
└── fonts/
```

---

## 2. Naming Rules

| Item               | Convention              | Example                     |
| ------------------ | ----------------------- | --------------------------- |
| Component file     | PascalCase              | `UserCard.tsx`              |
| Component name     | PascalCase              | `function UserCard()`       |
| Screen file        | PascalCase              | `HomeScreen.tsx`            |
| Screen name        | PascalCase + `Screen`   | `HomeScreen`                |
| Hook file          | camelCase               | `useAuth.ts`                |
| Hook name          | `use` prefix            | `useAuth`, `useUserData`    |
| Utility file       | camelCase               | `formatDate.ts`             |
| Atom file          | camelCase               | `authAtom.ts`               |
| Atom variable      | `Atom` suffix           | `userAtom`, `isLoadingAtom` |
| Route file         | kebab-case or camelCase | `login.tsx`, `[id].tsx`     |
| Type file          | camelCase               | `user.ts`                   |
| Type/Interface     | PascalCase              | `User`, `UserCardProps`     |
| Constant           | SCREAMING_SNAKE_CASE    | `API_BASE_URL`              |
| Query hook file    | camelCase with `use`    | `useUsers.ts`               |
| Mutation hook file | camelCase with `use`    | `useCreateUser.ts`          |

---

## 3. Route File vs Screen Component

**Route files** (`app/`) are thin wrappers — they handle Expo Router config (layout, params, redirects). The actual UI lives in **screen components** (`src/screens/`).

```typescript
// src/screens/HomeScreen/HomeScreen.tsx ← actual UI
export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Home</Text>
    </View>
  );
}

// app/(tabs)/index.tsx ← thin route wrapper
import { HomeScreen } from "@/screens";
export default HomeScreen;
```

---

## 4. TypeScript Conventions

```typescript
// ✅ Use interface for component props
interface UserCardProps {
  name: string;
  email: string;
  onPress?: () => void;
}

// ✅ Use type for unions, intersections, and utility types
type Status = "active" | "inactive" | "pending";
type UserWithRole = User & { role: string };

// ✅ Never use `any` — use `unknown` when the type is truly unknown
function parseResponse(data: unknown): User {
  // validate and cast
}

// ✅ Export types from types/ folder
export interface User {
  id: string;
  name: string;
  email: string;
}
```

---

## 5. Import Order

Enforce a consistent import order using groups separated by a blank line:

```typescript
// 1. React & React Native
import { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

// 2. Third-party libraries
import { useQuery } from "@tanstack/react-query";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";

// 3. Internal modules (path alias @/)
import { useAuth } from "@/hooks";
import { useUsers } from "@/queries";
import { UserCard } from "@/components";
import type { User } from "@/types";

// 4. Relative imports (same feature/folder)
import { styles } from "./HomeScreen.styles";
```

---

## 6. Path Alias

Configure `@/` alias for `src/` in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## 7. Barrel Exports (index.ts)

Every folder should have an `index.ts` re-exporting its public API:

```typescript
// src/components/index.ts
export { Button } from "./Button";
export { UserCard } from "./UserCard";
export { Avatar } from "./Avatar";
```

```typescript
// Consumer imports from the folder, not the file
import { Button, UserCard } from "@/components";
```

---

## 8. File Colocation

Keep related files together in a folder:

```
src/components/UserCard/
├── UserCard.tsx          # Component
├── UserCard.test.tsx     # Tests
├── UserCard.styles.ts    # StyleSheet (optional, for large styles)
└── index.ts              # Re-export
```

For simple components with few styles, keep styles inline in the component file.
