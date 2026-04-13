---
name: prisma-migrations
description: "Prisma migrations — running prisma migrate dev/deploy/reset; understanding migration files; handling migration drift; creating and applying schema changes. Use when: changing the database schema; deploying schema changes to production; resetting or troubleshooting migration state."
---

# Prisma Migrations

## Overview

Prisma Migrate tracks changes to your schema and generates SQL migration files. These files represent a history of your database changes and should be committed to version control.

---

## 1. Core Commands

### Development workflow

```bash
# Generate and apply a migration after changing schema.prisma
npx prisma migrate dev --name add_user_table

# This will:
# 1. Generate a new migration file in prisma/migrations/
# 2. Apply it to the database
# 3. Regenerate Prisma Client
```

### Production deployment

```bash
# Apply pending migrations (does NOT generate new ones)
npx prisma migrate deploy

# Use this in CI/CD and production — never use `migrate dev` in production
```

### Reset database (development only)

```bash
# Drop all data, re-apply all migrations, run seed
npx prisma migrate reset

# WARNING: This deletes all data. Only for development.
```

### Check migration status

```bash
# Show which migrations have been applied
npx prisma migrate status
```

---

## 2. Migration File Structure

After running `migrate dev`, Prisma creates files like:

```
prisma/
  migrations/
    20240101120000_add_user_table/
      migration.sql       ← the actual SQL Prisma generated
    20240102090000_add_posts/
      migration.sql
  schema.prisma
```

The SQL file contains the raw database changes:

```sql
-- Migration: 20240101120000_add_user_table
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
```

---

## 3. Typical Development Workflow

```
1. Edit prisma/schema.prisma  →  add or change a model
2. Run: npx prisma migrate dev --name describe_the_change
3. Prisma generates the SQL and applies it
4. Commit both schema.prisma and the new migration file
```

Example: Adding a `role` field to `User`:

```prisma
// Before
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
}

// After
enum Role {
  USER
  ADMIN
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  role  Role   @default(USER)   // ← new field
}
```

```bash
npx prisma migrate dev --name add_role_to_user
```

---

## 4. Introspect an Existing Database

If you already have a database (not created with Prisma), pull the schema from it:

```bash
# Pull the schema from the existing database into schema.prisma
npx prisma db pull
```

This generates Prisma models from the existing tables. Then generate the client:

```bash
npx prisma generate
```

---

## 5. Push Schema Without Migrations (Prototyping)

For quick prototyping, skip migration files and push directly:

```bash
# Sync schema.prisma to the database without generating migration files
npx prisma db push

# WARNING: This can cause data loss. Only for local development/prototyping.
```

---

## 6. Regenerate Prisma Client

After any schema change, regenerate the client so TypeScript types are up to date:

```bash
npx prisma generate
```

> `migrate dev` does this automatically. Run `generate` manually after `db push` or `db pull`.

---

## 7. Production Deployment Checklist

```bash
# In CI/CD or startup script (never migrate dev in production)
npx prisma migrate deploy
```

Add to your deployment pipeline:

```json
// package.json
{
  "scripts": {
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "postinstall": "prisma generate"
  }
}
```

---

## Key Rules

- Commit migration files to version control — they are the history of your schema.
- Never run `migrate dev` in production — always use `migrate deploy`.
- Use `migrate reset` only in development — it drops all data.
- Use descriptive migration names: `add_user_table`, `add_role_to_user`, `remove_deprecated_fields`.
- Run `prisma generate` after every schema change to keep TypeScript types in sync.
