---
name: vuejs-options-api
description: "Unified Vue 3 Options API skill index — covers project conventions, component design, Options API mastery (data, computed, methods, watch), state management (Vuex/Pinia with mapHelpers), routing (Vue Router 4 in router/), API integration (Axios in methods), forms (VeeValidate components + Zod in forms/), UI styling (Vuetify 3), performance optimization, API mocking, Vue lifecycle hooks, unit testing (Vitest + Vue Testing Library), and Storybook. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# Vue 3 Options API Skill

## Overview

This file is the top-level entry point for all Vue 3 Options API-related topics. It identifies the right sub-skill file to consult based on what the user is trying to accomplish. Each sub-skill file contains clear patterns, examples, and best practices for its domain.

---

## Sub-Skills Reference

| Domain                     | File                                                       | When to use                                                                                                |
| -------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Conventions                | [convention.md](convention.md)                             | Project structure, naming rules, file organization, TypeScript conventions, import order                   |
| Component Design           | [design-component.md](design-component.md)                 | Building reusable SFCs, props/emits design, slot patterns, presentational vs container split               |
| Options API Mastery        | [options-api-mastery.md](options-api-mastery.md)           | data, computed, methods, watch, mixins, provide/inject, custom directives                                  |
| Lifecycle Hooks            | [lifecycle.md](lifecycle.md)                               | created, mounted, unmounted, updated, lifecycle execution order                                            |
| State Management           | [state-management.md](state-management.md)                 | Local state, provide/inject (plugins/), Pinia stores (stores/) with mapState/mapActions                    |
| Routing & Navigation       | [routing-navigation.md](routing-navigation.md)             | Vue Router 4: router/, dynamic segments, navigation guards, nested routes, programmatic navigation         |
| API Integration            | [api-integration.md](api-integration.md)                   | Axios in utils/api.ts, API calls in methods, loading/error state management, data fetching patterns        |
| Form Handling & Validation | [form-handling-validation.md](form-handling-validation.md) | VeeValidate components + Zod: schemas in forms/, Form/Field components, error display, server-side errors  |
| UI & Styling (Vuetify)     | [ui-styling-vuetify.md](ui-styling-vuetify.md)             | Vuetify 3 components, theme customization, dark mode, AG Grid                                              |
| Performance Optimization   | [performance-optimization.md](performance-optimization.md) | Computed caching, async components, v-memo, keep-alive, avoiding unnecessary re-renders                    |
| Mock API                   | [mock-api.md](mock-api.md)                                 | Static JSON files in src/mocks/, env flag to toggle mock vs real API, usage in API call methods            |
| Unit Testing & Storybook   | [unit-test.md](unit-test.md)                               | Vitest + Vue Testing Library: component tests, async tests, mocking; Storybook for component documentation |

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
├── Use data, computed, methods, watch, or write a mixin?
│   └── → options-api-mastery.md
│
├── Understand or use lifecycle hooks (created, mounted, unmounted, etc.)?
│   └── → lifecycle.md
│
├── Manage global or shared state (provide/inject in plugins/, Pinia stores in stores/)?
│   └── → state-management.md
│
├── Set up routing, nested routes, or navigation guards (Vue Router 4)?
│   └── → routing-navigation.md
│
├── Fetch data from an API or handle loading/error states?
│   └── → api-integration.md
│
├── Build a form with VeeValidate + Zod validation (forms/)?
│   └── → form-handling-validation.md
│
├── Style components with Vuetify 3 or use AG Grid?
│   └── → ui-styling-vuetify.md
│
├── Optimize performance, reduce re-renders, or lazy load?
│   └── → performance-optimization.md
│
├── Mock API calls during development or testing?
│   └── → mock-api.md
│
└── Write unit tests or Storybook stories for components?
    └── → unit-test.md
```

---

## How to Use This Skill

1. **Identify the goal** using the Quick Decision Guide above.
2. **Load the corresponding sub-skill file** with `read_file`.
3. **Follow the patterns and examples** in that file to produce the response.
4. **Load multiple sub-skill files** when the task spans domains — for example, a new feature page typically involves `design-component.md` + `api-integration.md` + `form-handling-validation.md`.
