---
name: react-native-animations
description: "React Native animations — Animated API, LayoutAnimation, React Native Reanimated, gesture-driven animations, shared element transitions, and micro-interactions. Use when: adding motion to UI; transitioning between screens; building loading or micro-interaction animations."
---

# React Native Animations Skill

## Overview

This skill covers animation approaches in React Native — from simple built-in APIs to the high-performance Reanimated library.

---

## 1. LayoutAnimation (Simplest)

Automatically animates layout changes when state updates.

```typescript
import { LayoutAnimation, UIManager, Platform, View, Text, Pressable, StyleSheet } from "react-native";

// Enable on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function ExpandableCard() {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <Pressable onPress={toggle}>
      <View style={[styles.card, expanded && styles.expanded]}>
        <Text>Tap to {expanded ? "collapse" : "expand"}</Text>
        {expanded && <Text style={styles.detail}>Additional details here</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: "#e0e0e0", borderRadius: 8, margin: 16 },
  expanded: { padding: 24 },
  detail: { marginTop: 12 },
});
```

---

## 2. Animated API (Built-in)

The built-in `Animated` API runs on the JS thread by default but can be offloaded to the native driver.

```typescript
import { useRef, useEffect } from "react";
import { Animated, StyleSheet } from "react-native";

export function FadeIn({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true, // ✅ offload to native thread
    }).start();
  }, []);

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}
```

### Animated Compositions

```typescript
// Parallel — run animations simultaneously
Animated.parallel([
  Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
  Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
]).start();

// Sequence — run one after another
Animated.sequence([
  Animated.timing(scale, { toValue: 1.2, duration: 150, useNativeDriver: true }),
  Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
]).start();

// Stagger — same animation with delay between items
Animated.stagger(
  100,
  items.map((_, i) => Animated.timing(animatedValues[i], { toValue: 1, duration: 300, useNativeDriver: true })),
).start();

// Loop
Animated.loop(
  Animated.sequence([
    Animated.timing(rotation, { toValue: 1, duration: 1000, useNativeDriver: true }),
    Animated.timing(rotation, { toValue: 0, duration: 1000, useNativeDriver: true }),
  ]),
).start();
```

### Interpolation

```typescript
const rotation = animatedValue.interpolate({
  inputRange: [0, 1],
  outputRange: ["0deg", "360deg"],
});

const backgroundColor = animatedValue.interpolate({
  inputRange: [0, 1],
  outputRange: ["#ff0000", "#00ff00"],
});

<Animated.View style={{ transform: [{ rotate: rotation }] }} />
```

---

## 3. React Native Reanimated (High Performance)

Reanimated runs animations on the UI thread — no bridge overhead, 60fps guaranteed.

Install: `npx expo install react-native-reanimated`

Add to `babel.config.js`:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-reanimated/plugin"], // ✅ must be last
  };
};
```

### Basic Reanimated Animation

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";

export function AnimatedBox() {
  const offset = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const handlePress = () => {
    offset.value = withSpring(offset.value === 0 ? 200 : 0);
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </Pressable>
  );
}
```

### Timing vs Spring

```typescript
// Timing — linear or eased interpolation
offset.value = withTiming(200, {
  duration: 500,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
});

// Spring — physics-based with natural bounce
offset.value = withSpring(200, {
  damping: 10, // higher = less bounce
  stiffness: 100, // higher = faster
  mass: 1,
});
```

### Entering / Exiting Animations

```typescript
import Animated, { FadeIn, FadeOut, SlideInRight, BounceIn } from "react-native-reanimated";

// Fade in on mount, fade out on unmount
{isVisible && (
  <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)}>
    <Text>Hello!</Text>
  </Animated.View>
)}

// Slide in from right
<Animated.View entering={SlideInRight.springify().damping(15)}>
  <CardItem />
</Animated.View>

// Bounce in
<Animated.View entering={BounceIn.delay(200)}>
  <Badge />
</Animated.View>
```

### Layout Animations

```typescript
import Animated, { LinearTransition } from "react-native-reanimated";

// Animated list item reorder
<Animated.View layout={LinearTransition.springify()} key={item.id}>
  <ListItem item={item} />
</Animated.View>
```

---

## 4. Gesture-Driven Animations

Install: `npx expo install react-native-gesture-handler`

```typescript
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

export function DraggableCard() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Text>Drag me</Text>
      </Animated.View>
    </GestureDetector>
  );
}
```

---

## 5. Skeleton Loading Animation

```typescript
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export function Skeleton({ width, height }: { width: number; height: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[styles.skeleton, { width, height, opacity }]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: { backgroundColor: "#e0e0e0", borderRadius: 4 },
});
```

---

## 6. When to Use What

| Approach          | Use when                                            |
| ----------------- | --------------------------------------------------- |
| `LayoutAnimation` | Simple expand/collapse, list reorder (quick & easy) |
| `Animated` API    | Simple fade, slide, scale (built-in, no extra deps) |
| `Reanimated`      | Complex animations, gestures, 60fps requirement     |
| `Gesture Handler` | Drag, swipe, pinch — combine with Reanimated        |
