---
name: reactjs-unit-test
description: "React.js unit testing — Vitest + React Testing Library: rendering components, querying elements, simulating user events, testing async behavior, mocking hooks, and Storybook for component documentation. Use when: writing unit or integration tests for React components; writing stories for component documentation."
---

# React.js Unit Testing Skill

## Overview

This skill covers testing React components with **Vitest** + **React Testing Library (RTL)** and documenting components with **Storybook**. RTL encourages testing the way users actually interact with the UI, not implementation details.

Install: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`

---

## 1. Vite / Vitest Setup

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
// src/components/Button/Button.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("is disabled when isLoading is true", () => {
    render(<Button isLoading>Click me</Button>);
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
import { render, screen, waitFor } from "@testing-library/react";

// ✅ Use findBy* for async elements (returns a promise)
it("shows user list after loading", async () => {
  render(<UserList />);

  // Loading state first
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Wait for data
  const userItem = await screen.findByText("Alice");
  expect(userItem).toBeInTheDocument();
});

// ✅ Use waitFor for assertions about disappearing elements
it("hides spinner after data loads", async () => {
  render(<UserList />);
  await waitFor(() => {
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
```

---

## 5. Wrapping Providers

Components that use query client, context, or MUI theme need wrappers in tests.

```typescript
// src/tests/utils.tsx — custom render with all providers
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/providers/ThemeProvider";

function AllProviders({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }, // no retries in tests
  });
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Usage
renderWithProviders(<UserList />);
```

---

## 6. Mocking Modules & Hooks

```typescript
// Mock a whole module
vi.mock("@/services/userService", () => ({
  userService: {
    getAll: vi.fn().mockResolvedValue([{ id: "1", name: "Alice" }]),
  },
}));

// Mock a custom hook
vi.mock("@/hooks/useAuth", () => ({
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
  const onSubmit = vi.fn();

  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/email/i), "alice@example.com");
  await user.type(screen.getByLabelText(/password/i), "secret1234");
  await user.click(screen.getByRole("button", { name: /login/i }));

  await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
    email: "alice@example.com",
    password: "secret1234",
  }));
});

it("shows validation error for invalid email", async () => {
  const user = userEvent.setup();

  render(<LoginForm onSubmit={vi.fn()} />);
  await user.type(screen.getByLabelText(/email/i), "not-an-email");
  await user.click(screen.getByRole("button", { name: /login/i }));

  expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
});
```

---

## 8. Storybook \u2014 Component Documentation

Storybook runs alongside tests. Each component can have a `.stories.tsx` file that documents its variants.

Install: `npm install -D @storybook/react-vite @storybook/addon-essentials`

```
.storybook/
\u251c\u2500\u2500 main.ts        # Storybook config
\u2514\u2500\u2500 preview.ts     # Global decorators (Theme, i18n, etc.)
```

`typescript\n// .storybook/main.ts\nimport type { StorybookConfig } from \"@storybook/react-vite\";\n\nconst config: StorybookConfig = {\n  stories: [\"../src/**/*.stories.@(ts|tsx)\"],\n  addons: [\"@storybook/addon-essentials\"],\n  framework: \"@storybook/react-vite\",\n};\n\nexport default config;\n`

`typescript\n// .storybook/preview.ts\nimport type { Preview } from \"@storybook/react\";\nimport { ThemeProvider } from \"../src/providers/ThemeProvider\";\n\nconst preview: Preview = {\n  decorators: [\n    (Story) => (\n      <ThemeProvider>\n        <Story />\n      </ThemeProvider>\n    ),\n  ],\n  parameters: {\n    controls: { maturity: \"alpha\" },\n  },\n};\n\nexport default preview;\n`\n\n`typescript\n// src/components/Button/Button.stories.tsx\nimport type { Meta, StoryObj } from \"@storybook/react\";\nimport { Button } from \"./Button\";\n\nconst meta: Meta<typeof Button> = {\n  title: \"Components/Button\",\n  component: Button,\n  tags: [\"autodocs\"],     // auto-generates a Docs page\n  args: {\n    children: \"Click me\", // default arg for all stories\n  },\n};\n\nexport default meta;\ntype Story = StoryObj<typeof Button>;\n\n// Each named export = one story variant\nexport const Primary: Story = {\n  args: { variant: \"contained\", color: \"primary\" },\n};\n\nexport const Secondary: Story = {\n  args: { variant: \"outlined\", color: \"secondary\" },\n};\n\nexport const Loading: Story = {\n  args: { isLoading: true },\n};\n\nexport const Disabled: Story = {\n  args: { disabled: true },\n};\n`\n\n`bash\n# Run Storybook\nnpx storybook dev -p 6006\n\n# Build static Storybook\nnpx storybook build\n`
