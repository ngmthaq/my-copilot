---
name: relational-database-sql-queries
description: "SQL queries — writing SELECT, INSERT, UPDATE, DELETE; filtering with WHERE; grouping with GROUP BY; subqueries; CTEs. Use when: reading or writing data; filtering, sorting, or aggregating results; writing complex queries."
---

# SQL Queries

## Overview

SQL (Structured Query Language) is used to read and write data in relational databases. The four core statements are `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.

---

## 1. SELECT — Reading Data

```sql
-- Get all columns from a table
SELECT * FROM users;

-- Get specific columns
SELECT id, email, name FROM users;

-- With a condition
SELECT id, email FROM users WHERE role = 'admin';

-- Limit results
SELECT id, email FROM users LIMIT 10;

-- Skip rows (pagination)
SELECT id, email FROM users LIMIT 10 OFFSET 20; -- rows 21-30

-- Order results
SELECT id, name FROM users ORDER BY name ASC;
SELECT id, created_at FROM users ORDER BY created_at DESC;
```

---

## 2. WHERE — Filtering

```sql
-- Exact match
WHERE role = 'admin'

-- Not equal
WHERE status != 'deleted'

-- Multiple conditions
WHERE role = 'admin' AND is_active = TRUE

-- Either condition
WHERE role = 'admin' OR role = 'moderator'

-- Value in a list
WHERE role IN ('admin', 'moderator')

-- Value not in a list
WHERE role NOT IN ('banned', 'deleted')

-- Pattern matching (LIKE)
WHERE email LIKE '%@gmail.com'    -- ends with @gmail.com
WHERE name LIKE 'Alice%'          -- starts with Alice

-- Case-insensitive match (PostgreSQL)
WHERE name ILIKE '%alice%'

-- Case-insensitive match (MySQL — LIKE is case-insensitive by default)
WHERE name LIKE '%alice%'

-- MySQL: force case-sensitive match
WHERE name LIKE BINARY 'Alice%'

-- Range
WHERE age BETWEEN 18 AND 65

-- Null checks
WHERE deleted_at IS NULL          -- not deleted
WHERE deleted_at IS NOT NULL      -- is deleted
```

---

## 3. INSERT — Creating Records

```sql
-- Insert one row
INSERT INTO users (email, name, role)
VALUES ('alice@example.com', 'Alice', 'admin');

-- Insert many rows at once
INSERT INTO users (email, name)
VALUES
  ('bob@example.com', 'Bob'),
  ('carol@example.com', 'Carol');

-- Insert and return the new record (PostgreSQL)
INSERT INTO users (email, name)
VALUES ('dave@example.com', 'Dave')
RETURNING id, email, created_at;

-- MySQL: use LAST_INSERT_ID() after insert
INSERT INTO users (email, name) VALUES ('dave@example.com', 'Dave');
SELECT LAST_INSERT_ID();  -- returns the new auto-increment id
```

---

## 4. UPDATE — Modifying Records

```sql
-- Update one field
UPDATE users SET name = 'Alice Smith' WHERE id = 1;

-- Update multiple fields
UPDATE users
SET name = 'Alice Smith', role = 'moderator'
WHERE id = 1;

-- Update all rows matching a condition
UPDATE posts SET published = TRUE WHERE author_id = 1;

-- Update and return the changed record (PostgreSQL)
UPDATE users SET name = 'Alice Smith' WHERE id = 1
RETURNING id, name, updated_at;

-- MySQL: RETURNING is not supported — run a SELECT after UPDATE
UPDATE users SET name = 'Alice Smith' WHERE id = 1;
SELECT id, name, updated_at FROM users WHERE id = 1;
```

> Always include a `WHERE` clause on `UPDATE` — without it, every row is updated.

---

## 5. DELETE — Removing Records

```sql
-- Delete one row
DELETE FROM users WHERE id = 1;

-- Delete multiple rows matching a condition
DELETE FROM posts WHERE author_id = 1;

-- Delete and return what was deleted (PostgreSQL)
DELETE FROM users WHERE id = 1 RETURNING id, email;

-- MySQL: RETURNING is not supported — SELECT before deleting if needed
SELECT id, email FROM users WHERE id = 1;
DELETE FROM users WHERE id = 1;
```

> Always include a `WHERE` clause on `DELETE` — without it, every row is deleted.

---

## 6. Aggregation

```sql
-- Count rows
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM users WHERE role = 'admin';

-- Sum, average, min, max
SELECT SUM(amount) FROM orders WHERE user_id = 1;
SELECT AVG(price) FROM products;
SELECT MIN(price), MAX(price) FROM products;

-- Group results
SELECT role, COUNT(*) AS total
FROM users
GROUP BY role;

-- Group with filter (HAVING filters after grouping, WHERE filters before)
SELECT author_id, COUNT(*) AS post_count
FROM posts
GROUP BY author_id
HAVING COUNT(*) > 5;   -- only authors with more than 5 posts
```

---

## 7. Subqueries

A subquery is a query nested inside another query:

```sql
-- Get users who have at least one post
SELECT id, email FROM users
WHERE id IN (
  SELECT DISTINCT author_id FROM posts
);

-- Get users who have NO posts
SELECT id, email FROM users
WHERE id NOT IN (
  SELECT DISTINCT author_id FROM posts WHERE author_id IS NOT NULL
);

-- Use a subquery in SELECT (scalar subquery)
SELECT
  id,
  email,
  (SELECT COUNT(*) FROM posts WHERE author_id = users.id) AS post_count
FROM users;
```

---

## 8. CTEs (Common Table Expressions)

CTEs make complex queries readable by naming intermediate results.

> **MySQL note:** CTEs require MySQL 8.0+. For older versions, use subqueries instead.

```sql
-- Basic CTE
WITH active_users AS (
  SELECT id, email FROM users WHERE is_active = TRUE
)
SELECT * FROM active_users WHERE id > 100;

-- Multiple CTEs
WITH
  active_users AS (
    SELECT id FROM users WHERE is_active = TRUE
  ),
  recent_posts AS (
    SELECT author_id, COUNT(*) AS post_count
    FROM posts
    WHERE created_at > NOW() - INTERVAL '30 days'  -- PostgreSQL
    -- WHERE created_at > NOW() - INTERVAL 30 DAY  -- MySQL
    GROUP BY author_id
  )
SELECT u.id, u.email, rp.post_count
FROM active_users u
JOIN recent_posts rp ON u.id = rp.author_id;
```

---

## 9. DISTINCT — Remove Duplicates

```sql
-- Get unique roles
SELECT DISTINCT role FROM users;

-- Count unique values
SELECT COUNT(DISTINCT role) FROM users;
```

---

## Quick Reference

| Statement      | Purpose                       |
| -------------- | ----------------------------- |
| `SELECT`       | Read data                     |
| `INSERT`       | Add new rows                  |
| `UPDATE`       | Modify existing rows          |
| `DELETE`       | Remove rows                   |
| `WHERE`        | Filter rows                   |
| `ORDER BY`     | Sort results                  |
| `LIMIT`        | Cap the number of results     |
| `OFFSET`       | Skip rows (for pagination)    |
| `GROUP BY`     | Aggregate rows by a column    |
| `HAVING`       | Filter aggregated groups      |
| `DISTINCT`     | Remove duplicate rows         |
| `IN`           | Match against a list          |
| `LIKE`/`ILIKE` | Pattern match strings         |
| `IS NULL`      | Check for null values         |
| `WITH`         | Define a named subquery (CTE) |
