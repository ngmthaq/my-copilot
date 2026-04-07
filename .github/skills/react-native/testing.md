---
name: react-native-testing
description: "React Native testing — Jest + React Native Testing Library: component tests, async tests, mocking native modules, snapshot tests, and testing hooks. Use when: writing unit or component tests; mocking Expo modules; testing screens with navigation."
---

# React Native Testing Skill

## Overview

This skill covers testing React Native (Expo) apps with **Jest** and **React Native Testing Library (RNTL)**.

Install: `npx expo install jest-expo @testing-library/react-native @testing-library/jest-native`

### Jest Configuration

```json
// package.json
{
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)/|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)"
    ],
    "setupFilesAfterSetup": ["@testing-library/jest-native/extend-expect"]
  }
}
```

---

## 1. Basic Component Test

```typescript
// src/components/UserCard/UserCard.test.tsx
import { render, screen } from "@testing-library/react-native";
import { UserCard } from "./UserCard";

describe("UserCard", () => {
  const defaultProps = {
    name: "John Doe",
    email: "john@example.com",
    avatarUrl: "https://example.com/avatar.jpg",
    isOnline: true,
  };

  it("renders user name and email", () => {
    render(<UserCard {...defaultProps} />);

    expect(screen.getByText("John Doe")).toBeTruthy();
    expect(screen.getByText("john@example.com")).toBeTruthy();
  });

  it("shows online badge when user is online", () => {
    render(<UserCard {...defaultProps} isOnline={true} />);
    expect(screen.getByTestId("online-badge")).toBeTruthy();
  });

  it("shows offline badge when user is offline", () => {
    render(<UserCard {...defaultProps} isOnline={false} />);
    expect(screen.getByTestId("offline-badge")).toBeTruthy();
  });
});
```

---

## 2. Testing User Interactions

```typescript
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Counter } from "./Counter";

describe("Counter", () => {
  it("increments count on button press", () => {
    render(<Counter />);

    expect(screen.getByText("Count: 0")).toBeTruthy();

    fireEvent.press(screen.getByText("Increment"));

    expect(screen.getByText("Count: 1")).toBeTruthy();
  });

  it("calls onPress with current count", () => {
    const onPress = jest.fn();
    render(<Counter onPress={onPress} />);

    fireEvent.press(screen.getByText("Increment"));
    fireEvent.press(screen.getByText("Submit"));

    expect(onPress).toHaveBeenCalledWith(1);
  });
});
```

---

## 3. Testing Text Input

```typescript
import { render, screen, fireEvent } from "@testing-library/react-native";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("calls onSearch when text changes", () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    fireEvent.changeText(screen.getByPlaceholderText("Search..."), "hello");

    expect(onSearch).toHaveBeenCalledWith("hello");
  });
});
```

---

## 4. Testing Async Operations

```typescript
import { render, screen, waitFor } from "@testing-library/react-native";
import { UserListScreen } from "./UserListScreen";

// Mock the query hook
jest.mock("@/queries/useUsers", () => ({
  useUsers: jest.fn(),
}));

import { useUsers } from "@/queries/useUsers";

describe("UserListScreen", () => {
  it("shows loading indicator while fetching", () => {
    (useUsers as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<UserListScreen />);
    expect(screen.getByTestId("loading-indicator")).toBeTruthy();
  });

  it("renders user list when data is loaded", async () => {
    (useUsers as jest.Mock).mockReturnValue({
      data: [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
      ],
      isLoading: false,
      isError: false,
    });

    render(<UserListScreen />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeTruthy();
      expect(screen.getByText("Bob")).toBeTruthy();
    });
  });

  it("shows error message on failure", () => {
    (useUsers as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<UserListScreen />);
    expect(screen.getByText("Failed to load users")).toBeTruthy();
  });
});
```

---

## 5. Mocking Expo Modules

```typescript
// __mocks__/expo-secure-store.ts
const store: Record<string, string> = {};

export const setItemAsync = jest.fn(async (key: string, value: string) => {
  store[key] = value;
});

export const getItemAsync = jest.fn(async (key: string) => {
  return store[key] ?? null;
});

export const deleteItemAsync = jest.fn(async (key: string) => {
  delete store[key];
});
```

```typescript
// __mocks__/expo-router.ts
export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
}));

export const useLocalSearchParams = jest.fn(() => ({}));
export const useSegments = jest.fn(() => []);
export const Link = ({ children }: { children: React.ReactNode }) => <>{children}</>;
```

```typescript
// __mocks__/@react-native-async-storage/async-storage.ts
const store: Record<string, string> = {};

export default {
  setItem: jest.fn(async (key: string, value: string) => {
    store[key] = value;
  }),
  getItem: jest.fn(async (key: string) => store[key] ?? null),
  removeItem: jest.fn(async (key: string) => {
    delete store[key];
  }),
  clear: jest.fn(async () => {
    Object.keys(store).forEach((k) => delete store[k]);
  }),
};
```

---

## 6. Testing with Providers

```typescript
// src/utils/test-utils.tsx
import { render, type RenderOptions } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider } from "react-native-paper";
import type { ReactElement } from "react";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function AllProviders({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>{children}</PaperProvider>
    </QueryClientProvider>
  );
}

export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from "@testing-library/react-native";
```

```typescript
// Usage
import { renderWithProviders, screen } from "@/utils/test-utils";

it("renders within providers", () => {
  renderWithProviders(<MyComponent />);
  expect(screen.getByText("Hello")).toBeTruthy();
});
```

---

## 7. Testing Hooks

```typescript
import { renderHook, act } from "@testing-library/react-native";
import { useCounter } from "./useCounter";

describe("useCounter", () => {
  it("starts with initial count", () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it("increments count", () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

---

## 8. Snapshot Tests

```typescript
import { render } from "@testing-library/react-native";
import { UserCard } from "./UserCard";

it("matches snapshot", () => {
  const tree = render(
    <UserCard name="Alice" email="alice@example.com" avatarUrl="" isOnline={true} />,
  ).toJSON();

  expect(tree).toMatchSnapshot();
});
```

Use snapshots sparingly — they're best for catching unintended UI changes, not as the primary test strategy.

---

## 9. Testing Best Practices

- Query by text, placeholder, testID — avoid querying by component type
- Use `screen` object for queries (not destructured `getByText`)
- Use `waitFor` for async assertions
- Mock at the module boundary (`jest.mock("@/queries/useUsers")`)
- Create a `renderWithProviders` utility to avoid provider boilerplate
- Test behavior, not implementation — focus on what the user sees and does
- Run tests: `npx jest --watchAll`
