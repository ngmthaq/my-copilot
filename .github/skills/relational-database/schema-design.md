---
name: relational-database-schema-design
description: "Relational database schema design — designing tables, choosing data types, primary keys, foreign keys, and naming conventions. Use when: creating new tables; choosing the right column type; designing relationships between tables."
---

# Schema Design

## Overview

Good schema design makes your database easy to query, maintain, and scale. The goal is to model your data accurately using the right types, clear names, and proper relationships.

---

## 1. Tables and Columns

A table represents an entity (e.g., `users`, `orders`). Each row is one record; each column is one attribute.

```sql
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,         -- auto-incrementing integer PK
  email      VARCHAR(255) NOT NULL UNIQUE,
  name       VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 2. Choosing Primary Keys

| Option                          | When to use                            |
| ------------------------------- | -------------------------------------- |
| `SERIAL` / `INT AUTO_INCREMENT` | Simple apps, internal IDs              |
| `BIGSERIAL` / `BIGINT`          | Large tables (> 2 billion rows)        |
| `UUID`                          | Distributed systems, public-facing IDs |

```sql
-- Integer (PostgreSQL)
id SERIAL PRIMARY KEY

-- Integer (MySQL)
id INT AUTO_INCREMENT PRIMARY KEY

-- UUID (PostgreSQL)
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- UUID (MySQL)
id CHAR(36) PRIMARY KEY DEFAULT (UUID())
```

---

## 3. Common Data Types

| Purpose        | PostgreSQL      | MySQL           |
| -------------- | --------------- | --------------- |
| Short text     | `VARCHAR(n)`    | `VARCHAR(n)`    |
| Long text      | `TEXT`          | `TEXT`          |
| Integer        | `INTEGER`       | `INT`           |
| Large integer  | `BIGINT`        | `BIGINT`        |
| Exact decimal  | `NUMERIC(p, s)` | `DECIMAL(p, s)` |
| Floating point | `FLOAT`         | `FLOAT`         |
| Boolean        | `BOOLEAN`       | `TINYINT(1)`    |
| Date only      | `DATE`          | `DATE`          |
| Date + time    | `TIMESTAMP`     | `DATETIME`      |
| JSON           | `JSONB`         | `JSON`          |
| Binary data    | `BYTEA`         | `BLOB`          |

> Use `NUMERIC`/`DECIMAL` for money — never `FLOAT` (floating-point math is imprecise).

---

## 4. Foreign Keys

A foreign key links a row in one table to a row in another:

```sql
CREATE TABLE posts (
  id        SERIAL PRIMARY KEY,
  title     VARCHAR(255) NOT NULL,
  author_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_posts_author
    FOREIGN KEY (author_id) REFERENCES users(id)
    ON DELETE CASCADE   -- when user is deleted, delete their posts too
);
```

### `ON DELETE` behaviors

| Option      | What happens when the parent row is deleted |
| ----------- | ------------------------------------------- |
| `CASCADE`   | Child rows are also deleted                 |
| `SET NULL`  | FK column is set to `NULL`                  |
| `RESTRICT`  | Deletion is blocked if children exist       |
| `NO ACTION` | Same as RESTRICT (default)                  |

---

## 5. Naming Conventions

Consistent naming makes schemas self-documenting:

| Thing              | Convention             | Example                    |
| ------------------ | ---------------------- | -------------------------- |
| Table names        | `snake_case`, plural   | `users`, `order_items`     |
| Column names       | `snake_case`           | `first_name`, `created_at` |
| Primary key        | `id`                   | `id`                       |
| Foreign key        | `<table_singular>_id`  | `user_id`, `post_id`       |
| Indexes            | `idx_<table>_<column>` | `idx_posts_author_id`      |
| Unique constraints | `uq_<table>_<column>`  | `uq_users_email`           |

---

## 6. Complete Example

### PostgreSQL

```sql
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) NOT NULL,
  name       VARCHAR(100),
  role       VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT chk_users_role CHECK (role IN ('user', 'admin', 'moderator'))
);

CREATE TABLE posts (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  content    TEXT,
  published  BOOLEAN NOT NULL DEFAULT FALSE,
  author_id  INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_posts_author
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_posts_author_id ON posts(author_id);
```

### MySQL

```sql
CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(255) NOT NULL,
  name       VARCHAR(100),
  role       VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT chk_users_role CHECK (role IN ('user', 'admin', 'moderator'))  -- enforced in MySQL 8.0+
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE posts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  content    TEXT,
  published  TINYINT(1) NOT NULL DEFAULT 0,
  author_id  INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_posts_author
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_posts_author_id ON posts(author_id);
```

> Always use `ENGINE=InnoDB` in MySQL — it's the only engine that supports transactions and foreign keys. Use `utf8mb4` charset to support all Unicode characters (including emoji).

---

## Key Rules

- Always define a primary key on every table.
- Use `NOT NULL` on required columns — don't allow accidental nulls.
- Use `NUMERIC`/`DECIMAL` for money and prices, never `FLOAT`.
- Add a foreign key index (`CREATE INDEX`) on every FK column.
- Use `snake_case` for all table and column names.
- Use `TIMESTAMP` with `DEFAULT NOW()` for `created_at` and `updated_at` columns.
