---
name: javascript-event-loop
description: "JavaScript event loop — call stack, task queue, microtask queue, execution order, setTimeout/setInterval, requestAnimationFrame, and Node.js event loop phases. Use when: debugging async execution order; understanding why code runs in a certain sequence; performance tuning. DO NOT USE FOR: writing async code (use javascript-async-programming); general JS fundamentals (use javascript-core-fundamentals)."
---

# JavaScript Event Loop

## 1. Core Concepts

```
┌──────────────────────────┐
│       Call Stack          │  ← Executes synchronous code, one frame at a time
└──────────┬───────────────┘
           │ (empty?)
           ▼
┌──────────────────────────┐
│    Microtask Queue        │  ← Promise.then, queueMicrotask, MutationObserver
│    (runs ALL before next  │     Fully drained before ANY macrotask
│     macrotask)            │
└──────────┬───────────────┘
           │ (empty?)
           ▼
┌──────────────────────────┐
│    Macrotask Queue        │  ← setTimeout, setInterval, I/O, UI rendering
│    (runs ONE, then check  │
│     microtasks again)     │
└──────────────────────────┘
```

**Single-threaded**: JavaScript has one call stack. The event loop enables async behavior by queuing callbacks.

---

## 2. Execution Order

```javascript
console.log("1: sync"); // 1st — synchronous

setTimeout(() => console.log("2: timeout"), 0); // 5th — macrotask

Promise.resolve().then(() => console.log("3: microtask")); // 3rd — microtask

queueMicrotask(() => console.log("4: microtask 2")); // 4th — microtask

console.log("5: sync"); // 2nd — synchronous

// Output: 1: sync → 5: sync → 3: microtask → 4: microtask 2 → 2: timeout
```

### The Rule

1. Run all **synchronous** code (call stack empties)
2. Drain **ALL microtasks** (Promises, queueMicrotask)
3. Run **ONE macrotask** (setTimeout, setInterval, I/O)
4. Repeat from step 2

---

## 3. Microtasks vs Macrotasks

| Microtasks (higher priority) | Macrotasks (lower priority)       |
| ---------------------------- | --------------------------------- |
| `Promise.then/catch/finally` | `setTimeout` / `setInterval`      |
| `queueMicrotask()`           | `setImmediate()` (Node.js)        |
| `MutationObserver`           | I/O callbacks                     |
| `async/await` (continuation) | UI rendering (browser)            |
|                              | `requestAnimationFrame` (browser) |

```javascript
// Microtasks can starve macrotasks
function recurse() {
  queueMicrotask(recurse); // ⚠️ Infinite microtasks — UI freezes
}
// setTimeout would NOT freeze because it yields between iterations
```

---

## 4. setTimeout & setInterval

```javascript
// setTimeout — minimum delay, not guaranteed exact
setTimeout(() => console.log("delayed"), 100);
// Actual delay ≥ 100ms (depends on event loop load)

// setTimeout(fn, 0) — defers to next macrotask, NOT immediate
setTimeout(() => console.log("deferred"), 0);
console.log("first"); // "first" then "deferred"

// Nested setTimeout vs setInterval
// setInterval — may drift or stack if callback takes too long
const id = setInterval(() => doWork(), 1000);
clearInterval(id);

// Recursive setTimeout — guarantees gap between executions
function poll() {
  doWork();
  setTimeout(poll, 1000); // Waits 1s AFTER doWork completes
}

// Minimum clamp: browsers clamp nested setTimeout to 4ms after 5 levels
```

---

## 5. Async/Await Under the Hood

```javascript
async function example() {
  console.log("A"); // Sync — runs immediately
  await Promise.resolve(); // Pauses here, schedules microtask
  console.log("B"); // Microtask — runs after current sync code
}

console.log("C");
example();
console.log("D");

// Output: C → A → D → B
// "A" runs synchronously inside example()
// await pauses example(), "D" runs
// Then microtask resumes with "B"
```

```javascript
// Each await creates a microtask checkpoint
async function multi() {
  console.log(1);
  await null; // microtask 1
  console.log(2);
  await null; // microtask 2
  console.log(3);
}

multi();
console.log(4);
// Output: 1 → 4 → 2 → 3
```

---

## 6. requestAnimationFrame (Browser)

```javascript
// Runs before next repaint (~60fps = every 16.67ms)
// Better than setTimeout for animations
function animate() {
  element.style.left = `${position++}px`;
  if (position < 300) {
    requestAnimationFrame(animate);
  }
}
requestAnimationFrame(animate);

// Order: microtasks → rAF → paint → macrotasks
// rAF callbacks run BEFORE the browser paints
```

---

## 7. Node.js Event Loop Phases

```
   ┌───────────────────────────┐
┌─▶│         timers            │  setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │    pending callbacks      │  I/O callbacks deferred to next loop
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │       idle, prepare       │  Internal use
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │          poll             │  Retrieve I/O events, execute callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │          check            │  setImmediate callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │     close callbacks       │  socket.on('close', ...)
│  └─────────────┬─────────────┘
└─────────────────┘
```

```javascript
// setImmediate vs setTimeout(fn, 0) in Node.js
// Inside I/O callback: setImmediate always fires first
const fs = require("fs");
fs.readFile(__filename, () => {
  setImmediate(() => console.log("immediate")); // 1st
  setTimeout(() => console.log("timeout"), 0); // 2nd
});

// process.nextTick — runs BEFORE any microtask (Node.js only)
process.nextTick(() => console.log("nextTick")); // Before Promise.then
Promise.resolve().then(() => console.log("promise"));
// Output: nextTick → promise
```

---

## 8. Common Gotchas

```javascript
// ❌ Long-running sync code blocks everything
for (let i = 0; i < 1e9; i++) {} // Freezes UI, delays all callbacks

// ✅ Break up work
function processChunk(items, index = 0) {
  const end = Math.min(index + 1000, items.length);
  for (let i = index; i < end; i++) process(items[i]);
  if (end < items.length) {
    setTimeout(() => processChunk(items, end), 0); // Yield to event loop
  }
}

// ❌ Assuming setTimeout order with same delay
setTimeout(() => console.log("a"), 100);
setTimeout(() => console.log("b"), 100);
// Usually a→b, but NOT guaranteed by spec

// ❌ Expecting microtask after each await in a chain
// Microtasks from different async functions interleave
```

---

## 9. Best Practices

- **Never block the main thread** — offload heavy work to Web Workers or break into chunks
- **Use `queueMicrotask`** for tasks that must run before next render but after current sync
- **Use `requestAnimationFrame`** for visual updates, not `setTimeout`
- **Prefer recursive `setTimeout`** over `setInterval` for reliable spacing
- **Understand microtask priority** — Promises always resolve before setTimeout
- **Avoid infinite microtask loops** — they freeze the browser
- **Use `process.nextTick` sparingly** in Node.js — it can starve I/O
- **Profile with DevTools** — Performance tab shows event loop blocking
