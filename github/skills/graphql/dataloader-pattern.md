---
name: graphql-dataloader-pattern
description: "GraphQL DataLoader pattern — batching, caching, solving N+1 queries, per-request loader instances, and common patterns. Use when: fixing N+1 query problems; batching database calls; implementing field resolvers for relationships. DO NOT USE FOR: general resolver patterns (use graphql-resolvers skill); query optimization (use graphql-performance-optimization skill)."
---

# GraphQL DataLoader Pattern Skill

## Overview

Covers the DataLoader pattern — batching and caching to solve the N+1 query problem in GraphQL field resolvers.

---

## 1. The N+1 Problem

```graphql
# This query causes N+1 queries without DataLoader:
query {
  posts {
    # 1 query: SELECT * FROM posts
    title
    author {
      # N queries: SELECT * FROM users WHERE id = ? (once per post)
      name
    }
  }
}
# 10 posts = 11 queries. 100 posts = 101 queries.
```

---

## 2. DataLoader Solution

```typescript
// Install: npm install dataloader
import DataLoader from "dataloader";

// A DataLoader batches individual .load(id) calls into one batch call
const userLoader = new DataLoader<string, User>(async (ids) => {
  // Single query for all requested IDs
  const users = await prisma.user.findMany({
    where: { id: { in: [...ids] } },
  });

  // IMPORTANT: Return results in the same order as input IDs
  const userMap = new Map(users.map((u) => [u.id, u]));
  return ids.map((id) => userMap.get(id) || new Error(`User ${id} not found`));
});

// Usage: instead of direct DB query
// Before: prisma.user.findUnique({ where: { id: post.authorId } })
// After:  userLoader.load(post.authorId)
```

---

## 3. Creating Loaders (Per-Request)

```typescript
// loaders/index.ts
import DataLoader from "dataloader";
import { PrismaClient } from "@prisma/client";

export function createDataLoaders(prisma: PrismaClient) {
  return {
    // Load by primary key
    user: new DataLoader<string, User>(async (ids) => {
      const users = await prisma.user.findMany({
        where: { id: { in: [...ids] } },
      });
      const map = new Map(users.map((u) => [u.id, u]));
      return ids.map((id) => map.get(id) || new Error(`User ${id} not found`));
    }),

    // Load by foreign key (one-to-many)
    postsByAuthor: new DataLoader<string, Post[]>(async (authorIds) => {
      const posts = await prisma.post.findMany({
        where: { authorId: { in: [...authorIds] } },
      });
      const grouped = new Map<string, Post[]>();
      for (const post of posts) {
        const list = grouped.get(post.authorId) || [];
        list.push(post);
        grouped.set(post.authorId, list);
      }
      return authorIds.map((id) => grouped.get(id) || []);
    }),

    // Load count
    postsCountByAuthor: new DataLoader<string, number>(async (authorIds) => {
      const counts = await prisma.post.groupBy({
        by: ["authorId"],
        where: { authorId: { in: [...authorIds] } },
        _count: true,
      });
      const map = new Map(counts.map((c) => [c.authorId, c._count]));
      return authorIds.map((id) => map.get(id) || 0);
    }),
  };
}

export type DataLoaders = ReturnType<typeof createDataLoaders>;
```

---

## 4. Wire into Context

```typescript
// server.ts
interface Context {
  prisma: PrismaClient;
  currentUser: User | null;
  loaders: DataLoaders;
}

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }): Promise<Context> => ({
      prisma,
      currentUser: await getUserFromToken(req),
      loaders: createDataLoaders(prisma), // New instance per request
    }),
  }),
);
```

---

## 5. Use in Resolvers

```typescript
// DataLoader is used in field resolvers (type-level), not in Query/Mutation.
// Query/Mutation resolvers are called once — no N+1 problem there.
const resolvers = {
  Query: {
    posts: (_parent, args, { prisma }) => prisma.post.findMany({ take: args.first }), // No loader needed — single call
  },

  Post: {
    // Before (N+1): prisma.user.findUnique({ where: { id: parent.authorId } })
    // After (batched): one query for all authors in the request
    author: (parent, _args, { loaders }) => loaders.user.load(parent.authorId),
  },

  User: {
    posts: (parent, _args, { loaders }) => loaders.postsByAuthor.load(parent.id),

    postsCount: (parent, _args, { loaders }) => loaders.postsCountByAuthor.load(parent.id),
  },

  Comment: {
    author: (parent, _args, { loaders }) => loaders.user.load(parent.authorId),
  },
};
```

---

## 6. DataLoader with Filters

```typescript
// For loaders that need parameters beyond the key, use a compound key
const postsByAuthorAndStatus = new DataLoader<string, Post[]>(async (keys) => {
  // keys = ["authorId:published", "authorId:draft", ...]
  const parsed = keys.map((k) => {
    const [authorId, status] = k.split(":");
    return { authorId, status };
  });

  const posts = await prisma.post.findMany({
    where: {
      OR: parsed.map(({ authorId, status }) => ({
        authorId,
        status,
      })),
    },
  });

  // Group by compound key
  const grouped = new Map<string, Post[]>();
  for (const post of posts) {
    const key = `${post.authorId}:${post.status}`;
    const list = grouped.get(key) || [];
    list.push(post);
    grouped.set(key, list);
  }
  return keys.map((key) => grouped.get(key) || []);
});

// Usage
loaders.postsByAuthorAndStatus.load(`${authorId}:published`);
```

---

## 7. How DataLoader Works

```
Request timeline:
─────────────────────────────────────────────────
1. Resolver A calls loader.load("id1")          → queued
2. Resolver B calls loader.load("id2")          → queued
3. Resolver C calls loader.load("id1")          → cache hit (same request)
4. End of tick → DataLoader fires batch function
   → SELECT * FROM users WHERE id IN ("id1", "id2")
5. All three resolvers receive their results
─────────────────────────────────────────────────

Key behaviors:
- Batching: groups .load() calls within the same event loop tick
- Caching: same key in same request → returns cached result
- Per-request: new DataLoader instance per request (no cross-request cache)
```

---

## 8. Best Practices

- **Create new loaders per request** — never share instances across requests
- **Always return results in input order** — DataLoader requires this contract
- **Return `Error` for missing items** — not `null` or `undefined`
- **Use loaders for ALL relationship fields** — even if you think it's only loaded once
- **One loader per access pattern** — `userById`, `postsByAuthor`, `postsCountByAuthor`
- **Don't use DataLoader for mutations** — it's for read batching only
- **Use `.prime()` to seed cache** — after creating/updating, prime the loader: `loaders.user.prime(user.id, user)`
