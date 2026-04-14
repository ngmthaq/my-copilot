---
name: typeorm-pagination-filtering
description: "TypeORM pagination and filtering — offset pagination; where filters; order; skip/take; QueryBuilder for complex queries. Use when: implementing paginated APIs; adding search or filter functionality; sorting results; building list endpoints."
---

# TypeORM Pagination & Filtering

## Overview

TypeORM supports offset pagination with `skip`/`take` on the Repository API and full `QueryBuilder` for complex filtering. Use the Repository API for simple cases and `QueryBuilder` when you need dynamic conditions, joins, or search across multiple fields.

---

## 1. Offset Pagination (Page-Based)

Simple page/limit style — good for small-to-medium datasets.

```typescript
async function getUsers(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;

  const [users, total] = await userRepository.findAndCount({
    skip,
    take: pageSize,
    order: { createdAt: "DESC" },
  });

  return {
    data: users,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

// Usage: page 2, 10 items per page
const result = await getUsers(2, 10);
```

> `findAndCount` runs `SELECT` and `SELECT COUNT(*)` in a single call.

---

## 2. Filtering with `where`

### Basic filters (Repository API)

```typescript
import {
  Equal,
  Not,
  In,
  Like,
  ILike,
  MoreThan,
  LessThan,
  Between,
  IsNull,
} from "typeorm";

// Exact match
await userRepository.find({ where: { role: "ADMIN" } });

// Not equal
await userRepository.find({ where: { status: Not("DELETED") } });

// In a list
await userRepository.find({ where: { role: In(["ADMIN", "MODERATOR"]) } });

// String contains (case-sensitive)
await userRepository.find({ where: { name: Like("%alice%") } });

// String contains (case-insensitive) — PostgreSQL only
await userRepository.find({ where: { name: ILike("%alice%") } });

// Greater than / less than
await postRepository.find({ where: { views: MoreThan(100) } });
await postRepository.find({ where: { age: Between(18, 65) } });

// Null check
await userRepository.find({ where: { deletedAt: IsNull() } });
```

### OR conditions

```typescript
// Pass an array to `where` for OR behavior
const users = await userRepository.find({
  where: [{ email: "alice@example.com" }, { name: ILike("%alice%") }],
});
// WHERE email = 'alice@example.com' OR name ILIKE '%alice%'
```

---

## 3. Sorting with `order`

```typescript
// Single field
const posts = await postRepository.find({
  order: { createdAt: "DESC" },
});

// Multiple fields
const posts = await postRepository.find({
  order: {
    published: "DESC", // published posts first
    createdAt: "DESC", // then newest first
  },
});
```

---

## 4. QueryBuilder for Complex Queries

Use `QueryBuilder` when you need dynamic filters, full-text search, or joins:

```typescript
// Search with dynamic conditions
const posts = await postRepository
  .createQueryBuilder("post")
  .leftJoinAndSelect("post.author", "author")
  .where("post.published = :published", { published: true })
  .andWhere(
    new Brackets((qb) => {
      qb.where("post.title ILIKE :search", { search: `%${search}%` }).orWhere(
        "post.content ILIKE :search",
        {
          search: `%${search}%`,
        },
      );
    }),
  )
  .orderBy("post.createdAt", "DESC")
  .skip(skip)
  .take(pageSize)
  .getManyAndCount(); // returns [results, total]

const [posts, total] = result;
```

---

## 5. Full Example: Search + Filter + Sort + Paginate

```typescript
interface QueryParams {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

async function searchPosts(params: QueryParams) {
  const {
    search,
    status,
    page = 1,
    pageSize = 10,
    sortBy = "createdAt",
    sortOrder = "DESC",
  } = params;

  const qb = postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.author", "author")
    .select([
      "post.id",
      "post.title",
      "post.status",
      "post.createdAt",
      "author.id",
      "author.name",
    ]);

  if (status) {
    qb.andWhere("post.status = :status", { status });
  }

  if (search) {
    qb.andWhere(
      new Brackets((qb) => {
        qb.where("post.title ILIKE :search", { search: `%${search}%` }).orWhere(
          "post.content ILIKE :search",
          {
            search: `%${search}%`,
          },
        );
      }),
    );
  }

  const [posts, total] = await qb
    .orderBy(`post.${sortBy}`, sortOrder)
    .skip((page - 1) * pageSize)
    .take(pageSize)
    .getManyAndCount();

  return {
    data: posts,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  };
}
```

---

## 6. Select Specific Columns with QueryBuilder

```typescript
const users = await userRepository
  .createQueryBuilder("user")
  .select(["user.id", "user.email", "user.name"]) // only these columns
  .where("user.isActive = :active", { active: true })
  .getMany();
```

---

## TypeORM Filter Operators Reference

| Operator      | Example            | SQL equivalent      |
| ------------- | ------------------ | ------------------- |
| `Equal`       | `Equal("ADMIN")`   | `= 'ADMIN'`         |
| `Not`         | `Not("DELETED")`   | `!= 'DELETED'`      |
| `In`          | `In(["A", "B"])`   | `IN ('A', 'B')`     |
| `Like`        | `Like("%alice%")`  | `LIKE '%alice%'`    |
| `ILike`       | `ILike("%alice%")` | `ILIKE '%alice%'`   |
| `MoreThan`    | `MoreThan(100)`    | `> 100`             |
| `LessThan`    | `LessThan(100)`    | `< 100`             |
| `Between`     | `Between(10, 20)`  | `BETWEEN 10 AND 20` |
| `IsNull`      | `IsNull()`         | `IS NULL`           |
| `Not(IsNull)` | `Not(IsNull())`    | `IS NOT NULL`       |

---

## Key Rules

- Use `findAndCount` (Repository) or `getManyAndCount` (QueryBuilder) to get data and total in one call.
- Use array `where` for OR conditions in the Repository API.
- Use `QueryBuilder` with `Brackets` for complex OR/AND combinations.
- Add `@Index()` in the schema on any fields used in `where` / `order` for query performance.
- Always validate and sanitize `sortBy` values before passing to `orderBy` to prevent SQL injection.
