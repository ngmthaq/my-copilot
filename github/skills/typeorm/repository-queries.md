---
name: typeorm-repository-queries
description: "TypeORM repository queries — CRUD operations using find, findOne, save, insert, update, delete, count, and QueryBuilder. Use when: writing database queries; reading or writing records; filtering results; selecting specific columns."
---

# TypeORM Repository Queries

## Overview

TypeORM provides two main ways to query the database: the **Repository API** (simple, method-based) and the **QueryBuilder** (flexible, SQL-like). Use the Repository API for common CRUD — switch to QueryBuilder for complex joins or conditions.

---

## 1. Setup

```typescript
// Get a repository for an entity
import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";

const userRepository = AppDataSource.getRepository(User);
```

In NestJS, inject the repository via `@InjectRepository()` (see `integration-nestjs-express.md`).

---

## 2. Read Records

### Find many

```typescript
// Get all users
const users = await userRepository.find();

// With filter, sorting, and limit
const activeUsers = await userRepository.find({
  where: { isActive: true },
  order: { createdAt: "DESC" },
  take: 10, // limit
  skip: 0, // offset
});
```

### Find one

```typescript
// By primary key
const user = await userRepository.findOne({ where: { id: 1 } });

// By any field
const user = await userRepository.findOne({ where: { email: "alice@example.com" } });

// Returns null if not found — always check!
if (!user) {
  throw new NotFoundException("User not found");
}
```

### Find by primary key (shorthand)

```typescript
const user = await userRepository.findOneBy({ id: 1 });
```

---

## 3. Create Records

```typescript
// Option 1: create entity instance, then save
const user = userRepository.create({
  email: "alice@example.com",
  name: "Alice",
});
const saved = await userRepository.save(user);

// Option 2: save a plain object directly
const saved = await userRepository.save({
  email: "alice@example.com",
  name: "Alice",
});

// Insert many (faster than save for bulk inserts — skips hooks/events)
await userRepository.insert([
  { email: "bob@example.com", name: "Bob" },
  { email: "carol@example.com", name: "Carol" },
]);
```

---

## 4. Update Records

```typescript
// Option 1: load, modify, save (triggers hooks)
const user = await userRepository.findOneBy({ id: 1 });
if (!user) throw new NotFoundException("User not found");
user.name = "Alice Updated";
await userRepository.save(user);

// Option 2: update by condition (does NOT load the entity — faster, skips hooks)
await userRepository.update({ id: 1 }, { name: "Alice Updated" });

// Update by primary key (shorthand)
await userRepository.update(1, { name: "Alice Updated" });
```

---

## 5. Delete Records

```typescript
// Delete by condition (does NOT load the entity)
await userRepository.delete({ id: 1 });

// Delete by primary key (shorthand)
await userRepository.delete(1);

// Soft delete (sets deletedAt, requires @DeleteDateColumn on entity)
await userRepository.softDelete(1);

// Restore a soft-deleted record
await userRepository.restore(1);
```

---

## 6. Upsert (Insert or Update)

```typescript
// Insert if not exists, update if exists (based on conflict column)
await userRepository.upsert(
  { email: "alice@example.com", name: "Alice" },
  ["email"], // conflict target — the unique column(s)
);
```

---

## 7. Count Records

```typescript
// Count all users
const total = await userRepository.count();

// Count with filter
const activeCount = await userRepository.count({ where: { isActive: true } });
```

---

## 8. Select Specific Columns

```typescript
const users = await userRepository.find({
  select: {
    id: true,
    email: true,
    name: true,
    // password is NOT selected — good for security
  },
});
// Returns: { id, email, name }[]
```

---

## 9. Load Relations

```typescript
// Include related data
const user = await userRepository.findOne({
  where: { id: 1 },
  relations: {
    posts: true, // load posts relation
    profile: true, // load profile relation
  },
});

// Nested relations
const user = await userRepository.findOne({
  where: { id: 1 },
  relations: {
    posts: {
      comments: true, // load posts and their comments
    },
  },
});
```

---

## 10. QueryBuilder (Complex Queries)

Use `QueryBuilder` for complex filtering, joins, aggregations, or raw SQL-like control:

```typescript
// Basic QueryBuilder
const users = await userRepository
  .createQueryBuilder("user")
  .where("user.isActive = :isActive", { isActive: true })
  .andWhere("user.role = :role", { role: "ADMIN" })
  .orderBy("user.createdAt", "DESC")
  .take(10)
  .skip(0)
  .getMany();

// With JOIN
const posts = await postRepository
  .createQueryBuilder("post")
  .innerJoinAndSelect("post.author", "author") // join and select author
  .where("author.role = :role", { role: "ADMIN" })
  .getMany();

// Select specific columns
const users = await userRepository.createQueryBuilder("user").select(["user.id", "user.email", "user.name"]).getMany();
```

---

## Quick Reference

| Operation          | Repository Method           |
| ------------------ | --------------------------- |
| Get all            | `find()`                    |
| Get one            | `findOne()`                 |
| Get by PK          | `findOneBy({ id })`         |
| Create + save      | `create()` + `save()`       |
| Bulk insert        | `insert([])`                |
| Update (load+save) | `save(modified entity)`     |
| Update (direct)    | `update(id, partial)`       |
| Delete             | `delete(id)`                |
| Soft delete        | `softDelete(id)`            |
| Restore            | `restore(id)`               |
| Create or update   | `upsert(data, conflictKey)` |
| Count              | `count()`                   |
| Complex query      | `createQueryBuilder()`      |
