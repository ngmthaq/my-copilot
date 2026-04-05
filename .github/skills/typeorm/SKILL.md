---
name: typeorm
description: "Unified TypeORM skill index — covers entity design, repository queries (CRUD), relations, migrations, transactions, pagination & filtering, error handling, performance optimization, database seeding, and integration with NestJS/Express. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# TypeORM Skill

## Overview

This file is the top-level entry point for all TypeORM-related topics. It identifies the right sub-skill file to consult based on what the user is trying to accomplish. Each sub-skill file contains clear patterns, examples, and best practices for its domain.

---

## Sub-Skills Reference

| Domain                       | File                                                           | When to use                                                                                                             |
| ---------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Entity Design                | [entity-design.md](entity-design.md)                           | Defining entities, columns, data types, enums, `@PrimaryGeneratedColumn`, `@Column`, `@Index`, `@CreateDateColumn`      |
| Repository Queries           | [repository-queries.md](repository-queries.md)                 | Using `find`, `findOne`, `save`, `update`, `delete`, `count`, `QueryBuilder`, `select`, `relations`                     |
| Relations                    | [relations.md](relations.md)                                   | Modeling `@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`; eager/lazy loading; cascades; join columns             |
| Migrations                   | [migrations.md](migrations.md)                                 | Generating and running migrations; `migration:generate`, `migration:run`, `migration:revert`; synchronize vs migrations |
| Transactions                 | [transactions.md](transactions.md)                             | Using `QueryRunner`, `EntityManager` transactions; atomic operations; rollback behavior                                 |
| Pagination & Filtering       | [pagination-filtering.md](pagination-filtering.md)             | Offset pagination; `where` filters; `order`; `skip`/`take`; `QueryBuilder` for complex queries                          |
| Error Handling               | [error-handling.md](error-handling.md)                         | Catching TypeORM errors; handling unique constraint violations; mapping DB errors to HTTP responses                     |
| Performance Optimization     | [performance-optimization.md](performance-optimization.md)     | Selecting specific columns; avoiding N+1 with relations; indexes; connection pool configuration; query caching          |
| Seeding                      | [seeding.md](seeding.md)                                       | Writing seed scripts; running seeds; clearing data; using `save` vs `insert` for idempotency                            |
| Integration (NestJS/Express) | [integration-nestjs-express.md](integration-nestjs-express.md) | Setting up `TypeOrmModule` in NestJS; using `@InjectRepository`; setting up DataSource in Express                       |

---

## Quick Decision Guide

```
What are you trying to do?
│
├── Define or update a TypeORM entity or column?
│   └── → entity-design.md
│
├── Read, create, update, or delete records?
│   └── → repository-queries.md
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
├── Handle TypeORM or database errors gracefully?
│   └── → error-handling.md
│
├── Improve query performance or avoid slow queries?
│   └── → performance-optimization.md
│
├── Seed the database with initial or test data?
│   └── → seeding.md
│
└── Integrate TypeORM with NestJS or Express?
    └── → integration-nestjs-express.md
```

---

## How to Use This Skill

1. **Identify the goal** using the Quick Decision Guide above.
2. **Load the corresponding sub-skill file** with `read_file` (e.g., `repository-queries.md`).
3. **Follow the patterns and examples** in that file to produce the response.
4. **Load multiple sub-skill files** when the task spans domains — for example, building a full feature typically involves `repository-queries.md` + `relations.md` + `error-handling.md`.
