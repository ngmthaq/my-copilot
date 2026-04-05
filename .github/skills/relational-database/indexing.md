---
name: relational-database-indexing
description: "Database indexing — creating indexes to speed up queries; understanding when indexes help or hurt; composite and partial indexes. Use when: queries are slow; adding WHERE or ORDER BY clauses; optimizing JOIN performance."
---

# Database Indexing

## Overview

An index is a data structure the database maintains to find rows faster, similar to a book's index. Without an index, the database reads every row in the table (a full table scan). With an index, it jumps directly to matching rows.

---

## 1. How Indexes Work

```
Without index:  scan all 1,000,000 rows → find matches
With index:     jump directly to the 5 matching rows
```

Indexes speed up `SELECT` queries but slow down `INSERT`, `UPDATE`, and `DELETE` (because the index must be updated too). Only create indexes that your queries actually need.

---

## 2. Creating a Basic Index

```sql
-- Index on a single column (speeds up WHERE and ORDER BY on this column)
CREATE INDEX idx_posts_author_id ON posts(author_id);

-- Unique index (also enforces uniqueness, like a UNIQUE constraint)
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Drop an index
DROP INDEX idx_posts_author_id;
```

---

## 3. When to Add an Index

Add an index when you frequently:

| Operation                      | Example                                    |
| ------------------------------ | ------------------------------------------ |
| Filter by a column             | `WHERE status = 'active'`                  |
| Sort by a column               | `ORDER BY created_at DESC`                 |
| JOIN on a column (foreign key) | `JOIN posts ON posts.author_id = users.id` |
| Search for unique values       | `WHERE email = 'alice@example.com'`        |

Always index:

- Primary keys (automatic)
- Foreign key columns
- Columns used frequently in `WHERE` clauses
- Columns used in `ORDER BY` for large tables

---

## 4. Composite Indexes (Multi-Column)

A composite index covers multiple columns. The **column order matters** — the index is most useful when queries filter on the leftmost columns first.

```sql
-- Index on (status, created_at) — helps queries that filter by status AND/OR sort by created_at
CREATE INDEX idx_posts_status_created ON posts(status, created_at);

-- This query USES the index:
SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC;

-- This query also USES the index (leftmost prefix):
SELECT * FROM posts WHERE status = 'published';

-- This query does NOT use the index efficiently (skips the leftmost column):
SELECT * FROM posts ORDER BY created_at DESC;
```

**Rule:** Put the most selective column (fewest matching values) first, or the column you filter on most often.

---

## 5. Partial Indexes (PostgreSQL only)

Index only a subset of rows — smaller and faster for targeted queries:

```sql
-- Only index published posts (not drafts)
CREATE INDEX idx_posts_published ON posts(created_at)
WHERE published = TRUE;

-- Only index non-deleted users
CREATE INDEX idx_users_active ON users(email)
WHERE deleted_at IS NULL;
```

This is useful when most queries target a specific subset (e.g., only active records).

> **MySQL note:** MySQL does **not** support partial indexes with a `WHERE` clause. Simulate them by adding a generated column or using a covering index with the filter column included.

---

## 6. Index Types

### PostgreSQL index types

| Type    | Best for                                                       |
| ------- | -------------------------------------------------------------- |
| `BTREE` | Default. Equality (`=`), ranges (`>`, `<`, `BETWEEN`), sorting |
| `HASH`  | Equality only (`=`). Rarely better than BTREE                  |
| `GIN`   | Full-text search, JSONB, arrays                                |
| `GiST`  | Geometric data, full-text search                               |

### MySQL index types

| Type       | Best for                                            |
| ---------- | --------------------------------------------------- |
| `BTREE`    | Default. Equality, ranges, sorting (InnoDB default) |
| `HASH`     | Equality only. Available for MEMORY tables          |
| `FULLTEXT` | Full-text search on `TEXT`/`VARCHAR` columns        |
| `SPATIAL`  | Geospatial data (`GEOMETRY`, `POINT`, etc.)         |

### PostgreSQL full-text search index

```sql
CREATE INDEX idx_posts_fts ON posts USING GIN(to_tsvector('english', title || ' ' || content));

-- Query:
SELECT * FROM posts
WHERE to_tsvector('english', title || ' ' || content) @@ to_tsquery('database');
```

### MySQL full-text search index

```sql
-- Create a FULLTEXT index
CREATE FULLTEXT INDEX idx_posts_fts ON posts(title, content);

-- Query using MATCH ... AGAINST:
SELECT * FROM posts
WHERE MATCH(title, content) AGAINST('database' IN NATURAL LANGUAGE MODE);
```

---

## 7. When Indexes Don't Help

The database may **ignore an index** when:

- The query returns a large portion of the table (e.g., > 10-20% of rows)
- A function is applied to the indexed column: `WHERE LOWER(email) = 'alice@example.com'` — fix with a functional index:

```sql
-- Functional index (PostgreSQL)
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- Functional/expression index (MySQL 8.0.13+)
CREATE INDEX idx_users_email_lower ON users((LOWER(email)));
-- Note: MySQL requires extra parentheses for expressions

-- Now this query uses the index in both DBs:
WHERE LOWER(email) = 'alice@example.com'
```

- The column has very low cardinality (e.g., a `boolean` column — the DB may prefer a full scan)

---

## 8. Check What Indexes Exist

```sql
-- PostgreSQL: list all indexes on a table
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'posts';

-- MySQL: show indexes on a table
SHOW INDEX FROM posts;
```

---

## Key Rules

- Always index foreign key columns — without an index, JOINs and lookups on FK columns are slow.
- Don't over-index — every index adds overhead to writes. Only add indexes that queries need.
- Put the most frequently filtered column first in a composite index.
- Use `EXPLAIN ANALYZE` (see `performance-tuning.md`) to verify an index is actually being used.
- Use partial indexes to keep index size small when only a subset of rows is queried.
