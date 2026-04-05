---
name: prisma-seeding
description: "Prisma seeding — writing prisma/seed.ts; running prisma db seed; clearing data before seeding; using upsert for idempotency. Use when: populating the database with initial data; creating test data; resetting data for development."
---

# Prisma Seeding

## Overview

Seeding populates your database with initial or test data. Prisma supports a seed script that runs automatically after `migrate reset`, or manually via `prisma db seed`.

---

## 1. Setup

### Configure the seed script in `package.json`

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Or, if using `tsx`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Install the required packages:

```bash
npm install --save-dev ts-node tsx
```

---

## 2. Basic Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create users
  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice",
      role: "ADMIN",
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      name: "Bob",
    },
  });

  // Create posts for Alice
  await prisma.post.createMany({
    data: [
      { title: "Getting Started with Prisma", authorId: alice.id, published: true },
      { title: "Advanced Prisma Patterns", authorId: alice.id },
    ],
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Run the seed

```bash
npx prisma db seed
```

---

## 3. Idempotent Seeding with `upsert`

Use `upsert` so the seed can be run multiple times without creating duplicates:

```typescript
async function main() {
  // upsert: create if not exists, update if exists
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    create: {
      email: "alice@example.com",
      name: "Alice",
      role: "ADMIN",
    },
    update: {
      name: "Alice", // update if already exists
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    create: {
      email: "bob@example.com",
      name: "Bob",
    },
    update: {},
  });

  console.log("Seeded:", { alice, bob });
}
```

---

## 4. Clearing Data Before Seeding

To start fresh every time (useful for test environments):

```typescript
async function main() {
  // Delete in correct order (child tables first to avoid FK violations)
  await prisma.post.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Now seed fresh data
  await prisma.user.create({ data: { email: "alice@example.com", name: "Alice" } });
}
```

> Always delete child records before parent records to avoid foreign key violations.

---

## 5. Seeding with Relations

```typescript
async function main() {
  const user = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice",
      // Create nested profile and posts in one operation
      profile: {
        create: { bio: "I love Prisma!" },
      },
      posts: {
        create: [{ title: "My First Post", published: true }, { title: "Draft Post" }],
      },
    },
    include: { profile: true, posts: true },
  });

  console.log("Created user with profile and posts:", user);
}
```

---

## 6. Organized Seed File

For larger projects, split seed logic per entity:

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { seedUsers } from "./seeds/user.seed";
import { seedPosts } from "./seeds/post.seed";

const prisma = new PrismaClient();

async function main() {
  const users = await seedUsers(prisma);
  await seedPosts(prisma, users);
  console.log("All seeds complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

```typescript
// prisma/seeds/user.seed.ts
import { PrismaClient } from "@prisma/client";

export async function seedUsers(prisma: PrismaClient) {
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    create: { email: "alice@example.com", name: "Alice", role: "ADMIN" },
    update: {},
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    create: { email: "bob@example.com", name: "Bob" },
    update: {},
  });

  return { alice, bob };
}
```

---

## Key Rules

- Use `upsert` instead of `create` for idempotent seeds that can be safely re-run.
- When clearing data, delete child records before parent records.
- Always call `prisma.$disconnect()` in the `finally` block.
- Exit with `process.exit(1)` on error so CI/CD pipelines detect seed failures.
- Commit the seed file to version control — it serves as documentation for the expected initial data.
