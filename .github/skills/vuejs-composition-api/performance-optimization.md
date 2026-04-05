---
name: vuejs-performance-optimization
description: "Vue 3 performance — computed caching, shallowRef, defineAsyncComponent, v-memo, keep-alive, and avoiding unnecessary re-renders. Use when: a component re-renders too often; reducing initial bundle size; making lists or expensive calculations faster."
---

# Vue 3 Performance Optimization Skill

## Overview

This skill covers practical Vue 3 performance techniques. Always profile first — optimize only what you can measure.

---

## 0. Profile First

Before optimizing, confirm there is actually a problem:

1. Open **Vue DevTools** → Performance tab → Record an interaction.
2. Look for components that render unexpectedly or take long.
3. Then apply the technique that matches the root cause.

---

## 1. computed — Cached Derived State

`computed` values are cached — they only recalculate when their reactive dependencies change.

```typescript
import { ref, computed } from "vue";

const products = ref<Product[]>([]);
const searchTerm = ref("");

// ✅ Only re-filters when products or searchTerm changes
const filtered = computed(() =>
  products.value.filter((p) => p.name.toLowerCase().includes(searchTerm.value.toLowerCase())),
);
```

> **Rule:** Always use `computed` for derived values. Never re-derive in the template directly when the computation is non-trivial.

---

## 2. shallowRef — Skip Deep Reactivity

`shallowRef` makes only the top-level value reactive. Ideal for large arrays or objects where you replace the whole value rather than mutate nested properties.

```typescript
import { shallowRef } from "vue";

// ✅ Large list — only tracks whether the array reference changes, not items
const users = shallowRef<User[]>([]);

// ✅ Correct: replace the whole array (triggers reactivity)
users.value = [...users.value, newUser];

// ⚠️ Wrong: mutating items won't trigger re-renders with shallowRef
// users.value[0].name = "Alice"; // ❌ Not reactive
```

---

## 3. defineAsyncComponent — Lazy Loading

Split large components so they only load when needed.

```typescript
import { defineAsyncComponent } from "vue";

// ✅ AdminDashboard bundle is only downloaded when the component renders
const AdminDashboard = defineAsyncComponent(() => import("@/pages/AdminDashboard/AdminDashboard.vue"));

// ✅ With loading/error states
const HeavyChart = defineAsyncComponent({
  loader: () => import("@/components/HeavyChart/HeavyChart.vue"),
  loadingComponent: Spinner,
  errorComponent: ErrorMessage,
  delay: 200, // delay before showing loading state
  timeout: 10000,
});
```

```vue
<template>
  <!-- Suspense is required for async components -->
  <Suspense>
    <AdminDashboard />
    <template #fallback>
      <Spinner />
    </template>
  </Suspense>
</template>
```

---

## 4. v-memo — Memoize Template Subtrees

`v-memo` skips re-rendering a subtree when the given dependency array values haven't changed. Useful in large `v-for` lists.

```vue
<template>
  <!-- ✅ Each row only re-renders when user.id or selected changes -->
  <div v-for="user in users" :key="user.id" v-memo="[user.id, selected === user.id]">
    <UserRow :user="user" :is-selected="selected === user.id" />
  </div>
</template>
```

> **Rule:** Only use `v-memo` on list items with expensive render trees. On simple items, the memo check itself costs more than re-rendering.

---

## 5. keep-alive — Cache Component State

`<KeepAlive>` caches a component's state when it is removed from the DOM, so it doesn't reset when navigating back.

```vue
<template>
  <!-- ✅ Cache tab components — state (scroll position, form inputs) is preserved -->
  <KeepAlive :max="5">
    <component :is="activeTab" />
  </KeepAlive>
</template>
```

```vue
<!-- Use onActivated / onDeactivated lifecycle hooks inside cached components -->
<script setup lang="ts">
import { onActivated, onDeactivated } from "vue";

onActivated(() => {
  console.log("Component restored from cache");
  // Refresh data if needed
});

onDeactivated(() => {
  console.log("Component cached — cleanup timers, subscriptions");
});
</script>
```

---

## 6. v-once — Static Content

Use `v-once` to render a subtree only once. After the first render, it is treated as static HTML.

```vue
<template>
  <!-- ✅ Static content that never changes -->
  <footer v-once>
    <p>© 2026 MyApp. All rights reserved.</p>
  </footer>
</template>
```

---

## 7. Virtualize Long Lists

Only render items visible in the viewport. Essential for lists with 100+ items.

Install: `npm install vue-virtual-scroller`

```vue
<script setup lang="ts">
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
</script>

<template>
  <RecycleScroller class="scroller" :items="items" :item-size="48" key-field="id" v-slot="{ item }">
    <div class="user-row">{{ item.name }}</div>
  </RecycleScroller>
</template>

<style scoped>
.scroller {
  height: 400px;
  overflow-y: auto;
}
</style>
```

---

## 8. Avoid Common Re-render Causes

| Cause                                        | Fix                                                |
| -------------------------------------------- | -------------------------------------------------- |
| New object/array created in template         | Move to `computed` or define outside the component |
| Deep reactive objects with many nested keys  | Use `shallowRef` and replace at the top level      |
| Large lists without `v-memo`                 | Add `v-memo` with meaningful dependencies          |
| State that doesn't affect the template       | Use a plain `ref` outside setup, not `reactive`    |
| Component re-mounts instead of reusing state | Wrap with `<KeepAlive>`                            |

---

## 9. Lazy Load Routes

All routes should be lazy-loaded. Pass a function returning `import()` to the route component.

```typescript
// src/router/index.ts
{
  path: "/dashboard",
  component: () => import("@/pages/DashboardPage/DashboardPage.vue"), // ✅ lazy
}
```

Never do:

```typescript
import { DashboardPage } from "@/pages"; // ❌ eagerly bundled with main chunk
{ path: "/dashboard", component: DashboardPage }
```
