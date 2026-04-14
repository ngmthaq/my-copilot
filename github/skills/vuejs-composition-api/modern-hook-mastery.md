---
name: vuejs-composable-mastery
description: "Vue 3 composables — ref, reactive, computed, watch, watchEffect, template refs, and custom composables. Use when: working with any Composition API primitive; writing a custom composable; managing reactive state or side effects."
---

# Vue 3 Composable Mastery Skill

## Overview

This skill covers every commonly used Vue 3 Composition API primitive with clear rules and examples. Use it when writing or debugging reactive state, or when creating custom composables.

---

## 1. ref

Creates a reactive reference to a value. Access/mutate via `.value` in `<script>`, but directly in `<template>`.

```typescript
import { ref } from "vue";

const count = ref(0);

// ✅ Use functional update pattern for values based on previous state
const increment = () => count.value++;

// In template: {{ count }} (no .value needed)
```

```typescript
// ✅ Object ref — replace entire value or use reactive() for nested updates
const form = ref({ name: "", email: "" });

const updateName = (name: string) => {
  form.value = { ...form.value, name };
};
```

---

## 2. reactive

Creates a deeply reactive object. No `.value` needed — access properties directly.

```typescript
import { reactive } from "vue";

const state = reactive({
  name: "",
  email: "",
  isLoading: false,
});

// ✅ Mutate properties directly
state.name = "Alice";
state.isLoading = true;

// ⚠️ Do NOT destructure — reactivity is lost
// const { name } = state; // ❌ name is no longer reactive
```

> **Rule:** Use `ref` for primitives and single values. Use `reactive` for objects when you need many reactive properties without `.value` syntax.

---

## 3. computed

Creates a derived reactive value. Only recalculates when dependencies change (cached).

```typescript
import { ref, computed } from "vue";

const products = ref<Product[]>([]);
const searchTerm = ref("");

// ✅ Only re-filters when products or searchTerm changes
const filtered = computed(() =>
  products.value.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.value.toLowerCase()),
  ),
);

// In template: {{ filtered }} (automatically unwrapped)
```

```typescript
// ✅ Writable computed
const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (value) => {
    const [first, last] = value.split(" ");
    firstName.value = first;
    lastName.value = last;
  },
});
```

> **Rule:** Never put side effects inside `computed`. Use `watch` or `watchEffect` for side effects.

---

## 4. watch

Watches one or more reactive sources and runs a callback when they change.

```typescript
import { ref, watch } from "vue";

const userId = ref("1");

// ✅ Watch a single ref
watch(userId, async (newId, oldId) => {
  console.log(`Changed from ${oldId} to ${newId}`);
  await fetchUser(newId);
});

// ✅ Watch multiple sources
const page = ref(1);
const query = ref("");
watch([page, query], ([newPage, newQuery]) => {
  console.log("page:", newPage, "query:", newQuery);
});

// ✅ Watch a reactive object property with getter
watch(
  () => user.value?.role,
  (role) => {
    if (role === "admin") redirectToAdmin();
  },
);
```

```typescript
// ✅ Immediate watch — runs on mount too
watch(userId, fetchUser, { immediate: true });

// ✅ Deep watch — watches nested changes in an object
watch(
  form,
  (newForm) => {
    console.log("form changed", newForm);
  },
  { deep: true },
);
```

**Watch options:**

| Option      | Effect                               |
| ----------- | ------------------------------------ |
| `immediate` | Run callback immediately on mount    |
| `deep`      | Watch nested object property changes |
| `once`      | Stop watching after first trigger    |

---

## 5. watchEffect

Automatically tracks reactive dependencies used inside the callback. Runs immediately.

```typescript
import { ref, watchEffect } from "vue";

const userId = ref("1");
const user = ref<User | null>(null);

// ✅ Automatically re-runs whenever userId.value changes
watchEffect(async () => {
  user.value = await fetchUser(userId.value);
});

// ✅ Cleanup — use onCleanup to cancel stale async work
watchEffect(async (onCleanup) => {
  let cancelled = false;
  onCleanup(() => {
    cancelled = true;
  });

  const data = await fetchUser(userId.value);
  if (!cancelled) user.value = data;
});
```

> **Use `watch` when:** you need old value, want lazy (non-immediate) behavior, or want to watch a specific source explicitly.
> **Use `watchEffect` when:** the callback naturally reads from multiple reactive sources.

---

## 6. Template Refs

Access DOM elements or child component instances with `ref`.

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";

// ✅ Use case 1: Access a DOM element
const inputRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
  inputRef.value?.focus();
});
</script>

<template>
  <input ref="inputRef" />
</template>
```

```vue
<script setup lang="ts">
import { ref } from "vue";

// ✅ Use case 2: Store a mutable value without triggering re-renders
// Use a plain ref (not computed) — changes don't cause template re-render unless used there
const intervalId = ref<ReturnType<typeof setInterval> | null>(null);

const start = () => {
  intervalId.value = setInterval(() => console.log("tick"), 1000);
};

const stop = () => {
  if (intervalId.value) clearInterval(intervalId.value);
};
</script>
```

---

## 7. Custom Composables

Extract reusable stateful logic into a `use*` function. Always return reactive refs, not raw values.

```typescript
// src/composables/useLocalStorage.ts
import { ref, watch } from "vue";

export function useLocalStorage<T>(key: string, initial: T) {
  const stored = localStorage.getItem(key);
  const value = ref<T>(stored ? (JSON.parse(stored) as T) : initial);

  watch(
    value,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue));
    },
    { deep: true },
  );

  return value;
}

// Usage
const token = useLocalStorage<string | null>("auth-token", null);
token.value = "jwt-xxx"; // automatically persisted
```

```typescript
// src/composables/useDebounce.ts
import { ref, watch } from "vue";

export function useDebounce<T>(source: () => T, delay = 300) {
  const debounced = ref<T>(source()) as Ref<T>;

  watch(source, (newValue) => {
    const timer = setTimeout(() => {
      debounced.value = newValue;
    }, delay);
    return () => clearTimeout(timer);
  });

  return debounced;
}

// Usage in a search component
const searchTerm = ref("");
const debouncedSearch = useDebounce(() => searchTerm.value, 400);
```

---

## Composable Rules (Always Follow)

1. Composables must start with `use`.
2. Call composable top-level inside `<script setup>` or another composable — never inside conditionals, loops, or event handlers.
3. Always return refs or reactive objects — never return raw primitive values.
4. Clean up subscriptions, timers, or event listeners in `onUnmounted()` or via the `onCleanup` callback in `watchEffect`.
