---
name: prisma-schema-design
description: "Prisma schema design — defining models, fields, data types, enums, indexes, and datasource/generator config. Use when: creating or modifying the Prisma schema; choosing field types; adding constraints like @unique or @default; defining enums; configuring database connection."
---

# Prisma Schema Design

## Overview

The Prisma schema (`prisma/schema.prisma`) is the single source of truth for your database structure. It defines the database connection, the Prisma Client generator, and all your data models.

---

## 1. Basic Schema Structure

```prisma
// prisma/schema.prisma

// 1. Configure the database connection
datasource db {
  provider = "postgresql" // or "mysql", "sqlite", "sqlserver", "mongodb"
  url      = env("DATABASE_URL")
}

// 2. Configure Prisma Client generator
generator client {
  provider = "prisma-client-js"
}

// 3. Define your models
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 2. Common Field Types

| Prisma Type | Maps to (PostgreSQL) | Description                   |
| ----------- | -------------------- | ----------------------------- |
| `String`    | `TEXT` / `VARCHAR`   | Text values                   |
| `Int`       | `INTEGER`            | 32-bit integer                |
| `BigInt`    | `BIGINT`             | 64-bit integer                |
| `Float`     | `DOUBLE PRECISION`   | Floating-point number         |
| `Decimal`   | `DECIMAL`            | Exact decimal (money, prices) |
| `Boolean`   | `BOOLEAN`            | True/false                    |
| `DateTime`  | `TIMESTAMP`          | Date and time                 |
| `Json`      | `JSONB`              | JSON object                   |
| `Bytes`     | `BYTEA`              | Binary data                   |

---

## 3. Field Attributes

```prisma
model Product {
  id          Int      @id @default(autoincrement()) // Primary key, auto-increment
  uuid        String   @default(uuid())              // UUID default
  name        String                                 // Required field
  description String?                                // Optional field (nullable)
  price       Decimal  @db.Decimal(10, 2)            // Exact decimal, 2 decimals
  stock       Int      @default(0)                   // Default value
  slug        String   @unique                       // Unique constraint
  createdAt   DateTime @default(now())               // Set on create
  updatedAt   DateTime @updatedAt                    // Auto-updated on save
}
```

### Key Attributes

| Attribute          | Purpose                                   |
| ------------------ | ----------------------------------------- |
| `@id`              | Marks the primary key                     |
| `@unique`          | Enforces uniqueness on this field         |
| `@default(value)`  | Sets a default value                      |
| `@updatedAt`       | Auto-updates to current timestamp on save |
| `@db.VarChar(255)` | Maps to a specific native DB column type  |
| `?` after type     | Makes the field optional (nullable)       |

---

## 4. Enums

Use enums for fields with a fixed set of values:

```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model User {
  id   Int    @id @default(autoincrement())
  role Role   @default(USER)
}

model Order {
  id     Int         @id @default(autoincrement())
  status OrderStatus @default(PENDING)
}
```

---

## 5. Model-Level Attributes

```prisma
model User {
  id        Int    @id @default(autoincrement())
  email     String
  tenantId  Int

  // Composite unique constraint (both together must be unique)
  @@unique([email, tenantId])
}

model Post {
  id        Int    @id @default(autoincrement())
  title     String
  authorId  Int
  status    String

  // Indexes speed up queries on these fields
  @@index([authorId])
  @@index([status, createdAt])

  // Custom table name in the database
  @@map("blog_posts")
}
```

---

## 6. Using `@map` and `@@map`

Use `@map` to rename a field in the database without changing your Prisma model field name:

```prisma
model User {
  id        Int    @id @default(autoincrement())
  firstName String @map("first_name")   // DB column is "first_name", Prisma uses "firstName"
  lastName  String @map("last_name")

  @@map("users") // DB table is "users"
}
```

---

## 7. Complete Example

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts     Post[]
  profile   Profile?

  @@map("users")
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String?
  userId Int    @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())

  @@index([authorId])
  @@map("posts")
}
```

---

## Key Rules

- Always use `@updatedAt` on `updatedAt` fields — Prisma handles the update automatically.
- Use `String?` (with `?`) for nullable fields; omit `?` for required fields.
- Add `@@index` on foreign key fields to speed up JOINs.
- Use `Decimal` (not `Float`) for money/price fields to avoid floating-point issues.
- Use `@@map` to keep database column names in `snake_case` while using `camelCase` in Prisma.
