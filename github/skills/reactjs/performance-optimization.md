---
name: reactjs-performance-optimization
description: "React.js performance — memoization, lazy loading, code splitting, and avoiding unnecessary re-renders. Use when: a component re-renders too often; reducing initial bundle size; making lists or expensive calculations faster."
---

# React.js Performance Optimization Skill

## Overview

This skill covers practical React performance techniques. Always profile first — optimize only what you can measure.

---

## 0. Profile First

Before optimizing, confirm there is actually a problem:

1. Open **React DevTools** → Profiler tab → Record an interaction.
2. Look for components that render unexpectedly or take long.
3. Then apply the technique that matches the root cause.

---

## 1. React.memo — Skip Unnecessary Re-renders

Wraps a component so it only re-renders when its props change.

```typescript
// Without memo: re-renders every time parent renders
function UserAvatar({ name, avatarUrl }: AvatarProps) {
  return <img src={avatarUrl} alt={name} />;
}

// ✅ With memo: skips render if props are the same
export const UserAvatar = React.memo(function UserAvatar({ name, avatarUrl }: AvatarProps) {
  return <img src={avatarUrl} alt={name} />;
});
```

> **Only use `memo` when:** the component renders often AND it's slow or has expensive children. `memo` itself has a small cost — don't wrap everything.

---

## 2. useCallback — Stable Function References

Without `useCallback`, functions are re-created on every render, breaking `memo`.

```typescript
// ✔ Without useCallback: handleDelete is a new function every render
// ✔ This causes MemoizedRow to re-render even with React.memo
function UserTable({ users }: Props) {
  const handleDelete = (id: string) => deleteUser(id); // new ref each render
  return users.map((u) => <MemoizedRow key={u.id} user={u} onDelete={handleDelete} />);
}

// ✅ With useCallback: handleDelete is stable
function UserTable({ users }: Props) {
  const handleDelete = useCallback((id: string) => deleteUser(id), []);
  return users.map((u) => <MemoizedRow key={u.id} user={u} onDelete={handleDelete} />);
}
```

---

## 3. useMemo — Cache Expensive Calculations

```typescript
function ProductList({ products, searchTerm, category }: Props) {
  // ✅ Only recalculates when products, searchTerm, or category changes
  const filtered = useMemo(() => {
    return products
      .filter((p) => p.category === category)
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm, category]);

  return <ul>{filtered.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

---

## 4. Lazy Loading & Code Splitting

Split large pages or modals so they only load when needed.

```typescript
import { lazy, Suspense } from "react";

// ✅ The bundle for AdminPage is only downloaded when the user navigates to /admin
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const ReportModal = lazy(() => import("@/components/ReportModal"));

function App() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Suspense>
  );
}
```

---

## 5. Virtualize Long Lists

Only render items visible in the viewport. Essential for lists with 100+ items.

Install: `npm install @tanstack/react-virtual`

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";

export function VirtualList({ items }: { items: string[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // approximate row height in px
  });

  return (
    <div ref={parentRef} style={{ height: "400px", overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize() + "px", position: "relative" }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div
            key={item.key}
            style={{ position: "absolute", top: item.start, width: "100%", height: item.size + "px" }}
          >
            {items[item.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 6. Avoid Common Re-render Causes

| Cause                                                | Fix                                           |
| ---------------------------------------------------- | --------------------------------------------- |
| Passing a new object/array literal as prop           | Move it outside the component or `useMemo` it |
| Passing an arrow function as prop to `memo` children | Wrap with `useCallback`                       |
| Context value changes on every render                | Memoize context value with `useMemo`          |
| Huge component doing too much                        | Split into smaller focused components         |

```typescript
// ⚠️ Context re-renders all consumers when value reference changes
<AuthContext.Provider value={{ user, login, logout }}> // new object every render!

// ✅ Memoize the context value
const value = useMemo(() => ({ user, login, logout }), [user]);
<AuthContext.Provider value={value}>
```
