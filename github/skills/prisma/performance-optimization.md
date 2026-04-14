---
name: prisma-performance-optimization
description: "Prisma performance optimization — selecting only needed fields; avoiding N+1 queries with include; using findFirst vs findUnique; connection pooling; query logging. Use when: queries are slow; reducing data transfer; avoiding N+1 problems; optimizing database connections."
---

# Prisma Performance Optimization

## Overview

Poor Prisma query patterns lead to slow APIs. The most common issues are: selecting too many fields, the N+1 problem, and missing database indexes. This guide shows how to identify and fix them.

---

## 1. Select Only What You Need

Never fetch the entire record if you only need a few fields:

```typescript
// BAD — fetches ALL fields including password, large text, etc.
const users = await prisma.user.findMany();

// GOOD — only fetch what you need
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});
```

This reduces the amount of data transferred from the database.

---

## 2. Avoid the N+1 Problem

The N+1 problem: fetching a list of N records, then making N additional queries to get related data.

```typescript
// BAD — N+1 problem: 1 query for users + N queries for posts (one per user)
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { authorId: user.id } });
  // ...
}

// GOOD — single query with include: 1 query total using a JOIN
const users = await prisma.user.findMany({
  include: { posts: true },
});
```

Always use `include` or `select` with nested relations to batch the data in a single query.

---

## 3. `findUnique` vs `findFirst`

| Method       | Use when                                  | Performance                               |
| ------------ | ----------------------------------------- | ----------------------------------------- |
| `findUnique` | Querying by `@id` or `@unique` field      | Faster (uses index automatically)         |
| `findFirst`  | Querying by any field (may not be unique) | May do a full table scan without an index |

```typescript
// GOOD — findUnique on primary key (always uses index)
const user = await prisma.user.findUnique({ where: { id: 1 } });
const user = await prisma.user.findUnique({
  where: { email: "alice@example.com" },
});

// OK — findFirst on non-unique field, but ensure @@index exists in schema
const post = await prisma.post.findFirst({ where: { authorId: 1 } });
```

---

## 4. Add Database Indexes

Indexes speed up queries that filter or sort by a field. Add them in your schema:

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  authorId  Int
  status    String
  createdAt DateTime @default(now())

  @@index([authorId])           // speed up finding posts by author
  @@index([status])             // speed up filtering by status
  @@index([status, createdAt])  // speed up sorting + filtering together
}
```

> Always add `@@index` on foreign key fields and fields you frequently filter or sort by.

---

## 5. Limit `include` Depth

Deeply nested includes can generate complex JOIN queries. Keep includes shallow:

```typescript
// BAD — deeply nested, complex JOIN
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      include: {
        comments: {
          include: { author: { include: { profile: true } } },
        },
      },
    },
  },
});

// GOOD — keep it flat, make multiple targeted queries if needed
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: { select: { id: true, title: true } } },
});
```

---

## 6. Connection Pooling

Prisma uses a connection pool internally. For serverless environments (Vercel, AWS Lambda), use [Prisma Accelerate](https://www.prisma.io/accelerate) or configure `connection_limit`:

```env
# In .env — limit connections per instance (important for serverless)
DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=5"
```

For long-running servers, the default pool size is fine.

---

## 7. Reuse the Prisma Client Instance

Never create a new `PrismaClient` on every request — it opens new connections each time:

```typescript
// BAD — creates a new connection pool per request
async function getUser(id: number) {
  const prisma = new PrismaClient(); // ← wrong
  return prisma.user.findUnique({ where: { id } });
}

// GOOD — share a single instance across the app
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default prisma;
```

---

## 8. Enable Query Logging (Development Only)

Log slow or unexpected queries during development:

```typescript
const prisma = new PrismaClient({
  log: ["query", "warn", "error"],
});

// Or log only slow queries
const prisma = new PrismaClient({
  log: [{ level: "query", emit: "event" }],
});

prisma.$on("query", (e) => {
  if (e.duration > 100) {
    console.warn(`Slow query (${e.duration}ms): ${e.query}`);
  }
});
```

---

## Key Rules

- Use `select` to avoid fetching unnecessary fields.
- Use `include` to avoid N+1 — never loop and query inside a loop.
- Add `@@index` on foreign key fields and fields used in `where` / `orderBy`.
- Keep includes shallow — max 2-3 levels deep.
- Always use a single shared `PrismaClient` instance.
- Use `findUnique` for lookups by `@id` or `@unique` fields — it's always indexed.
