---
name: migrations
description: Schema changes with ALTER TABLE, migration file conventions, zero-downtime strategies, and rollback patterns.
---

# Migrations

## Overview

A **migration** is a versioned script that changes your database schema (add columns, rename tables, etc.). Running migrations keeps the schema in sync across environments (local, staging, production).

---

## 1. ALTER TABLE — Common Changes

### Add a column

```sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- With default value (safe for existing rows)
ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
```

### Drop a column

```sql
ALTER TABLE users DROP COLUMN phone;

-- PostgreSQL: drop with dependent objects
ALTER TABLE users DROP COLUMN phone CASCADE;
```

### Rename a column

```sql
-- PostgreSQL
ALTER TABLE users RENAME COLUMN username TO display_name;

-- MySQL
ALTER TABLE users CHANGE username display_name VARCHAR(100) NOT NULL;
```

### Change column type

```sql
-- PostgreSQL
ALTER TABLE products ALTER COLUMN price TYPE NUMERIC(12, 2);

-- MySQL
ALTER TABLE products MODIFY COLUMN price DECIMAL(12, 2) NOT NULL;
```

### Rename a table

```sql
-- PostgreSQL
ALTER TABLE orders RENAME TO purchase_orders;

-- MySQL
RENAME TABLE orders TO purchase_orders;
```

### Add / Drop a constraint

```sql
-- Add a NOT NULL constraint
ALTER TABLE users ALTER COLUMN email SET NOT NULL;       -- PostgreSQL
ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NOT NULL;  -- MySQL

-- Add a unique constraint
ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);

-- Drop a constraint
ALTER TABLE users DROP CONSTRAINT uq_users_email;       -- PostgreSQL
ALTER TABLE users DROP INDEX uq_users_email;            -- MySQL
```

---

## 2. Migration File Conventions

Name migration files with a timestamp prefix so they run in order:

```
migrations/
  20240101_000001_create_users_table.sql
  20240115_000002_add_phone_to_users.sql
  20240201_000003_create_orders_table.sql
```

Each file typically has an **up** (apply) and **down** (revert) section:

```sql
-- UP: apply the change
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- DOWN: revert the change
ALTER TABLE users DROP COLUMN phone;
```

Track which migrations have run in a `migrations` table:

```sql
-- PostgreSQL
CREATE TABLE migrations (
  id         SERIAL PRIMARY KEY,
  filename   VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MySQL
CREATE TABLE migrations (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  filename   VARCHAR(255) NOT NULL UNIQUE,
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

---

## 3. Zero-Downtime Migration Strategies

Dropping columns or adding `NOT NULL` columns can break running apps. Use these safe patterns:

### Adding a NOT NULL column safely

```sql
-- Step 1: Add column as nullable
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Step 2: Backfill existing rows (run in batches for large tables)
UPDATE users SET phone = 'unknown' WHERE phone IS NULL;

-- Step 3: Add NOT NULL constraint
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;    -- PostgreSQL
ALTER TABLE users MODIFY COLUMN phone VARCHAR(20) NOT NULL;  -- MySQL
```

### Renaming a column safely

```sql
-- Step 1: Add the new column
ALTER TABLE users ADD COLUMN display_name VARCHAR(100);

-- Step 2: Backfill
UPDATE users SET display_name = username;

-- Step 3: Deploy app to read from new column

-- Step 4: Drop old column (in a later migration)
ALTER TABLE users DROP COLUMN username;
```

### Dropping a table safely

```sql
-- Step 1: Deploy app to stop using the table
-- Step 2: In a later migration, drop it
DROP TABLE old_table;
```

---

## 4. Rolling Back a Migration

Always test the rollback (down) script before deploying:

```sql
-- Undo: add column → drop column
ALTER TABLE users DROP COLUMN phone;

-- Undo: create table → drop table
DROP TABLE IF EXISTS orders;

-- Undo: add index → drop index
DROP INDEX idx_users_email;                  -- PostgreSQL
DROP INDEX idx_users_email ON users;         -- MySQL
```

---

## 5. Data Migrations

Sometimes you need to transform data, not just schema:

```sql
-- Normalize a status column from string to integer
ALTER TABLE orders ADD COLUMN status_code INTEGER;

UPDATE orders SET status_code =
  CASE status
    WHEN 'pending'   THEN 1
    WHEN 'shipped'   THEN 2
    WHEN 'delivered' THEN 3
    ELSE 0
  END;

ALTER TABLE orders DROP COLUMN status;
ALTER TABLE orders RENAME COLUMN status_code TO status;  -- PostgreSQL / MySQL 8.0+
-- MySQL < 8.0: use CHANGE COLUMN instead
-- ALTER TABLE orders CHANGE COLUMN status_code status INTEGER NOT NULL;
```

---

## Key Rules

- Always name migration files with a timestamp prefix for deterministic ordering
- Keep each migration focused on one logical change (easier to revert)
- Add NOT NULL columns in two steps — first nullable, backfill, then add the constraint
- Never modify or delete an already-applied migration file — create a new one instead
- Test the rollback script before deploying to production
- Run data migrations in batches for large tables to avoid long locks
