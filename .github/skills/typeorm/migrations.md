---
name: typeorm-migrations
description: "TypeORM migrations — generating and running migrations; migration:generate, migration:run, migration:revert; synchronize vs migrations; DataSource configuration. Use when: changing the database schema; deploying changes to production; reverting a bad migration."
---

# TypeORM Migrations

## Overview

TypeORM migrations are TypeScript/JavaScript files that describe schema changes (CREATE TABLE, ALTER TABLE, etc.). They give you version-controlled, reversible database changes. Always use migrations in production — never `synchronize: true`.

---

## 1. DataSource Configuration

```typescript
// src/data-source.ts
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: ["src/entities/**/*.entity.ts"],
  migrations: ["src/migrations/**/*.ts"],

  // NEVER use synchronize: true in production — it can drop columns
  synchronize: false,

  logging: process.env.NODE_ENV === "development",
});
```

---

## 2. Core Commands

```bash
# Generate a migration by comparing entities to the current DB schema
npx typeorm-ts-node-commonjs migration:generate src/migrations/AddUserTable -d src/data-source.ts

# Run all pending migrations
npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts

# Revert the last applied migration
npx typeorm-ts-node-commonjs migration:revert -d src/data-source.ts

# Show all migrations and their status
npx typeorm-ts-node-commonjs migration:show -d src/data-source.ts

# Create a blank migration file (for manual SQL)
npx typeorm-ts-node-commonjs migration:create src/migrations/AddIndexToEmail
```

Add these to `package.json` for convenience:

```json
{
  "scripts": {
    "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/data-source.ts",
    "migration:run": "typeorm-ts-node-commonjs migration:run -d src/data-source.ts",
    "migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/data-source.ts",
    "migration:show": "typeorm-ts-node-commonjs migration:show -d src/data-source.ts"
  }
}
```

---

## 3. Migration File Structure

A generated migration looks like this:

```typescript
// src/migrations/1704067200000-AddUserTable.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserTable1704067200000 implements MigrationInterface {
  name = "AddUserTable1704067200000";

  // Applied when running migration:run
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "email" character varying NOT NULL,
        "name" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);
  }

  // Applied when running migration:revert
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
```

The `up` method applies the change; `down` reverts it.

---

## 4. Typical Development Workflow

```
1. Modify entity files (add/remove/change a column or relation)
2. Generate migration:
   npm run migration:generate -- src/migrations/DescribeChange
3. Review the generated SQL in the migration file
4. Apply the migration:
   npm run migration:run
5. Commit both the entity changes AND the migration file
```

Example: Adding a `role` column to `users`:

```typescript
// Entity change
@Column({ type: "enum", enum: UserRole, default: UserRole.USER })
role: UserRole;
```

```bash
npm run migration:generate -- src/migrations/AddRoleToUser
npm run migration:run
```

---

## 5. Writing Migrations Manually

For changes that TypeORM can't auto-detect (e.g., data migrations, custom indexes):

```typescript
import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class AddEmailIndex1704067200001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add an index
    await queryRunner.createIndex("users", new TableIndex({ name: "IDX_users_email", columnNames: ["email"] }));

    // Or run raw SQL
    await queryRunner.query(`UPDATE "users" SET "role" = 'USER' WHERE "role" IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("users", "IDX_users_email");
  }
}
```

---

## 6. Running Migrations in Production

```typescript
// In your app startup (e.g., main.ts)
import { AppDataSource } from "./data-source";

async function bootstrap() {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations(); // apply all pending migrations on startup
  // ... start server
}
```

Or run as a separate script before starting the server:

```bash
npm run migration:run && node dist/main.js
```

---

## 7. `synchronize` vs Migrations

| Setting             | When to use            | Risk                                     |
| ------------------- | ---------------------- | ---------------------------------------- |
| `synchronize: true` | Local development only | Can drop columns with data in production |
| Migrations          | All other environments | Safe, reversible, version-controlled     |

> Always set `synchronize: false` in staging and production.

---

## Key Rules

- Commit migration files to version control — they are the history of your schema.
- Always review generated migration SQL before running — TypeORM may generate destructive changes.
- Implement both `up` and `down` so every migration is reversible.
- Never modify a migration that has already been applied in production — create a new one instead.
- Use `migration:run` in production startup scripts, not `synchronize: true`.
