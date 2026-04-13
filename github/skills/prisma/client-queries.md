---
name: prisma-client-queries
description: "Prisma client queries — CRUD operations using findMany, findUnique, create, update, delete, upsert, count, select, include. Use when: writing database queries; reading or writing records; filtering results; selecting specific fields."
---

# Prisma Client Queries

## Overview

Prisma Client provides type-safe methods to interact with your database. All methods are async and return strongly-typed results based on your schema.

---

## 1. Setup

```typescript
// src/lib/prisma.ts — create a single shared instance
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
```

Import and use it anywhere:

```typescript
import prisma from "../lib/prisma";
```

---

## 2. Read Records

### Find many records

```typescript
// Get all users
const users = await prisma.user.findMany();

// With filter, sorting, and limit
const activeUsers = await prisma.user.findMany({
  where: { isActive: true },
  orderBy: { createdAt: "desc" },
  take: 10, // limit
  skip: 0, // offset
});
```

### Find a single record

```typescript
// By primary key — returns null if not found
const user = await prisma.user.findUnique({
  where: { id: 1 },
});

// By any unique field
const user = await prisma.user.findUnique({
  where: { email: "alice@example.com" },
});

// First match — useful for non-unique fields
const post = await prisma.post.findFirst({
  where: { authorId: 1, published: true },
  orderBy: { createdAt: "desc" },
});
```

---

## 3. Create Records

```typescript
// Create one
const newUser = await prisma.user.create({
  data: {
    email: "alice@example.com",
    name: "Alice",
  },
});

// Create many
await prisma.user.createMany({
  data: [
    { email: "bob@example.com", name: "Bob" },
    { email: "carol@example.com", name: "Carol" },
  ],
  skipDuplicates: true, // ignore records that already exist
});
```

---

## 4. Update Records

```typescript
// Update one by primary key (throws if not found)
const updated = await prisma.user.update({
  where: { id: 1 },
  data: { name: "Alice Updated" },
});

// Update many matching records
await prisma.post.updateMany({
  where: { published: false, authorId: 1 },
  data: { published: true },
});
```

---

## 5. Delete Records

```typescript
// Delete one by primary key (throws if not found)
await prisma.user.delete({
  where: { id: 1 },
});

// Delete many matching records
await prisma.post.deleteMany({
  where: { authorId: 1 },
});
```

---

## 6. Upsert (Create or Update)

Creates the record if it doesn't exist, otherwise updates it:

```typescript
const user = await prisma.user.upsert({
  where: { email: "alice@example.com" },
  create: {
    email: "alice@example.com",
    name: "Alice",
  },
  update: {
    name: "Alice Updated",
  },
});
```

---

## 7. Count Records

```typescript
// Count all users
const total = await prisma.user.count();

// Count with filter
const activeCount = await prisma.user.count({
  where: { isActive: true },
});
```

---

## 8. Select Specific Fields

Use `select` to return only the fields you need (reduces data transfer):

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    email: true,
    name: true,
    // password is NOT selected — good for security
  },
});
// user is typed as { id: number; email: string; name: string | null }
```

---

## 9. Include Related Records

Use `include` to load related data in the same query:

```typescript
const userWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: true, // include all posts
    profile: true, // include profile
  },
});

// Include with filter on relations
const userWithPublishedPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: "desc" },
    },
  },
});
```

> **Note:** Use `select` OR `include`, not both at the top level. You can nest `select` inside `include`.

---

## 10. Where Filters

```typescript
// Exact match
where: { status: "ACTIVE" }

// Not equal
where: { status: { not: "DELETED" } }

// In a list of values
where: { role: { in: ["ADMIN", "MODERATOR"] } }

// String contains (case-insensitive)
where: { name: { contains: "alice", mode: "insensitive" } }

// String starts with
where: { email: { startsWith: "alice" } }

// Greater than / less than
where: { age: { gte: 18, lte: 65 } }

// Null check
where: { deletedAt: null }         // not deleted
where: { deletedAt: { not: null } } // is deleted

// AND / OR
where: {
  AND: [
    { published: true },
    { authorId: 1 },
  ]
}

where: {
  OR: [
    { email: "alice@example.com" },
    { name: "Alice" },
  ]
}
```

---

## Quick Reference

| Operation        | Method         |
| ---------------- | -------------- |
| Get all          | `findMany()`   |
| Get one by ID    | `findUnique()` |
| Get first match  | `findFirst()`  |
| Create one       | `create()`     |
| Create many      | `createMany()` |
| Update one       | `update()`     |
| Update many      | `updateMany()` |
| Delete one       | `delete()`     |
| Delete many      | `deleteMany()` |
| Create or update | `upsert()`     |
| Count            | `count()`      |
