---
name: typeorm-transactions
description: "TypeORM transactions — using QueryRunner and EntityManager for transactions; atomic operations; rollback behavior. Use when: running multiple operations that must all succeed or all fail; transferring data between records; preventing partial updates."
---

# TypeORM Transactions

## Overview

A transaction groups multiple database operations so they either all succeed or all fail. TypeORM provides two ways to run transactions: via `QueryRunner` (full control) or via `DataSource.transaction()` (callback style).

---

## 1. `DataSource.transaction()` — Callback Style (Simple)

Pass a callback that receives an `EntityManager`. If the callback throws, TypeORM rolls back automatically:

```typescript
import { AppDataSource } from "../data-source";

const result = await AppDataSource.transaction(async (manager) => {
  // Use `manager` instead of a repository inside the callback

  // Step 1: Deduct from sender
  await manager.decrement(Account, { id: fromAccountId }, "balance", amount);

  // Step 2: Add to receiver
  await manager.increment(Account, { id: toAccountId }, "balance", amount);

  // Step 3: Record the transfer
  const transfer = manager.create(Transfer, { fromAccountId, toAccountId, amount });
  return manager.save(transfer);
});
// result is the saved Transfer
```

> Throwing any error inside the callback triggers a rollback and re-throws the error.

---

## 2. `QueryRunner` — Full Control (Complex)

Use `QueryRunner` when you need to read data and make decisions before writing, or when you need manual control over commit/rollback:

```typescript
import { AppDataSource } from "../data-source";

const queryRunner = AppDataSource.createQueryRunner();

// Acquire a connection and start the transaction
await queryRunner.connect();
await queryRunner.startTransaction();

try {
  // Step 1: Check balance
  const account = await queryRunner.manager.findOne(Account, {
    where: { id: fromAccountId },
    lock: { mode: "pessimistic_write" }, // lock the row to prevent concurrent updates
  });

  if (!account || account.balance < amount) {
    throw new Error("Insufficient balance"); // triggers rollback in catch block
  }

  // Step 2: Deduct
  await queryRunner.manager.decrement(Account, { id: fromAccountId }, "balance", amount);

  // Step 3: Add
  await queryRunner.manager.increment(Account, { id: toAccountId }, "balance", amount);

  // Step 4: Record transfer
  const transfer = queryRunner.manager.create(Transfer, { fromAccountId, toAccountId, amount });
  await queryRunner.manager.save(transfer);

  // All good — commit
  await queryRunner.commitTransaction();
  return transfer;
} catch (error) {
  // Something failed — rollback everything
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  // Always release the connection back to the pool
  await queryRunner.release();
}
```

---

## 3. When to Use Each Style

| Scenario                                  | Use                                   |
| ----------------------------------------- | ------------------------------------- |
| Simple atomic batch of writes             | `DataSource.transaction(callback)`    |
| Need to read before writing (check first) | `QueryRunner`                         |
| Need row-level locking                    | `QueryRunner` with `lock`             |
| Conditional logic between operations      | Either — but `QueryRunner` is clearer |

---

## 4. Practical Example: Create Order with Stock Check

```typescript
async function createOrder(userId: number, productId: number, quantity: number) {
  return AppDataSource.transaction(async (manager) => {
    // Check availability
    const product = await manager.findOne(Product, { where: { id: productId } });

    if (!product || product.stock < quantity) {
      throw new Error("Not enough stock"); // auto-rollback
    }

    // Deduct stock
    await manager.decrement(Product, { id: productId }, "stock", quantity);

    // Create order
    const order = manager.create(Order, {
      userId,
      productId,
      quantity,
      total: Number(product.price) * quantity,
    });
    return manager.save(order);
  });
}
```

---

## 5. Row-Level Locking

Prevent concurrent reads from getting stale data before writing:

```typescript
const queryRunner = AppDataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();

try {
  // Lock the row so no other transaction can modify it until we commit
  const product = await queryRunner.manager.findOne(Product, {
    where: { id: productId },
    lock: { mode: "pessimistic_write" }, // SELECT ... FOR UPDATE
  });

  // ... make changes
  await queryRunner.commitTransaction();
} catch (err) {
  await queryRunner.rollbackTransaction();
  throw err;
} finally {
  await queryRunner.release();
}
```

| Lock mode           | SQL equivalent          | Use when                                |
| ------------------- | ----------------------- | --------------------------------------- |
| `pessimistic_read`  | `SELECT ... FOR SHARE`  | You plan to read and want no changes    |
| `pessimistic_write` | `SELECT ... FOR UPDATE` | You plan to write — block other writers |
| `optimistic`        | version/timestamp check | Low-contention scenarios                |

---

## 6. Using Transactions in NestJS

In NestJS, inject `DataSource` and use it the same way:

```typescript
import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class OrderService {
  constructor(private readonly dataSource: DataSource) {}

  async createOrder(userId: number, productId: number, quantity: number) {
    return this.dataSource.transaction(async (manager) => {
      // same pattern as above
    });
  }
}
```

---

## Key Rules

- Always use `manager` (the transaction's `EntityManager`) inside the callback — not a regular repository.
- For `QueryRunner`, always call `release()` in `finally` — even if the transaction fails.
- Throwing any error inside `DataSource.transaction()` automatically triggers rollback.
- Use row locking (`pessimistic_write`) when multiple concurrent requests could conflict on the same row.
- Keep transactions short and focused — long transactions hold locks and reduce throughput.
