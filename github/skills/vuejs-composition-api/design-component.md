---
name: vuejs-design-component
description: "Vue 3 component design — building reusable SFCs, props/emits design, composition patterns, presentational vs container split. Use when: creating a new component; deciding how to split responsibilities; making a component flexible and reusable."
---

# Vue 3 Component Design Skill

## Overview

This skill covers how to design clean, reusable Vue 3 components using the Composition API with `<script setup>` — clear props/emits contracts, composition over configuration, and separating logic from presentation.

---

## 1. Basic Component Template

```vue
<!-- src/components/AppButton/AppButton.vue -->
<script setup lang="ts">
interface Props {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  loading: false,
  disabled: false,
});

defineEmits<{ click: [] }>();
</script>

<template>
  <button
    :class="`btn btn--${props.variant} btn--${props.size}`"
    :disabled="props.disabled || props.loading"
  >
    <span v-if="props.loading" class="spinner" />
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
<script setup lang="ts">
interface Props {
  name: string;
  email: string;
  avatarUrl: string;
  isOnline: boolean;
}

defineProps<Props>();
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
<script setup lang="ts">
import { useUser } from "@/queries";
import UserCard from "@/components/UserCard/UserCard.vue";

const props = defineProps<{ userId: string }>();
const { data, isLoading, isError } = useUser(() => props.userId);
</script>

<template>
  <div v-if="isLoading"><Skeleton /></div>
  <div v-else-if="isError"><ErrorMessage /></div>
  <UserCard v-else v-bind="data" />
</template>
```

---

## 3. Composition Pattern (Slot-based)

Prefer composing small pieces over a single mega-component with many props.

```vue
<!-- src/components/AppCard/AppCard.vue -->
<script setup lang="ts">
defineProps<{ class?: string }>();
</script>

<template>
  <div :class="`card ${$props.class ?? ''}`">
    <slot />
  </div>
</template>
```

```vue
<!-- src/components/AppCard/AppCardHeader.vue -->
<template>
  <div class="card__header"><slot /></div>
</template>
```

```vue
<!-- src/components/AppCard/AppCardBody.vue -->
<template>
  <div class="card__body"><slot /></div>
</template>
```

```vue
<!-- src/components/AppCard/AppCardFooter.vue -->
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
<script setup lang="ts">
interface Props {
  modelValue: boolean;
  title: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const close = () => emit("update:modelValue", false);
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
  └── uses components/, queries/, mutations/, stores/

components/     ← reusable UI building blocks (no knowledge of routes or pages)
  └── uses composables/, utils/

layouts/        ← shell/chrome (AppBar, Sidebar, etc.)
  └── used by router/ as layout wrappers via <RouterView />

router/         ← Vue Router config only (createRouter, navigation guards)
  └── imports from pages/
```

**Rules:**

- `pages/` components may use queries, mutations, stores, and components freely.
- `components/` must never import from `pages/`, `router/`, `queries/`, or `mutations/` — they are pure UI.
- `router/` should be thin: only Vue Router config, navigation guards, no JSX/template logic.

```vue
<!-- ✅ Correct layering example -->

<!-- components/UserCard/UserCard.vue — pure UI, no data fetching -->
<script setup lang="ts">
defineProps<{ name: string; email: string }>();
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
<script setup lang="ts">
import { useUsers } from "@/queries";
import { UserCard } from "@/components";

const { data: users, isLoading } = useUsers();
</script>

<template>
  <p v-if="isLoading">Loading...</p>
  <UserCard v-for="user in users" :key="user.id" v-bind="user" />
</template>
```

```typescript
// router/index.ts — router config only
import { createRouter, createWebHistory } from "vue-router";
import { UsersPage } from "@/pages";

export const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/users", component: UsersPage }],
});
```

---

## 6. Component Design Checklist

- Props are the **public API** — keep them minimal and intentional.
- Use `withDefaults` to provide default values for optional props.
- Never manage async data inside a presentational component — use a container.
- If a component exceeds ~150 lines, split it into sub-components.
- Use `defineExpose` sparingly — prefer event-driven communication via emits.
- Use `v-model` with `modelValue` + `update:modelValue` emit for two-way binding.
