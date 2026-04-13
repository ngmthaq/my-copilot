---
name: vuejs-options-api-ui-styling
description: "Vue 3 Options API UI styling — Vuetify 3: theme setup, Vuetify components, inline styles, scoped CSS, dark mode, AG Grid for high-performance tables, and date pickers. Use when: styling components; customizing the theme; using Vuetify components or AG Grid."
---

# Vue 3 Options API UI & Styling Skill

## Overview

This project uses **Vuetify 3** as the primary component library and design system. AG Grid is used for high-performance data tables. Vuetify components work identically in template — the only difference is the `<script>` section uses `defineComponent()`.

Packages: `vuetify @mdi/font ag-grid-vue3 ag-grid-community`

---

## 1. Vuetify Setup

```typescript
// src/plugins/vuetify.ts
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

export const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#1976D2",
          secondary: "#9C27B0",
          error: "#B00020",
          success: "#4CAF50",
          warning: "#FB8C00",
        },
      },
    },
  },
});
```

```typescript
// src/main.ts
import { createApp } from "vue";
import { vuetify } from "@/plugins/vuetify";
import App from "./App.vue";

const app = createApp(App);
app.use(vuetify);
app.mount("#app");
```

---

## 2. Dark Mode

```typescript
// src/plugins/vuetify.ts
export const vuetify = createVuetify({
  theme: {
    defaultTheme: "light",
    themes: {
      light: { colors: { primary: "#1976D2" } },
      dark: { colors: { primary: "#64B5F6" } },
    },
  },
});
```

```vue
<script lang="ts">
import { defineComponent } from "vue";
import { useTheme } from "vuetify";

export default defineComponent({
  name: "ThemeToggle",
  setup() {
    // ✅ useTheme is a Composition API composable — use it in setup()
    const theme = useTheme();
    return { theme };
  },
  computed: {
    isDark(): boolean {
      return this.theme.global.current.value.dark;
    },
    themeIcon(): string {
      return this.isDark ? "mdi-weather-sunny" : "mdi-weather-night";
    },
  },
  methods: {
    toggleTheme() {
      this.theme.global.name.value = this.isDark ? "light" : "dark";
    },
  },
});
</script>

<template>
  <v-btn icon @click="toggleTheme">
    <v-icon>{{ themeIcon }}</v-icon>
  </v-btn>
</template>
```

---

## 3. Common Vuetify Components

Templates are identical to Composition API — only the `<script>` section changes.

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "LayoutDemo",
  data() {
    return {
      email: "",
      role: "",
      snackbar: false,
    };
  },
});
</script>

<template>
  <!-- Layout -->
  <v-container>
    <v-row>
      <v-col cols="12" md="6">Left</v-col>
      <v-col cols="12" md="6">Right</v-col>
    </v-row>
  </v-container>

  <!-- Buttons -->
  <v-btn color="primary" variant="elevated">Save</v-btn>
  <v-btn color="secondary" variant="outlined">Cancel</v-btn>
  <v-btn icon="mdi-delete" color="error" variant="text" />

  <!-- Card -->
  <v-card>
    <v-card-title>Card Title</v-card-title>
    <v-card-text>Content goes here.</v-card-text>
    <v-card-actions>
      <v-btn>Action</v-btn>
    </v-card-actions>
  </v-card>

  <!-- Text fields -->
  <v-text-field label="Email" type="email" v-model="email" />

  <!-- Select -->
  <v-select label="Role" :items="['admin', 'user']" v-model="role" />

  <!-- Badge and chip -->
  <v-chip color="success" size="small">Active</v-chip>
  <v-badge :content="5" color="error"><v-icon>mdi-bell</v-icon></v-badge>

  <!-- Loading / Skeleton -->
  <v-progress-circular indeterminate color="primary" />
  <v-skeleton-loader type="card" />

  <!-- Alert / Snackbar -->
  <v-alert type="error">Something went wrong.</v-alert>
  <v-snackbar v-model="snackbar" :timeout="3000">Saved!</v-snackbar>
