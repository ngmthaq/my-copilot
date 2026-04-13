---
name: graphql
description: "Unified GraphQL skill index — covers authentication & authorization, DataLoader batching, error handling, performance optimization, queries & mutations, resolvers, schema design, schema stitching & federation, subscriptions, and the type system. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# GraphQL Skill

## Overview

This file is the top-level entry point for all GraphQL-related topics. It identifies the right sub-skill file to consult based on what the user is trying to accomplish. Each sub-skill file contains detailed patterns, examples, and best practices for its domain.

---

## Sub-Skills Reference

| Domain                         | File                                                               | When to use                                                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication & Authorization | [authentication-authorization.md](authentication-authorization.md) | Protecting queries/mutations; implementing login; checking permissions; JWT context auth; field-level auth; directive-based auth; RBAC             |
| DataLoader Pattern             | [dataloader-pattern.md](dataloader-pattern.md)                     | Fixing N+1 query problems; batching database calls; implementing field resolvers for relationships; per-request loader instances                   |
| Error Handling                 | [error-handling.md](error-handling.md)                             | Handling errors in resolvers; formatting error responses; implementing custom error classes; using error codes; partial responses                  |
| Performance Optimization       | [performance-optimization.md](performance-optimization.md)         | Optimizing slow queries; limiting query depth/complexity; implementing caching; persisted queries; preventing abuse; monitoring resolvers          |
| Queries & Mutations            | [queries-mutations.md](queries-mutations.md)                       | Defining Query/Mutation types; writing client-side operations; using variables and fragments; aliases; operation naming; Apollo Client integration |
| Resolvers                      | [resolvers.md](resolvers.md)                                       | Implementing resolver logic; accessing context/parent; organizing resolvers; mapping database to GraphQL; field resolvers; interface resolvers     |
| Schema Design                  | [schema-design.md](schema-design.md)                               | Designing GraphQL schemas; structuring types and fields; choosing nullability; organizing schema files; connection pattern; custom scalars         |
| Schema Stitching & Federation  | [schema-stitching-federation.md](schema-stitching-federation.md)   | Composing multiple GraphQL services; setting up Apollo Federation; creating subgraphs; extending types across services; Apollo Router              |
| Subscriptions                  | [subscriptions.md](subscriptions.md)                               | Implementing real-time features; setting up WebSocket transport; publishing events from mutations; filtering subscription events                   |
| Type System                    | [type-system.md](type-system.md)                                   | Defining types; choosing between interfaces and unions; working with custom scalars; understanding type modifiers; directives                      |

---

## Quick Decision Guide

```
What are you trying to do?
│
├── Define types, scalars, enums, interfaces, or unions?
│   └── → type-system.md
│
├── Design a schema (naming conventions, nullability, connections, organization)?
│   └── → schema-design.md
│
├── Write queries, mutations, fragments, variables, or aliases?
│   └── → queries-mutations.md
│
├── Implement resolver logic (context, parent chaining, field resolvers)?
│   └── → resolvers.md
│
├── Fix N+1 queries or batch database calls?
│   └── → dataloader-pattern.md
│
├── Handle errors (custom error classes, error codes, partial responses)?
│   └── → error-handling.md
│
├── Protect resolvers with authentication or authorization?
│   ├── JWT auth, context, login/register mutations?    → authentication-authorization.md
│   └── Directive-based auth or RBAC?                  → authentication-authorization.md
│
├── Implement real-time features (WebSockets, events)?
│   └── → subscriptions.md
│
├── Optimize performance (complexity limits, caching, persisted queries)?
│   └── → performance-optimization.md
│
└── Compose multiple GraphQL services together?
    ├── Apollo Federation subgraphs?   → schema-stitching-federation.md
    └── Schema stitching / gateway?    → schema-stitching-federation.md
```

---

## How to Use This Skill

1. Identify the user's goal using the decision guide above.
2. Load the corresponding sub-skill file with `read_file`.
3. Follow the patterns and examples in that file to produce the response.
4. When a task spans multiple domains (e.g., designing a schema **and** implementing its resolvers with auth), load all relevant sub-skill files before responding.
