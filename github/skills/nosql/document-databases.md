---
name: nosql-document-databases
description: "Document database patterns — MongoDB CRUD, schema design with Mongoose, embedded vs referenced documents, aggregation pipelines, and common gotchas. Use when working with MongoDB, Firestore, or any document store."
---

# Document Databases

## Overview

Document databases store data as JSON-like documents (objects with fields). Each document can have a different structure — no fixed schema required. MongoDB is the most popular example.

**Key concept:** Instead of rows in a table, you have documents in a collection.

```
SQL:     Database → Table      → Row
MongoDB: Database → Collection → Document
```

---

## 1. Basic CRUD with MongoDB (Node.js / Mongoose)

### Setup

```typescript
import mongoose, { Schema, model, Document } from "mongoose";

await mongoose.connect(process.env.MONGODB_URI!);
```

### Define a Schema

```typescript
interface IUser extends Document {
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    age: { type: Number, min: 0 },
  },
  { timestamps: true },
); // adds createdAt, updatedAt automatically

const User = model<IUser>("User", userSchema);
```

### Create

```typescript
// Create one
const user = await User.create({
  name: "Alice",
  email: "alice@example.com",
  age: 30,
});

// Create many
const users = await User.insertMany([
  { name: "Bob", email: "bob@example.com", age: 25 },
  { name: "Carol", email: "carol@example.com", age: 28 },
]);
```

### Read

```typescript
// Find all
const all = await User.find();

// Find with filter
const adults = await User.find({ age: { $gte: 18 } });

// Find one by ID
const user = await User.findById(id);

// Find one by field
const user = await User.findOne({ email: "alice@example.com" });

// Select specific fields (projection)
const names = await User.find({}, "name email");

// Sort, limit, skip (pagination)
const page = await User.find().sort({ createdAt: -1 }).skip(20).limit(10);
```

### Update

```typescript
// Update one
await User.findByIdAndUpdate(id, { age: 31 }, { new: true });

// Update many
await User.updateMany({ age: { $lt: 18 } }, { $set: { status: "minor" } });

// Common update operators
{
  $set: {
    field: value;
  }
} // set a field
{
  $unset: {
    field: "";
  }
} // remove a field
{
  $inc: {
    age: 1;
  }
} // increment a number
{
  $push: {
    tags: "nodeJS";
  }
} // append to array
{
  $pull: {
    tags: "oldTag";
  }
} // remove from array
{
  $addToSet: {
    tags: "vue";
  }
} // add to array only if not present
```

### Delete

```typescript
await User.findByIdAndDelete(id); // delete one
await User.deleteMany({ age: { $lt: 18 } }); // delete many
```

---

## 2. Embedded Documents vs References

### Embed (nest inside the document)

Use when data is always loaded with the parent and doesn't grow unboundedly.

```typescript
const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      product: String,
      quantity: Number,
      price: Number,
    },
  ], // ← embedded array of sub-documents
  total: Number,
});
```

**Good for:** addresses, order line items, comments on a blog post.

### Reference (store ID, look up separately)

Use when data is shared across many documents or grows large.

```typescript
const postSchema = new Schema({
  title: String,
  author: { type: Schema.Types.ObjectId, ref: "User" }, // ← reference
});

// Populate the reference at query time
const post = await Post.findById(id).populate("author", "name email");
```

**Good for:** users, products, categories — anything shared between documents.

---

## 3. Aggregation Pipeline

Aggregation lets you transform and group data in stages, like a data pipeline.

```typescript
// Example: total revenue per product category
const result = await Order.aggregate([
  { $match: { status: "completed" } }, // 1. filter
  { $unwind: "$items" }, // 2. flatten array
  {
    $group: {
      // 3. group & sum
      _id: "$items.category",
      totalRevenue: { $sum: "$items.price" },
      count: { $sum: 1 },
    },
  },
  { $sort: { totalRevenue: -1 } }, // 4. sort
  { $limit: 5 }, // 5. top 5
]);
```

**Common aggregation stages:**

| Stage        | Purpose                             |
| ------------ | ----------------------------------- |
| `$match`     | Filter documents (like WHERE)       |
| `$group`     | Group and aggregate (like GROUP BY) |
| `$project`   | Shape the output fields             |
| `$sort`      | Sort results                        |
| `$limit`     | Limit number of results             |
| `$skip`      | Skip results (for pagination)       |
| `$unwind`    | Flatten an array into separate docs |
| `$lookup`    | Join with another collection        |
| `$addFields` | Add computed fields                 |

---

## 4. Common Patterns

### Pagination (cursor-based is faster than offset for large datasets)

```typescript
// Offset pagination (simple but slow on large data)
async function getPage(page: number, limit: number) {
  return User.find()
    .sort({ _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

// Cursor pagination (fast, consistent)
async function getNextPage(lastId: string, limit: number) {
  return User.find({ _id: { $lt: lastId } })
    .sort({ _id: -1 })
    .limit(limit);
}
```

### Transactions (multi-document atomicity)

```typescript
const session = await mongoose.startSession();
session.startTransaction();
try {
  await Order.create([orderData], { session });
  await Inventory.updateOne(
    { _id: productId },
    { $inc: { stock: -1 } },
    { session },
  );
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```

---

## 5. Common Gotchas

- **Avoid unbounded arrays** — never push items into an array without a limit (e.g., activity logs). Use a separate collection instead.
- **`_id` is always indexed** — don't add a redundant index on `_id`.
- **`findByIdAndUpdate` returns the OLD doc by default** — pass `{ new: true }` to get the updated version.
- **Schema validation is optional** — Mongoose validates, but the database itself won't reject invalid data unless you set strict schema validation at the DB level.
- **ObjectId ≠ string** — always use `mongoose.Types.ObjectId` for comparisons, or let Mongoose cast automatically.
