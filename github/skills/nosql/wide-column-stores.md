---
name: nosql-wide-column-stores
description: "Wide-column store patterns — Cassandra table design, partition keys, clustering columns, CQL queries, and write-heavy workload design. Use when working with Apache Cassandra, HBase, or ScyllaDB."
---

# Wide-Column Stores

## Overview

Wide-column stores organize data in rows and columns, but each row can have a different set of columns. They're optimized for **write-heavy workloads** and **time-series data**. Apache Cassandra is the most popular example.

**Key idea:** Design your tables around your queries, not the other way around.

```
SQL:       Design tables → write queries later
Cassandra: Know your queries → design tables around them
```

---

## 1. Core Concepts

### Partition Key & Clustering Columns

Every Cassandra table has:

- **Partition key** — determines which node stores the row. All rows with the same partition key are stored together.
- **Clustering columns** — sort rows within the partition.

```cql
CREATE TABLE sensor_readings (
  sensor_id  UUID,          -- partition key: group data by sensor
  recorded_at TIMESTAMP,    -- clustering column: sort by time
  temperature DOUBLE,
  humidity    DOUBLE,
  PRIMARY KEY (sensor_id, recorded_at)
) WITH CLUSTERING ORDER BY (recorded_at DESC);
```

This table is designed for one query: _"Get readings for sensor X, newest first."_

### Why Partition Key Matters

| Bad partition key         | Problem                                     |
| ------------------------- | ------------------------------------------- |
| Sequential ID / timestamp | All writes go to one node ("hot partition") |
| Too many unique values    | Too many small partitions (low efficiency)  |
| Too few unique values     | Too few large partitions (hot spots)        |

A good partition key distributes data **evenly** across nodes.

---

## 2. CQL Basics (Cassandra Query Language)

CQL looks like SQL but has important restrictions.

### Create Keyspace (like a database)

```cql
CREATE KEYSPACE my_app
  WITH replication = {
    'class': 'SimpleStrategy',
    'replication_factor': 3     -- store 3 copies
  };

USE my_app;
```

### Common Table Patterns

```cql
-- User events (partition by user, sort by time)
CREATE TABLE user_events (
  user_id   UUID,
  event_time TIMESTAMP,
  event_type TEXT,
  metadata  MAP<TEXT, TEXT>,   -- key-value map
  PRIMARY KEY (user_id, event_time)
) WITH CLUSTERING ORDER BY (event_time DESC);

-- Time-series with compound partition key (avoid hot partitions)
CREATE TABLE metrics (
  service TEXT,
  date    DATE,         -- composite partition key: spread by service + date
  time    TIMESTAMP,
  value   DOUBLE,
  PRIMARY KEY ((service, date), time)
) WITH CLUSTERING ORDER BY (time DESC);
```

### CRUD

```cql
-- Insert ("upsert" — always replaces if primary key exists)
INSERT INTO user_events (user_id, event_time, event_type)
VALUES (uuid(), toTimestamp(now()), 'login');

-- Insert with TTL (auto-deletes after N seconds)
INSERT INTO sessions (session_id, user_id)
VALUES ('abc123', uuid())
USING TTL 1800;  -- 30 minutes

-- Read (must filter by partition key)
SELECT * FROM user_events
WHERE user_id = 550e8400-e29b-41d4-a716-446655440000
  AND event_time > '2026-01-01'
LIMIT 100;

-- Update
UPDATE user_events
SET event_type = 'logout'
WHERE user_id = 550e8400-e29b-41d4-a716-446655440000
  AND event_time = '2026-01-15 10:30:00';

-- Delete
DELETE FROM user_events
WHERE user_id = 550e8400-e29b-41d4-a716-446655440000
  AND event_time = '2026-01-15 10:30:00';
```

### Node.js with cassandra-driver

```typescript
import { Client } from "cassandra-driver";

const client = new Client({
  contactPoints: ["localhost"],
  localDataCenter: "datacenter1",
  keyspace: "my_app",
});

await client.connect();

// Read recent events for a user
const result = await client.execute(
  "SELECT * FROM user_events WHERE user_id = ? LIMIT ?",
  [userId, 50],
  { prepare: true }, // always use prepared statements
);

const events = result.rows;
```

---

## 3. Design Patterns

### One table per query pattern

If you need the same data in two different access patterns, create two tables.

```cql
-- Table 1: Find orders by user
CREATE TABLE orders_by_user (
  user_id  UUID,
  order_id UUID,
  total    DECIMAL,
  status   TEXT,
  PRIMARY KEY (user_id, order_id)
);

-- Table 2: Find orders by status (for admin)
CREATE TABLE orders_by_status (
  status   TEXT,
  order_id UUID,
  user_id  UUID,
  total    DECIMAL,
  PRIMARY KEY (status, order_id)
);

-- Insert into BOTH tables when creating an order
```

### Bucketing to avoid large partitions

A partition holding millions of rows becomes a "hot partition". Bucket by a time period:

```cql
-- Instead of partitioning by user_id only (unbounded growth)
-- Add a monthly bucket to the partition key
CREATE TABLE events_bucketed (
  user_id UUID,
  month   TEXT,   -- e.g., '2026-03'
  time    TIMESTAMP,
  action  TEXT,
  PRIMARY KEY ((user_id, month), time)
);
```

---

## 4. Common Gotchas

- **No joins** — Cassandra does not support joins. Denormalize your data or query multiple tables in application code.
- **No `WHERE` on non-key columns** (without ALLOW FILTERING) — filtering on non-primary-key columns requires a secondary index or a separate table.
- **`ALLOW FILTERING` is a red flag** — it performs a full table scan. Avoid it in production.
- **Inserts are upserts** — there's no error if the row already exists; it just overwrites.
- **Deletions leave tombstones** — deleted rows leave markers until compaction. High delete rates can hurt read performance.
- **Use prepared statements** — always use `{ prepare: true }` in the driver to avoid injection and improve performance.
