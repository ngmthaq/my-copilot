---
name: nosql-scaling-sharding
description: "Scaling NoSQL databases — horizontal scaling, sharding strategies, replica sets, partition key selection, and replication. Covers MongoDB and Cassandra approaches."
---

# Scaling & Sharding

## Overview

NoSQL databases are designed to scale **horizontally** — you add more servers rather than upgrading to a bigger one. This document explains how NoSQL databases distribute data across multiple nodes.

---

## 1. Vertical vs Horizontal Scaling

```
Vertical scaling (scale up):
  One big server with more RAM, CPU, disk
  → Simple, but has a physical limit and is expensive

Horizontal scaling (scale out):
  Many smaller servers sharing the load
  → NoSQL is designed for this
```

**NoSQL horizontal scaling strategies:**

- **Replication** — copy data to multiple nodes for high availability and read scaling
- **Sharding** — split data across multiple nodes for write scaling and large datasets

---

## 2. Replication

Replication copies your data to multiple servers so that if one server fails, others take over.

### MongoDB Replica Set

A replica set has one **primary** (handles all writes) and multiple **secondaries** (replicate from primary).

```
[ Primary ] → replicates to → [ Secondary 1 ]
                             → [ Secondary 2 ]

If primary fails:
  Secondaries elect a new primary automatically (within ~10 seconds)
```

```typescript
// Connect to replica set in connection string
const uri = "mongodb://host1:27017,host2:27017,host3:27017/mydb?replicaSet=rs0";
await mongoose.connect(uri);

// Read from secondaries to reduce primary load
await User.find().read("secondaryPreferred");
// Options: primary, primaryPreferred, secondary, secondaryPreferred, nearest
```

### Cassandra Replication

Cassandra automatically replicates data to multiple nodes based on `replication_factor`.

```cql
-- Replicate to 3 nodes per datacenter
CREATE KEYSPACE my_app WITH replication = {
  'class': 'NetworkTopologyStrategy',
  'us-east': 3,
  'eu-west': 3
};
```

---

## 3. Sharding

Sharding splits data across multiple servers (shards). Each shard holds a subset of the data.

```
Total data: 1TB across 4 shards
  Shard 1: users A-F  (250GB)
  Shard 2: users G-M  (250GB)
  Shard 3: users N-S  (250GB)
  Shard 4: users T-Z  (250GB)
```

### MongoDB Sharding

In MongoDB, you choose a **shard key** — the field used to decide which shard a document goes to.

```javascript
// Enable sharding on a collection
// (done via mongo shell or admin commands)
sh.enableSharding("mydb");
sh.shardCollection("mydb.users", { userId: "hashed" });
//                                          ↑
//                          shard key: hashed for even distribution
```

### Choosing a Good Shard Key

| Criteria               | Good shard key                     | Bad shard key              |
| ---------------------- | ---------------------------------- | -------------------------- |
| **Cardinality**        | Many unique values (userId, email) | Few values (status, bool)  |
| **Write distribution** | Spreads writes evenly              | Creates a "hot shard"      |
| **Query isolation**    | Common queries target one shard    | All queries hit all shards |

**Hashed shard key** — even write distribution, but range queries hit all shards:

```javascript
sh.shardCollection("mydb.users", { userId: "hashed" });
```

**Ranged shard key** — efficient range queries, but can create hot shards if values are sequential:

```javascript
sh.shardCollection("mydb.events", { createdAt: 1 }); // risky: recent events all on one shard
```

**Compound shard key** — balance distribution and query isolation:

```javascript
sh.shardCollection("mydb.orders", { userId: 1, orderId: 1 });
```

### Cassandra Sharding (Partition Key)

In Cassandra, sharding is automatic and controlled by the **partition key**. All rows with the same partition key live on the same node.

```cql
CREATE TABLE events (
  user_id   UUID,       -- partition key: data for same user stays together
  event_time TIMESTAMP, -- clustering column: sorted within the partition
  action    TEXT,
  PRIMARY KEY (user_id, event_time)
);
```

**Spread load by using a compound partition key when one field creates hot spots:**

```cql
-- If all users write to the same "today" date, that date is a hot partition
-- Add a bucket to spread the load
CREATE TABLE daily_events (
  date    DATE,
  bucket  TINYINT,       -- 0 to 9: hash(user_id) % 10
  user_id UUID,
  time    TIMESTAMP,
  action  TEXT,
  PRIMARY KEY ((date, bucket), user_id, time)
);
```

---

## 4. Read Scaling Patterns

### Read Replicas

Route read-heavy queries to secondary/replica nodes to reduce load on the primary.

```typescript
// MongoDB: prefer reading from nearest node
await Product.find({ category: "electronics" }).read("nearest");

// Good for: product listings, user profiles, reports
// Bad for: reading data you just wrote (may be stale for milliseconds)
```

### Caching Layer

Use Redis in front of the database to serve frequent reads without hitting the database.

```
Request → Redis (cache hit? return instantly)
                ↓ cache miss
         MongoDB → store in Redis → return to client
```

See [key-value-stores.md](key-value-stores.md) for the cache-aside pattern.

---

## 5. Common Gotchas

- **Changing the shard key is very hard** — choose carefully before going to production; re-sharding requires migrating all data.
- **Monotonically increasing shard keys create hot shards** — e.g., using `createdAt` or auto-increment IDs means all new writes go to one shard. Use hashed shard keys or add randomness.
- **Scatter-gather queries are expensive** — if a query doesn't include the shard key, MongoDB must query ALL shards and merge results. Always include the shard key in common queries.
- **Replication lag** — secondaries may be slightly behind the primary. Don't read from secondaries for write-then-read flows where consistency is critical.
- **Don't shard prematurely** — a single well-tuned replica set handles hundreds of thousands of ops/sec. Shard only when you've exhausted vertical scaling and replica set read scaling.
