---
name: prisma-pagination-filtering
description: "Prisma pagination and filtering — offset vs cursor pagination; where filters; orderBy; skip/take; cursor-based pagination. Use when: implementing paginated APIs; adding search or filter functionality; sorting results; building list endpoints."
---

# Prisma Pagination & Filtering

## Overview

Prisma provides flexible tools for pagination (`skip`/`take` for offset, `cursor` for cursor-based) and filtering via the `where` clause. Use these to build efficient list and search endpoints.

---

## 1. Offset Pagination (Page-Based)

Simple page/limit style. Good for small datasets and when users jump between pages.

```typescript
async function getUsers(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

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

---

## 2. Cursor-Based Pagination (Infinite Scroll / Next Page)

Better for large datasets and real-time feeds. Uses the last item's ID as the cursor.

```typescript
async function getPosts(cursor?: number, take = 10) {
  const posts = await prisma.post.findMany({
    take,
    // If cursor is provided, start after that record
    ...(cursor && {
      skip: 1, // skip the cursor record itself
      cursor: { id: cursor },
    }),
    orderBy: { createdAt: "desc" },
  });

  const nextCursor = posts.length === take ? posts[posts.length - 1].id : null;

  return {
    data: posts,
    nextCursor, // pass this as `cursor` in the next request
  };
}

// First page (no cursor)
const page1 = await getPosts();

// Next page (use the cursor from previous response)
const page2 = await getPosts(page1.nextCursor ?? undefined);
```

---

## 3. Filtering with `where`

### Basic filters

```typescript
// Exact match
const users = await prisma.user.findMany({
  where: { role: "ADMIN" },
});

// Multiple conditions (implicit AND)
const posts = await prisma.post.findMany({
  where: {
    published: true,
    authorId: 1,
  },
});
```

### String search

```typescript
// Contains (case-insensitive)
const users = await prisma.user.findMany({
  where: {
    name: { contains: "alice", mode: "insensitive" },
  },
});

// Starts with
const users = await prisma.user.findMany({
  where: {
    email: { startsWith: "alice" },
  },
});
```

### Number / date range

```typescript
// Between two values
const posts = await prisma.post.findMany({
  where: {
    createdAt: {
      gte: new Date("2024-01-01"),
      lte: new Date("2024-12-31"),
    },
  },
});
```

### OR / AND / NOT

```typescript
// OR — match any condition
const users = await prisma.user.findMany({
  where: {
    OR: [{ email: { contains: "alice" } }, { name: { contains: "alice" } }],
  },
});

// NOT — exclude matches
const users = await prisma.user.findMany({
  where: {
    NOT: { role: "BANNED" },
  },
});

// Combining AND + OR
const posts = await prisma.post.findMany({
  where: {
    AND: [
      { published: true },
      {
        OR: [{ title: { contains: "prisma" } }, { content: { contains: "prisma" } }],
      },
    ],
  },
});
```

### Filter on related records

```typescript
// Posts where the author is an admin
const posts = await prisma.post.findMany({
  where: {
    author: { role: "ADMIN" },
  },
});

// Users who have at least one published post
const users = await prisma.user.findMany({
  where: {
    posts: { some: { published: true } },
  },
});

// Users where ALL posts are published
const users = await prisma.user.findMany({
  where: {
    posts: { every: { published: true } },
  },
});

// Users with NO posts
const users = await prisma.user.findMany({
  where: {
    posts: { none: {} },
  },
});
```

---

## 4. Sorting with `orderBy`

```typescript
// Single field
const posts = await prisma.post.findMany({
  orderBy: { createdAt: "desc" },
});

// Multiple fields (primary sort, then secondary)
const posts = await prisma.post.findMany({
  orderBy: [
    { published: "desc" }, // published posts first
    { createdAt: "desc" }, // then by newest
  ],
});

// Sort by related field
const posts = await prisma.post.findMany({
  orderBy: {
    author: { name: "asc" },
  },
});
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
  sortOrder?: "asc" | "desc";
}

async function searchPosts(params: QueryParams) {
  const { search, status, page = 1, pageSize = 10, sortBy = "createdAt", sortOrder = "desc" } = params;

  const where = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { content: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(status && { status }),
  };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { author: { select: { id: true, name: true } } },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  };
}
```

---

## Key Rules

- Always run `findMany` and `count` in the same `$transaction` to get consistent totals.
- Use cursor pagination for large tables and infinite scroll; use offset for small datasets with page numbers.
- Add `@@index` in the schema on any fields you frequently filter or sort by.
- Use `mode: "insensitive"` for case-insensitive string searches.
