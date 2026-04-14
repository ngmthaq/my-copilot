---
name: react-native-performance-optimization
description: "React Native performance — FlatList optimization, memoization, Hermes engine, reducing re-renders, image caching, bundle size reduction, and profiling. Use when: fixing slow screens; optimizing lists; reducing app size; profiling performance."
---

# React Native Performance Optimization Skill

## Overview

This skill covers practical techniques to keep React Native (Expo) apps fast and responsive.

---

## 1. FlatList Optimization

FlatList is the primary tool for rendering large lists efficiently.

```typescript
import { FlatList, View, Text } from "react-native";
import { memo, useCallback } from "react";

// ✅ Memoize list items to prevent unnecessary re-renders
const UserItem = memo(function UserItem({ user, onPress }: { user: User; onPress: (id: string) => void }) {
  return (
    <Pressable onPress={() => onPress(user.id)}>
      <Text>{user.name}</Text>
    </Pressable>
  );
});

export function UserListScreen() {
  const { data: users } = useUsers();

  // ✅ Stable callback reference
  const handlePress = useCallback((id: string) => {
    router.push(`/users/${id}`);
  }, []);

  // ✅ Stable renderItem reference
  const renderItem = useCallback(
    ({ item }: { item: User }) => <UserItem user={item} onPress={handlePress} />,
    [handlePress],
  );

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      // ✅ Performance props
      removeClippedSubviews          // unmount off-screen items (Android)
      maxToRenderPerBatch={10}       // items per batch render
      windowSize={5}                 // render window multiplier
      initialNumToRender={10}        // items to render initially
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,         // enable scroll-to-index
        offset: ITEM_HEIGHT * index,
        index,
      })}
    />
  );
}
```

### FlatList vs ScrollView

| Use           | When                                                 |
| ------------- | ---------------------------------------------------- |
| `FlatList`    | 20+ items; items are same shape; need virtualization |
| `ScrollView`  | < 20 items; mixed content; no virtualization needed  |
| `SectionList` | Grouped data with section headers                    |

---

## 2. Memoization

### React.memo

Wrap components that receive the same props frequently:

```typescript
// ✅ Only re-renders when props change (shallow comparison)
const ExpensiveChart = memo(function ExpensiveChart({ data }: { data: number[] }) {
  return <View>{/* complex chart rendering */}</View>;
});
```

### useMemo & useCallback

```typescript
// ✅ Cache expensive computation
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items],
);

// ✅ Stable function reference
const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
}, []);
```

### When NOT to memoize

- Simple components that re-render cheaply
- Values that change every render anyway
- Premature optimization without measurement

---

## 3. Avoiding Unnecessary Re-Renders

```typescript
// ❌ Creates new object every render → child re-renders
<UserCard style={{ marginTop: 10 }} />

// ✅ Use StyleSheet (created once)
<UserCard style={styles.card} />

// ❌ Creates new function every render
<Pressable onPress={() => doSomething(id)} />

// ✅ useCallback
const handlePress = useCallback(() => doSomething(id), [id]);
<Pressable onPress={handlePress} />

// ❌ Creates new array every render
<FlatList data={items.filter(fn)} />

// ✅ useMemo
const filtered = useMemo(() => items.filter(fn), [items]);
<FlatList data={filtered} />
```

---

## 4. Image Optimization

```typescript
// ✅ Use expo-image for caching and performance
import { Image } from "expo-image";

<Image
  source={{ uri: imageUrl }}
  style={styles.image}
  contentFit="cover"
  placeholder={blurhash}        // show placeholder while loading
  transition={200}              // fade-in transition
  cachePolicy="memory-disk"     // cache strategy
/>
```

Install: `npx expo install expo-image`

---

## 5. Hermes Engine

Expo SDK 49+ uses Hermes by default. Hermes improves:

- App startup time (bytecode precompilation)
- Memory usage
- Bundle size

Verify Hermes is enabled:

```typescript
const isHermes = () => Boolean((global as any).HermesInternal);
console.log("Hermes enabled:", isHermes());
```

---

## 6. Reduce Bundle Size

```bash
# Analyze bundle size
npx expo export --dump-sourcemap
npx source-map-explorer dist/_expo/static/js/*.js
```

Tips:

- Import only what you need: `import { Button } from "react-native-paper"` (tree-shakeable)
- Avoid importing entire lodash: use `lodash/debounce` instead of `lodash`
- Use `expo-image` instead of `react-native Image` for better caching
- Lazy-load heavy screens that are rarely visited

---

## 7. Lazy Loading Screens

```typescript
// app/_layout.tsx
import { Stack } from "expo-router";

// Expo Router automatically code-splits by route file
// Heavy screens only load when navigated to
```

For non-route components:

```typescript
import { lazy, Suspense } from "react";
import { ActivityIndicator } from "react-native";

const HeavyChart = lazy(() => import("@/components/HeavyChart"));

function DashboardScreen() {
  return (
    <Suspense fallback={<ActivityIndicator />}>
      <HeavyChart data={chartData} />
    </Suspense>
  );
}
```

---

## 8. Avoid Layout Thrashing

```typescript
// ❌ Reading layout then immediately writing causes thrashing
const onLayout = (e) => {
  const { height } = e.nativeEvent.layout;
  setContainerHeight(height); // triggers re-render + relayout
};

// ✅ Use onLayout once and cache the value
const [measured, setMeasured] = useState(false);
const onLayout = (e) => {
  if (!measured) {
    setMeasured(true);
    setContainerHeight(e.nativeEvent.layout.height);
  }
};
```

---

## 9. InteractionManager for Deferred Work

```typescript
import { InteractionManager } from "react-native";

useEffect(() => {
  // ✅ Run expensive work after navigation animation completes
  const task = InteractionManager.runAfterInteractions(() => {
    loadHeavyData();
  });

  return () => task.cancel();
}, []);
```

---

## 10. Performance Checklist

- [ ] FlatList uses `keyExtractor`, `getItemLayout`, `removeClippedSubviews`
- [ ] List items are wrapped in `React.memo`
- [ ] No inline objects/functions in JSX (use `StyleSheet` + `useCallback`)
- [ ] Images use `expo-image` with caching
- [ ] Heavy computations use `useMemo`
- [ ] Navigation animations are not blocked by data loading
- [ ] Hermes engine is enabled
- [ ] Bundle size is monitored
