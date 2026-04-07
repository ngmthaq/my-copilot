---
name: react-native
description: "Unified React Native (Expo) skill index — covers project conventions, component design, hooks, state management (Jotai), navigation (Expo Router), API integration (TanStack Query + Axios), forms (Formik + Zod), UI styling (React Native Paper + StyleSheet), performance optimization, platform integration (camera, permissions, native modules), animations (Reanimated), testing (Jest + RNTL), push notifications (Expo Notifications), offline storage (AsyncStorage, MMKV, SQLite), and deep linking. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# React Native Skill

## Overview

This file is the top-level entry point for all React Native-related topics. The project uses **Expo (managed workflow)**. It identifies the right sub-skill file to consult based on what the user is trying to accomplish. Each sub-skill file contains clear patterns, examples, and best practices for its domain.

---

## Sub-Skills Reference

| Domain                     | File                                                       | When to use                                                                                                    |
| -------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Conventions                | [convention.md](convention.md)                             | Project structure, naming rules, file organization, TypeScript conventions, import order                       |
| Component Design           | [design-component.md](design-component.md)                 | Building reusable components, props design, composition patterns, presentational vs container split            |
| Modern Hook Mastery        | [modern-hook-mastery.md](modern-hook-mastery.md)           | useState, useEffect, useRef, useMemo, useCallback, custom hooks, RN-specific hooks                             |
| State Management           | [state-management.md](state-management.md)                 | Local state, Context API (providers/), Jotai atoms (stores/), when to use each approach                        |
| Navigation & Routing       | [navigation-routing.md](navigation-routing.md)             | Expo Router file-based routing: app/ directory, type-safe navigation, tabs, stacks, modals, auth guards        |
| API Integration            | [api-integration.md](api-integration.md)                   | Axios in utils/api.ts, TanStack Query hooks in queries/ and mutations/, cache invalidation                     |
| Form Handling & Validation | [form-handling-validation.md](form-handling-validation.md) | Formik + Zod: schemas in forms/, form setup, validation, error display, keyboard handling                      |
| UI & Styling               | [ui-styling.md](ui-styling.md)                             | React Native Paper components, StyleSheet, theming, dark mode, responsive design                               |
| Performance Optimization   | [performance-optimization.md](performance-optimization.md) | FlatList optimization, memoization, Hermes, reducing re-renders, image caching, bundle size                    |
| Platform Integration       | [platform-integration.md](platform-integration.md)         | Expo modules for camera, permissions, location, file system, native modules, platform-specific code            |
| Animations                 | [animations.md](animations.md)                             | React Native Reanimated, LayoutAnimation, Animated API, gesture-driven animations, shared element transitions  |
| Testing                    | [testing.md](testing.md)                                   | Jest + React Native Testing Library: component tests, async tests, mocking native modules, snapshot tests      |
| Push Notifications         | [push-notifications.md](push-notifications.md)             | Expo Notifications: setup, push tokens, local/remote notifications, handling received notifications            |
| Offline & Storage          | [offline-storage.md](offline-storage.md)                   | AsyncStorage, MMKV, expo-sqlite, choosing the right storage, data persistence patterns                         |
| Deep Linking               | [deep-linking.md](deep-linking.md)                         | Expo Router deep links, universal links (iOS), app links (Android), URL scheme config, handling incoming links |

---

## Quick Decision Guide

```
What are you trying to do?
│
├── Set up project structure, naming, or file layout?
│   └── → convention.md
│
├── Design a reusable component or decide how to split components?
│   └── → design-component.md
│
├── Use or write a React hook (useState, useEffect, custom hooks)?
│   └── → modern-hook-mastery.md
│
├── Manage global or shared state (Context in providers/, Jotai atoms in stores/)?
│   └── → state-management.md
│
├── Set up navigation, tabs, stacks, modals, or auth guards (Expo Router)?
│   └── → navigation-routing.md
│
├── Fetch data (queries/) or mutate data (mutations/) with TanStack Query?
│   └── → api-integration.md
│
├── Build a form with Formik + Zod validation (forms/)?
│   └── → form-handling-validation.md
│
├── Style components with React Native Paper, StyleSheet, or theming?
│   └── → ui-styling.md
│
├── Optimize performance, reduce re-renders, or optimize FlatList?
│   └── → performance-optimization.md
│
├── Access camera, location, permissions, or native APIs via Expo?
│   └── → platform-integration.md
│
├── Add animations — Reanimated, LayoutAnimation, or gesture-driven?
│   └── → animations.md
│
├── Write unit tests or component tests?
│   └── → testing.md
│
├── Set up push notifications?
│   └── → push-notifications.md
│
├── Store data locally (AsyncStorage, MMKV, SQLite)?
│   └── → offline-storage.md
│
└── Handle deep links, universal links, or URL schemes?
    └── → deep-linking.md
```

---

## How to Use This Skill

1. **Identify the goal** using the Quick Decision Guide above.
2. **Load the corresponding sub-skill file** with `read_file`.
3. **Follow the patterns and examples** in that file to produce the response.
4. **Load multiple sub-skill files** when the task spans domains — for example, a new screen typically involves `design-component.md` + `api-integration.md` + `navigation-routing.md`.

## Related Skills

| Skill      | Entry Point                          | When to also load                                         |
| ---------- | ------------------------------------ | --------------------------------------------------------- |
| TypeScript | `.github/skills/typescript/SKILL.md` | TypeScript language fundamentals used inside React Native |
| JavaScript | `.github/skills/javascript/SKILL.md` | JavaScript fundamentals                                   |
| Docker     | `.github/skills/docker/SKILL.md`     | Containerising CI pipelines that build the app            |
