---
name: relational-database-joins
description: "SQL JOINs — combining data from multiple tables using INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN, and self-joins. Use when: querying related tables together; fetching records with or without matching rows in another table."
---

# SQL JOINs

## Overview

A JOIN combines rows from two or more tables based on a related column (usually a foreign key). JOINs let you query data spread across multiple tables in a single statement.

---

## 1. INNER JOIN — Only Matching Rows

Returns rows where there is a match in **both** tables. Rows with no match on either side are excluded.

```sql
-- Get posts with their author's name (excludes posts with no author)
SELECT
  posts.id,
  posts.title,
  users.name AS author_name
FROM posts
INNER JOIN users ON posts.author_id = users.id;
```

```
posts          users
-----          -----
id=1 author=1  id=1 name=Alice   → included ✓
id=2 author=2  id=2 name=Bob     → included ✓
id=3 author=99 (no match)        → excluded ✗
```

---

## 2. LEFT JOIN — All Left Rows + Matching Right Rows

Returns **all rows from the left table**, and matching rows from the right. If there is no match on the right, columns from the right table are `NULL`.

```sql
-- Get all users, and their post count (including users with 0 posts)
SELECT
  users.id,
  users.name,
  COUNT(posts.id) AS post_count
FROM users
LEFT JOIN posts ON posts.author_id = users.id
GROUP BY users.id, users.name;
```

```
users          posts
-----          -----
Alice (id=1)   → has 3 posts  → post_count = 3
Bob   (id=2)   → has 0 posts  → post_count = 0  (NULL counted as 0)
```

---

## 3. RIGHT JOIN — All Right Rows + Matching Left Rows

Returns **all rows from the right table**, and matching rows from the left. Less common — a LEFT JOIN with tables swapped achieves the same result.

```sql
-- Get all posts, even if their author was deleted
SELECT
  posts.id,
  posts.title,
  users.name AS author_name   -- NULL if author was deleted
FROM users
RIGHT JOIN posts ON posts.author_id = users.id;
```

---

## 4. FULL JOIN — All Rows from Both Tables

Returns all rows from **both tables**. Where there's no match, the missing side is `NULL`.

> **MySQL note:** MySQL does **not** support `FULL JOIN`. Use a `UNION` of a `LEFT JOIN` and a `RIGHT JOIN` instead.

```sql
-- All users and all posts, matched where possible (PostgreSQL)
SELECT
  users.name,
  posts.title
FROM users
FULL JOIN posts ON posts.author_id = users.id;
-- Users with no posts: post columns are NULL
-- Posts with no author: user columns are NULL

-- MySQL equivalent (UNION of LEFT + RIGHT JOIN):
SELECT users.name, posts.title
FROM users LEFT JOIN posts ON posts.author_id = users.id
UNION
SELECT users.name, posts.title
FROM users RIGHT JOIN posts ON posts.author_id = users.id;
```

---

## 5. Visual Summary

```
Table A (users)     Table B (posts)

INNER JOIN          ← only matching rows (intersection)
LEFT JOIN           ← all of A + matching B
RIGHT JOIN          ← matching A + all of B
FULL JOIN           ← all of A + all of B
```

---

## 6. Joining Multiple Tables

```sql
-- Posts with author and category
SELECT
  posts.id,
  posts.title,
  users.name    AS author,
  categories.name AS category
FROM posts
INNER JOIN users      ON posts.author_id   = users.id
INNER JOIN categories ON posts.category_id = categories.id;
```

---

## 7. Self-Join

A table joined to itself — useful for hierarchical data (e.g., employees and their managers):

```sql
-- Get employee and their manager's name
SELECT
  emp.name   AS employee,
  mgr.name   AS manager
FROM employees AS emp
LEFT JOIN employees AS mgr ON emp.manager_id = mgr.id;
```

---

## 8. Filtering JOIN Results

Add a `WHERE` clause to filter after the join:

```sql
-- Active users with published posts
SELECT users.name, posts.title
FROM users
INNER JOIN posts ON posts.author_id = users.id
WHERE users.is_active = TRUE
  AND posts.published = TRUE;
```

---

## 9. Using Aliases for Readability

```sql
-- Aliases (u, p) shorten the query
SELECT u.id, u.name, p.title
FROM users u
INNER JOIN posts p ON p.author_id = u.id
WHERE u.role = 'admin';
```

---

## When to Use Each JOIN

| JOIN Type    | Use when                                                                      |
| ------------ | ----------------------------------------------------------------------------- |
| `INNER JOIN` | You only want rows with a match in both tables                                |
| `LEFT JOIN`  | You want all rows from the left table, even if no match on the right          |
| `RIGHT JOIN` | You want all rows from the right table, even if no match on the left          |
| `FULL JOIN`  | You want all rows from both tables (with NULLs where no match)                |
| Self-join    | The table has a relationship to itself (e.g., parent-child, manager-employee) |

---

## Key Rules

- Use `INNER JOIN` by default — switch to `LEFT JOIN` when you need to include rows with no match.
- Be explicit: write `INNER JOIN` / `LEFT JOIN` rather than just `JOIN` (even though `JOIN` defaults to `INNER JOIN`).
- Always alias table names in multi-table queries for readability.
- Add indexes on the JOIN columns (foreign keys) to keep joins fast.
