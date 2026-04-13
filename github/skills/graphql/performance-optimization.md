---
name: graphql-performance-optimization
description: "GraphQL performance optimization — query complexity, depth limiting, persisted queries, caching, field-level optimization, and monitoring. Use when: optimizing slow queries; limiting query depth/complexity; implementing caching; preventing abuse. DO NOT USE FOR: DataLoader batching (use graphql-dataloader-pattern skill); schema design (use graphql-schema-design skill)."
---

# GraphQL Performance Optimization Skill

## Overview

Covers performance techniques — query complexity analysis, depth limiting, persisted queries, caching strategies, and monitoring.

---

## 1. Query Depth Limiting

```typescript
// Prevent deeply nested queries that can overwhelm the server
// npm install graphql-depth-limit
import depthLimit from "graphql-depth-limit";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(7)], // Max 7 levels deep
});

// This would be rejected (too deep):
// query { user { posts { comments { author { posts { comments { ... } } } } } } }
```

---

## 2. Query Complexity Analysis

```typescript
// Assign cost to fields, reject queries exceeding a budget
// npm install graphql-query-complexity
import { createComplexityLimitRule, simpleEstimator, fieldExtensionsEstimator } from "graphql-query-complexity";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [
    createComplexityLimitRule(1000, {
      estimators: [fieldExtensionsEstimator(), simpleEstimator({ defaultComplexity: 1 })],
      onComplete: (complexity) => {
        console.log("Query complexity:", complexity);
      },
    }),
  ],
});
```

```graphql
# Schema with complexity hints
type Query {
  users(first: Int = 20): [User!]! # complexity = first * child complexity
}

type User {
  id: ID! # cost: 1
  name: String! # cost: 1
  posts: [Post!]! # cost: 10 (expensive relationship)
}
```

---

## 3. Persisted Queries (APQ)

```typescript
// Client sends a hash instead of the full query string
// Reduces bandwidth and prevents arbitrary queries in production

// Server setup (Apollo)
import { ApolloServerPluginPersistedQueries } from "@apollo/server/plugin/persistedQueries";
import { KeyvAdapter } from "@apollo/utils.keyvadapter";
import Keyv from "keyv";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginPersistedQueries({
      cache: new KeyvAdapter(new Keyv("redis://localhost:6379")),
    }),
  ],
});

// Client sends:
// POST { "extensions": { "persistedQuery": { "sha256Hash": "abc123..." } } }
// First request: server returns "PersistedQueryNotFound", client resends with full query
// Subsequent: server uses cached query
```

---

## 4. Response Caching

```typescript
// Apollo Server response cache
// npm install @apollo/server-plugin-response-cache
import responseCachePlugin from "@apollo/server-plugin-response-cache";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [responseCachePlugin()],
});
```

```graphql
# Cache hints in schema
type Query {
  posts: [Post!]! @cacheControl(maxAge: 60) # Cache 60 seconds
  user(id: ID!): User @cacheControl(maxAge: 30, scope: PRIVATE)
}

type Post {
  id: ID!
  title: String!
  viewCount: Int! @cacheControl(maxAge: 0) # Never cache
}
```

```typescript
// Programmatic cache hints in resolvers
const resolvers = {
  Query: {
    posts: (_parent, _args, _ctx, info) => {
      info.cacheControl.setCacheHint({ maxAge: 60 });
      return getPosts();
    },
  },
};
```

---

## 5. Field-Level Optimization

```typescript
// Only fetch fields that are actually requested
import { parseResolveInfo } from "graphql-parse-resolve-info";

const resolvers = {
  Query: {
    users: (_parent, args, { prisma }, info) => {
      const parsedInfo = parseResolveInfo(info);
      const requestedFields = Object.keys(parsedInfo.fieldsByTypeName.User);

      // Build Prisma select from requested fields
      const select = {};
      for (const field of requestedFields) {
        if (field !== "posts") select[field] = true; // Skip relations
      }

      return prisma.user.findMany({ select });
    },
  },
};
```

---

## 6. Pagination Limits

```graphql
# Always enforce maximum page sizes
input PaginationInput {
  first: Int = 20 # Default
  after: String
}
```

```typescript
// Validate and cap pagination
const resolvers = {
  Query: {
    posts: (_parent, { first = 20, after }, { prisma }) => {
      const limit = Math.min(first, 100); // Cap at 100
      return prisma.post.findMany({ take: limit });
    },
  },
};
```

---

## 7. Query Allowlisting (Production)

```typescript
// Only allow pre-registered queries in production
// Prevents malicious or expensive ad-hoc queries

const allowedQueries = new Map<string, string>(); // hash → query

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    {
      async requestDidStart() {
        return {
          async didResolveOperation(ctx) {
            if (process.env.NODE_ENV === "production") {
              const hash = computeHash(ctx.request.query);
              if (!allowedQueries.has(hash)) {
                throw new GraphQLError("Query not allowed", {
                  extensions: { code: "FORBIDDEN" },
                });
              }
            }
          },
        };
      },
    },
  ],
});
```

---

## 8. Monitoring & Tracing

```typescript
// Apollo Studio tracing
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginUsageReporting()],
});

// Custom plugin for slow query logging
const slowQueryPlugin = {
  async requestDidStart() {
    const start = Date.now();
    return {
      async willSendResponse(ctx) {
        const duration = Date.now() - start;
        if (duration > 1000) {
          console.warn(`Slow query (${duration}ms):`, ctx.request.query);
        }
      },
    };
  },
};
```

---

## 9. Best Practices

- **Set depth limits** — 5-10 levels is reasonable for most APIs
- **Set complexity limits** — prevent expensive queries from overwhelming the server
- **Use DataLoader** — solve N+1 before adding caching
- **Cache at the right level** — response cache for public data, DataLoader for per-request
- **Enforce pagination limits** — cap `first`/`limit` at 100
- **Use persisted queries** — reduces bandwidth and attack surface
- **Monitor resolver performance** — identify and optimize slow resolvers
- **Avoid over-fetching from DB** — use `info` to select only requested fields
