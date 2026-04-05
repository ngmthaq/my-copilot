---
name: relational-database-constraints
description: "Database constraints — enforcing data integrity with PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK, and DEFAULT. Use when: preventing bad data; enforcing business rules at the database level; designing table columns."
---

# Database Constraints

## Overview

Constraints are rules enforced by the database to ensure data integrity. They prevent invalid data from being inserted or updated, catching errors at the data layer rather than relying solely on application code.

---

## 1. PRIMARY KEY

Uniquely identifies each row. Every table should have one. Implies `NOT NULL` and `UNIQUE`.

```sql
-- Single column PK
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255)
);

-- Composite PK (combination of columns must be unique)
CREATE TABLE order_items (
  order_id INT,
  product_id INT,
  quantity INT NOT NULL,
  PRIMARY KEY (order_id, product_id)
);
```

---

## 2. NOT NULL

Prevents a column from storing `NULL`. Use on any column that must always have a value.

```sql
CREATE TABLE users (
  id    SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,  -- required
  name  VARCHAR(100)            -- optional (nullable by default)
);
```

---

## 3. UNIQUE

Ensures all values in a column (or combination of columns) are distinct.

```sql
-- Single column unique
CREATE TABLE users (
  id    SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE
);

-- Composite unique (combination must be unique)
CREATE TABLE team_members (
  user_id INT NOT NULL,
  team_id INT NOT NULL,
  UNIQUE (user_id, team_id)  -- same user can't be in same team twice
);

-- Named constraint (easier to identify in error messages)
CONSTRAINT uq_users_email UNIQUE (email)
```

---

## 4. FOREIGN KEY

Links a column to the primary key of another table, enforcing referential integrity.

```sql
CREATE TABLE posts (
  id        SERIAL PRIMARY KEY,
  title     VARCHAR(255) NOT NULL,
  author_id INT NOT NULL,

  CONSTRAINT fk_posts_author
    FOREIGN KEY (author_id)
    REFERENCES users(id)
    ON DELETE CASCADE   -- delete posts when user is deleted
    ON UPDATE CASCADE   -- update FK if user's PK changes (rare)
);
```

### ON DELETE options

| Option      | Behavior                                      |
| ----------- | --------------------------------------------- |
| `CASCADE`   | Deletes child rows automatically              |
| `SET NULL`  | Sets FK to `NULL` (column must be nullable)   |
| `RESTRICT`  | Blocks deletion if children exist             |
| `NO ACTION` | Same as `RESTRICT` (default if not specified) |

---

## 5. CHECK

Enforces a custom condition on a column's value.

```sql
CREATE TABLE products (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(255) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,

  CONSTRAINT chk_products_price CHECK (price > 0),
  CONSTRAINT chk_products_stock CHECK (stock >= 0)
);

CREATE TABLE users (
  id   SERIAL PRIMARY KEY,
  role VARCHAR(20) NOT NULL DEFAULT 'user',

  CONSTRAINT chk_users_role CHECK (role IN ('user', 'admin', 'moderator'))
);
```

> **MySQL note:** `CHECK` constraints are enforced starting from **MySQL 8.0.16**. In older versions the syntax is accepted but silently ignored. For older MySQL, enforce constraints in application code.

---

## 6. DEFAULT

Sets a fallback value when no value is provided on insert.

```sql
CREATE TABLE posts (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  published  BOOLEAN NOT NULL DEFAULT FALSE,
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 7. Adding Constraints to Existing Tables

```sql
-- Add NOT NULL (requires no existing NULLs in the column)
ALTER TABLE users ALTER COLUMN email SET NOT NULL;           -- PostgreSQL
ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NOT NULL; -- MySQL

-- Add UNIQUE constraint
ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);

-- Add CHECK constraint
ALTER TABLE products ADD CONSTRAINT chk_price CHECK (price > 0);

-- Add FOREIGN KEY
ALTER TABLE posts
  ADD CONSTRAINT fk_posts_author
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

-- Drop a UNIQUE constraint
ALTER TABLE users DROP CONSTRAINT uq_users_email;           -- PostgreSQL
ALTER TABLE users DROP INDEX uq_users_email;                -- MySQL

-- Drop a FOREIGN KEY constraint
ALTER TABLE posts DROP CONSTRAINT fk_posts_author;          -- PostgreSQL
ALTER TABLE posts DROP FOREIGN KEY fk_posts_author;         -- MySQL

-- Drop a CHECK constraint
ALTER TABLE products DROP CONSTRAINT chk_price;             -- PostgreSQL
ALTER TABLE products DROP CHECK chk_price;                  -- MySQL 8.0+
```

---

## 8. Constraint Naming Convention

Always name constraints so error messages are meaningful:

| Type        | Pattern                   | Example              |
| ----------- | ------------------------- | -------------------- |
| Primary key | `pk_<table>`              | `pk_users`           |
| Foreign key | `fk_<table>_<referenced>` | `fk_posts_author`    |
| Unique      | `uq_<table>_<column>`     | `uq_users_email`     |
| Check       | `chk_<table>_<column>`    | `chk_products_price` |

---

## Key Rules

- Every table needs a `PRIMARY KEY`.
- Use `NOT NULL` on all required columns — don't assume application code will catch missing values.
- Use `FOREIGN KEY` constraints to enforce valid relationships, not just application-level checks.
- Use `CHECK` constraints to enforce business rules (valid enums, positive numbers, etc.).
- Name all constraints — anonymous constraints are hard to identify in error messages.
- Always add an index on foreign key columns (constraints alone don't create indexes in PostgreSQL).
