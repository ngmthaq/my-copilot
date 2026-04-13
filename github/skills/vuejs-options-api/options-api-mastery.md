---
name: vuejs-options-api-mastery
description: "Vue 3 Options API mastery — data, computed, methods, watch, mixins, provide/inject, and custom directives. Use when: working with any Options API primitive; writing a mixin; managing reactive state or side effects in Options API components."
---

# Vue 3 Options API Mastery Skill

## Overview

This skill covers every commonly used Vue 3 Options API primitive with clear rules and examples. Use it when writing or debugging reactive state, or when creating reusable logic with mixins.

---

## 1. data — Reactive State

`data()` must be a function that returns a plain object. Every property in the returned object becomes reactive.

```vue
<script lang="ts">
import { defineComponent } from "vue";

interface CounterData {
  count: number;
  message: string;
}

export default defineComponent({
  name: "Counter",
  data(): CounterData {
    return {
      count: 0,
      message: "Hello",
    };
  },
});
</script>

<template>
  <p>{{ count }} — {{ message }}</p>
</template>
```

```typescript
// ✅ Object data — mutate properties directly via this
data() {
  return {
    form: { name: "", email: "" },
  };
},
methods: {
  updateName(name: string) {
    this.form.name = name;
  },
  resetForm() {
    // ✅ Reset by reassigning properties
    this.form = { name: "", email: "" };
  },
},
```

> **Rule:** Always type the return value of `data()` with an interface. Never add reactive properties after initialization — declare all in `data()`.

---

## 2. computed — Cached Derived State

Computed properties are cached and only recalculate when their dependencies change.

```vue
<script lang="ts">
import { defineComponent } from "vue";
import type { Product } from "@/types";

export default defineComponent({
  name: "ProductList",
  data() {
    return {
      products: [] as Product[],
      searchTerm: "",
    };
  },
  computed: {
    // ✅ Only re-filters when products or searchTerm changes
    filteredProducts(): Product[] {
      return this.products.filter((p) => p.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    },
    productCount(): number {
      return this.filteredProducts.length;
    },
  },
});
</script>
```

```typescript
// ✅ Writable computed (getter + setter)
computed: {
  fullName: {
    get(): string {
      return `${this.firstName} ${this.lastName}`;
    },
    set(value: string) {
      const [first, last] = value.split(" ");
      this.firstName = first;
      this.lastName = last;
    },
  },
},
```

> **Rule:** Never put side effects inside `computed`. Use `watch` for side effects. Computed properties should be pure derivations.

---

## 3. methods — Actions and Event Handlers

Methods are functions attached to the component instance. They are not cached — they re-execute every time they are called.

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Counter",
  data() {
    return { count: 0 };
  },
  methods: {
    increment() {
      this.count++;
    },
    decrement() {
      if (this.count > 0) this.count--;
    },
    reset() {
      this.count = 0;
    },
  },
});
</script>

<template>
  <p>{{ count }}</p>
  <button @click="increment">+</button>
  <button @click="decrement">-</button>
  <button @click="reset">Reset</button>
</template>
```

```typescript
// ✅ Async methods for API calls
methods: {
  async fetchUsers() {
    this.isLoading = true;
    this.error = null;
    try {
      this.users = await userService.getUsers();
    } catch (err: any) {
      this.error = err.message ?? "Failed to fetch users";
    } finally {
      this.isLoading = false;
    }
  },
},
```

> **Rule:** Use `methods` for event handlers and actions. Use `computed` for derived values — never use a method when a computed property would work.

---

## 4. watch — React to State Changes

Watchers run a callback when a watched reactive source changes.

```typescript
export default defineComponent({
  data() {
    return {
      userId: "1",
      searchTerm: "",
      page: 1,
    };
  },
  watch: {
    // ✅ Watch a single data property
    userId(newId: string, oldId: string) {
      console.log(`Changed from ${oldId} to ${newId}`);
      this.fetchUser(newId);
    },

    // ✅ Immediate watch — runs on component creation too
    searchTerm: {
      handler(newTerm: string) {
        this.page = 1; // reset pagination on search
        this.fetchUsers(newTerm, this.page);
      },
      immediate: true,
    },

    // ✅ Deep watch — watches nested object changes
    form: {
      handler(newForm: Record<string, unknown>) {
        console.log("form changed", newForm);
      },
      deep: true,
    },

    // ✅ Watch a nested property using dot notation
    "form.email"(newEmail: string) {
      this.validateEmail(newEmail);
    },
  },
});
```

**Watch options:**

| Option      | Effect                               |
| ----------- | ------------------------------------ |
| `immediate` | Run callback immediately on creation |
| `deep`      | Watch nested object property changes |

> **Rule:** Use `watch` for side effects (API calls, logging, analytics). Use `computed` for derived values.

---

## 5. mixins — Reusable Logic

Mixins allow sharing data, computed, methods, and lifecycle hooks across multiple components. All mixin options are merged into the component.

```typescript
// src/mixins/paginationMixin.ts
import { defineComponent } from "vue";

