---
name: nosql-query-patterns
description: "Common NoSQL query patterns — CRUD queries, pagination, aggregation, filtering, sorting, and full-text search. Primarily MongoDB/Mongoose, with notes for other databases."
---

# Query Patterns

## Overview

This file covers the most common query patterns you'll use in NoSQL databases, with practical code examples using MongoDB/Mongoose. The patterns apply conceptually to other databases too.

---

## 1. CRUD Queries

See [document-databases.md](document-databases.md) for full CRUD examples. Quick reference:

```typescript
// Create
await Model.create(data);

// Read
await Model.findById(id);
await Model.findOne({ field: value });
await Model.find({ field: value });

// Update
await Model.findByIdAndUpdate(id, { $set: { field: value } }, { new: true });

// Delete
await Model.findByIdAndDelete(id);
```

---

## 2. Filtering

### Comparison Operators

```typescript
// Equal
await Product.find({ category: "electronics" });

// Not equal
await Product.find({ status: { $ne: "deleted" } });

// Greater than / less than
await Product.find({ price: { $gte: 10, $lte: 100 } });

// In a list of values
await Product.find({ category: { $in: ["electronics", "books"] } });

// Not in a list
await Product.find({ status: { $nin: ["deleted", "archived"] } });

// Field exists
await Product.find({ discount: { $exists: true } });
```

### Logical Operators

```typescript
// AND (default when combining multiple conditions)
await Product.find({ category: "electronics", price: { $lt: 500 } });

// OR
await Product.find({
  $or: [{ category: "electronics" }, { category: "books" }],
});

// NOT
await Product.find({ price: { $not: { $gt: 1000 } } });

// Combine AND + OR
await Product.find({
  status: "active",
  $or: [{ category: "electronics" }, { featured: true }],
});
```

### Array Queries

```typescript
// Documents where tags array contains 'mongodb'
await Post.find({ tags: "mongodb" });

// Documents where tags contains ALL of these
await Post.find({ tags: { $all: ["mongodb", "tutorial"] } });

// Documents where tags contains at least one of these
await Post.find({ tags: { $in: ["mongodb", "redis"] } });

// Documents where ANY element in items matches both conditions
await Order.find({
  items: { $elemMatch: { product: "Widget", quantity: { $gt: 2 } } },
});
```

---

## 3. Sorting & Projection

```typescript
// Sort ascending (1) or descending (-1)
await Post.find().sort({ createdAt: -1, title: 1 });

// Include only specific fields
await User.find({}, { name: 1, email: 1 }); // only name and email

// Exclude specific fields
await User.find({}, { password: 0 }); // everything except password
```

---

## 4. Pagination

### Offset Pagination (simple)

```typescript
async function getPage(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(),
  ]);
  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
```

**Downside:** Slow on large datasets (skip scans all skipped docs). Use cursor pagination for large collections.

### Cursor Pagination (fast, consistent)

```typescript
async function getNextPage(cursor: string | null, limit: number) {
  const filter = cursor ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } } : {};
  const data = await Product.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1);

  // If we got limit+1, there's a next page
  const hasNextPage = data.length > limit;
  if (hasNextPage) data.pop();

  return {
    data,
    nextCursor: hasNextPage ? data[data.length - 1]._id : null,
  };
}
```

---

## 5. Full-Text Search

```typescript
// 1. Create a text index (do this once)
await Post.collection.createIndex({ title: "text", content: "text" });

// 2. Search
const results = await Post.find(
  { $text: { $search: "mongodb tutorial" } },
  { score: { $meta: "textScore" } }, // include relevance score
).sort({ score: { $meta: "textScore" } }); // sort by relevance

// Phrases: wrap in quotes
await Post.find({ $text: { $search: '"exact phrase"' } });

// Exclude a word with -
await Post.find({ $text: { $search: "mongodb -replication" } });
```

---

## 6. Aggregation Patterns

### Count with filter

```typescript
const activeCount = await User.countDocuments({ status: "active" });
```

### Group and count

```typescript
const byCategory = await Product.aggregate([
  { $match: { status: "active" } },
  { $group: { _id: "$category", count: { $sum: 1 }, avgPrice: { $avg: "$price" } } },
  { $sort: { count: -1 } },
]);
```

### Join collections with `$lookup`

```typescript
// Get posts with their author details
const posts = await Post.aggregate([
  { $match: { status: "published" } },
  {
    $lookup: {
      from: "users", // collection to join
      localField: "authorId", // field in Post
      foreignField: "_id", // field in User
      as: "author", // output field name
    },
  },
  { $unwind: "$author" }, // convert array to object (1-to-1 join)
  { $project: { title: 1, "author.name": 1, "author.email": 1 } },
]);
```

### Date-based grouping

```typescript
// Sales per month
const monthlySales = await Order.aggregate([
  { $match: { status: "completed" } },
  {
    $group: {
      _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
      total: { $sum: "$amount" },
      count: { $sum: 1 },
    },
  },
  { $sort: { "_id.year": -1, "_id.month": -1 } },
]);
```

---

## 7. Upsert (Insert or Update)

```typescript
// Update if exists, insert if not
await Product.findOneAndUpdate(
  { sku: "WIDGET-42" }, // filter
  { $set: { price: 29.99, updatedAt: new Date() } },
  { upsert: true, new: true }, // ← upsert: true
);
```

---

## 8. Bulk Operations

```typescript
await Product.bulkWrite([
  { insertOne: { document: { name: "New Widget", price: 9.99 } } },
  { updateOne: { filter: { sku: "W-01" }, update: { $set: { price: 8.99 } } } },
  { deleteOne: { filter: { sku: "W-OLD" } } },
]);
```
