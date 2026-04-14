---
name: vuejs-lifecycle
description: "Vue 3 lifecycle hooks — onMounted, onUnmounted, onUpdated, onBeforeMount, onActivated, onDeactivated, and execution order. Use when: running code when a component mounts or unmounts; reacting to DOM updates; managing resources in cached components."
---

# Vue 3 Lifecycle Hooks Skill

## Overview

This skill covers all Vue 3 lifecycle hooks available in the Composition API (`<script setup>`). Hooks are registered functions that run at specific points in a component's life.

---

## 1. Lifecycle Order

```
setup() runs (synchronous)
  │
  ├── onBeforeMount   — DOM not yet created
  ├── onMounted       — DOM created and attached ✅ most commonly used
  │
  ├── [component is active — reactive updates may occur]
  │
  ├── onBeforeUpdate  — before the DOM is patched
  ├── onUpdated       — after the DOM is patched ⚠️ avoid state mutations here
  │
  ├── [component is removed from DOM]
  │
  ├── onBeforeUnmount — before teardown
  └── onUnmounted     — after teardown ✅ cleanup timers, subscriptions
```

---

## 2. onMounted

Runs after the component's DOM is created and inserted. Use for DOM access, focus, or starting subscriptions.

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";

const inputRef = ref<HTMLInputElement | null>(null);

// ✅ DOM is available here
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
import { onMounted } from "vue";
import { useUsers } from "@/queries";

const { refetch } = useUsers();

// ✅ Trigger a refetch on mount
onMounted(() => {
  refetch();
});
</script>
```

---

## 3. onUnmounted

Runs after the component is removed from the DOM. Use for cleanup: clear timers, remove event listeners, cancel subscriptions.

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const count = ref(0);
let intervalId: ReturnType<typeof setInterval>;

onMounted(() => {
  intervalId = setInterval(() => {
    count.value++;
  }, 1000);
});

// ✅ Always clean up timers
onUnmounted(() => {
  clearInterval(intervalId);
});
</script>
```

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

const handleResize = () => {
  console.log("window resized", window.innerWidth);
};

onMounted(() => window.addEventListener("resize", handleResize));
onUnmounted(() => window.removeEventListener("resize", handleResize));
</script>
```

---

## 4. onBeforeMount

Runs just before the component is mounted. The DOM does not exist yet — `$el` and template refs are unavailable.

```vue
<script setup lang="ts">
import { onBeforeMount } from "vue";

onBeforeMount(() => {
  console.log("Component about to mount — no DOM yet");
  // Useful for setting up non-reactive data or reading route params early
});
</script>
```

---

## 5. onUpdated

Runs after the component re-renders due to a reactive state change. The DOM reflects the latest state.

```vue
<script setup lang="ts">
import { ref, onUpdated } from "vue";

const list = ref<string[]>([]);

// ✅ Respond to DOM changes after re-render
onUpdated(() => {
  console.log("List re-rendered, new length:", list.value.length);
});

// ⚠️ Never mutate reactive state inside onUpdated — it triggers an infinite loop
</script>
```

---

## 6. onBeforeUnmount

Runs just before the component is torn down. Component is still fully functional here — a good place for last-minute cleanup.

```vue
<script setup lang="ts">
import { onBeforeUnmount } from "vue";

onBeforeUnmount(() => {
  console.log("Component about to be destroyed — DOM still accessible here");
  // Save draft state, log analytics, etc.
});
</script>
```

---

## 7. onActivated / onDeactivated (KeepAlive)

Only triggered inside components wrapped by `<KeepAlive>`. Use to refresh data or clean up when the component is cached/restored.

```vue
<script setup lang="ts">
import { onActivated, onDeactivated } from "vue";
import { useUsers } from "@/queries";

const { refetch } = useUsers();

// ✅ Re-fetch fresh data every time the component is shown from cache
onActivated(() => {
  refetch();
});

// ✅ Stop polling or heavy work when tab is hidden
onDeactivated(() => {
  console.log("Component deactivated — now cached");
});
</script>
```

---

## 8. onErrorCaptured

Captures errors from any descendant component. Return `false` to prevent the error from propagating.

```vue
<script setup lang="ts">
import { onErrorCaptured, ref } from "vue";

const error = ref<Error | null>(null);

onErrorCaptured((err, instance, info) => {
  error.value = err;
  console.error("Caught in component:", info, err);
  return false; // stop propagation
});
</script>

<template>
  <div v-if="error" class="error-boundary">
    Something went wrong: {{ error.message }}
  </div>
  <slot v-else />
</template>
```

---

## 9. Lifecycle in Custom Composables

Lifecycle hooks work inside composables — they bind to the component that called the composable.

```typescript
// src/composables/useWindowSize.ts
import { ref, onMounted, onUnmounted } from "vue";

export function useWindowSize() {
  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight);

  const update = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  };

  onMounted(() => window.addEventListener("resize", update));
  onUnmounted(() => window.removeEventListener("resize", update));

  return { width, height };
}

// Usage in any component
const { width, height } = useWindowSize();
```

---

## Hook Reference

| Hook              | When it runs                                            |
| ----------------- | ------------------------------------------------------- |
| `onBeforeMount`   | Before first render — no DOM yet                        |
| `onMounted`       | After first render — DOM available ✅                   |
| `onBeforeUpdate`  | Before reactive update re-renders                       |
| `onUpdated`       | After reactive update re-renders                        |
| `onBeforeUnmount` | Before component teardown — DOM still accessible        |
| `onUnmounted`     | After component teardown — clean up timers/listeners ✅ |
| `onActivated`     | Component restored from `<KeepAlive>` cache             |
| `onDeactivated`   | Component cached by `<KeepAlive>`                       |
| `onErrorCaptured` | Error thrown in a descendant component                  |
