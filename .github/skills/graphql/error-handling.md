---
name: graphql-error-handling
description: "GraphQL error handling — error types, error formatting, error codes, partial responses, and error extensions. Use when: handling errors in resolvers; formatting error responses; implementing custom error classes; using error codes. DO NOT USE FOR: input validation (use graphql-queries-mutations skill); auth errors (use graphql-authentication-authorization skill)."
---

# GraphQL Error Handling Skill

## Overview

Covers error handling in GraphQL — error response format, custom error classes, error codes, partial responses, and error formatting.

---

## 1. GraphQL Error Response Format

```json
{
  "data": null,
  "errors": [
    {
      "message": "User not found",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["user"],
      "extensions": {
        "code": "NOT_FOUND",
        "http": { "status": 404 }
      }
    }
  ]
}
```

Key difference from REST: GraphQL always returns 200 OK. Errors go in the `errors` array. Data can be partial — some fields resolve, others error.

---

## 2. Throwing Errors in Resolvers

```typescript
import { GraphQLError } from "graphql";

const resolvers = {
  Query: {
    user: async (_parent, { id }, { prisma }) => {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return user;
    },
  },

  Mutation: {
    createUser: async (_parent, { input }, { prisma }) => {
      const existing = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existing) {
        throw new GraphQLError("Email already in use", {
          extensions: { code: "CONFLICT" },
        });
      }
      return prisma.user.create({ data: input });
    },
  },
};
```

---

## 3. Custom Error Classes

```typescript
// errors/index.ts
import { GraphQLError } from "graphql";

export class NotFoundError extends GraphQLError {
  constructor(resource: string) {
    super(`${resource} not found`, {
      extensions: { code: "NOT_FOUND" },
    });
  }
}

export class AuthenticationError extends GraphQLError {
  constructor(message = "Not authenticated") {
    super(message, {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(message = "Not authorized") {
    super(message, {
      extensions: { code: "FORBIDDEN" },
    });
  }
}

export class ValidationError extends GraphQLError {
  constructor(errors: Record<string, string[]>) {
    super("Validation failed", {
      extensions: { code: "VALIDATION_ERROR", errors },
    });
  }
}

// Usage
throw new NotFoundError("User");
throw new ValidationError({ email: ["Invalid format"] });
```

---

## 4. Standard Error Codes

| Code               | When to Use                          |
| ------------------ | ------------------------------------ |
| `BAD_USER_INPUT`   | Invalid arguments or input           |
| `UNAUTHENTICATED`  | Missing or invalid authentication    |
| `FORBIDDEN`        | Authenticated but insufficient perms |
| `NOT_FOUND`        | Resource doesn't exist               |
| `CONFLICT`         | Duplicate or conflicting state       |
| `VALIDATION_ERROR` | Input validation failed              |
| `INTERNAL_ERROR`   | Unexpected server error              |

---

## 5. Error Formatting (Hide Internal Details)

```typescript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (formattedError, error) => {
    // Log full error internally
    console.error(error);

    // Hide internal errors from clients
    if (formattedError.extensions?.code === "INTERNAL_SERVER_ERROR") {
      return {
        message: "An unexpected error occurred",
        extensions: { code: "INTERNAL_ERROR" },
      };
    }

    // Strip stack traces in production
    if (process.env.NODE_ENV === "production") {
      delete formattedError.extensions?.stacktrace;
    }

    return formattedError;
  },
});
```

---

## 6. Partial Responses

```graphql
# GraphQL can return partial data — some fields succeed, others error
query GetUser($id: ID!) {
  user(id: $id) {
    name # resolves successfully
    posts {
      # resolver throws → null + error in errors array
      title
    }
  }
}
```

```json
{
  "data": {
    "user": {
      "name": "John",
      "posts": null
    }
  },
  "errors": [
    {
      "message": "Failed to load posts",
      "path": ["user", "posts"]
    }
  ]
}
```

This is why nullability matters — nullable fields can error independently without nullifying the entire parent.

---

## 7. Union-Based Error Handling (Alternative)

```graphql
# Errors as types — makes errors explicit in the schema
type Mutation {
  createUser(input: CreateUserInput!): CreateUserResult!
}

union CreateUserResult = User | ValidationErrors | ConflictError

type ValidationErrors {
  errors: [FieldError!]!
}

type FieldError {
  field: String!
  message: String!
}

type ConflictError {
  message: String!
}
```

```typescript
// Resolver returns the appropriate type
createUser: async (_parent, { input }, { prisma }) => {
  const errors = validate(input);
  if (errors.length) return { __typename: "ValidationErrors", errors };

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) return { __typename: "ConflictError", message: "Email taken" };

  const user = await prisma.user.create({ data: input });
  return { __typename: "User", ...user };
};
```

---

## 8. Best Practices

- **Use error codes** — clients should switch on `extensions.code`, not message strings
- **Hide internal details** — never expose stack traces or SQL errors to clients
- **Use custom error classes** — consistent, reusable error creation
- **Log all errors server-side** — use `formatError` to log before sanitizing
- **Understand partial responses** — nullable fields can fail independently
- **Choose error strategy** — thrown errors (simple) vs union types (explicit, type-safe)
- **Don't use HTTP status codes** — GraphQL always returns 200; use `extensions.code`
