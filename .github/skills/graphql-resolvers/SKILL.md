---
name: graphql-resolvers
description: "GraphQL resolvers — resolver functions, context, parent chaining, field resolvers, and resolver organization. Use when: implementing resolver logic; accessing context/parent; organizing resolvers; mapping database to GraphQL. DO NOT USE FOR: schema design (use graphql-schema-design skill); DataLoader (use graphql-dataloader-pattern skill)."
---

# GraphQL Resolvers Skill

## Overview

Covers resolver implementation — the four arguments, parent chaining, field resolvers, context setup, and organization.

---

## 1. Resolver Signature

```typescript
// Every resolver receives 4 arguments
(parent, args, context, info) => result;

// parent  — result from parent resolver (undefined for root Query/Mutation)
// args    — arguments passed to the field
// context — shared per-request state (auth, DB, loaders)
// info    — query AST metadata (rarely used directly)
```

---

## 2. Query & Mutation Resolvers

```typescript
const resolvers = {
  Query: {
    user: (_parent, { id }, { prisma }) =>
      prisma.user.findUnique({ where: { id } }),

    users: (_parent, { filter, pagination }, { prisma }) => {
      const { page = 1, limit = 20 } = pagination || {};
      return prisma.user.findMany({
        where: buildFilter(filter),
        skip: (page - 1) * limit,
        take: limit,
      });
    },

    me: (_parent, _args, { currentUser }) => {
      if (!currentUser) throw new GraphQLError("Not authenticated");
      return currentUser;
    },
  },

  Mutation: {
    createUser: (_parent, { input }, { prisma }) =>
      prisma.user.create({ data: input }),

    updateUser: (_parent, { id, input }, { prisma }) =>
      prisma.user.update({ where: { id }, data: input }),

    deleteUser: async (_parent, { id }, { prisma }) => {
      await prisma.user.delete({ where: { id } });
      return true;
    },
  },
};
```

---

## 3. Field Resolvers (Parent Chaining)

```typescript
const resolvers = {
  User: {
    // parent = the User object from the parent resolver
    posts: (parent, _args, { prisma }) =>
      prisma.post.findMany({ where: { authorId: parent.id } }),

    // Computed field
    fullName: (parent) => `${parent.firstName} ${parent.lastName}`,

    // With DataLoader (avoids N+1)
    posts: (parent, _args, { loaders }) =>
      loaders.postsByAuthor.load(parent.id),
  },

  Post: {
    author: (parent, _args, { loaders }) => loaders.user.load(parent.authorId),
  },
};
```

---

## 4. Context Setup

```typescript
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

interface Context {
  prisma: PrismaClient;
  currentUser: User | null;
  loaders: ReturnType<typeof createDataLoaders>;
}

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }): Promise<Context> => {
      const token = req.headers.authorization?.replace("Bearer ", "");
      const currentUser = token ? await getUserFromToken(token) : null;
      return { prisma, currentUser, loaders: createDataLoaders(prisma) };
    },
  }),
);
```

---

## 5. Resolver Organization

```
src/resolvers/
├── index.ts              # Merges all resolvers
├── user.resolver.ts
├── post.resolver.ts
└── comment.resolver.ts
```

```typescript
// resolvers/index.ts
import { mergeResolvers } from "@graphql-tools/merge";
import { userResolvers } from "./user.resolver";
import { postResolvers } from "./post.resolver";

export const resolvers = mergeResolvers([userResolvers, postResolvers]);
```

---

## 6. Interface & Union Resolvers

```typescript
const resolvers = {
  Node: {
    __resolveType(obj) {
      if (obj.email) return "User";
      if (obj.title) return "Post";
      return null;
    },
  },

  SearchResult: {
    __resolveType(obj) {
      if (obj.email) return "User";
      if (obj.title) return "Post";
      return null;
    },
  },
};
```

---

## 7. Best Practices

- **Keep resolvers thin** — delegate to service/repository layers
- **Use DataLoader** for field resolvers fetching related data (avoid N+1)
- **Type your context** — define a `Context` interface
- **Default resolvers work** — if parent has a matching field name, no resolver needed
- **Throw `GraphQLError`** with error codes for client-friendly errors
- **Never mutate context** — it's shared across all resolvers in a request
- **Use `_parent` / `_args`** prefix for unused parameters
