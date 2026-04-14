---
name: nosql-performance-optimization
description: "NoSQL performance optimization — query optimization, index usage, connection pooling, caching strategies, projection, avoiding common anti-patterns, and profiling slow queries. Primarily MongoDB-focused with general NoSQL principles."
---

# Performance Optimization

## Overview

NoSQL databases are fast by design, but bad schema design, missing indexes, and anti-patterns can make them slow. This file covers how to diagnose and fix performance problems.

---

## 1. The Most Impactful Optimizations

In order of impact:

1. **Add the right indexes** — turns O(n) scans into O(log n) lookups
2. **Use projection** — fetch only the fields you need
3. **Model data for your queries** — avoid joins and multiple round trips
4. **Use caching** — serve hot data from Redis, not the DB
5. **Tune connection pooling** — avoid creating connections on every request

---

## 2. Query Optimization

### Use Projection (don't fetch everything)

```typescript
// Bad: fetches all fields including large ones (avatar, bio, etc.)
const users = await User.find({ status: "active" });

// Good: fetch only what you need
const users = await User.find({ status: "active" }, "name email createdAt");

// In aggregation
await User.aggregate([
  { $match: { status: "active" } },
  { $project: { name: 1, email: 1 } }, // only these fields
]);
```

### Avoid `$where` and JavaScript expressions

```typescript
// Bad: runs JavaScript in the database (slow, no index)
await User.find({ $where: "this.age > 18" });

// Good: use native operators
await User.find({ age: { $gt: 18 } });
```

### Use `limit()` always

```typescript
// Bad: returns ALL matching documents
const all = await Log.find({ level: "error" });

// Good: limit to what you actually need
const recent = await Log.find({ level: "error" })
  .sort({ createdAt: -1 })
  .limit(100);
```

### Avoid `countDocuments()` for large collections

```typescript
// Slow on large collections: scans all matching docs
const count = await User.countDocuments({ status: "active" });

// Faster for rough counts: uses collection metadata
const count = await User.estimatedDocumentCount(); // total count only

// With filter: make sure status is indexed
const count = await User.countDocuments({ status: "active" }); // ok if indexed
```

---

## 3. Index Optimization

See [indexing.md](indexing.md) for full guidance. Quick checklist:

```typescript
// Check if a query is using an index
const plan = await User.find({ email: "alice@example.com" }).explain(
  "executionStats",
);

// Red flags in explain output:
// stage: 'COLLSCAN'     → no index, fix immediately
// docsExamined >> docsReturned  → index is inefficient
// too many examined for compound index  → wrong field order

// List all indexes on a collection
const indexes = await User.collection.listIndexes().toArray();

// Drop an unused index
await User.collection.dropIndex("old_index_name");
```

---

## 4. Connection Pooling

Creating a new database connection for every request is expensive. Use connection pools.

```typescript
// MongoDB with Mongoose: configure pool size
await mongoose.connect(process.env.MONGODB_URI!, {
  maxPoolSize: 10, // max connections in the pool (default: 5)
  minPoolSize: 2, // keep at least 2 connections warm
  serverSelectionTimeoutMS: 5000, // fail fast if no server available
  socketTimeoutMS: 45000, // close idle connections after 45s
});

// Redis with ioredis: already uses a pool internally
// One shared client across the app:
const redis = new Redis({ host: "localhost", port: 6379 });
// Export and reuse this instance everywhere — don't create new Redis() per request
```

**Rule:** Create the DB client **once** at app startup and reuse it throughout the application lifecycle.

---

## 5. Caching Strategy

Use Redis to cache results that are:

- Frequently read
- Rarely changed
- Expensive to compute

```typescript
// Cache-aside pattern with TTL
async function getProductById(id: string) {
  const cacheKey = `product:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const product = await Product.findById(id).lean(); // .lean() = faster, plain JS object
  if (product) {
    await redis.set(cacheKey, JSON.stringify(product), "EX", 3600);
  }
  return product;
}
```

**Cache invalidation rules:**

- Always delete/update the cache key when the data changes
- Use short TTLs (minutes) for frequently changing data
- Use long TTLs (hours/days) for rarely changing data (product catalog, config)

---

## 6. Use `.lean()` in Mongoose

By default, Mongoose wraps results in Model instances (with methods, virtuals, tracking). `.lean()` returns plain JavaScript objects — much faster for read-only data.

```typescript
// Normal: full Mongoose document (heavy)
const users = await User.find({ status: "active" });

// .lean(): plain JS objects (2-3x faster, much less memory)
const users = await User.find({ status: "active" }).lean();

// Use .lean() when:
// - You only need to read/serialize data (API responses)
// - You don't need Mongoose methods like .save(), virtuals, populate
// Don't use .lean() when:
// - You need to call .save() or use Mongoose middleware
```

---

## 7. Batch Operations

Avoid loops that make individual database calls. Batch them.

```typescript
// Bad: N individual DB calls (N+1 problem)
for (const orderId of orderIds) {
  const order = await Order.findById(orderId); // 1 query per loop iteration
  await processOrder(order);
}

// Good: 1 DB call to fetch all, then process in memory
const orders = await Order.find({ _id: { $in: orderIds } });
await Promise.all(orders.map(processOrder));

// Bad: N individual inserts
for (const item of items) {
  await Product.create(item);
}

// Good: bulk insert
await Product.insertMany(items);
```

---

## 8. Profiling Slow Queries (MongoDB)

```typescript
// Enable profiling for queries slower than 100ms
// Run in mongo shell:
// db.setProfilingLevel(1, { slowms: 100 })

// View the slowest queries from the profiler
const slowQueries = await db
  .collection("system.profile")
  .find({})
  .sort({ millis: -1 })
  .limit(10)
  .toArray();

// Alternatively: use MongoDB Atlas Performance Advisor (UI-based)
```

---

## 9. Common Anti-Patterns to Avoid

| Anti-Pattern                             | Problem                              | Fix                                     |
| ---------------------------------------- | ------------------------------------ | --------------------------------------- |
| No index on filtered fields              | Full collection scan on every query  | Add compound index (see indexing.md)    |
| Fetching all fields (no projection)      | Large payloads, slow serialization   | Project only needed fields              |
| Creating a new DB connection per request | Connection overhead kills throughput | Use a shared connection pool            |
| Unbounded queries without limit          | Returns millions of docs, OOM        | Always use `.limit()`                   |
| N+1 queries in a loop                    | N database round trips instead of 1  | Use `$in` or `insertMany` / `bulkWrite` |
| Storing large binary data in documents   | Bloated documents, slow reads        | Store in object storage (S3), save URL  |
| `$where` with JavaScript                 | Can't use indexes, security risk     | Use native query operators              |
