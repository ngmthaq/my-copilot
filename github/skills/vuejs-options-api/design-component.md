---
name: vuejs-options-api-design-component
description: "Vue 3 Options API component design — building reusable SFCs, props/emits design, slot patterns, presentational vs container split. Use when: creating a new component; deciding how to split responsibilities; making a component flexible and reusable."
---

# Vue 3 Options API Component Design Skill

## Overview

This skill covers how to design clean, reusable Vue 3 components using the Options API — clear props/emits contracts, slot-based composition, and separating logic from presentation.

---

## 1. Basic Component Template

```vue
<!-- src/components/AppButton/AppButton.vue -->
<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "AppButton",
  props: {
    variant: {
      type: String as PropType<"primary" | "secondary" | "danger">,
      default: "primary",
    },
    size: {
      type: String as PropType<"sm" | "md" | "lg">,
      default: "md",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["click"],
});
</script>

<template>
  <button :class="`btn btn--${variant} btn--${size}`" :disabled="disabled || loading">
    <span v-if="loading" class="spinner" />
    <slot v-else />
  </button>
</template>
```

---

## 2. Presentational vs Container Split

Keep UI rendering and data fetching separate.

```vue
<!-- ✅ Presentational — only cares about display -->
<!-- src/components/UserCard/UserCard.vue -->
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UserCard",
  props: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatarUrl: { type: String, required: true },
    isOnline: { type: Boolean, required: true },
  },
});
</script>

<template>
  <div class="user-card">
    <img :src="avatarUrl" :alt="name" />
    <h3>{{ name }}</h3>
    <p>{{ email }}</p>
    <span :class="isOnline ? 'badge--green' : 'badge--gray'">
      {{ isOnline ? "Online" : "Offline" }}
    </span>
  </div>
</template>
```

```vue
<!-- ✅ Container — handles data fetching, passes props down -->
<!-- src/pages/UserCardContainer/UserCardContainer.vue -->
<script lang="ts">
import { defineComponent } from "vue";
import UserCard from "@/components/UserCard/UserCard.vue";
import { userService } from "@/services";
import type { User } from "@/types";

export default defineComponent({
  name: "UserCardContainer",
  components: { UserCard },
  props: {
    userId: { type: String, required: true },
  },
  data() {
    return {
      user: null as User | null,
      isLoading: true,
      isError: false,
    };
  },
  async created() {
    try {
      this.user = await userService.getUser(this.userId);
    } catch {
      this.isError = true;
    } finally {
      this.isLoading = false;
    }
  },
});
</script>

<template>
  <div v-if="isLoading"><Skeleton /></div>
  <div v-else-if="isError"><ErrorMessage /></div>
  <UserCard v-else-if="user" v-bind="user" />
</template>
```

---

## 3. Composition Pattern (Slot-based)

Prefer composing small pieces over a single mega-component with many props.

```vue
<!-- src/components/AppCard/AppCard.vue -->
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AppCard",
  props: {
    class: { type: String, default: "" },
  },
});
</script>

<template>
  <div :class="`card ${$props.class}`">
    <slot />
  </div>
</template>
```

```vue
<!-- src/components/AppCard/AppCardHeader.vue -->
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({ name: "AppCardHeader" });
</script>

<template>
  <div class="card__header"><slot /></div>
</template>
```

```vue
<!-- src/components/AppCard/AppCardBody.vue -->
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({ name: "AppCardBody" });
</script>

<template>
  <div class="card__body"><slot /></div>
</template>
```

```vue
<!-- src/components/AppCard/AppCardFooter.vue -->
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({ name: "AppCardFooter" });
</script>

<template>
  <div class="card__footer"><slot /></div>
</template>
```

```vue
<!-- Usage -->
<template>
  <AppCard>
    <AppCardHeader>Title</AppCardHeader>
    <AppCardBody>Content goes here.</AppCardBody>
    <AppCardFooter>
      <AppButton>Save</AppButton>
    </AppCardFooter>
  </AppCard>
</template>
```

---

## 4. Named Slots Pattern

Use named slots to let callers control what renders in each region.

```vue
<!-- src/components/AppModal/AppModal.vue -->
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AppModal",
  props: {
    modelValue: { type: Boolean, required: true },
    title: { type: String, required: true },
  },
  emits: ["update:modelValue"],
  methods: {
    close() {
      this.$emit("update:modelValue", false);
    },
  },
});
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal">
        <h2>{{ title }}</h2>
        <div class="modal__body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="modal__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
```

```vue
<!-- Usage with v-model and named slot -->
<AppModal v-model="isOpen" title="Confirm Delete">
  Are you sure you want to delete this item?

  <template #footer>
    <AppButton variant="secondary" @click="isOpen = false">Cancel</AppButton>
    <AppButton variant="danger" @click="handleDelete">Delete</AppButton>
  </template>
</AppModal>
```

---

## 5. Component Hierarchy

Organize components into four layers — each layer knows about the one below it, never the one above.

```
pages/          ← page-level components (one per route, imported by router/)
  └── uses components/, services/, stores/

components/     ← reusable UI building blocks (no knowledge of routes or pages)
  └── uses mixins/, utils/

layouts/        ← shell/chrome (AppBar, Sidebar, etc.)
  └── used by router/ as layout wrappers via <RouterView />

router/         ← Vue Router config only (createRouter, navigation guards)
  └── imports from pages/
```

**Rules:**

- `pages/` components may use services, stores, and components freely.
- `components/` must never import from `pages/`, `router/`, or `services/` — they are pure UI.
- `router/` should be thin: only Vue Router config, navigation guards, no template logic.

```vue
<!-- ✅ Correct layering example -->

<!-- components/UserCard/UserCard.vue — pure UI, no data fetching -->
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UserCard",
  props: {
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
});
</script>

<template>
  <div class="card">
    <h3>{{ name }}</h3>
    <p>{{ email }}</p>
  </div>
</template>
```

```vue
<!-- pages/UsersPage/UsersPage.vue — fetches data, composes components -->
<script lang="ts">
import { defineComponent } from "vue";
import { UserCard } from "@/components";
import { userService } from "@/services";
import type { User } from "@/types";

export default defineComponent({
  name: "UsersPage",
  components: { UserCard },
  data() {
    return {
      users: [] as User[],
      isLoading: true,
    };
  },
  async created() {
    this.users = await userService.getUsers();
    this.isLoading = false;
  },
});
</script>

<template>
  <p v-if="isLoading">Loading...</p>
  <UserCard v-for="user in users" :key="user.id" v-bind="user" />
</template>
```

---

## 6. Component Design Checklist

- Props are the **public API** — keep them minimal and intentional.
- Use `default` values for optional props.
- Never manage async data inside a presentational component — use a container.
- If a component exceeds ~150 lines, split it into sub-components.
- Use `$refs` sparingly — prefer event-driven communication via emits.
- Use `v-model` with `modelValue` + `update:modelValue` emit for two-way binding.
- Always register child components in the `components` option.
