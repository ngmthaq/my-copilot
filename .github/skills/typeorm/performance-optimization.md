---
name: typeorm-performance-optimization
description: "TypeORM performance optimization — selecting specific columns; avoiding N+1 queries with relations; indexes; connection pool configuration; query caching. Use when: queries are slow; reducing data transfer; avoiding N+1 problems; optimizing database connections."
---

# TypeORM Performance Optimization

## Overview

Common TypeORM performance issues are: selecting all columns when only a few are needed, the N+1 problem from improperly loaded relations, and missing database indexes. This guide covers how to identify and fix them.

---

## 1. Select Only What You Need

Never fetch the entire entity if you only need a few columns:

```typescript
// BAD — fetches ALL columns including password, large text blobs, etc.
const users = await userRepository.find();

// GOOD (Repository API) — select specific fields
const users = await userRepository.find({
  select: {
    id: true,
    email: true,
    name: true,
  },
});

// GOOD (QueryBuilder) — same result
const users = await userRepository.createQueryBuilder("user").select(["user.id", "user.email", "user.name"]).getMany();
```

---

## 2. Avoid the N+1 Problem

The N+1 problem: fetching N records then making N extra queries to get their relations.

```typescript
// BAD — N+1: 1 query for users + N queries for posts (one per user)
const users = await userRepository.find();
for (const user of users) {
  const posts = await postRepository.find({ where: { authorId: user.id } });
}

// GOOD — single query with relation: fetches users and posts in one JOIN
const users = await userRepository.find({
  relations: { posts: true },
});
```

Or using `QueryBuilder` for more control:

```typescript
// Efficient join — fetches everything in one query
const users = await userRepository
  .createQueryBuilder("user")
  .leftJoinAndSelect("user.posts", "post", "post.published = :published", { published: true })
  .getMany();
```

---

## 3. Add Database Indexes

Indexes speed up queries that filter or sort by a field. Define indexes on your entity:

```typescript
import { Entity, Column, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("posts")
@Index(["authorId"]) // index on foreign key
@Index(["status", "createdAt"]) // composite index for common filter+sort pattern
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Index() // inline index on a single column
  @Column({ unique: true })
  slug: string;

  @Column()
  authorId: number;

  @Column()
  status: string;
}
```

> Always add `@Index()` on foreign key columns and fields used in `where` / `order`.

---

## 4. Use `loadRelationIdAndMap` Instead of Full Joins

When you only need the related IDs (not the full entity), avoid loading the full relation:

```typescript
// BAD — loads full author objects just to get IDs
const posts = await postRepository.find({ relations: { author: true } });

// GOOD — loads only the authorId, not the full User entity
const posts = await postRepository
  .createQueryBuilder("post")
  .loadRelationIdAndMap("post.authorId", "post.author")
  .getMany();
```

---

## 5. Limit Relation Depth

Deep nested `relations` generate complex multi-level JOINs. Keep it shallow:

```typescript
// BAD — deeply nested, many JOINs
const users = await userRepository.find({
  relations: {
    posts: {
      comments: {
        author: {
          profile: true,
        },
      },
    },
  },
});

// GOOD — flat, targeted queries
const users = await userRepository.find({
  relations: { posts: true },
  select: { id: true, name: true, posts: { id: true, title: true } },
});
```

---

## 6. Connection Pool Configuration

Configure the pool size in your `DataSource`:

```typescript
// src/data-source.ts
export const AppDataSource = new DataSource({
  type: "postgres",
  // ...
  extra: {
    // Connection pool settings
    max: 10, // max connections in the pool (default: 10)
    min: 2, // min idle connections
    idleTimeoutMillis: 30000, // close idle connections after 30s
  },
});
```

For serverless environments, reduce pool size:

```typescript
extra: {
  max: 2,    // serverless functions don't need large pools
},
```

---

## 7. Query Caching

Cache frequently-read, rarely-changed data:

```typescript
// Enable cache in DataSource configuration (uses in-memory cache by default)
export const AppDataSource = new DataSource({
  // ...
  cache: true,
  // OR with Redis:
  // cache: {
  //   type: "redis",
  //   options: { host: "localhost", port: 6379 },
  // },
});

// Cache a specific query for 60 seconds
const roles = await roleRepository.find({
  cache: {
    id: "all_roles",
    milliseconds: 60000, // 60 seconds
  },
});

// Invalidate the cache manually
await AppDataSource.queryResultCache?.remove(["all_roles"]);
```

---

## 8. Use `getOne` vs `getMany` Correctly

```typescript
// Use getOne() when you expect a single result
const user = await userRepository.createQueryBuilder("user").where("user.id = :id", { id: 1 }).getOne(); // returns User | null

// Use getOneOrFail() to throw if not found
const user = await userRepository.createQueryBuilder("user").where("user.id = :id", { id: 1 }).getOneOrFail(); // throws EntityNotFoundError if missing
```

---

## Key Rules

- Use `select` to avoid fetching unnecessary columns.
- Always use `relations` or a join to load related data — never loop and query inside a loop.
- Add `@Index()` on foreign key columns and fields used in `where` / `order`.
- Keep relation loading shallow — max 2 levels deep.
- Use `loadRelationIdAndMap` when you only need the related ID, not the full entity.
- Use connection pool settings appropriate to your environment (fewer connections for serverless).
- Cache static or rarely-changing data to reduce database load.
