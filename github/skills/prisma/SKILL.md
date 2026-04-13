---
name: prisma
description: "Unified Prisma skill index — covers schema design, client queries (CRUD), relations, migrations, transactions, pagination & filtering, error handling, performance optimization, database seeding, and integration with NestJS/Express. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# Prisma Skill

## Overview

This file is the top-level entry point for all Prisma-related topics. It identifies the right sub-skill file to consult based on what the user is trying to accomplish. Each sub-skill file contains clear patterns, examples, and best practices for its domain.

---

## Sub-Skills Reference

| Domain                       | File                                                           | When to use                                                                                                              |
| ---------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Schema Design                | [schema-design.md](schema-design.md)                           | Defining models, fields, data types, enums, `@id`, `@unique`, `@default`, `@@index`, `datasource`, `generator`           |
| Client Queries               | [client-queries.md](client-queries.md)                         | Writing `findMany`, `findUnique`, `create`, `update`, `delete`, `upsert`, `count`, `select`, `include`                   |
| Relations                    | [relations.md](relations.md)                                   | Modeling one-to-one, one-to-many, many-to-many relations; using nested writes; `connect`, `disconnect`, `set`            |
| Migrations                   | [migrations.md](migrations.md)                                 | Running `prisma migrate dev/deploy/reset`; understanding migration files; handling migration drift                       |
| Transactions                 | [transactions.md](transactions.md)                             | Using `$transaction`, sequential and interactive transactions; atomic operations; rollback behavior                      |
| Pagination & Filtering       | [pagination-filtering.md](pagination-filtering.md)             | Offset vs cursor pagination; `where` filters; `orderBy`; `skip`/`take`; `cursor`                                         |
| Error Handling               | [error-handling.md](error-handling.md)                         | Catching `PrismaClientKnownRequestError`; handling P-codes (P2002, P2025, etc.); mapping Prisma errors to HTTP responses |
| Performance Optimization     | [performance-optimization.md](performance-optimization.md)     | Selecting only needed fields; avoiding N+1 with `include`; using `findFirst` vs `findUnique`; connection pooling         |
| Seeding                      | [seeding.md](seeding.md)                                       | Writing `prisma/seed.ts`; running `prisma db seed`; clearing data before seeding; using `upsert` for idempotency         |
| Integration (NestJS/Express) | [integration-nestjs-express.md](integration-nestjs-express.md) | Setting up `PrismaService` in NestJS; creating a Prisma module; using Prisma in Express services/repositories            |

---

## Quick Decision Guide

```
What are you trying to do?
│
├── Define or update a Prisma model or schema?
│   └── → schema-design.md
│
├── Read, create, update, or delete records?
│   └── → client-queries.md
│
├── Model relationships between tables?
│   └── → relations.md
│
├── Run or manage database migrations?
│   └── → migrations.md
│
├── Execute multiple operations atomically?
│   └── → transactions.md
│
├── Paginate results or filter/sort records?
│   └── → pagination-filtering.md
│
├── Handle Prisma errors gracefully?
│   └── → error-handling.md
│
├── Improve query performance or avoid slow queries?
│   └── → performance-optimization.md
│
├── Seed the database with initial or test data?
│   └── → seeding.md
│
└── Integrate Prisma with NestJS or Express?
    └── → integration-nestjs-express.md
```

---

## How to Use This Skill

1. **Identify the goal** using the Quick Decision Guide above.
2. **Load the corresponding sub-skill file** with `read_file` (e.g., `client-queries.md`).
3. **Follow the patterns and examples** in that file to produce the response.
4. **Load multiple sub-skill files** when the task spans domains — for example, building a full feature typically involves `client-queries.md` + `relations.md` + `error-handling.md`.
