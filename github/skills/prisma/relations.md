---
name: prisma-relations
description: "Prisma relations — modeling one-to-one, one-to-many, and many-to-many relationships; using nested writes; connect, disconnect, and set operations. Use when: defining foreign keys; querying related data; creating records with related data in one operation."
---

# Prisma Relations

## Overview

Prisma supports three types of relations: one-to-one, one-to-many, and many-to-many. Relations are defined in the schema and can be queried or written in a single operation using nested writes.

---

## 1. One-to-One

Each user has exactly one profile.

```prisma
model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  profile Profile? // optional: user may not have a profile yet
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String?
  userId Int    @unique          // @unique enforces one-to-one
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Query

```typescript
// Get user with their profile
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { profile: true },
});

// Create user and profile together
const user = await prisma.user.create({
  data: {
    email: "alice@example.com",
    profile: {
      create: { bio: "Hello, I'm Alice!" },
    },
  },
  include: { profile: true },
});
```

---

## 2. One-to-Many

One user can have many posts.

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  posts Post[] // a user has many posts
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  authorId Int
  author   User   @relation(fields: [authorId], references: [id])
}
```

### Query

```typescript
// Get user with all their posts
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true },
});

// Create a post for an existing user
const post = await prisma.post.create({
  data: {
    title: "My first post",
    author: { connect: { id: 1 } }, // connect to existing user
  },
});

// Create user and their posts at once
const user = await prisma.user.create({
  data: {
    email: "alice@example.com",
    posts: {
      create: [{ title: "Post 1" }, { title: "Post 2" }],
    },
  },
});
```

---

## 3. Many-to-Many

Posts can have many tags; tags can belong to many posts.

### Implicit (Prisma manages the join table)

```prisma
model Post {
  id   Int   @id @default(autoincrement())
  tags Tag[]
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}
```

### Explicit (you control the join table)

Use this when you need extra fields on the relationship:

```prisma
model Post {
  id       Int         @id @default(autoincrement())
  title    String
  postTags PostTag[]
}

model Tag {
  id       Int         @id @default(autoincrement())
  name     String      @unique
  postTags PostTag[]
}

model PostTag {
  postId    Int
  tagId     Int
  assignedAt DateTime @default(now())  // extra field on the relation

  post Post @relation(fields: [postId], references: [id])
  tag  Tag  @relation(fields: [tagId], references: [id])

  @@id([postId, tagId]) // composite primary key
}
```

### Query (implicit many-to-many)

```typescript
// Create post with tags
const post = await prisma.post.create({
  data: {
    title: "My post",
    tags: {
      connect: [{ id: 1 }, { id: 2 }], // connect existing tags
    },
  },
});

// Add a tag to an existing post
await prisma.post.update({
  where: { id: 1 },
  data: {
    tags: { connect: { id: 3 } },
  },
});

// Remove a tag from a post
await prisma.post.update({
  where: { id: 1 },
  data: {
    tags: { disconnect: { id: 3 } },
  },
});

// Replace all tags
await prisma.post.update({
  where: { id: 1 },
  data: {
    tags: { set: [{ id: 1 }, { id: 2 }] }, // replaces all existing tags
  },
});
```

---

## 4. Nested Write Operations

| Operation    | When to use                                  |
| ------------ | -------------------------------------------- |
| `create`     | Create a new related record                  |
| `connect`    | Link an existing record by its unique field  |
| `disconnect` | Remove the link (does not delete the record) |
| `set`        | Replace all linked records with a new list   |
| `update`     | Update a linked related record               |
| `delete`     | Delete a linked related record               |
| `upsert`     | Create or update a related record            |

```typescript
// update nested relation
await prisma.user.update({
  where: { id: 1 },
  data: {
    profile: {
      update: { bio: "Updated bio" },
    },
  },
});

// upsert nested relation
await prisma.user.update({
  where: { id: 1 },
  data: {
    profile: {
      upsert: {
        create: { bio: "New bio" },
        update: { bio: "Updated bio" },
      },
    },
  },
});
```

---

## 5. `onDelete` Behavior

Control what happens to related records when the parent is deleted:

```prisma
model Post {
  authorId Int
  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)
  // When user is deleted → posts are also deleted
}
```

| Value      | Behavior                                        |
| ---------- | ----------------------------------------------- |
| `Cascade`  | Deletes child records when parent is deleted    |
| `Restrict` | Prevents deleting parent if children exist      |
| `SetNull`  | Sets the foreign key to `null` on parent delete |
| `NoAction` | Database default behavior                       |

---

## Key Rules

- Always add `@@index` on foreign key fields (e.g., `@@index([authorId])`) to speed up joins.
- Use `Cascade` for owned relations (profile belongs to user) — when the parent goes, children go too.
- Use `Restrict` when you want to prevent accidental deletion of parents that still have children.
- Use explicit many-to-many only when you need extra fields on the join table.
