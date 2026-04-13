---
name: typeorm-seeding
description: "TypeORM seeding — writing seed scripts; running seeds; clearing data before seeding; using upsert for idempotency. Use when: populating the database with initial data; creating test data; resetting data for development."
---

# TypeORM Seeding

## Overview

TypeORM doesn't have a built-in seed command, but you can write a seed script that initializes the `DataSource` and inserts data. Use `upsert` to make seeds idempotent (safe to run multiple times).

---

## 1. Basic Seed Script

```typescript
// src/seeds/seed.ts
import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";
import { UserRole } from "../enums/user-role.enum";

async function main() {
  // Initialize the database connection
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);

  // Create users
  await userRepository.save([
    { email: "alice@example.com", name: "Alice", role: UserRole.ADMIN },
    { email: "bob@example.com", name: "Bob", role: UserRole.USER },
  ]);

  console.log("Seed complete");
  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### Add a script to `package.json`

```json
{
  "scripts": {
    "seed": "ts-node src/seeds/seed.ts"
    // or with tsx:
    // "seed": "tsx src/seeds/seed.ts"
  }
}
```

```bash
npm run seed
```

---

## 2. Idempotent Seeding with `upsert`

Use `upsert` so the seed can be run multiple times without creating duplicates:

```typescript
async function main() {
  await AppDataSource.initialize();
  const userRepository = AppDataSource.getRepository(User);

  // upsert: insert if not exists, update if exists (conflict on `email`)
  await userRepository.upsert(
    [
      { email: "alice@example.com", name: "Alice", role: UserRole.ADMIN },
      { email: "bob@example.com", name: "Bob", role: UserRole.USER },
    ],
    ["email"], // unique column(s) to check for conflicts
  );

  console.log("Seed complete");
  await AppDataSource.destroy();
}
```

---

## 3. Clearing Data Before Seeding

To start fresh every time (useful for test environments):

```typescript
async function main() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);
  const postRepository = AppDataSource.getRepository(Post);

  // Delete in correct order: children before parents (to avoid FK violations)
  await postRepository.delete({}); // delete all posts first
  await userRepository.delete({}); // then delete all users

  // Now seed fresh data
  const alice = await userRepository.save({
    email: "alice@example.com",
    name: "Alice",
    role: UserRole.ADMIN,
  });

  await postRepository.save([
    { title: "Getting Started", authorId: alice.id },
    { title: "Advanced TypeORM", authorId: alice.id },
  ]);

  console.log("Seed complete");
  await AppDataSource.destroy();
}
```

> Always delete child records before parent records to avoid foreign key violations.

---

## 4. Seeding with Relations

```typescript
async function main() {
  await AppDataSource.initialize();
  const userRepository = AppDataSource.getRepository(User);
  const postRepository = AppDataSource.getRepository(Post);

  // Create user first
  const alice = userRepository.create({
    email: "alice@example.com",
    name: "Alice",
  });
  const savedAlice = await userRepository.save(alice);

  // Create posts linked to Alice
  await postRepository.save([
    { title: "My First Post", author: savedAlice, published: true },
    { title: "Draft Post", author: savedAlice },
  ]);

  await AppDataSource.destroy();
}
```

---

## 5. Organized Seed File

For larger projects, split seeds by entity:

```typescript
// src/seeds/seed.ts
import { AppDataSource } from "../data-source";
import { seedUsers } from "./user.seed";
import { seedPosts } from "./post.seed";

async function main() {
  await AppDataSource.initialize();

  const users = await seedUsers(AppDataSource);
  await seedPosts(AppDataSource, users);

  console.log("All seeds complete");
  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

```typescript
// src/seeds/user.seed.ts
import { DataSource } from "typeorm";
import { User } from "../entities/user.entity";
import { UserRole } from "../enums/user-role.enum";

export async function seedUsers(dataSource: DataSource) {
  const repo = dataSource.getRepository(User);

  await repo.upsert(
    [
      { email: "alice@example.com", name: "Alice", role: UserRole.ADMIN },
      { email: "bob@example.com", name: "Bob", role: UserRole.USER },
    ],
    ["email"],
  );

  return repo.find();
}
```

---

## 6. Using `typeorm-extension` (Optional)

For a more structured approach with seeders and factories, use the `typeorm-extension` package:

```bash
npm install typeorm-extension
```

```typescript
// src/seeds/MainSeeder.ts
import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { User } from "../entities/user.entity";

export class MainSeeder implements Seeder {
  async run(dataSource: DataSource, factoryManager: SeederFactoryManager) {
    const userRepository = dataSource.getRepository(User);
    await userRepository.upsert([{ email: "alice@example.com", name: "Alice" }], ["email"]);
  }
}
```

```bash
npx typeorm-extension seed:run -d src/data-source.ts
```

---

## Key Rules

- Always call `AppDataSource.destroy()` after seeding to close the connection.
- Use `upsert` instead of `save` for idempotent seeds that can be safely re-run.
- When clearing data, delete child records before parent records.
- Exit with `process.exit(1)` on error so CI/CD pipelines detect seed failures.
- Commit seed files to version control — they document expected initial data.
