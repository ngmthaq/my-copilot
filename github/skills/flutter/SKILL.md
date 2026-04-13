---
name: flutter
description: "Unified Flutter skill index — covers coding convention & architecture recommendations, widget basics, layout system, state management (Riverpod/Bloc/Provider), navigation & routing (GoRouter), forms & validation, API integration, animations, performance optimization, platform integration (camera, permissions, native channels), and testing (widget, unit, integration). Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# Flutter Skill

## Overview

This file is the top-level entry point for all Flutter-related topics. It identifies the right sub-skill file to consult based on what the user is trying to accomplish. Each sub-skill file contains detailed patterns, examples, and best practices for its domain.

---

## Sub-Skills Reference

| Domain                   | File                                                       | When to use                                                                                                                                                                                    |
| ------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Convention               | [convention.md](convention.md)                             | Writing or reviewing Flutter widgets for style; structuring a Flutter app; applying Flutter architecture patterns (MVVM, repository, unidirectional data flow); widget constructor conventions |
| Widget Basics            | [widget-basics.md](widget-basics.md)                       | Understanding StatelessWidget vs StatefulWidget; using BuildContext; working with keys; composing widget trees; applying themes; using common material/cupertino widgets                       |
| Layout System            | [layout-system.md](layout-system.md)                       | Using Row, Column, Stack, Expanded, Flexible, SizedBox, Padding, Align, Center, ConstrainedBox; understanding constraints; building responsive/adaptive layouts                                |
| State Management         | [state-management.md](state-management.md)                 | Choosing and using Riverpod, Bloc/Cubit, or Provider; lifting state; using ValueNotifier; structuring state across the widget tree; handling async state                                       |
| Navigation & Routing     | [navigation-routing.md](navigation-routing.md)             | Implementing GoRouter or Navigator 2.0; defining routes; passing arguments; deep links; nested/shell routes; redirect guards; bottom nav bar routing                                           |
| Forms & Validation       | [forms-validation.md](forms-validation.md)                 | Building forms with Form/GlobalKey; TextFormField; validating input; handling submission; using reactive_forms or flutter_form_builder; keyboard management                                    |
| API Integration          | [api-integration.md](api-integration.md)                   | Making HTTP requests with Dio or http; handling JSON; authentication headers; error handling; caching; using Riverpod/Bloc with async data; retry logic                                        |
| Animations               | [animations.md](animations.md)                             | Using implicit animations (AnimatedContainer, AnimatedOpacity); explicit animations (AnimationController, Tween); Hero transitions; Lottie; custom painters; staggered animations              |
| Performance Optimization | [performance-optimization.md](performance-optimization.md) | Avoiding unnecessary rebuilds; const widgets; ListView.builder; RepaintBoundary; image caching; compute() for CPU work; profiling with DevTools; tree shaking                                  |
| Platform Integration     | [platform-integration.md](platform-integration.md)         | Using platform channels (MethodChannel); accessing camera, location, permissions; handling platform-specific code; `dart:io` for file access; responsive design across iOS/Android/Web/Desktop |
| Testing                  | [testing.md](testing.md)                                   | Writing unit tests; widget tests with WidgetTester; integration tests; mocking with Mockito/mocktail; testing Riverpod/Bloc; golden tests; running on CI                                       |

---

## Quick Decision Guide

```
What are you trying to do?
│
├── Follow Flutter widget conventions, architecture patterns (MVVM, repository), or naming standards?
│   └── → convention.md
│
├── Build a widget, understand StatelessWidget vs StatefulWidget, or use BuildContext?
│   └── → widget-basics.md
│
├── Arrange widgets on screen, handle constraints, or build a responsive layout?
│   └── → layout-system.md
│
├── Manage UI state — choose Riverpod, Bloc, Provider, or ValueNotifier?
│   └── → state-management.md
│
├── Navigate between screens, set up routes, or handle deep links?
│   └── → navigation-routing.md
│
├── Build a form, validate inputs, or handle text field controllers?
│   └── → forms-validation.md
│
├── Call a REST API, handle JSON, show loading/error states, or cache data?
│   └── → api-integration.md
│
├── Add animations — implicit, explicit, Hero, or Lottie?
│   └── → animations.md
│
├── Fix jank, reduce widget rebuilds, profile performance, or optimize lists?
│   └── → performance-optimization.md
│
├── Access camera, location, sensors, native APIs, or handle permissions?
│   └── → platform-integration.md
│
└── Write unit, widget, or integration tests; mock dependencies; run on CI?
    └── → testing.md
```

---

## How to Use This Skill

1. **Identify the goal** using the Quick Decision Guide above.
2. **Load the corresponding sub-skill file** with `read_file` (e.g., `state-management.md`).
3. **Follow the patterns and examples** in that file to produce the response.
4. **Load multiple sub-skill files** when the task spans domains — for example, building a data-fetching screen typically involves `api-integration.md` + `state-management.md` + `widget-basics.md`.

## Related Skills

| Skill  | Entry Point                      | When to also load                              |
| ------ | -------------------------------- | ---------------------------------------------- |
| Dart   | `.github/skills/dart/SKILL.md`   | Dart language fundamentals used inside Flutter |
| Docker | `.github/skills/docker/SKILL.md` | Containerising CI pipelines that build Flutter |
