---
name: prisma-transactions
description: "Prisma transactions — using $transaction for sequential and interactive transactions; atomic operations; rollback behavior. Use when: running multiple operations that must all succeed or all fail; transferring data between records; preventing partial updates."
---

# Prisma Transactions

## Overview

A transaction groups multiple database operations so they either all succeed or all fail together. If any operation fails, the database is rolled back to its state before the transaction started.

---

## 1. Sequential Transactions (Simple)

Pass an array of Prisma queries — all run in a single transaction:

```typescript
// Transfer balance between two accounts atomically
const [debit, credit] = await prisma.$transaction([
  prisma.account.update({
    where: { id: fromAccountId },
    data: { balance: { decrement: amount } },
  }),
  prisma.account.update({
    where: { id: toAccountId },
    data: { balance: { increment: amount } },
  }),
]);
```

If the second update fails, the first is automatically rolled back.

---

## 2. Interactive Transactions (Complex Logic)

Use a callback when you need to read data and then make decisions based on it:

```typescript
const result = await prisma.$transaction(async (tx) => {
  // Use `tx` instead of `prisma` inside the callback

  // Step 1: Read the account balance
  const account = await tx.account.findUnique({
    where: { id: fromAccountId },
  });

  if (!account || account.balance < amount) {
    throw new Error("Insufficient balance"); // triggers rollback
  }

  // Step 2: Deduct from sender
  await tx.account.update({
    where: { id: fromAccountId },
    data: { balance: { decrement: amount } },
  });

  // Step 3: Add to receiver
  await tx.account.update({
    where: { id: toAccountId },
    data: { balance: { increment: amount } },
  });

  // Step 4: Record the transfer
  return tx.transfer.create({
    data: { fromAccountId, toAccountId, amount },
  });
});

// result is the created Transfer record
```

> **Key rule:** Throw an error inside the callback to trigger a rollback. Return a value to commit.

---

## 3. When to Use Each Type

| Scenario                             | Use                            |
| ------------------------------------ | ------------------------------ |
| Multiple independent writes          | Sequential `$transaction([])`  |
| Need to read before writing          | Interactive `$transaction(cb)` |
| Conditional logic between operations | Interactive `$transaction(cb)` |
| Simple atomic batch                  | Sequential `$transaction([])`  |

---

## 4. Practical Example: Create Order with Inventory Check

```typescript
async function createOrder(
  userId: number,
  productId: number,
  quantity: number,
) {
  return prisma.$transaction(async (tx) => {
    // Check product availability
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.stock < quantity) {
      throw new Error("Not enough stock");
    }

    // Deduct stock
    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });

    // Create the order
    const order = await tx.order.create({
      data: {
        userId,
        productId,
        quantity,
        total: product.price * quantity,
      },
    });

    return order;
  });
}
```

---

## 5. Transaction Timeout

By default, interactive transactions time out after 5 seconds. Increase this for long operations:

```typescript
await prisma.$transaction(
  async (tx) => {
    // long-running operations...
  },
  {
    timeout: 15000, // 15 seconds in milliseconds
    maxWait: 5000, // max time to wait for a database connection
  },
);
```

---

## 6. Isolation Level

Control how the transaction sees data from concurrent transactions:

```typescript
await prisma.$transaction(
  async (tx) => {
    // ...
  },
  {
    isolationLevel: "Serializable", // strictest — prevents all anomalies
    // Other options: "ReadUncommitted", "ReadCommitted", "RepeatableRead"
  },
);
```

For most use cases, the default (`ReadCommitted`) is fine.

---

## Key Rules

- Always use `tx` (the transaction client) inside the callback — not the global `prisma`.
- Throwing any error inside the callback rolls back all operations.
- Keep transactions short to avoid blocking the database.
- Use interactive transactions when you need to read data before deciding what to write.
- Use sequential transactions when the operations are independent and don't depend on each other's results.
