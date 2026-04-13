---
name: reactjs-ui-styling-tw
description: "React.js UI styling — Tailwind CSS v4: utility classes, cn() helper with clsx + tailwind-merge, CSS Modules, responsive design, and dark mode. Use when: styling components with Tailwind; applying conditional classes; responsive layouts; dark mode with class strategy."
---

# React.js UI & Styling — Tailwind CSS Skill

## Overview

This skill covers styling React components with **Tailwind CSS v4** (utility-first). Use `cn()` (clsx + tailwind-merge) for conditional classes and CSS Modules for scoped styles.

Packages: `tailwindcss @tailwindcss/vite clsx tailwind-merge`

---

## 1. Tailwind CSS Basics

Install: `npm install tailwindcss @tailwindcss/vite` (Tailwind v4 with Vite plugin)

```tsx
// Simple styled button using Tailwind utilities
export function Button({ children, variant = "primary" }) {
  return (
    <button
      className="px-4 py-2 rounded-md font-semibold text-sm transition-colors
                 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {children}
    </button>
  );
}
```

---

## 2. cn() Utility — Conditional Classes

Install: `npm install clsx tailwind-merge`

```typescript
// src/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
// Use cn() to apply classes conditionally
import { cn } from "@/utils/cn";

interface BadgeProps {
  variant: "success" | "warning" | "danger";
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "px-2 py-1 rounded-full text-xs font-medium",
        variant === "success" && "bg-green-100 text-green-800",
        variant === "warning" && "bg-yellow-100 text-yellow-800",
        variant === "danger" && "bg-red-100 text-red-800",
      )}
    >
      {children}
    </span>
  );
}
```

---

## 3. CSS Modules

Co-locate a `.module.css` file next to your component for scoped styles.

```css
/* src/components/Card/card.module.css */
.card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  background: white;
}

.card__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card--highlighted {
  border: 2px solid #3b82f6;
}
```

```tsx
// src/components/Card/Card.tsx
import styles from "./card.module.css";
import { cn } from "@/utils/cn";

interface CardProps {
  title: string;
  highlighted?: boolean;
  children: React.ReactNode;
}

export function Card({ title, highlighted = false, children }: CardProps) {
  return (
    <div className={cn(styles.card, highlighted && styles["card--highlighted"])}>
      <h2 className={styles.card__title}>{title}</h2>
      {children}
    </div>
  );
}
```

---

## 4. Responsive Design with Tailwind

Tailwind uses **mobile-first** breakpoints. Apply base styles for mobile, then override for larger screens.

```tsx
<div
  className="
  grid
  grid-cols-1        /* mobile: 1 column */
  sm:grid-cols-2     /* 640px+: 2 columns */
  lg:grid-cols-3     /* 1024px+: 3 columns */
  gap-4
"
>
  {items.map((item) => (
    <ItemCard key={item.id} {...item} />
  ))}
</div>
```

| Prefix | Min-width    |
| ------ | ------------ |
| (none) | 0px (mobile) |
| `sm:`  | 640px        |
| `md:`  | 768px        |
| `lg:`  | 1024px       |
| `xl:`  | 1280px       |

---

## 5. Dark Mode

**Tailwind approach** — add `dark:` variants and toggle the `dark` class on `<html>`:

```typescript
// src/hooks/useDarkMode.ts
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggle = () => setIsDark((v) => !v);
  return { isDark, toggle };
}
```

```tsx
// Apply dark mode variants in components
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">Content</div>
```

```css
/* tailwind.config (v3) or CSS layer (v4) */
/* Enable class-based dark mode */
/* tailwind.config.js: darkMode: 'class' */
```
