---
name: transactions
description: ACID properties, BEGIN/COMMIT/ROLLBACK, isolation levels, savepoints, and practical examples.
---

# Transactions

## Overview

A **transaction** is a group of SQL statements that execute as a single unit. Either all succeed or all fail — no partial updates.

---

## 1. Basic Syntax

```sql
-- PostgreSQL
BEGIN;

  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;

-- MySQL (START TRANSACTION is the preferred syntax)
START TRANSACTION;

  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;
```

> `BEGIN` works in both PostgreSQL and MySQL. MySQL also accepts `BEGIN WORK`. `START TRANSACTION` is MySQL's canonical form and allows options like `START TRANSACTION READ ONLY`.

If something goes wrong, roll back all changes:

```sql
BEGIN;

  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  -- uh oh, second update fails
  UPDATE accounts SET balance = balance + 100 WHERE id = 999; -- user not found

ROLLBACK;
-- Neither update is applied
```

---

## 2. ACID Properties

| Property        | Meaning                         | Example                                                |
| --------------- | ------------------------------- | ------------------------------------------------------ |
| **Atomicity**   | All or nothing                  | Transfer: both debit + credit succeed or neither does  |
| **Consistency** | Data stays valid                | Balance can't go below 0 if a CHECK constraint is set  |
| **Isolation**   | Transactions don't interfere    | Two transfers run concurrently without corrupting data |
| **Durability**  | Committed data survives crashes | Data written to disk, not lost on power failure        |

---

## 3. Isolation Levels

Controls what one transaction can see from other concurrent transactions.

```sql
-- Set for current transaction (PostgreSQL)
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

BEGIN;
  -- your queries here
COMMIT;

-- MySQL: set for the session
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION;
  -- your queries here
COMMIT;
```

| Level              | Dirty Read   | Non-Repeatable Read | Phantom Read | Default in     |
| ------------------ | ------------ | ------------------- | ------------ | -------------- |
| `READ UNCOMMITTED` | ✅ possible  | ✅ possible         | ✅ possible  | —              |
| `READ COMMITTED`   | ❌ prevented | ✅ possible         | ✅ possible  | PostgreSQL     |
| `REPEATABLE READ`  | ❌ prevented | ❌ prevented        | ✅ possible  | MySQL (InnoDB) |
| `SERIALIZABLE`     | ❌ prevented | ❌ prevented        | ❌ prevented | —              |

**Glossary:**

- **Dirty read** — reading uncommitted changes from another transaction
- **Non-repeatable read** — same row returns different data on second read
- **Phantom read** — same query returns different rows on second run

---

## 4. Practical Example — Fund Transfer

```sql
BEGIN;

  -- Check sender has enough balance
  SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
  -- FOR UPDATE locks the row so no concurrent transaction can modify it

  -- Debit sender
  UPDATE accounts
  SET balance = balance - 500
  WHERE id = 1 AND balance >= 500;

  -- Credit receiver
  UPDATE accounts
  SET balance = balance + 500
  WHERE id = 2;

COMMIT;
```

Use `FOR UPDATE` to lock rows you intend to modify, preventing race conditions.

---

## 5. Practical Example — Inventory Check

```sql
BEGIN;

  -- Lock product row
  SELECT stock FROM products WHERE id = 42 FOR UPDATE;

  -- Only proceed if stock available
  UPDATE products SET stock = stock - 1 WHERE id = 42 AND stock > 0;

  INSERT INTO order_items (order_id, product_id, quantity)
  VALUES (101, 42, 1);

COMMIT;
```

---

## 6. Savepoints

Savepoints let you partially roll back within a transaction. Supported by both PostgreSQL and MySQL (InnoDB engine only).

```sql
-- Works in both PostgreSQL and MySQL
BEGIN;  -- or START TRANSACTION; in MySQL

  INSERT INTO orders (user_id, total) VALUES (1, 200);

  SAVEPOINT before_items;

  INSERT INTO order_items (order_id, product_id, quantity) VALUES (1, 99, 1);
  -- Something's wrong with this item

  ROLLBACK TO SAVEPOINT before_items;
  -- Order is still inserted, only the item is rolled back

  INSERT INTO order_items (order_id, product_id, quantity) VALUES (1, 50, 1);

COMMIT;
```

---

## 7. Auto-commit

By default, most database clients run in **auto-commit mode** — each statement is its own transaction.

```sql
-- This runs as its own transaction automatically:
UPDATE users SET name = 'Alice' WHERE id = 1;

-- To disable auto-commit and control transactions manually, use BEGIN explicitly.
```

---

## Key Rules

- Always use `BEGIN` + `COMMIT`/`ROLLBACK` for multi-step operations that must succeed or fail together
- Use `FOR UPDATE` to lock rows during read-then-write operations (prevents race conditions)
- Prefer `READ COMMITTED` for most apps; use `SERIALIZABLE` only when strict consistency is critical
- Keep transactions short — long transactions hold locks and block other queries
- Use savepoints when you need partial rollback inside a complex transaction
