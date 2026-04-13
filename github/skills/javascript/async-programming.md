---
name: javascript-async-programming
description: "JavaScript async programming — callbacks, Promises, async/await, error handling, concurrency patterns, and AbortController. Use when: writing async code; handling API calls; managing concurrent operations; debugging async bugs. DO NOT USE FOR: event loop internals (use javascript-event-loop); sync fundamentals (use javascript-core-fundamentals)."
---

# JavaScript Async Programming

## 1. Callbacks (Legacy)

```javascript
// Callback pattern — error-first convention (Node.js)
function readFile(path, callback) {
  fs.readFile(path, "utf8", (err, data) => {
    if (err) return callback(err);
    callback(null, data);
  });
}

// Callback hell — avoid this
getUser(id, (err, user) => {
  getPosts(user.id, (err, posts) => {
    getComments(posts[0].id, (err, comments) => {
      // deeply nested, hard to maintain
    });
  });
});
```

---

## 2. Promises

```javascript
// Creating a promise
const promise = new Promise((resolve, reject) => {
  const data = fetchData();
  data ? resolve(data) : reject(new Error("Failed"));
});

// Chaining — each .then returns a new promise
fetchUser(id)
  .then((user) => fetchPosts(user.id))
  .then((posts) => fetchComments(posts[0].id))
  .then((comments) => console.log(comments))
  .catch((err) => console.error(err)) // catches ANY error in chain
  .finally(() => hideLoader()); // always runs

// Promise states: pending → fulfilled OR rejected (settled)
// Once settled, state never changes
```

---

## 3. Async/Await

```javascript
// Syntactic sugar over Promises — same underlying mechanism
async function getUserData(id) {
  const user = await fetchUser(id);
  const posts = await fetchPosts(user.id);
  const comments = await fetchComments(posts[0].id);
  return { user, posts, comments };
}

// Error handling
async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Fetch failed:", err.message);
    throw err; // re-throw to let caller handle
  }
}

// Top-level await (ES modules only)
const config = await loadConfig();

// Async always returns a Promise
async function greet() {
  return "hello";
}
greet().then(console.log); // "hello"
```

---

## 4. Concurrency Patterns

```javascript
// Promise.all — run in parallel, fail on first rejection
const [users, posts, tags] = await Promise.all([fetchUsers(), fetchPosts(), fetchTags()]);

// Promise.allSettled — run in parallel, never rejects
const results = await Promise.allSettled([fetchUsers(), fetchPosts(), riskyOperation()]);
// results: [{ status: "fulfilled", value }, { status: "rejected", reason }]

// Promise.race — first to settle wins
const result = await Promise.race([
  fetchData(),
  timeout(5000), // rejects after 5s
]);

// Promise.any — first to FULFILL wins (ignores rejections)
const fastest = await Promise.any([fetchFromCDN1(), fetchFromCDN2(), fetchFromCDN3()]);

// Sequential execution (when order matters)
const results = [];
for (const url of urls) {
  results.push(await fetch(url));
}

// Controlled concurrency — process N at a time
async function mapWithLimit(items, limit, fn) {
  const results = [];
  const executing = new Set();

  for (const item of items) {
    const p = fn(item).then((r) => {
      executing.delete(p);
      return r;
    });
    executing.add(p);
    results.push(p);
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

await mapWithLimit(urls, 5, fetch);
```

---

## 5. AbortController

```javascript
// Cancel fetch requests
const controller = new AbortController();

fetch("/api/data", { signal: controller.signal })
  .then((res) => res.json())
  .catch((err) => {
    if (err.name === "AbortError") console.log("Cancelled");
  });

// Cancel after timeout
setTimeout(() => controller.abort(), 5000);

// AbortSignal.timeout (modern)
await fetch("/api/data", { signal: AbortSignal.timeout(5000) });

// Share signal across multiple requests
const controller = new AbortController();
await Promise.all([fetch("/api/a", { signal: controller.signal }), fetch("/api/b", { signal: controller.signal })]);
```

---

## 6. Async Iteration

```javascript
// for-await-of — consume async iterables
async function* fetchPages(baseUrl) {
  let page = 1;
  while (true) {
    const res = await fetch(`${baseUrl}?page=${page}`);
    const data = await res.json();
    if (data.items.length === 0) return;
    yield data.items;
    page++;
  }
}

for await (const items of fetchPages("/api/users")) {
  process(items);
}

// Async generator with cleanup
async function* streamLines(url) {
  const res = await fetch(url);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}
```

---

## 7. Error Handling Patterns

```javascript
// Wrapper for clean error handling (Go-style)
async function to(promise) {
  try {
    return [await promise, null];
  } catch (err) {
    return [null, err];
  }
}

const [user, err] = await to(fetchUser(id));
if (err) return handleError(err);

// Retry with exponential backoff
async function retry(fn, { retries = 3, delay = 1000 } = {}) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, delay * 2 ** i));
    }
  }
}

await retry(() => fetch("/flaky-api"), { retries: 3, delay: 500 });

// Unhandled rejection handler
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled:", event.reason);
  event.preventDefault();
});
```

---

## 8. Common Pitfalls

```javascript
// ❌ Forgetting await — returns promise, not value
const data = fetchUser(id); // Promise, not user!

// ❌ Sequential when parallel is possible
const a = await fetchA(); // Waits...
const b = await fetchB(); // Waits again...
// ✅ Use Promise.all
const [a, b] = await Promise.all([fetchA(), fetchB()]);

// ❌ await in forEach — doesn't work as expected
arr.forEach(async (item) => {
  await process(item); // These fire concurrently, forEach doesn't await
});
// ✅ Use for...of for sequential
for (const item of arr) await process(item);
// ✅ Use Promise.all for parallel
await Promise.all(arr.map((item) => process(item)));

// ❌ Swallowing errors with empty catch
try {
  await riskyOp();
} catch {} // Silent failure
// ✅ Always handle or re-throw
try {
  await riskyOp();
} catch (err) {
  logger.error(err);
  throw err;
}
```

---

## 9. Best Practices

- **Prefer async/await** over `.then()` chains for readability
- **Always handle errors** — use try/catch or `.catch()`
- **Use `Promise.all`** for independent parallel operations
- **Use `Promise.allSettled`** when you need all results regardless of failures
- **Add timeouts** to all external requests with `AbortSignal.timeout()`
- **Avoid mixing callbacks and promises** — promisify callbacks with `util.promisify`
- **Use `for...of`** (not `forEach`) for sequential async iteration
- **Limit concurrency** when processing large batches to avoid overwhelming resources
- **Never ignore unhandled rejections** — they crash Node.js by default
