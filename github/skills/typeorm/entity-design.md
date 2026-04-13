---
name: typeorm-entity-design
description: "TypeORM entity design — defining entities, columns, data types, enums, primary keys, indexes, and timestamps. Use when: creating or modifying TypeORM entities; choosing column types; adding constraints like @Unique or @Index; defining enums; configuring column defaults."
---

# TypeORM Entity Design

## Overview

In TypeORM, entities are TypeScript classes decorated with `@Entity()`. Each property decorated with `@Column()` maps to a database column. Entities are the single source of truth for your table structure.

---

## 1. Basic Entity Structure

```typescript
// src/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("users") // maps to the "users" table
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 2. Primary Key Options

```typescript
// Auto-increment integer (default)
@PrimaryGeneratedColumn()
id: number;

// UUID
@PrimaryGeneratedColumn("uuid")
id: string;

// Manual primary key (you set the value)
@PrimaryColumn()
id: string;

// Composite primary key (use @PrimaryColumn on multiple fields)
@PrimaryColumn()
userId: number;

@PrimaryColumn()
roleId: number;
```

---

## 3. Common Column Types

```typescript
@Column()
name: string; // VARCHAR (default)

@Column({ type: "text" })
description: string; // TEXT (for long content)

@Column({ type: "int" })
age: number; // INTEGER

@Column({ type: "bigint" })
bigNumber: string; // BIGINT (returned as string in JS)

@Column({ type: "decimal", precision: 10, scale: 2 })
price: string; // DECIMAL(10,2) — use string to avoid float issues

@Column({ type: "float" })
rating: number; // FLOAT

@Column()
isActive: boolean; // BOOLEAN

@Column({ type: "timestamp" })
scheduledAt: Date; // TIMESTAMP

@Column({ type: "json" })
metadata: Record<string, any>; // JSON

@Column({ type: "simple-array" })
tags: string[]; // stores array as comma-separated string
```

---

## 4. Column Options

```typescript
@Column({
  type: "varchar",
  length: 100,        // column length
  nullable: true,     // allows NULL
  default: "active",  // default value
  unique: true,       // unique constraint
  name: "first_name", // custom column name in DB
  select: false,      // exclude from SELECT by default (e.g., passwords)
})
firstName: string;
```

---

## 5. Enums

```typescript
// Define the enum
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

// Use in entity
@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role: UserRole;
}

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;
}
```

---

## 6. Timestamp Columns

```typescript
@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @CreateDateColumn() // auto-set on insert
  createdAt: Date;

  @UpdateDateColumn() // auto-updated on save
  updatedAt: Date;

  @DeleteDateColumn() // used for soft deletes — set on delete
  deletedAt: Date | null;
}
```

---

## 7. Indexes

```typescript
import { Entity, Column, Index, PrimaryGeneratedColumn } from "typeorm";

// Single column index
@Entity("posts")
@Index(["authorId"]) // index on authorId
@Index(["status", "createdAt"]) // composite index
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Index() // inline index on a single column
  @Column()
  slug: string;

  @Column()
  authorId: number;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## 8. Complete Example

```typescript
// src/entities/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
}

@Entity("products")
@Index(["status"])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ nullable: true, type: "text" })
  description: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: string;

  @Column({ default: 0 })
  stock: number;

  @Index()
  @Column({ unique: true, length: 255 })
  slug: string;

  @Column({ type: "enum", enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## Key Rules

- Use `@CreateDateColumn()` and `@UpdateDateColumn()` — TypeORM manages them automatically.
- Use `type: "decimal"` (not `float`) for money/price fields and map the property as `string` to avoid floating-point issues.
- Use `select: false` on sensitive columns like `password` so they are never accidentally returned in queries.
- Add `@Index()` on foreign key columns and fields you frequently filter or sort by.
- Use string enums (e.g., `"ACTIVE"`) instead of numeric enums for readability in the database.
- Register all entities in the TypeORM `DataSource` configuration (or `TypeOrmModule` in NestJS).
