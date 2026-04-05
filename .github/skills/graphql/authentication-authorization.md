---
name: graphql-authentication-authorization
description: "GraphQL authentication and authorization — JWT auth, context-based auth, field-level auth, directive-based auth, and role-based access control. Use when: protecting queries/mutations; implementing login; checking permissions; using auth directives. DO NOT USE FOR: error handling (use graphql-error-handling skill); resolver basics (use graphql-resolvers skill)."
---

# GraphQL Authentication & Authorization Skill

## Overview

Covers auth in GraphQL — JWT-based authentication via context, field-level authorization, directive-based auth, and RBAC patterns.

---

## 1. Authentication via Context

```typescript
// Extract user from JWT in context setup
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import jwt from "jsonwebtoken";

interface Context {
  currentUser: User | null;
  prisma: PrismaClient;
}

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }): Promise<Context> => {
      const token = req.headers.authorization?.replace("Bearer ", "");
      let currentUser = null;

      if (token) {
        try {
          const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
          currentUser = await prisma.user.findUnique({
            where: { id: payload.sub },
          });
        } catch {
          // Invalid token — currentUser stays null
        }
      }

      return { currentUser, prisma };
    },
  }),
);
```

---

## 2. Login / Register Mutations

```graphql
type Mutation {
  login(input: LoginInput!): AuthPayload!
  register(input: RegisterInput!): AuthPayload!
}

input LoginInput {
  email: String!
  password: String!
}

input RegisterInput {
  email: String!
  name: String!
  password: String!
}

type AuthPayload {
  token: String!
  user: User!
}
```

```typescript
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const resolvers = {
  Mutation: {
    login: async (_parent, { input }, { prisma }) => {
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (!user || !(await bcrypt.compare(input.password, user.password))) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });
      return { token, user };
    },

    register: async (_parent, { input }, { prisma }) => {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = await prisma.user.create({
        data: { ...input, password: hashedPassword },
      });
      const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });
      return { token, user };
    },
  },
};
```

---

## 3. Auth Guard Helpers

```typescript
// auth/guards.ts
import { GraphQLError } from "graphql";

export function requireAuth(context: Context): User {
  if (!context.currentUser) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return context.currentUser;
}

export function requireRole(context: Context, ...roles: string[]): User {
  const user = requireAuth(context);
  if (!roles.includes(user.role)) {
    throw new GraphQLError("Not authorized", {
      extensions: { code: "FORBIDDEN" },
    });
  }
  return user;
}

// Usage in resolvers
const resolvers = {
  Query: {
    me: (_p, _a, ctx) => requireAuth(ctx),
    adminDashboard: (_p, _a, ctx) => {
      requireRole(ctx, "ADMIN");
      return getDashboardData();
    },
  },
  Mutation: {
    deleteUser: (_p, { id }, ctx) => {
      requireRole(ctx, "ADMIN");
      return ctx.prisma.user.delete({ where: { id } });
    },
  },
};
```

---

## 4. Directive-Based Auth

```graphql
directive @auth(requires: Role = USER) on FIELD_DEFINITION

enum Role {
  ADMIN
  MODERATOR
  USER
}

type Query {
  me: User! @auth
  users: [User!]! @auth(requires: ADMIN)
}

type Mutation {
  updateUser(id: ID!, input: UpdateUserInput!): User! @auth
  deleteUser(id: ID!): Boolean! @auth(requires: ADMIN)
}
```

```typescript
// Implementing the @auth directive
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import { defaultFieldResolver, GraphQLSchema } from "graphql";

function authDirectiveTransformer(schema: GraphQLSchema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(schema, fieldConfig, "auth")?.[0];
      if (!authDirective) return fieldConfig;

      const requiredRole = authDirective.requires || "USER";
      const originalResolve = fieldConfig.resolve || defaultFieldResolver;

      fieldConfig.resolve = (parent, args, context, info) => {
        requireRole(context, requiredRole);
        return originalResolve(parent, args, context, info);
      };

      return fieldConfig;
    },
  });
}
```

---

## 5. Field-Level Authorization (Owner Check)

```typescript
const resolvers = {
  Mutation: {
    updatePost: async (_parent, { id, input }, ctx) => {
      const user = requireAuth(ctx);
      const post = await ctx.prisma.post.findUnique({ where: { id } });

      if (!post) throw new NotFoundError("Post");

      // Only author or admin can update
      if (post.authorId !== user.id && user.role !== "ADMIN") {
        throw new GraphQLError("Not authorized to update this post", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      return ctx.prisma.post.update({ where: { id }, data: input });
    },
  },

  User: {
    // Hide email from non-owners
    email: (parent, _args, ctx) => {
      if (ctx.currentUser?.id === parent.id || ctx.currentUser?.role === "ADMIN") {
        return parent.email;
      }
      return null;
    },
  },
};
```

---

## 6. Best Practices

- **Authenticate in context** — parse JWT once, make `currentUser` available everywhere
- **Authorize in resolvers** — check permissions where the data access happens
- **Use guard helpers** — `requireAuth()` / `requireRole()` for consistent error handling
- **Throw `UNAUTHENTICATED`** for missing auth, `FORBIDDEN` for insufficient permissions
- **Never trust client data** — always verify ownership server-side
- **Keep login/register public** — only these mutations skip auth checks
- **Hash passwords with bcrypt** — never store plaintext
- **Use short-lived JWTs** — 7d max, consider refresh tokens for long sessions
