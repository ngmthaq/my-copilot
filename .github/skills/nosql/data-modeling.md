---
name: nosql-data-modeling
description: "NoSQL data modeling patterns — embedding vs referencing, denormalization, schema design for document stores, and modeling for query patterns. Use when designing schemas or collections for MongoDB or other NoSQL databases."
---

# NoSQL Data Modeling

## Overview

NoSQL data modeling is different from SQL. In SQL you normalize data to avoid duplication. In NoSQL you often **denormalize** (duplicate data) to make reads fast. The goal is to model data around how it will be **queried**, not around avoiding redundancy.

**Core principle:** Make common queries fast, even if that means storing data redundantly.

---

## 1. Embedding vs Referencing

This is the most important decision in document database modeling.

### Embedding (store data inside the document)

```typescript
// User document with embedded addresses
{
  _id: ObjectId("..."),
  name: "Alice",
  email: "alice@example.com",
  addresses: [
    { type: "home", street: "123 Main St", city: "NYC" },
    { type: "work", street: "456 Park Ave", city: "NYC" },
  ]
}
```

**Use embedding when:**

- The sub-data belongs to only one parent ("has-a" relationship)
- You always read the sub-data with the parent
- The sub-data is small and won't grow unboundedly
- You need atomic updates across parent + sub-data

**Examples:** addresses, contact info, order line items, product variants, embedded comments (small count).

### Referencing (store an ID, link to another collection)

```typescript
// Post document references the author
{
  _id: ObjectId("..."),
  title: "Getting Started with MongoDB",
  authorId: ObjectId("user-id-here"),   // ← reference
  tags: ["mongodb", "nosql"],
}

// Fetch author separately
const post = await Post.findById(postId).populate('authorId');
```

**Use referencing when:**

- The sub-data is shared across many documents
- The sub-data can grow unboundedly (e.g., all posts by a user)
- The sub-data is large and often not needed
- You want to update the sub-data without touching all parent docs

**Examples:** user profiles, products, categories, authors.

### Decision Table

| Question                                   | Embed | Reference |
| ------------------------------------------ | ----- | --------- |
| Is there a "one" owner of this data?       | Yes   | No        |
| Do you load it with the parent every time? | Yes   | No        |
| Can it grow without bound?                 | No    | Yes       |
| Is it shared across many parent documents? | No    | Yes       |
| Do you need atomic updates?                | Yes   | No        |

---

## 2. Common Schema Patterns

### Pattern: Attribute Pattern

For documents with many optional fields that vary between records (e.g., product specs).

```typescript
// Bad: sparse document with many null fields
{
  _id: "...",
  name: "Laptop",
  ram_gb: 16,
  storage_gb: 512,
  color: null,         // not applicable
  shoe_size: null,     // not applicable
  battery_mah: null,   // not applicable
}

// Good: attribute pattern – use an array of key-value pairs
{
  _id: "...",
  name: "Laptop",
  attributes: [
    { key: "ram_gb",      value: "16" },
    { key: "storage_gb",  value: "512" },
  ]
}

// Index the attributes array for fast filtering
db.products.createIndex({ "attributes.key": 1, "attributes.value": 1 });
```

### Pattern: Bucket Pattern

For time-series or event data where individual documents would be too granular.

```typescript
// Bad: one document per sensor reading (millions of tiny docs)
{ sensorId: "s1", time: "10:00:01", temp: 22.1 }
{ sensorId: "s1", time: "10:00:02", temp: 22.3 }
// ...

// Good: bucket pattern – group readings by hour
{
  sensorId: "s1",
  hour: "2026-04-05T10",
  count: 60,
  readings: [
    { time: "10:00:01", temp: 22.1 },
    { time: "10:00:02", temp: 22.3 },
    // ... up to 60 entries
  ],
  minTemp: 21.8,
  maxTemp: 23.0,
  avgTemp: 22.4,
}
```

### Pattern: Computed Pattern

Store pre-computed aggregates to avoid expensive calculations on every read.

```typescript
// Instead of counting votes on every read...
const voteCount = await Vote.countDocuments({ postId });

// Store the count in the post and update it on write
{
  _id: ObjectId("..."),
  title: "My Post",
  voteCount: 142,   // ← pre-computed, updated on each vote
}

await Post.findByIdAndUpdate(postId, { $inc: { voteCount: 1 } });
```

### Pattern: Outlier Pattern

For data where most documents are small but some are unusually large.

```typescript
// Most users have < 100 followers — embed them
{
  _id: "user-alice",
  name: "Alice",
  followerIds: ["user-bob", "user-carol"],   // embedded
  hasMoreFollowers: false,
}

// A celebrity has 1M followers — use overflow collection
{
  _id: "user-celebrity",
  name: "Celebrity",
  followerIds: ["user-1", "user-2", ...],    // first N embedded
  hasMoreFollowers: true,                    // ← flag
}
// Remaining followers stored in a separate overflow collection
```

---

## 3. Denormalization

Denormalization means duplicating data across documents to avoid lookups.

```typescript
// Instead of referencing author by ID and doing a separate lookup:
{
  _id: ObjectId("..."),
  title: "My Post",
  // Duplicate author info directly in the post
  author: {
    _id: ObjectId("user-id"),
    name: "Alice",           // duplicated
    avatarUrl: "...",        // duplicated
  }
}

// Now you can render the post without loading the User collection.
// Trade-off: if Alice changes her name, update ALL her posts too.
```

**Rules for safe denormalization:**

1. Only duplicate fields that **rarely change** (name, username, avatar).
2. When data changes, update all copies (**write fan-out**).
3. If data changes frequently, use references instead.

---

## 4. Model for Your Queries

Always start with the questions:

1. **What are the most frequent queries?**
2. **What data do those queries need?**
3. **Design the document so the query needs no joins/lookups.**

```
Frequent query: Show a user's feed (latest 20 posts from followed users)

  Option A (reference): Load user → load follow list → query posts → load authors for each post
  Option B (denormalized): Store a pre-built feed collection per user, updated on write

  For high-scale social apps, Option B is the right trade-off.
```

---

## 5. Common Gotchas

- **Document size limit** — MongoDB documents are capped at 16 MB. Unbounded embedded arrays can hit this.
- **Over-embedding** — embedding everything seems easy but makes updates and cross-collection queries painful.
- **Over-referencing** — too many references turn NoSQL into slow SQL without join support.
- **Not modeling for queries** — the #1 mistake. Design your schema to answer your actual queries efficiently.
- **Forgetting write fan-out** — when denormalizing, make sure your code updates all copies on write.
