---
name: graphql-queries-mutations
description: "GraphQL queries and mutations — writing queries, mutations, variables, fragments, aliases, and operation naming. Use when: defining Query/Mutation types; writing client-side operations; using variables and fragments. DO NOT USE FOR: resolver logic (use graphql-resolvers skill); subscriptions (use graphql-subscriptions skill)."
---

# GraphQL Queries & Mutations Skill

## Overview

Covers defining and writing queries and mutations — operation structure, variables, fragments, aliases, and client integration.

---

## 1. Query Type Definition (Server)

```graphql
type Query {
  user(id: ID!): User # Single (nullable)
  users(filter: UserFilter, pagination: PaginationInput): UserConnection! # List
  me: User! # Current user
}
```

---

## 2. Mutation Type Definition (Server)

```graphql
type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  login(input: LoginInput!): AuthPayload!
}

type AuthPayload {
  token: String!
  user: User!
}
```

---

## 3. Writing Queries (Client)

```graphql
# Always name operations and use variables
query GetUser($id: ID!) {
  user(id: $id) {
    id
    email
    name
    posts {
      id
      title
    }
  }
}

# List with pagination
query GetPosts($first: Int = 20, $after: String) {
  posts(first: $first, after: $after) {
    edges {
      node {
        id
        title
        author {
          name
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

---

## 4. Writing Mutations (Client)

```graphql
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    published
    createdAt
  }
}
# Variables: { "input": { "title": "My Post", "content": "Hello" } }
```

---

## 5. Fragments

```graphql
# Reusable field selections
fragment UserFields on User {
  id
  email
  name
  role
}

query GetPost($id: ID!) {
  post(id: $id) {
    id
    title
    author {
      ...UserFields
    }
    comments {
      text
      author {
        ...UserFields
      }
    }
  }
}

# Inline fragments — for unions/interfaces
query Search($q: String!) {
  search(query: $q) {
    ... on User {
      id
      email
    }
    ... on Post {
      id
      title
    }
  }
}
```

---

## 6. Aliases

```graphql
# Fetch same field with different arguments
query GetTwoUsers {
  admin: user(id: "1") {
    ...UserFields
  }
  viewer: user(id: "2") {
    ...UserFields
  }
}
# Result: { "admin": { ... }, "viewer": { ... } }
```

---

## 7. Client Integration (Apollo Client)

```typescript
import { gql, useQuery, useMutation } from "@apollo/client";

const GET_POSTS = gql`
  query GetPosts($first: Int) {
    posts(first: $first) {
      edges {
        node {
          id
          title
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

function PostList() {
  const { data, loading } = useQuery(GET_POSTS, { variables: { first: 20 } });

  const [createPost] = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_POSTS }],
  });
}
```

---

## 8. Best Practices

- **Always name operations** — `query GetUser` not anonymous `{ user { } }`
- **Use variables** — never interpolate values into query strings
- **Wrap mutation args in `input`** — `createUser(input: CreateUserInput!)`
- **Use fragments** to share field selections across queries
- **Request only needed fields** — this is GraphQL's main advantage
- **Use payload types** for complex mutation results
- **Colocate queries with components** — keep queries near the code using them
