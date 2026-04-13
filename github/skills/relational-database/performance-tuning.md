---
name: performance-tuning
description: EXPLAIN/EXPLAIN ANALYZE, slow query patterns, query optimization, and connection management.
---

# Performance Tuning

## Overview

Performance problems usually come from missing indexes, fetching too much data, or poorly structured queries. Use `EXPLAIN` to find the bottleneck, then fix it.

---

## 1. EXPLAIN and EXPLAIN ANALYZE

`EXPLAIN` shows the query plan (what the database _will_ do). `EXPLAIN ANALYZE` actually runs the query and shows real timing.

> **MySQL note:** `EXPLAIN ANALYZE` requires MySQL **8.0.18+**. On older versions, use `EXPLAIN` alone for the estimated plan.

```sql
-- Show the plan (no execution) — works in both PostgreSQL and MySQL
EXPLAIN
SELECT * FROM orders WHERE user_id = 5;

-- Run the query and show actual timing
EXPLAIN ANALYZE                        -- PostgreSQL (always available)
EXPLAIN ANALYZE                        -- MySQL 8.0.18+
SELECT * FROM orders WHERE user_id = 5;
```

### Reading the output

**PostgreSQL** output (tree format):

```
Seq Scan on orders  (cost=0.00..245.00 rows=1000 width=64)
                            ↑ startup  ↑ total   ↑ rows
```

**MySQL** output (tabular format):

```
id | select_type | table  | type  | key  | rows | Extra
1  | SIMPLE      | orders | ALL   | NULL | 5000 | Using where
```

| MySQL `type` value | Meaning                                       |
| ------------------ | --------------------------------------------- |
| `ALL`              | Full table scan — no index (slow)             |
| `index`            | Full index scan                               |
| `range`            | Index used for range query                    |
| `ref`              | Index used for non-unique lookup              |
| `eq_ref`           | Index used for unique/PK lookup (fast)        |
| `const`            | Single row match via PK or unique (very fast) |

**Red flags in PostgreSQL:** `Seq Scan` on a large table, `Sort` without an index, high `rows` estimate vs actual.

**Red flags in MySQL:** `type: ALL` on a large table, `Extra: Using filesort`, `Extra: Using temporary`.

---

## 2. Common Slow Query Patterns

### Problem: Full table scan (missing index)

```sql
-- Slow: no index on email
SELECT * FROM users WHERE email = 'alice@example.com';

-- Fix: add an index
CREATE INDEX idx_users_email ON users (email);
```

### Problem: SELECT \* (fetching unused columns)

```sql
-- Slow: fetches all columns including large TEXT/BLOB fields
SELECT * FROM articles WHERE category = 'tech';

-- Fix: select only what you need
SELECT id, title, published_at FROM articles WHERE category = 'tech';
```

### Problem: LIKE with leading wildcard

```sql
-- Slow: can't use a BTREE index
SELECT * FROM users WHERE name LIKE '%alice%';

-- Fix (PostgreSQL): use a GIN index with full-text search
CREATE INDEX idx_users_name_gin ON users USING GIN (to_tsvector('english', name));
SELECT * FROM users WHERE to_tsvector('english', name) @@ to_tsquery('alice');

-- Fix (MySQL): use a FULLTEXT index + MATCH AGAINST
CREATE FULLTEXT INDEX idx_users_name_fts ON users(name);
SELECT * FROM users WHERE MATCH(name) AGAINST('alice' IN NATURAL LANGUAGE MODE);
```

### Problem: Function on indexed column

```sql
-- Slow: the index on email is ignored because of LOWER()
SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';

-- Fix: create a functional index
CREATE INDEX idx_users_email_lower ON users (LOWER(email));
SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';
```

### Problem: N+1 queries in SQL

```sql
-- N+1: one query per order to get user
SELECT * FROM orders;                         -- returns 100 orders
SELECT * FROM users WHERE id = ?;             -- runs 100 times!

-- Fix: use a JOIN
SELECT o.id, o.total, u.name
FROM orders o
JOIN users u ON u.id = o.user_id;            -- 1 query total
```

---

## 3. Pagination Optimization

```sql
-- Slow on large offsets: database scans and skips all prior rows
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 10000;

-- Fast: cursor-based pagination using an indexed column
SELECT * FROM posts
WHERE created_at < '2024-01-01 12:00:00'   -- last seen value from previous page
ORDER BY created_at DESC
LIMIT 20;
```

---

## 4. COUNT Optimization

```sql
-- Slow: counts all columns
SELECT COUNT(*) FROM orders WHERE status = 'pending';

-- Faster: COUNT(*) is already optimized in PostgreSQL; ensure index on status
CREATE INDEX idx_orders_status ON orders (status);
SELECT COUNT(*) FROM orders WHERE status = 'pending';

-- Avoid: COUNT(column) checks for NULLs — use COUNT(*) when you just want row count
```

---

## 5. Batch Updates and Deletes

Updating or deleting millions of rows at once locks the table for a long time.

```sql
-- Instead of:
DELETE FROM logs WHERE created_at < NOW() - INTERVAL '1 year';   -- PostgreSQL
DELETE FROM logs WHERE created_at < NOW() - INTERVAL 1 YEAR;     -- MySQL

-- Do it in batches:
DELETE FROM logs
WHERE id IN (
  SELECT id FROM logs
  WHERE created_at < NOW() - INTERVAL '1 year'  -- PostgreSQL
  -- WHERE created_at < NOW() - INTERVAL 1 YEAR -- MySQL
  LIMIT 1000
);
-- Run this repeatedly until 0 rows deleted
```

---

## 6. Connection Pooling

Opening a new database connection is expensive. Use a connection pool to reuse connections.

| Setting           | PostgreSQL default | MySQL default | Recommended (app)                       |
| ----------------- | ------------------ | ------------- | --------------------------------------- |
| `max_connections` | 100                | 151           | Set pool size to 10–20 per app instance |
| Pool min size     | —                  | —             | 2–5 idle connections                    |
| Pool max size     | —                  | —             | 10–20 (depends on DB server)            |

Common poolers:

- **PgBouncer** — PostgreSQL connection pooler (runs as sidecar)
- **ProxySQL** — MySQL/MariaDB connection pooler and query router
- **HikariCP** — Java connection pool (works with both)
- Built-in pool in Prisma, TypeORM, Sequelize, etc.

---

## 7. Query Optimization Checklist

| Check                     | Action                            |
| ------------------------- | --------------------------------- |
| Slow query identified     | Run `EXPLAIN ANALYZE`             |
| `Seq Scan` on large table | Add index on filter/join column   |
| `SELECT *` everywhere     | Select only needed columns        |
| `LIKE '%term%'`           | Use full-text search / GIN index  |
| Function on WHERE column  | Create functional index           |
| N+1 pattern               | Use JOIN or subquery              |
| Large OFFSET pagination   | Switch to cursor-based pagination |
| Bulk delete/update        | Process in batches                |
| Too many connections      | Add a connection pool             |

---

## Key Rules

- Run `EXPLAIN ANALYZE` first — don't guess where the slowdown is
- Add indexes on columns used in `WHERE`, `JOIN`, and `ORDER BY`
- Never do `SELECT *` in production queries that run frequently
- Avoid functions on indexed columns in `WHERE` clauses — create functional indexes instead
- Use cursor-based pagination for large datasets instead of `OFFSET`
- Process large bulk operations in batches to avoid long locks
- Use a connection pool — never open a new connection per request
