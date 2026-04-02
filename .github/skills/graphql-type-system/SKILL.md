---
name: graphql-type-system
description: "GraphQL type system — scalar types, object types, enums, input types, interfaces, unions, lists, and non-null modifiers. Use when: defining types; choosing between interfaces and unions; working with custom scalars; understanding type modifiers. DO NOT USE FOR: schema organization (use graphql-schema-design skill); resolver implementation (use graphql-resolvers skill)."
---

# GraphQL Type System Skill

## Overview

Covers all GraphQL type kinds — scalars, objects, enums, inputs, interfaces, unions, and type modifiers (lists, non-null).

---

## 1. Scalar Types

```graphql
# Built-in scalars
type Example {
  id: ID! # Unique identifier (serialized as String)
  name: String! # UTF-8 string
  age: Int! # 32-bit signed integer
  score: Float! # Double-precision floating point
  active: Boolean! # true or false
}

# Custom scalars
scalar DateTime # ISO 8601
scalar Email # Validated email
scalar JSON # Arbitrary JSON
```

```typescript
// Implementing custom scalar
import { GraphQLScalarType, Kind } from "graphql";

const DateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  serialize(value: Date) {
    return value.toISOString();
  },
  parseValue(value: string) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return new Date(ast.value);
    return null;
  },
});
```

---

## 2. Object Types

```graphql
type User {
  id: ID!
  email: String!
  name: String!
  role: UserRole!
  posts: [Post!]! # Relationship
  postsCount: Int! # Computed field
  createdAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User! # Back-reference
  tags: [String!]!
  published: Boolean!
}
```

---

## 3. Enum Types

```graphql
enum UserRole {
  ADMIN
  MODERATOR
  USER
}

enum SortOrder {
  ASC
  DESC
}
```

```typescript
// Enum resolver mapping (when DB values differ)
const resolvers = {
  UserRole: {
    ADMIN: "admin",
    MODERATOR: "mod",
    USER: "user",
  },
};
```

---

## 4. Input Types

```graphql
# Inputs are for arguments only — cannot be used as output
input CreateUserInput {
  email: String!
  name: String!
  role: UserRole = USER # Default value
}

input UpdateUserInput {
  email: String # All optional for partial updates
  name: String
  role: UserRole
}

# Inputs can nest other inputs
input CreatePostInput {
  title: String!
  content: String!
  metadata: PostMetadataInput
}
```

---

## 5. Interfaces

```graphql
# Shared contract that types must implement
interface Node {
  id: ID!
}

interface Timestamped {
  createdAt: DateTime!
  updatedAt: DateTime!
}

type User implements Node & Timestamped {
  id: ID!
  email: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

```typescript
// Must resolve __typename for interfaces
const resolvers = {
  Node: {
    __resolveType(obj) {
      if (obj.email) return "User";
      if (obj.title) return "Post";
      return null;
    },
  },
};
```

---

## 6. Union Types

```graphql
# One of several types (no shared fields required)
union SearchResult = User | Post | Comment

type Query {
  search(query: String!): [SearchResult!]!
}
```

```typescript
const resolvers = {
  SearchResult: {
    __resolveType(obj) {
      if (obj.email) return "User";
      if (obj.title) return "Post";
      if (obj.text) return "Comment";
      return null;
    },
  },
};
```

---

## 7. Type Modifiers (List & Non-Null)

| Declaration  | `null`  | `[]`  | `["a", null]` | `["a"]` |
| ------------ | ------- | ----- | ------------- | ------- |
| `[String]`   | valid   | valid | valid         | valid   |
| `[String!]`  | valid   | valid | invalid       | valid   |
| `[String]!`  | invalid | valid | valid         | valid   |
| `[String!]!` | invalid | valid | invalid       | valid   |

Most common: `[Type!]!` — non-null list with non-null items (can be empty `[]`).

---

## 8. Directives

```graphql
# Built-in
type User {
  oldField: String @deprecated(reason: "Use newField instead")
  newField: String!
}

# Custom directive
directive @auth(requires: UserRole!) on FIELD_DEFINITION

type Mutation {
  deleteUser(id: ID!): Boolean! @auth(requires: ADMIN)
}
```

---

## 9. Best Practices

- **Use `[Type!]!`** for list fields
- **Use enums** over strings for fixed value sets
- **Use interfaces** when types share common fields you query polymorphically
- **Use unions** when grouping unrelated types
- **Separate input from output** — never use object types as inputs
- **Add `@deprecated`** before removing fields
- **Prefer specific scalars** (`DateTime`, `Email`) over generic `String`
