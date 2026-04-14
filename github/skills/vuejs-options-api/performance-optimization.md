---
name: vuejs-options-api-performance-optimization
description: "Vue 3 Options API performance — computed caching, defineAsyncComponent, v-memo, keep-alive, v-once, and avoiding unnecessary re-renders. Use when: a component re-renders too often; reducing initial bundle size; making lists or expensive calculations faster."
---

# Vue 3 Options API Performance Optimization Skill

## Overview

This skill covers practical Vue 3 performance techniques using the Options API. Always profile first — optimize only what you can measure.

---

## 0. Profile First

Before optimizing, confirm there is actually a problem:

1. Open **Vue DevTools** → Performance tab → Record an interaction.
2. Look for components that render unexpectedly or take long.
3. Then apply the technique that matches the root cause.

---

## 1. computed — Cached Derived State

`computed` properties are cached — they only recalculate when their reactive dependencies change.

```vue
<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Product } from "@/types";

export default defineComponent({
  name: "ProductList",
  props: {
    products: { type: Array as PropType<Product[]>, required: true },
  },
  data() {
    return {
      searchTerm: "",
    };
  },
  computed: {
    // ✅ Only re-filters when products or searchTerm changes
    filtered(): Product[] {
      return this.products.filter((p) =>
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
      );
    },
  },
});
</script>
```

> **Rule:** Always use `computed` for derived values. Never re-derive in the template directly when the computation is non-trivial.

---

## 2. Object.freeze — Skip Deep Reactivity for Static Data

Use `Object.freeze()` for large, read-only datasets. Vue won't add reactive getters/setters to frozen objects.

```vue
<script lang="ts">
import { defineComponent } from "vue";
import type { Country } from "@/types";

export default defineComponent({
  name: "CountryList",
  data() {
    return {
      // ✅ Large static list — freeze to skip reactive overhead
      countries: Object.freeze(countriesData) as Country[],
    };
  },
});
</script>
```

---

## 3. defineAsyncComponent — Lazy Loading

Split large components so they only load when needed.

```vue
<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";
import Spinner from "@/components/Spinner/Spinner.vue";

export default defineComponent({
  name: "AdminPage",
  components: {
    // ✅ AdminDashboard bundle is only downloaded when rendered
    AdminDashboard: defineAsyncComponent(
      () => import("@/pages/AdminDashboard/AdminDashboard.vue"),
    ),

    // ✅ With loading/error states
    HeavyChart: defineAsyncComponent({
      loader: () => import("@/components/HeavyChart/HeavyChart.vue"),
      loadingComponent: Spinner,
      delay: 200,
      timeout: 10000,
    }),
  },
});
</script>

<template>
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
  <div
    v-for="user in users"
    :key="user.id"
    v-memo="[user.id, selected === user.id]"
  >
    <UserRow :user="user" :is-selected="selected === user.id" />
  </div>
</template>
```

> **Rule:** Only use `v-memo` on list items with expensive render trees. On simple items, the memo check itself costs more than re-rendering.

---

## 5. keep-alive — Cache Component State

`<KeepAlive>` caches a component's state when it is removed from the DOM, so it doesn't reset when navigating back.

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TabContainer",
  data() {
    return {
      activeTab: "TabOne",
    };
  },
});
</script>

<template>
  <KeepAlive :max="5">
    <component :is="activeTab" />
  </KeepAlive>
</template>
```

Inside cached components, use `activated` / `deactivated` lifecycle hooks:

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CachedPage",
  activated() {
    console.log("Component restored from cache");
    // Refresh data if needed
  },
  deactivated() {
    console.log("Component cached — cleanup timers, subscriptions");
  },
});
</script>
```

---

## 6. v-once — Static Content

Use `v-once` to render a subtree only once. After the first render, it is treated as static HTML.

```vue
<template>
  <footer v-once>
    <p>&copy; 2026 MyApp. All rights reserved.</p>
  </footer>
</template>
```

---

## 7. Virtualize Long Lists

Only render items visible in the viewport. Essential for lists with 100+ items.

Install: `npm install vue-virtual-scroller`

```vue
<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

export default defineComponent({
  name: "VirtualList",
  components: { RecycleScroller },
  props: {
    items: {
      type: Array as PropType<{ id: string; name: string }[]>,
      required: true,
    },
  },
});
</script>

<template>
  <RecycleScroller
    class="scroller"
    :items="items"
    :item-size="48"
    key-field="id"
    v-slot="{ item }"
  >
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

| Cause                                        | Fix                                       |
| -------------------------------------------- | ----------------------------------------- |
| New object/array created in template         | Move to `computed` or `data()`            |
| Deep reactive objects with many nested keys  | Use `Object.freeze()` for read-only data  |
| Large lists without `v-memo`                 | Add `v-memo` with meaningful dependencies |
| State that doesn't affect the template       | Store it as a non-reactive class field    |
| Component re-mounts instead of reusing state | Wrap with `<KeepAlive>`                   |

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
