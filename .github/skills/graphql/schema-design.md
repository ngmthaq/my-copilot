---
name: graphql-schema-design
description: "GraphQL schema design — SDL syntax, naming conventions, schema organization, nullability rules, and schema-first vs code-first approaches. Use when: designing GraphQL schemas; structuring types and fields; choosing nullability; organizing schema files. DO NOT USE FOR: resolver logic (use graphql-resolvers skill); authentication (use graphql-authentication-authorization skill)."
---

# GraphQL Schema Design Skill

## Overview

Covers schema design principles — SDL syntax, type organization, naming conventions, nullability, and schema-first vs code-first approaches.

---

## 1. Schema-First vs Code-First

```graphql
# Schema-First: Write SDL directly (recommended for most teams)
# schema.graphql
type User {
  id: ID!
  email: String!
  name: String!
  posts: [Post!]!
}
```

```typescript
// Code-First: Generate schema from code (e.g., TypeGraphQL, Nexus)
@ObjectType()
class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field(() => [Post])
  posts: Post[];
}
```

---

## 2. Naming Conventions

```graphql
# Types: PascalCase
type BlogPost { ... }
type UserProfile { ... }

# Fields: camelCase
type User {
  firstName: String!
  lastName: String!
  createdAt: DateTime!
}

# Enums: PascalCase type, SCREAMING_SNAKE_CASE values
enum UserRole {
  ADMIN
  MODERATOR
  REGULAR_USER
}

# Input types: suffixed with "Input"
input CreateUserInput {
  email: String!
  name: String!
}

# Mutations: verb + noun
type Mutation {
  createUser(input: CreateUserInput!): User!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  deleteComment(id: ID!): Boolean!
}

# Queries: noun (singular for one, plural for list)
type Query {
  user(id: ID!): User
  users(filter: UserFilter, pagination: PaginationInput): UserConnection!
}
```

---

## 3. Nullability Rules

```graphql
# ! means non-null — use it deliberately

type User {
  id: ID! # Always exists — non-null
  email: String! # Required field — non-null
  bio: String # Optional field — nullable
  posts: [Post!]! # Non-null list of non-null items (can be empty [])
  friends: [User!] # Nullable list of non-null items (list itself can be null)
}

# Rule of thumb:
# - IDs and required fields: non-null (!)
# - Optional/computed fields: nullable
# - Lists: almost always [Type!]! (non-null list, non-null items)
# - Query single resource: nullable (may not exist) — user(id: ID!): User
# - Mutation results: non-null (!) — createUser: User!
```

---

## 4. Input Types & Reusability

```graphql
# Separate input types for create vs update
input CreatePostInput {
  title: String!
  content: String!
  published: Boolean = false # Default value
  categoryIds: [ID!]
}

# Update inputs — all fields optional
input UpdatePostInput {
  title: String
  content: String
  published: Boolean
  categoryIds: [ID!]
}

# Shared filter/pagination inputs
input PaginationInput {
  page: Int = 1
  limit: Int = 20
}

input DateRangeInput {
  from: DateTime
  to: DateTime
}
```

---

## 5. Connection Pattern (Relay-style Pagination)

```graphql
type Query {
  posts(first: Int, after: String, filter: PostFilter): PostConnection!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PostEdge {
  node: Post!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

---

## 6. Schema Organization

```
src/
├── schema/
│   ├── index.ts           # Merges all type definitions
│   ├── scalars.graphql    # Custom scalars (DateTime, JSON, etc.)
│   ├── common.graphql     # Shared types (PageInfo, Connection, etc.)
│   ├── user.graphql       # User type, queries, mutations
│   ├── post.graphql       # Post type, queries, mutations
│   └── comment.graphql    # Comment type, queries, mutations
```

```typescript
// schema/index.ts — merge type definitions
import { mergeTypeDefs } from "@graphql-tools/merge";
import { loadFilesSync } from "@graphql-tools/load-files";
import path from "path";

const typesArray = loadFilesSync(path.join(__dirname, "."), {
  extensions: ["graphql"],
});

export const typeDefs = mergeTypeDefs(typesArray);
```

---

## 7. Interfaces & Unions

```graphql
# Interface — shared fields across types
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

# Union — one of several types (no shared fields required)
union SearchResult = User | Post | Comment

type Query {
  search(query: String!): [SearchResult!]!
}
```

---

## 8. Custom Scalars

```graphql
scalar DateTime # ISO 8601 date-time string
scalar JSON # Arbitrary JSON
scalar Email # Validated email string
```

```typescript
// Using graphql-scalars library
import { DateTimeResolver, JSONResolver } from "graphql-scalars";

const resolvers = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,
};
```

---

## 9. Best Practices

- **Design schema from client needs** — not from database tables
- **Use non-null (`!`) by default** — only make nullable when the field can genuinely be absent
- **Always use input types** for mutations — never inline multiple arguments
- **Use enums** for fixed sets of values — roles, statuses, categories
- **Prefer connections** over simple lists for paginated data
- **Keep types focused** — split large types with interfaces rather than one mega-type
- **Version via evolution** — deprecate fields with `@deprecated("Use newField instead")`, don't version the schema
- **Document with descriptions** — `"The user's primary email"` before field definitions
