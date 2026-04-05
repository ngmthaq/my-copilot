---
name: graphql-schema-stitching-federation
description: "GraphQL schema stitching and federation — Apollo Federation, subgraphs, supergraph, entity references, schema stitching, and microservice composition. Use when: composing multiple GraphQL services; setting up Apollo Federation; creating subgraphs; extending types across services. DO NOT USE FOR: single-service schema design (use graphql-schema-design skill); resolver basics (use graphql-resolvers skill)."
---

# GraphQL Schema Stitching & Federation Skill

## Overview

Covers composing multiple GraphQL services into one API — Apollo Federation (recommended) and schema stitching.

---

## 1. Federation vs Stitching

| Feature            | Apollo Federation              | Schema Stitching           |
| ------------------ | ------------------------------ | -------------------------- |
| Architecture       | Decentralized (subgraphs)      | Centralized gateway        |
| Type ownership     | Each service owns its types    | Gateway merges all schemas |
| Cross-service refs | Built-in (`@key`, `@external`) | Manual delegation          |
| Recommended for    | Microservices at scale         | Simpler setups, legacy     |

**Use Federation** for new projects. **Use Stitching** for quick prototypes or wrapping existing APIs.

---

## 2. Apollo Federation — Subgraph Setup

```typescript
// npm install @apollo/subgraph @apollo/server
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import gql from "graphql-tag";

// Users subgraph
const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

  type Query {
    me: User
    user(id: ID!): User
  }

  type User @key(fields: "id") {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
  }

  enum UserRole {
    ADMIN
    USER
  }
`;

const resolvers = {
  Query: {
    me: (_p, _a, { currentUser }) => currentUser,
    user: (_p, { id }, { prisma }) => prisma.user.findUnique({ where: { id } }),
  },
  User: {
    // Reference resolver — how this subgraph resolves User when referenced by others
    __resolveReference: (ref, { prisma }) => prisma.user.findUnique({ where: { id: ref.id } }),
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});
```

---

## 3. Extending Types Across Subgraphs

```graphql
# Posts subgraph — extends User from Users subgraph
extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@external"])

type Query {
  posts(first: Int, after: String): PostConnection!
  post(id: ID!): Post
}

type Post @key(fields: "id") {
  id: ID!
  title: String!
  content: String!
  author: User!
  createdAt: DateTime!
}

# Reference User type (owned by Users subgraph)
type User @key(fields: "id") {
  id: ID!
  posts: [Post!]! # Extend User with posts field
}
```

```typescript
// Posts subgraph resolvers
const resolvers = {
  Post: {
    author: (post) => ({ __typename: "User", id: post.authorId }),
    // Returns a reference — gateway will call Users subgraph to resolve full User
  },
  User: {
    // Resolve the posts field that this subgraph contributes to User
    posts: (user, _args, { prisma }) => prisma.post.findMany({ where: { authorId: user.id } }),
  },
};
```

---

## 4. Apollo Router (Gateway)

```yaml
# router.yaml — Apollo Router configuration
supergraph:
  introspection: true

# Compose subgraphs into supergraph
# rover supergraph compose --config supergraph.yaml > supergraph.graphql
```

```yaml
# supergraph.yaml
federation_version: =2.0
subgraphs:
  users:
    routing_url: http://localhost:4001/graphql
    schema:
      subgraph_url: http://localhost:4001/graphql
  posts:
    routing_url: http://localhost:4002/graphql
    schema:
      subgraph_url: http://localhost:4002/graphql
  comments:
    routing_url: http://localhost:4003/graphql
    schema:
      subgraph_url: http://localhost:4003/graphql
```

```bash
# Install and run Apollo Router
rover supergraph compose --config supergraph.yaml > supergraph.graphql
./router --supergraph supergraph.graphql
```

---

## 5. Federation Directives

```graphql
# @key — defines entity's primary key (how it's referenced across subgraphs)
type User @key(fields: "id") {
  id: ID!
}

# Multiple keys
type Product @key(fields: "id") @key(fields: "sku") {
  id: ID!
  sku: String!
}

# @external — field is defined in another subgraph
type User @key(fields: "id") {
  id: ID! @external
  email: String! @external
  reviews: [Review!]!
}

# @requires — field depends on an external field
type User @key(fields: "id") {
  id: ID! @external
  email: String! @external
  emailDomain: String! @requires(fields: "email")
}

# @shareable — field can be resolved by multiple subgraphs
type Product @key(fields: "id") {
  id: ID!
  name: String! @shareable
}

# @override — take ownership of a field from another subgraph
type User @key(fields: "id") {
  id: ID!
  name: String! @override(from: "legacy-users")
}
```

---

## 6. Schema Stitching (Alternative)

```typescript
// npm install @graphql-tools/stitch @graphql-tools/wrap
import { stitchSchemas } from "@graphql-tools/stitch";
import { RenameTypes } from "@graphql-tools/wrap";

const gatewaySchema = stitchSchemas({
  subschemas: [
    {
      schema: usersSchema,
      executor: usersExecutor, // HTTP executor to users service
    },
    {
      schema: postsSchema,
      executor: postsExecutor,
      merge: {
        // How to resolve User references in posts schema
        User: {
          fieldName: "user",
          selectionSet: "{ id }",
          args: (ref) => ({ id: ref.id }),
        },
      },
    },
  ],
});
```

---

## 7. Typical Architecture

```
┌──────────────┐
│   Clients     │
└──────┬───────┘
       │
┌──────▼───────┐
│ Apollo Router │  ← Composes supergraph, routes queries
│   (Gateway)   │
└──┬────┬────┬─┘
   │    │    │
┌──▼─┐┌─▼──┐┌▼────┐
│Users││Posts││Comments│  ← Independent subgraphs (own DB, own deploy)
└────┘└────┘└──────┘
```

---

## 8. Best Practices

- **Use Federation v2** — cleaner syntax, better tooling than v1
- **One entity owner** — each type should have a primary subgraph that owns it
- **Use `@key` on entities** — any type referenced across subgraphs needs a key
- **Return references, not data** — `{ __typename: "User", id: post.authorId }` lets the gateway resolve
- **Keep subgraphs independent** — each has its own DB and deploys independently
- **Use Rover CLI** — compose and validate supergraph schemas before deploying
- **Test subgraphs in isolation** — each subgraph should work standalone
- **Use `@shareable`** for fields resolved by multiple subgraphs (e.g., computed fields)
