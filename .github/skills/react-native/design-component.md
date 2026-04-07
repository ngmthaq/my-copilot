---
name: react-native-design-component
description: "React Native component design — building reusable components, props design, composition patterns, presentational vs container split. Use when: creating a new component; deciding how to split responsibilities; making a component flexible and reusable."
---

# React Native Component Design Skill

## Overview

This skill covers how to design clean, reusable React Native components — clear props contracts, composition over configuration, and separating logic from presentation.

---

## 1. Basic Component Template

```typescript
// src/components/AppButton/AppButton.tsx
import { StyleSheet, ActivityIndicator, Pressable, Text, type ViewStyle } from "react-native";

interface AppButtonProps {
  children: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
}

export function AppButton({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  style,
  onPress,
}: AppButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[size],
        pressed && styles.pressed,
        (disabled || isLoading) && styles.disabled,
        style,
      ]}
      disabled={disabled || isLoading}
      onPress={onPress}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: "#6200ee" },
  secondary: { backgroundColor: "#03dac6" },
  danger: { backgroundColor: "#cf6679" },
  sm: { paddingVertical: 6, paddingHorizontal: 12 },
  md: { paddingVertical: 10, paddingHorizontal: 20 },
  lg: { paddingVertical: 14, paddingHorizontal: 28 },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  text: { fontWeight: "600", fontSize: 14 },
  primaryText: { color: "#fff" },
  secondaryText: { color: "#000" },
  dangerText: { color: "#fff" },
});
```

---

## 2. Presentational vs Container Split

Keep UI rendering and data fetching separate.

```typescript
// ✅ Presentational — only cares about display
interface UserCardProps {
  name: string;
  email: string;
  avatarUrl: string;
  isOnline: boolean;
  onPress?: () => void;
}

export function UserCard({ name, email, avatarUrl, isOnline, onPress }: UserCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
      <View style={[styles.badge, isOnline ? styles.online : styles.offline]} />
    </Pressable>
  );
}
```

```typescript
// ✅ Container — handles data fetching, passes props down
export function UserCardContainer({ userId }: { userId: string }) {
  const { data, isLoading, isError } = useUser(userId);

  if (isLoading) return <ActivityIndicator />;
  if (isError) return <ErrorMessage />;

  return <UserCard {...data} />;
}
```

---

## 3. Composition Pattern

Prefer composing small pieces over a single mega-component with many props.

```typescript
// ✅ Composable Card component
import { View, Text, StyleSheet, type ViewStyle, type ReactNode } from "react-native";

function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function CardHeader({ children }: { children: ReactNode }) {
  return <View style={styles.header}>{children}</View>;
}

function CardBody({ children }: { children: ReactNode }) {
  return <View style={styles.body}>{children}</View>;
}

function CardFooter({ children }: { children: ReactNode }) {
  return <View style={styles.footer}>{children}</View>;
}

// Attach sub-components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export { Card };
```

```typescript
// Usage
<Card>
  <Card.Header>
    <Text style={styles.title}>Order #1234</Text>
  </Card.Header>
  <Card.Body>
    <Text>3 items — $42.00</Text>
  </Card.Body>
  <Card.Footer>
    <AppButton size="sm" onPress={onViewDetails}>View Details</AppButton>
  </Card.Footer>
</Card>
```

---

## 4. Render Props Pattern

Use render props when a component needs to delegate part of its rendering.

```typescript
interface ListWithEmptyProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  renderEmpty?: () => ReactNode;
  keyExtractor: (item: T) => string;
}

export function ListWithEmpty<T>({
  data,
  renderItem,
  renderEmpty,
  keyExtractor,
}: ListWithEmptyProps<T>) {
  if (data.length === 0) {
    return renderEmpty ? renderEmpty() : <Text>No items found</Text>;
  }

  return (
    <View>
      {data.map((item, index) => (
        <View key={keyExtractor(item)}>{renderItem(item, index)}</View>
      ))}
    </View>
  );
}
```

---

## 5. Forwarding Refs

Use `forwardRef` when a component wraps a native RN component and consumers need access to the ref.

```typescript
import { forwardRef } from "react";
import { TextInput, View, Text, StyleSheet, type TextInputProps } from "react-native";

interface AppTextInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  ({ label, error, style, ...rest }, ref) => {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          ref={ref}
          style={[styles.input, error && styles.inputError, style]}
          placeholderTextColor="#999"
          {...rest}
        />
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  },
);

AppTextInput.displayName = "AppTextInput";
```

---

## 6. Platform-Specific Components

Use `Platform.select` or separate files for platform-specific variations.

```typescript
import { Platform, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
});
```

For larger differences, use file extensions:

```
src/components/DatePicker/
├── DatePicker.ios.tsx
├── DatePicker.android.tsx
└── index.ts   # RN auto-resolves correct file per platform
```

---

## 7. Component Checklist

Before shipping a component, verify:

- [ ] Props have TypeScript types with clear names
- [ ] Optional props have sensible defaults
- [ ] Component handles loading, error, and empty states if applicable
- [ ] Accessible: has `accessibilityLabel`, `accessibilityRole`, `accessibilityHint` where needed
- [ ] Pressable areas are at least 44×44 pts (Apple HIG) / 48×48 dp (Material)
- [ ] Styles use `StyleSheet.create` for performance
- [ ] No inline object/array/function creation in render (causes unnecessary re-renders)
