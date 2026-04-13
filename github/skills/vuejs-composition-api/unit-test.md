---
name: vuejs-unit-test
description: "Vue 3 unit testing — Vitest + Vue Testing Library: rendering components, querying elements, simulating user events, testing async behavior, mocking composables, and Storybook for component documentation. Use when: writing unit or integration tests for Vue 3 components; writing stories for component documentation."
---

# Vue 3 Unit Testing Skill

## Overview

This skill covers testing Vue 3 components with **Vitest** + **Vue Testing Library (VTL)** and documenting components with **Storybook**. VTL encourages testing the way users actually interact with the UI, not implementation details.

Install: `npm install -D vitest @testing-library/vue @testing-library/jest-dom @testing-library/user-event jsdom`

---

## 1. Vite / Vitest Setup

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
  },
});
```

```typescript
// src/setupTests.ts
import "@testing-library/jest-dom";
```

---

## 2. Basic Component Test

```typescript
// src/components/AppButton/AppButton.test.ts
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import AppButton from "./AppButton.vue";

describe("AppButton", () => {
  it("renders slot content", () => {
    render(AppButton, { slots: { default: "Click me" } });
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("emits click when clicked", async () => {
    const user = userEvent.setup();
    const { emitted } = render(AppButton, { slots: { default: "Click me" } });

    await user.click(screen.getByRole("button"));

    expect(emitted()).toHaveProperty("click");
  });

  it("is disabled when loading is true", () => {
    render(AppButton, { props: { loading: true }, slots: { default: "Click me" } });
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

---

## 3. Querying Elements — Priority Order

Use queries in this order (most accessible → least):

| Query                  | Use when                                     |
| ---------------------- | -------------------------------------------- |
| `getByRole`            | Buttons, inputs, headings, links (preferred) |
| `getByLabelText`       | Form inputs with labels                      |
| `getByPlaceholderText` | Inputs with placeholder only                 |
| `getByText`            | Any visible text content                     |
| `getByTestId`          | Last resort — add `data-testid` to element   |

```typescript
screen.getByRole("button", { name: /submit/i }); // ✅ Best
screen.getByLabelText(/email/i); // ✅ Good
screen.getByTestId("submit-button"); // ⚠️ Avoid if possible
```

---

## 4. Testing Async Behavior

```typescript
import { render, screen, waitFor } from "@testing-library/vue";

// ✅ Use findBy* for async elements (returns a promise)
it("shows user list after loading", async () => {
  render(UserList);

  // Loading state first
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Wait for data
  const userItem = await screen.findByText("Alice");
  expect(userItem).toBeInTheDocument();
});

// ✅ Use waitFor for assertions about disappearing elements
it("hides spinner after data loads", async () => {
  render(UserList);
  await waitFor(() => {
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
```

---

## 5. Wrapping Providers

Components that use a query client, Pinia stores, Vue Router, or Vuetify need wrappers in tests.

```typescript
// src/tests/utils.ts — custom render with all providers
import { render, type RenderOptions } from "@testing-library/vue";
import { createPinia } from "pinia";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import { createRouter, createMemoryHistory } from "vue-router";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";

const vuetify = createVuetify({ components, directives });

export function renderWithProviders(
  component: Component,
  options: RenderOptions & { props?: Record<string, unknown>; slots?: Record<string, string> } = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }, // no retries in tests
  });

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/", component: { template: "<div />" } }],
  });

  return render(component, {
    global: {
      plugins: [createPinia(), [VueQueryPlugin, { queryClient }], router, vuetify],
    },
    ...options,
  });
}

// Usage
renderWithProviders(UserList);
```

---

## 6. Mocking Modules & Composables

```typescript
// Mock a whole module
vi.mock("@/utils/authApi", () => ({
  authApi: {
    get: vi.fn().mockResolvedValue({ data: { data: [{ id: "1", name: "Alice" }] } }),
  },
}));

// Mock a composable
vi.mock("@/composables/useAuth", () => ({
  useAuth: () => ({
    user: { id: "1", name: "Alice", role: "admin" },
    logout: vi.fn(),
  }),
}));
```

---

## 7. Testing a Form

```typescript
it("submits the form with valid data", async () => {
  const user = userEvent.setup();
  const { emitted } = renderWithProviders(LoginForm);

  await user.type(screen.getByLabelText(/email/i), "alice@example.com");
  await user.type(screen.getByLabelText(/password/i), "secret1234");
  await user.click(screen.getByRole("button", { name: /login/i }));

  await waitFor(() => {
    expect(emitted("submit")).toBeTruthy();
    expect(emitted("submit")![0]).toEqual([
      {
        email: "alice@example.com",
        password: "secret1234",
      },
    ]);
  });
});

it("shows validation error for invalid email", async () => {
  const user = userEvent.setup();

  renderWithProviders(LoginForm);
  await user.type(screen.getByLabelText(/email/i), "not-an-email");
  await user.click(screen.getByRole("button", { name: /login/i }));

  expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
});
```

---

## 8. Storybook — Component Documentation

Storybook runs alongside tests. Each component can have a `.stories.ts` file that documents its variants.

Install: `npm install -D @storybook/vue3-vite @storybook/addon-essentials`

```
.storybook/
├── main.ts        # Storybook config
└── preview.ts     # Global decorators (Vuetify, plugins, etc.)
```

```typescript
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/vue3-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts)"],
  addons: ["@storybook/addon-essentials"],
  framework: "@storybook/vue3-vite",
};

export default config;
```

```typescript
// .storybook/preview.ts
import type { Preview } from "@storybook/vue3";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";

const vuetify = createVuetify({ components, directives });

const preview: Preview = {
  decorators: [
    (story) => ({
      components: { story: story() },
      setup() {
        return {};
      },
      template: `<v-app><story /></v-app>`,
    }),
  ],
};

export default preview;
```

```typescript
// src/components/AppButton/AppButton.stories.ts
import type { Meta, StoryObj } from "@storybook/vue3";
import AppButton from "./AppButton.vue";

const meta: Meta<typeof AppButton> = {
  title: "Components/AppButton",
  component: AppButton,
  tags: ["autodocs"],
  args: {
    default: "Click me", // default slot content
  },
};

export default meta;
type Story = StoryObj<typeof AppButton>;

export const Primary: Story = {
  args: { variant: "primary" },
};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
```

```bash
# Run Storybook
npx storybook dev -p 6006

# Build static Storybook
npx storybook build
```