export const paginationMixin = defineComponent({
  data() {
    return {
      page: 1,
      pageSize: 10,
      totalItems: 0,
    };
  },
  computed: {
    totalPages(): number {
      return Math.ceil(this.totalItems / this.pageSize);
    },
    hasNextPage(): boolean {
      return this.page < this.totalPages;
    },
    hasPrevPage(): boolean {
      return this.page > 1;
    },
  },
  methods: {
    nextPage() {
      if (this.hasNextPage) this.page++;
    },
    prevPage() {
      if (this.hasPrevPage) this.page--;
    },
    goToPage(page: number) {
      if (page >= 1 && page <= this.totalPages) this.page = page;
    },
  },
});
```

```vue
<!-- Usage in a component -->
<script lang="ts">
import { defineComponent } from "vue";
import { paginationMixin } from "@/mixins";
import { userService } from "@/services";
import type { User } from "@/types";

export default defineComponent({
  name: "UsersPage",
  mixins: [paginationMixin],
  data() {
    return {
      users: [] as User[],
    };
  },
  watch: {
    page() {
      this.fetchUsers();
    },
  },
  async created() {
    await this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      const result = await userService.getUsers(this.page, this.pageSize);
      this.users = result.data;
      this.totalItems = result.total;
    },
  },
});
</script>

<template>
  <UserCard v-for="user in users" :key="user.id" v-bind="user" />
  <div>
    <button :disabled="!hasPrevPage" @click="prevPage">Previous</button>
    <span>Page {{ page }} of {{ totalPages }}</span>
    <button :disabled="!hasNextPage" @click="nextPage">Next</button>
  </div>
</template>
```

**Mixin merge rules:**

| Option     | Merge strategy                                         |
| ---------- | ------------------------------------------------------ |
| `data`     | Merged — component data wins on conflict               |
| `computed` | Merged — component computed wins on conflict           |
| `methods`  | Merged — component methods win on conflict             |
| Lifecycles | Both run — mixin hooks run first, then component hooks |

> **Rule:** Keep mixins small and focused. Avoid mixins that declare the same data/method names — naming collisions are a common source of bugs. Prefix mixin data properties if needed.

---

## 6. provide / inject — Dependency Injection

Pass data down without prop drilling. Works across any depth of component hierarchy.

```vue
<!-- Parent component — provide values -->
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AppProvider",
  provide() {
    return {
      theme: this.theme,
      toggleTheme: this.toggleTheme,
    };
  },
  data() {
    return {
      theme: "light" as "light" | "dark",
    };
  },
  methods: {
    toggleTheme() {
      this.theme = this.theme === "light" ? "dark" : "light";
    },
  },
});
</script>
```

```vue
<!-- Any descendant — inject values -->
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ThemeToggle",
  inject: ["theme", "toggleTheme"],
});
</script>

<template>
  <button @click="toggleTheme">Current: {{ theme }}</button>
</template>
```

```typescript
// ✅ Typed inject with default value
inject: {
  theme: {
    from: "theme",
    default: "light",
  },
},
```

> **Rule:** Use `provide/inject` for app-wide services (API clients, theme, i18n). For reactive global state, prefer Pinia stores.

---

## 7. $refs — Access DOM and Child Components

Use `ref` attribute on elements or components to get a reference. Access via `this.$refs`.

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FocusInput",
  mounted() {
    // ✅ Focus the input on mount
    (this.$refs.inputRef as HTMLInputElement).focus();
  },
});
</script>

<template>
  <input ref="inputRef" />
</template>
```

> **Rule:** Use `$refs` sparingly. Prefer event-driven communication via emits for parent-child interaction. `$refs` are only available after mounting.

---

## 8. $emit — Child-to-Parent Communication

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SearchInput",
  emits: {
    // ✅ Typed emits with runtime validation
    search: (query: string) => query.length >= 0,
    clear: () => true,
  },
  data() {
    return { query: "" };
  },
  methods: {
    handleSearch() {
      this.$emit("search", this.query);
    },
    handleClear() {
      this.query = "";
      this.$emit("clear");
    },
  },
});
</script>

<template>
  <div>
    <input v-model="query" @keyup.enter="handleSearch" />
    <button @click="handleSearch">Search</button>
    <button @click="handleClear">Clear</button>
  </div>
</template>
```

---

## Options API Rules (Always Follow)

1. Always wrap components with `defineComponent()` for proper TypeScript inference.
2. Type the return value of `data()` with an interface.
3. Use `computed` for derived values, `methods` for actions, `watch` for side effects.
4. Register all child components in the `components` option.
5. Clean up timers, listeners, and subscriptions in `beforeUnmount` or `unmounted`.
6. Keep mixins small and focused — avoid naming collisions with component properties.
