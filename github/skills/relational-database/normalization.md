---
name: relational-database-normalization
description: "Database normalization — understanding 1NF, 2NF, 3NF; eliminating redundancy; knowing when to denormalize. Use when: designing a schema; fixing data anomalies; choosing between normalized and denormalized design."
---

# Database Normalization

## Overview

Normalization is the process of organizing a database to reduce data redundancy and prevent data anomalies (update, insert, and delete anomalies). It works by splitting data into well-structured tables and linking them with foreign keys.

---

## 1. Why Normalization Matters

Imagine storing order data in a single table:

| order_id | customer_name | customer_email  | product_name | product_price |
| -------- | ------------- | --------------- | ------------ | ------------- |
| 1        | Alice         | alice@email.com | Widget A     | 9.99          |
| 2        | Alice         | alice@email.com | Widget B     | 14.99         |
| 3        | Bob           | bob@email.com   | Widget A     | 9.99          |

**Problems:**

- Alice's email is stored twice — if it changes, you must update all rows.
- If Widget A's price changes, all past orders are affected.
- Deleting the only order for Bob also deletes Bob's information.

---

## 2. First Normal Form (1NF)

**Rule:** Each cell must contain a single, atomic value. No repeating groups or arrays.

```
BAD — multiple values in one cell:
| user_id | tags           |
| 1       | python,js,sql  |  ← not atomic

GOOD — one value per cell (separate table):
| user_id | tag    |
| 1       | python |
| 1       | js     |
| 1       | sql    |
```

**Also requires:** Each row is uniquely identifiable (has a primary key).

---

## 3. Second Normal Form (2NF)

**Rule:** Must be in 1NF. Every non-key column must depend on the **whole** primary key (not just part of it). Applies only when the primary key is composite.

```
BAD — composite PK (order_id, product_id), but product_name depends only on product_id:
| order_id | product_id | product_name | quantity |
| 1        | 10         | Widget A     | 2        |
| 2        | 10         | Widget A     | 1        |  ← product_name repeated

GOOD — split product info into its own table:
orders_products:                products:
| order_id | product_id | qty |  | product_id | product_name |
| 1        | 10         | 2   |  | 10         | Widget A     |
| 2        | 10         | 1   |  | 11         | Widget B     |
```

---

## 4. Third Normal Form (3NF)

**Rule:** Must be in 2NF. Every non-key column must depend **directly** on the primary key, not on another non-key column (no transitive dependencies).

```
BAD — zip_code determines city, but zip_code is not the PK:
| user_id | zip_code | city       |
| 1       | 10001    | New York   |
| 2       | 10001    | New York   |  ← city is repeated for every user with same zip

GOOD — split city/zip into a separate table:
users:                          zip_codes:
| user_id | zip_code |          | zip_code | city     |
| 1       | 10001    |          | 10001    | New York |
| 2       | 10001    |          | 90210    | Beverly Hills |
```

---

## 5. Practical Example: Normalizing Orders

### Before (denormalized)

```
orders_flat:
| order_id | customer_email   | customer_name | product_name | product_price | qty |
| 1        | alice@email.com  | Alice         | Widget A     | 9.99          | 2   |
| 2        | alice@email.com  | Alice         | Widget B     | 14.99         | 1   |
```

### After (normalized to 3NF)

```sql
-- Each entity in its own table
CREATE TABLE customers (
  id    SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name  VARCHAR(100) NOT NULL
);

CREATE TABLE products (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(255) NOT NULL,
  price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(id),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  order_id   INT NOT NULL REFERENCES orders(id),
  product_id INT NOT NULL REFERENCES products(id),
  quantity   INT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,  -- snapshot price at time of order
  PRIMARY KEY (order_id, product_id)
);
```

> Notice `unit_price` on `order_items` — it stores the price at the time of purchase, not the current product price. This is an intentional denormalization to preserve historical accuracy.

---

## 6. When to Denormalize

Normalization improves data integrity but can require many JOINs for queries. Sometimes you intentionally store redundant data for performance:

| Situation                         | Approach                               |
| --------------------------------- | -------------------------------------- |
| Read-heavy tables with slow JOINs | Store computed/redundant values        |
| Analytics / reporting tables      | Flat, denormalized tables are fine     |
| Price/name at time of transaction | Store a snapshot (e.g., `unit_price`)  |
| User's full name in a log table   | OK to duplicate — logs are append-only |

**Rule:** Normalize first. Only denormalize when you have measured a performance need.

---

## Summary

| Normal Form | Key Rule                                         |
| ----------- | ------------------------------------------------ |
| **1NF**     | Atomic values only; each row uniquely identified |
| **2NF**     | No partial dependencies on a composite key       |
| **3NF**     | No transitive dependencies (non-key → non-key)   |

For most applications, **3NF is the target**. Higher normal forms (BCNF, 4NF, 5NF) exist but are rarely needed in practice.

---

## Key Rules

- Default to normalized design — it prevents data anomalies.
- Each entity (user, product, order) should have its own table.
- Link tables with foreign keys, not by duplicating data.
- Store snapshots (like price at purchase time) intentionally as documented denormalization.
- Only denormalize for proven performance reasons, not prematurely.
