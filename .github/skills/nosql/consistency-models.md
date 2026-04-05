---
name: nosql-consistency-models
description: "Consistency models in NoSQL — CAP theorem, eventual vs strong consistency, ACID vs BASE, and read/write consistency levels in Cassandra and MongoDB. Use when understanding trade-offs between consistency, availability, and partition tolerance."
---

# Consistency Models

## Overview

NoSQL databases make different trade-offs between consistency, availability, and performance. Understanding these trade-offs helps you choose the right database and configure it correctly.

---

## 1. The CAP Theorem

A distributed system can guarantee at most **2 of these 3** properties:

| Property                    | Meaning                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| **Consistency (C)**         | Every read returns the most recent write                         |
| **Availability (A)**        | Every request gets a response (even if it's stale data)          |
| **Partition Tolerance (P)** | The system works even if network partitions (message loss) occur |

Network partitions are unavoidable in distributed systems. So in practice, you choose **CP** or **AP**:

```
CP databases (Consistency + Partition Tolerance):
  → MongoDB (with majority writes), HBase, Zookeeper
  → Sacrifice: availability during partitions

AP databases (Availability + Partition Tolerance):
  → Cassandra, CouchDB, DynamoDB
  → Sacrifice: may serve stale data during partitions
```

---

## 2. ACID vs BASE

SQL databases are ACID. Many NoSQL databases are BASE.

### ACID (SQL / MongoDB with transactions)

| Property        | Meaning                                                      |
| --------------- | ------------------------------------------------------------ |
| **Atomicity**   | All operations in a transaction succeed or all fail together |
| **Consistency** | Data always moves from one valid state to another            |
| **Isolation**   | Concurrent transactions don't interfere with each other      |
| **Durability**  | Committed data survives crashes                              |

### BASE (Cassandra, many NoSQL)

| Property                  | Meaning                                              |
| ------------------------- | ---------------------------------------------------- |
| **Basically Available**   | System responds even if some data is stale           |
| **Soft state**            | Data may change over time as replicas sync           |
| **Eventually Consistent** | All replicas will agree eventually (not immediately) |

---

## 3. Types of Consistency

### Strong Consistency

After a write succeeds, every subsequent read returns that value.

```
Write: user.balance = 100
Read (any node, immediately): user.balance = 100  ✔
```

**Example:** MongoDB with `{ writeConcern: { w: 'majority' } }` + `{ readConcern: 'majority' }`.

**Cost:** Higher latency (waits for majority of replicas to confirm)

### Eventual Consistency

After a write, replicas will _eventually_ agree, but reads might temporarily return stale data.

```
Write: user.balance = 100 (written to 1 of 3 replicas)
Read (different replica, immediately): user.balance = 80  ✗ (stale)
Read (same replica, 50ms later):       user.balance = 100 ✔ (synced)
```

**Example:** Cassandra with `ConsistencyLevel.ONE`.

**Cost:** Lower latency, but reads can be stale

### Read-Your-Writes Consistency

A user always sees their own writes, even if other users might see stale data.

**Example:** Route a user's reads to the primary replica after a write.

---

## 4. Cassandra Consistency Levels

Cassandra lets you choose the consistency level per query. More nodes required = stronger consistency = higher latency.

| Level          | Write requires...            | Read requires...             | Use when                           |
| -------------- | ---------------------------- | ---------------------------- | ---------------------------------- |
| `ONE`          | 1 replica to acknowledge     | 1 replica to respond         | Lowest latency, eventual           |
| `QUORUM`       | Majority of replicas         | Majority of replicas         | Balanced (most common)             |
| `ALL`          | All replicas                 | All replicas                 | Strongest, lowest availability     |
| `LOCAL_QUORUM` | Majority in local datacenter | Majority in local datacenter | Multi-region, low cross-DC latency |

```typescript
const result = await client.execute("SELECT * FROM users WHERE id = ?", [userId], {
  prepare: true,
  consistency: types.consistencies.localQuorum,
});
```

**Formula for strong consistency:** `WRITE + READ > replication_factor`

```
If replication_factor = 3:
  QUORUM write (2) + QUORUM read (2) = 4 > 3  ✔ always returns latest
  ONE write (1) + ONE read (1) = 2 < 3         ✗ might return stale
```

---

## 5. MongoDB Write & Read Concerns

```typescript
// Strong consistency: wait for majority of replica set to confirm
const result = await User.findByIdAndUpdate(
  id,
  { $set: { balance: 100 } },
  {
    writeConcern: { w: "majority", j: true }, // w: majority nodes, j: journaled
    readConcern: { level: "majority" }, // read from majority-confirmed data
    new: true,
  },
);

// Fast write (default): acknowledge when primary receives it
// Risk: data may not be on secondary replicas yet
const result = await User.findByIdAndUpdate(id, update); // w: 1 (default)
```

---

## 6. When to Use Which Model

| Use Case                              | Consistency Need | Recommended setting              |
| ------------------------------------- | ---------------- | -------------------------------- |
| Financial transactions (debit/credit) | Strong           | MongoDB transactions, w:majority |
| User profile reads                    | Eventual is fine | Cassandra ONE or MongoDB w:1     |
| Shopping cart                         | Read-your-writes | Route to primary after write     |
| Social feed (likes, views)            | Eventual is fine | Cassandra ONE, Redis             |
| Inventory (prevent oversell)          | Strong           | MongoDB transactions             |
| Analytics / reporting                 | Eventual is fine | Read from secondary replicas     |

---

## 7. Common Gotchas

- **Eventual consistency doesn't mean incorrect** — it means temporarily stale. For most social features, this is perfectly acceptable.
- **Cassandra QUORUM is not free** — it halves your throughput vs ONE. Only use it where you truly need it.
- **MongoDB is not eventually consistent by default** — single-document writes are always atomic. Transactions give ACID across multiple documents.
- **"Eventually" usually means milliseconds** — not minutes or hours. Replication lag is typically very small under normal load.
