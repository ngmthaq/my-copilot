---
name: reactjs
description: "Unified React.js skill index — covers project conventions, component design, hooks, state management (Jotai), routing (TanStack Router in routes/), API integration (TanStack Query in queries/ & mutations/), forms (Formik+Zod in forms/), UI styling (MUI + Emotion + AG Grid), performance optimization, API mocking (MSW), unit testing (Vitest + RTL), and Storybook. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# React.js Skill

## Overview

This file is the top-level entry point for all React.js-related topics. It identifies the right sub-skill file to consult based on what the user is trying to accomplish. Each sub-skill file contains clear patterns, examples, and best practices for its domain.

---

## Sub-Skills Reference

| Domain                     | File                                                       | When to use                                                                                                  |
| -------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Conventions                | [convention.md](convention.md)                             | Project structure, naming rules, file organization, TypeScript conventions, import order                     |
| Component Design           | [design-component.md](design-component.md)                 | Building reusable components, props design, composition patterns, presentational vs container split          |
| Modern Hook Mastery        | [modern-hook-mastery.md](modern-hook-mastery.md)           | useState, useEffect, useRef, useMemo, useCallback, useContext, custom hooks                                  |
| State Management           | [state-management.md](state-management.md)                 | Local state, Context API (providers/), Jotai atoms (stores/), when to use each approach                      |
| Routing & Navigation       | [routing-navigation.md](routing-navigation.md)             | TanStack Router file-based routing: routes/, type-safe Link/navigate/params, protected routes via beforeLoad |
| API Integration            | [api-integration.md](api-integration.md)                   | Axios in utils/api.ts, TanStack Query hooks in queries/ and mutations/, cache invalidation                   |
| Form Handling & Validation | [form-handling-validation.md](form-handling-validation.md) | Formik + Zod: schemas in forms/, form setup, validation, error display, server-side errors                   |
| UI & Styling (MUI)         | [ui-styling-mui.md](ui-styling-mui.md)                     | MUI components, sx prop, styled(), theme customization, dark mode, MUI DataGrid, AG Grid, DatePicker         |
| UI & Styling (Tailwind)    | [ui-styling-tw.md](ui-styling-tw.md)                       | Tailwind CSS utilities, cn() helper, CSS Modules, responsive design, dark mode with class strategy           |
| Performance Optimization   | [performance-optimization.md](performance-optimization.md) | Memoization, lazy loading, code splitting, avoiding unnecessary re-renders                                   |
| Mock API                   | [mock-api.md](mock-api.md)                                 | Static JSON files in src/mocks/, env flag to toggle mock vs real API, usage in query and mutation hooks      |
| Unit Testing & Storybook   | [unit-test.md](unit-test.md)                               | Vitest + React Testing Library: component tests, async tests, mocking; Storybook for component documentation |

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
├── Set up routing, nested routes, or protected routes (TanStack Router)?
│   └── → routing-navigation.md
│
├── Fetch data (queries/) or mutate data (mutations/) with TanStack Query?
│   └── → api-integration.md
│
├── Build a form with Formik + Zod validation (forms/)?
│   └── → form-handling-validation.md
│
├── Style components with MUI, use sx prop, styled(), or AG Grid?
│   └── → ui-styling-mui.md
│
├── Style components with Tailwind CSS, cn(), or CSS Modules?
│   └── → ui-styling-tw.md
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
