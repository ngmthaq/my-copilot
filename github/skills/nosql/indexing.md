---
name: nosql-indexing
description: "NoSQL indexing guide — index types, compound indexes, when to index, sparse/partial/TTL indexes, and how to spot missing or slow indexes. Focused on MongoDB but concepts apply broadly."
---

# Indexing in NoSQL

## Overview

Indexes are data structures that let the database find documents quickly without scanning every document. Without an index, the database does a **collection scan** — checking every document one by one.

**Rule of thumb:** Any field you filter, sort, or join on frequently should probably have an index.

---

## 1. Index Types (MongoDB)

### Single Field Index

```typescript
// Create index on email (ascending)
await User.collection.createIndex({ email: 1 });

// Descending (useful for sorting newest first)
await Post.collection.createIndex({ createdAt: -1 });

// Unique index (enforces uniqueness)
await User.collection.createIndex({ email: 1 }, { unique: true });
```

### Compound Index (index on multiple fields)

Covers queries that filter on multiple fields. **Field order matters.**

```typescript
// Supports queries filtering by userId, or userId + status, or userId + status + createdAt
await Order.collection.createIndex({ userId: 1, status: 1, createdAt: -1 });

// Supports: find by userId
// Supports: find by userId + status
// Supports: find by userId + status, sorted by createdAt
// Does NOT support: find by status alone (no leading field)
```

**The Equality-Sort-Range (ESR) rule for field order:**

1. **Equality** fields first (exact match: `status: 'active'`)
2. **Sort** fields next (fields in `sort()`)
3. **Range** fields last (range: `age: { $gte: 18 }`)

```typescript
// Query: find active users aged 18+, sorted by name
// Good index order: { status, name, age }
await User.collection.createIndex({ status: 1, name: 1, age: 1 });
```

### Text Index (full-text search)

```typescript
await Post.collection.createIndex({ title: "text", content: "text" });

// Query using text search
const results = await Post.find({ $text: { $search: "mongodb tutorial" } });
```

### Sparse Index

Only indexes documents where the field exists. Good for optional fields.

```typescript
// Index only documents that have a phoneNumber
await User.collection.createIndex({ phoneNumber: 1 }, { sparse: true });
```

### Partial Index

Only indexes documents matching a filter. More targeted than sparse.

```typescript
// Index only active orders
await Order.collection.createIndex(
  { userId: 1, createdAt: -1 },
  { partialFilterExpression: { status: "active" } },
);
```

### TTL Index (auto-delete documents after expiry)

```typescript
// Auto-delete session documents 30 minutes after `createdAt`
await Session.collection.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 1800 },
);
```

---

## 2. Defining Indexes in Mongoose

```typescript
const userSchema = new Schema({
  email: { type: String, unique: true }, // unique index
  status: { type: String, index: true }, // single-field index
  firstName: String,
  lastName: String,
  createdAt: Date,
});

// Compound index at schema level
userSchema.index({ status: 1, createdAt: -1 });
userSchema.index({ firstName: "text", lastName: "text" }); // text search
```

---

## 3. Diagnosing Slow Queries with `explain()`

```typescript
// Add .explain('executionStats') to any query
const explanation = await User.find({ email: "alice@example.com" }).explain(
  "executionStats",
);

// Key fields to check:
console.log(explanation.executionStats.totalDocsExamined); // should equal totalDocsReturned
console.log(explanation.executionStats.executionTimeMillis); // should be low
console.log(explanation.queryPlanner.winningPlan.stage); // should NOT be 'COLLSCAN'
```

**Warning signs:**

- `stage: 'COLLSCAN'` — no index used, full collection scan
- `totalDocsExamined >> totalDocsReturned` — index is inefficient
- High `executionTimeMillis` — query is slow

---

## 4. When to Index

**Index these:**

- Fields used in `find()` filters frequently
- Fields used in `sort()`
- Fields with high cardinality (many distinct values) like email, userId
- Foreign key fields used with `populate()` or lookups

**Don't over-index:**

- Every index slows down **writes** (insert, update, delete must update all indexes)
- Small collections (< 1,000 docs) rarely benefit from indexes
- Fields with very low cardinality (e.g., `isDeleted: true/false`) — the database may ignore the index and scan anyway
- Fields that are almost never queried

---

## 5. Common Gotchas

- **Index on `_id` is free** — MongoDB always has an index on `_id`, don't add one manually.
- **Compound index direction matters for sorting** — `{ a: 1, b: -1 }` supports sorting `a ASC, b DESC` or `a DESC, b ASC`, but not `a ASC, b ASC`.
- **Too many indexes** — each index takes storage and slows writes. Audit and drop unused indexes.
- **Index doesn't help regex** — `{ $regex: /^alice/ }` (prefix) uses an index, but `{ $regex: /alice/ }` (substring) does not.
- **Indexes are only used if the query matches the prefix** — a compound index `{ a, b, c }` won't help a query that filters only on `c`.