</template>
```

---

## 4. Component Styling — Scoped CSS

```vue
<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "StatusBadge",
  props: {
    status: {
      type: String as PropType<"active" | "inactive" | "pending">,
      required: true,
    },
  },
});
</script>

<template>
  <span :class="['status-badge', `status-badge--${status}`]">
    {{ status }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.status-badge--active {
  background-color: #4caf50;
}
.status-badge--inactive {
  background-color: #f44336;
}
.status-badge--pending {
  background-color: #ff9800;
}
</style>
```

---

## 5. Vuetify Theme Tokens in Styles

```vue
<style>
/* Access Vuetify theme colors via CSS variables */
.my-element {
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}
</style>
```

---

## 6. Data Table — v-data-table

```vue
<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { User } from "@/types/user";

export default defineComponent({
  name: "UsersTable",
  props: {
    rows: { type: Array as PropType<User[]>, required: true },
  },
  data() {
    return {
      headers: [
        { title: "ID", key: "id", width: 80 },
        { title: "Name", key: "name", sortable: true },
        { title: "Email", key: "email" },
        { title: "Role", key: "role", width: 120 },
        { title: "", key: "actions", sortable: false },
      ],
    };
  },
  methods: {
    handleEdit(item: User) {
      this.$router.push({ name: "edit-user", params: { userId: item.id } });
    },
  },
});
</script>

<template>
  <v-data-table :headers="headers" :items="rows" :items-per-page="10" hover>
    <template #item.role="{ item }">
      <v-chip :color="item.role === 'admin' ? 'primary' : 'default'" size="small">
        {{ item.role }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <v-btn icon="mdi-pencil" size="small" variant="text" @click="handleEdit(item)" />
    </template>
  </v-data-table>
</template>
```

---

## 7. Date Picker

```vue
<script lang="ts">
import { defineComponent } from "vue";
import { VDateInput } from "vuetify/labs/VDateInput";

export default defineComponent({
  name: "DatePickerDemo",
  components: { VDateInput },
  data() {
    return {
      date: null as Date | null,
    };
  },
});
</script>

<template>
  <v-date-input v-model="date" label="Birth Date" prepend-icon="mdi-calendar" />
</template>
```

---

## 8. AG Grid — High-Performance Grid

Use AG Grid for very large datasets (10,000+ rows) where Vuetify DataTable performance is insufficient.

Install: `npm install ag-grid-vue3 ag-grid-community`

```vue
<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import type { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import type { User } from "@/types/user";

export default defineComponent({
  name: "UsersGrid",
  components: { AgGridVue },
  props: {
    rows: { type: Array as PropType<User[]>, required: true },
  },
  data() {
    return {
      colDefs: [
        { field: "name", headerName: "Name", flex: 1, sortable: true, filter: true },
        { field: "email", headerName: "Email", flex: 1 },
        { field: "role", headerName: "Role", width: 120 },
      ] as ColDef<User>[],
    };
  },
});
</script>

<template>
  <div class="ag-theme-material" style="height: 500px">
    <AgGridVue
      :rowData="rows"
      :columnDefs="colDefs"
      :pagination="true"
      :paginationPageSize="25"
      rowSelection="multiple"
    />
  </div>
</template>
```

---

## 9. Dialog (Modal) with Vuetify

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ConfirmDialog",
  data() {
    return {
      isOpen: false,
    };
  },
  emits: ["confirm"],
  methods: {
    open() {
      this.isOpen = true;
    },
    handleDelete() {
      this.$emit("confirm");
      this.isOpen = false;
    },
  },
});
</script>

<template>
  <v-btn @click="open">Open Dialog</v-btn>

  <v-dialog v-model="isOpen" max-width="500">
    <v-card>
      <v-card-title>Confirm Delete</v-card-title>
      <v-card-text>Are you sure you want to delete this item?</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="isOpen = false">Cancel</v-btn>
        <v-btn color="error" variant="elevated" @click="handleDelete">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
```
