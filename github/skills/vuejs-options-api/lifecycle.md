---
name: vuejs-options-api-lifecycle
description: "Vue 3 Options API lifecycle hooks — created, mounted, unmounted, updated, beforeMount, beforeUnmount, activated, deactivated, and execution order. Use when: running code when a component creates, mounts, or unmounts; reacting to DOM updates; managing resources in cached components."
---

# Vue 3 Options API Lifecycle Hooks Skill

## Overview

This skill covers all Vue 3 lifecycle hooks available in the Options API. Hooks are methods defined on the component options that run at specific points in a component's life.

---

## 1. Lifecycle Order

```
beforeCreate  — instance created, data/computed/methods NOT available yet
  │
created       — instance created, data/computed/methods available ✅, no DOM yet
  │
beforeMount   — template compiled, DOM not yet created
  │
mounted       — DOM created and attached ✅ most commonly used for DOM access
  │
[component is active — reactive updates may occur]
  │
beforeUpdate  — before the DOM is patched
  │
updated       — after the DOM is patched ⚠️ avoid state mutations here
  │
[component is removed from DOM]
  │
beforeUnmount — before teardown (DOM still accessible)
  │
unmounted     — after teardown ✅ cleanup timers, subscriptions
```

---

## 2. beforeCreate / created

`beforeCreate` runs before the instance is fully initialized — `data`, `computed`, and `methods` are not yet available. `created` runs after initialization — reactive data is ready, but no DOM.

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UserPage",
  data() {
    return {
      userId: "",
    };
  },
  beforeCreate() {
    // ⚠️ this.userId is NOT available here
    console.log("beforeCreate — no access to data or methods");
  },
  created() {
    // ✅ this.userId IS available here — no DOM yet
    console.log("created — data ready, no DOM");
    this.userId = (this.$route?.params?.userId as string) ?? "";
  },
});
</script>
```

> **Rule:** Use `created` for data initialization, API calls, or route param reading. Avoid `beforeCreate` unless working with plugins or low-level setup.

---

## 3. mounted

Runs after the component's DOM is created and inserted. Use for DOM access, focus, or starting subscriptions.

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FocusInput",
  mounted() {
    // ✅ DOM is available here
    (this.$refs.inputRef as HTMLInputElement)?.focus();
  },
});
</script>

<template>
  <input ref="inputRef" />
</template>
```

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TimerComponent",
  data() {
    return {
      count: 0,
      intervalId: null as ReturnType<typeof setInterval> | null,
    };
  },
  mounted() {
    // ✅ Start timer when component enters the DOM
    this.intervalId = setInterval(() => {
      this.count++;
    }, 1000);
  },
  beforeUnmount() {
    // ✅ Always clean up timers
    if (this.intervalId) clearInterval(this.intervalId);
  },
});
</script>
```

---

## 4. unmounted

Runs after the component is removed from the DOM. Use for cleanup: clear timers, remove event listeners, cancel subscriptions.

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "WindowResize",
  data() {
    return { width: window.innerWidth };
  },
  methods: {
    handleResize() {
      this.width = window.innerWidth;
    },
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
  },
  unmounted() {
    window.removeEventListener("resize", this.handleResize);
  },
});
</script>
```

---

## 5. beforeMount

Runs just before the component is mounted. The template is compiled, but DOM does not exist yet — `$el` and `$refs` are unavailable.

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "PreMountSetup",
  beforeMount() {
    console.log("About to mount — no DOM yet");
    // Useful for non-reactive setup before rendering
  },
});
</script>
```

---

## 6. updated

Runs after the component re-renders due to a reactive state change. The DOM reflects the latest state.

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ListTracker",
  data() {
    return { items: [] as string[] };
  },
  updated() {
    // ✅ Respond to DOM changes after re-render
    console.log("List re-rendered, new length:", this.items.length);

    // ⚠️ Never mutate reactive state inside updated — it triggers an infinite loop
  },
});
</script>
```

---

## 7. beforeUnmount

Runs just before the component is torn down. Component is still fully functional here — a good place for last-minute cleanup.

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "DraftSaver",
  beforeUnmount() {
    // ✅ Component is still functional — save draft state, log analytics
    this.saveDraft();
    console.log("Component about to be destroyed");
  },
  methods: {
    saveDraft() {
      localStorage.setItem("draft", JSON.stringify(this.form));
    },
  },
});
</script>
```

---

## 8. activated / deactivated (KeepAlive)

Only triggered inside components wrapped by `<KeepAlive>`. Use to refresh data or clean up when the component is cached/restored.

```vue
<script lang="ts">
import { defineComponent } from "vue";
import { userService } from "@/services";
import type { User } from "@/types";

export default defineComponent({
  name: "CachedUserList",
  data() {
    return { users: [] as User[] };
  },
  async activated() {
    // ✅ Re-fetch fresh data every time the component is shown from cache
    this.users = await userService.getUsers();
  },
  deactivated() {
    // ✅ Stop polling or heavy work when component is hidden
    console.log("Component deactivated — now cached");
  },
});
</script>
```

```vue
<!-- Parent wraps with KeepAlive -->
<template>
  <KeepAlive :max="5">
    <component :is="activeTab" />
  </KeepAlive>
</template>
```

---

## 9. errorCaptured

Captures errors from any descendant component. Return `false` to prevent the error from propagating.

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ErrorBoundary",
  data() {
    return { error: null as Error | null };
  },
  errorCaptured(err: Error, instance: any, info: string) {
    this.error = err;
    console.error("Caught in component:", info, err);
    return false; // stop propagation
  },
});
</script>

<template>
  <div v-if="error" class="error-boundary">Something went wrong: {{ error.message }}</div>
  <slot v-else />
</template>
```

---

## 10. Lifecycle in Mixins

Lifecycle hooks work inside mixins — both the mixin and the component hooks run. Mixin hooks run first.

```typescript
// src/mixins/logMixin.ts
import { defineComponent } from "vue";

export const logMixin = defineComponent({
  created() {
    console.log(`${this.$options.name} — mixin created`);
  },
  mounted() {
    console.log(`${this.$options.name} — mixin mounted`);
  },
});
```

```vue
<script lang="ts">
import { defineComponent } from "vue";
import { logMixin } from "@/mixins";

export default defineComponent({
  name: "MyComponent",
  mixins: [logMixin],
  created() {
    // Runs AFTER the mixin's created hook
    console.log("MyComponent — component created");
  },
});
</script>
```

Output:

```
MyComponent — mixin created
MyComponent — component created
```

---

## Hook Reference

| Hook            | When it runs                                            |
| --------------- | ------------------------------------------------------- |
| `beforeCreate`  | Instance initializing — no data/methods yet             |
| `created`       | Instance created — data/methods available, no DOM ✅    |
| `beforeMount`   | Before first render — no DOM yet                        |
| `mounted`       | After first render — DOM available ✅                   |
| `beforeUpdate`  | Before reactive update re-renders                       |
| `updated`       | After reactive update re-renders                        |
| `beforeUnmount` | Before component teardown — DOM still accessible        |
| `unmounted`     | After component teardown — clean up timers/listeners ✅ |
| `activated`     | Component restored from `<KeepAlive>` cache             |
| `deactivated`   | Component cached by `<KeepAlive>`                       |
| `errorCaptured` | Error thrown in a descendant component                  |
