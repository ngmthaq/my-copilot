---
name: nosql-key-value-stores
description: "Key-value store patterns — Redis data structures, caching, session storage, pub/sub, rate limiting, TTL, and connection setup. Use when working with Redis or any key-value store."
---

# Key-Value Stores

## Overview

Key-value stores map a unique key to a value — like a giant dictionary/hashmap. They are extremely fast because lookups are O(1). Redis is the most popular and supports rich data structures beyond simple strings.

**Use Redis for:** caching, session storage, rate limiting, pub/sub messaging, leaderboards, and distributed locks.

---

## 1. Setup (Node.js with ioredis)

```typescript
import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
});

redis.on("error", (err) => console.error("Redis error:", err));
```

---

## 2. Data Types & Commands

### String (most basic)

```typescript
await redis.set("username", "alice"); // set
const name = await redis.get("username"); // get
await redis.del("username"); // delete
await redis.set("counter", 0);
await redis.incr("counter"); // increment atomically
await redis.incrby("counter", 5); // increment by N

// Set with expiry (TTL in seconds)
await redis.set("otp:123", "456789", "EX", 300); // expires in 5 minutes
await redis.expire("key", 60); // set TTL on existing key
await redis.ttl("key"); // get remaining TTL
```

### Hash (object-like, field → value)

```typescript
// Store a user object
await redis.hset("user:42", { name: "Alice", email: "alice@example.com", age: "30" });

// Get all fields
const user = await redis.hgetall("user:42"); // { name: 'Alice', ... }

// Get one field
const email = await redis.hget("user:42", "email");

// Update one field
await redis.hset("user:42", "age", "31");

// Delete a field
await redis.hdel("user:42", "age");
```

### List (ordered, allows duplicates — like a queue)

```typescript
// Push to the end (right) or front (left)
await redis.rpush("queue:emails", "email1@x.com", "email2@x.com");
await redis.lpush("queue:emails", "urgent@x.com"); // adds to front

// Pop from front (dequeue)
const next = await redis.lpop("queue:emails");

// Read without removing
const all = await redis.lrange("queue:emails", 0, -1); // 0 to end
```

### Set (unique values, unordered)

```typescript
await redis.sadd("online-users", "alice", "bob", "carol");
await redis.srem("online-users", "bob"); // remove
const isOnline = await redis.sismember("online-users", "alice"); // 1 or 0
const members = await redis.smembers("online-users");
const count = await redis.scard("online-users"); // size
```

### Sorted Set (unique values with a score — great for leaderboards)

```typescript
// Add with score
await redis.zadd("leaderboard", 1500, "alice", 850, "bob", 2100, "carol");

// Top 3 (highest score first)
const top3 = await redis.zrevrange("leaderboard", 0, 2, "WITHSCORES");

// Get rank (0-indexed, lowest score = rank 0)
const rank = await redis.zrevrank("leaderboard", "alice");

// Increment score
await redis.zincrby("leaderboard", 100, "alice");
```

---

## 3. Common Patterns

### Caching (cache-aside pattern)

```typescript
async function getUser(id: string) {
  const cacheKey = `user:${id}`;

  // 1. Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Miss — fetch from database
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return null;

  // 3. Store in cache with TTL (1 hour)
  await redis.set(cacheKey, JSON.stringify(user), "EX", 3600);

  return user;
}

// Invalidate cache on update
async function updateUser(id: string, data: Partial<User>) {
  const user = await db.user.update({ where: { id }, data });
  await redis.del(`user:${id}`); // ← always invalidate after write
  return user;
}
```

### Session Storage

```typescript
// Store session (30-minute expiry)
async function saveSession(sessionId: string, userId: string) {
  await redis.set(`session:${sessionId}`, userId, "EX", 1800);
}

// Read session
async function getSession(sessionId: string) {
  return redis.get(`session:${sessionId}`);
}

// Destroy session (logout)
async function deleteSession(sessionId: string) {
  await redis.del(`session:${sessionId}`);
}
```

### Rate Limiting

```typescript
async function isRateLimited(ip: string, limit = 100, windowSec = 60): Promise<boolean> {
  const key = `rate:${ip}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, windowSec); // set window on first request
  }
  return current > limit;
}

// Usage in middleware
app.use(async (req, res, next) => {
  if (await isRateLimited(req.ip)) {
    return res.status(429).json({ error: "Too many requests" });
  }
  next();
});
```

### Pub/Sub (message broadcasting)

```typescript
// Publisher
const publisher = new Redis();
await publisher.publish("notifications", JSON.stringify({ userId: "42", msg: "Hello!" }));

// Subscriber (use a separate connection)
const subscriber = new Redis();
subscriber.subscribe("notifications");
subscriber.on("message", (channel, message) => {
  const data = JSON.parse(message);
  console.log(`[${channel}]`, data);
});
```

### Distributed Lock (prevent race conditions)

```typescript
async function withLock<T>(lockKey: string, ttlSec: number, fn: () => Promise<T>): Promise<T | null> {
  const lockValue = crypto.randomUUID();
  const acquired = await redis.set(lockKey, lockValue, "NX", "EX", ttlSec);
  if (!acquired) return null; // someone else holds the lock

  try {
    return await fn();
  } finally {
    // Only release if we still own the lock
    const current = await redis.get(lockKey);
    if (current === lockValue) await redis.del(lockKey);
  }
}
```

---

## 4. Key Naming Conventions

Always use a consistent naming pattern to avoid key collisions:

```
{namespace}:{identifier}:{field?}

Examples:
  user:42             → user object hash
  user:42:sessions    → set of session IDs for user 42
  session:abc123      → session data
  rate:192.168.1.1    → rate limit counter for an IP
  cache:products:all  → cached product list
  lock:checkout:42    → distributed lock for user 42's checkout
```

---

## 5. Common Gotchas

- **Don't store huge values** — Redis is an in-memory store; keep values small.
- **Always set a TTL on cache keys** — stale data without expiry causes memory bloat.
- **Pub/sub messages are not persisted** — if a subscriber is offline, it misses messages. Use a message queue (Bull, BullMQ) for guaranteed delivery.
- **Use separate connections for pub/sub** — a connection in subscribe mode can only use pub/sub commands.
- **Key collision is silent** — namespacing keys prevents one feature from overwriting another.
