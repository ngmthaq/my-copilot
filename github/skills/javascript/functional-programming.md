---
name: javascript-functional-programming
description: "JavaScript functional programming — pure functions, immutability, higher-order functions, composition, currying, array methods, functors, and monads. Use when: writing declarative code; composing functions; working with array transformations; implementing functional patterns. DO NOT USE FOR: OOP patterns (use javascript-object-oriented); general fundamentals (use javascript-core-fundamentals)."
---

# JavaScript Functional Programming

## 1. Pure Functions

```javascript
// Pure — same input always produces same output, no side effects
function add(a, b) {
  return a + b;
}

// Impure — depends on external state
let tax = 0.1;
function addTax(price) {
  return price + price * tax; // Depends on external `tax`
}

// Impure — causes side effects
function saveUser(user) {
  db.save(user); // Side effect (I/O)
  console.log("Saved"); // Side effect (logging)
}

// Strategy: push side effects to the edges, keep core logic pure
```

---

## 2. Immutability

```javascript
// Never mutate — create new copies
const original = { name: "Alice", scores: [90, 85] };

// Object spread
const updated = { ...original, name: "Bob" };

// Nested update (spread at each level)
const withNewScore = {
  ...original,
  scores: [...original.scores, 95],
};

// Array operations (non-mutating)
const arr = [1, 2, 3];
const added = [...arr, 4]; // [1, 2, 3, 4]
const removed = arr.filter((x) => x !== 2); // [1, 3]
const replaced = arr.map((x) => (x === 2 ? 20 : x)); // [1, 20, 3]

// Modern non-mutating methods
arr.toSorted((a, b) => b - a); // New sorted array
arr.toReversed(); // New reversed array
arr.with(1, 99); // [1, 99, 3]

// Object.freeze (shallow)
const frozen = Object.freeze({ a: 1, b: { c: 2 } });
frozen.a = 10; // Silently fails (or throws in strict mode)
frozen.b.c = 20; // ⚠️ Works! Freeze is shallow

// Deep freeze
function deepFreeze(obj) {
  Object.freeze(obj);
  Object.values(obj).forEach((v) => {
    if (typeof v === "object" && v !== null) deepFreeze(v);
  });
  return obj;
}
```

---

## 3. Higher-Order Functions

```javascript
// Functions that take or return functions
function withLogging(fn) {
  return function (...args) {
    console.log(`Calling ${fn.name} with`, args);
    const result = fn(...args);
    console.log(`Result:`, result);
    return result;
  };
}

const loggedAdd = withLogging(add);
loggedAdd(2, 3); // Logs: Calling add with [2, 3] → Result: 5

// Common built-in HOFs
array.map(fn); // Transform each element
array.filter(fn); // Keep elements matching predicate
array.reduce(fn, init); // Accumulate into single value
array.some(fn); // Any match?
array.every(fn); // All match?
array.find(fn); // First match
array.flatMap(fn); // Map + flatten
```

---

## 4. Array Method Chains

```javascript
const orders = [
  { id: 1, status: "shipped", total: 50 },
  { id: 2, status: "pending", total: 120 },
  { id: 3, status: "shipped", total: 80 },
  { id: 4, status: "cancelled", total: 30 },
];

// Chain: filter → map → reduce
const shippedRevenue = orders
  .filter((o) => o.status === "shipped")
  .map((o) => o.total)
  .reduce((sum, total) => sum + total, 0); // 130

// Group with reduce
const byStatus = orders.reduce((groups, order) => {
  const key = order.status;
  groups[key] = [...(groups[key] || []), order];
  return groups;
}, {});

// Modern: Object.groupBy
const grouped = Object.groupBy(orders, (o) => o.status);
```

---

## 5. Composition

```javascript
// Compose — right to left: compose(f, g)(x) = f(g(x))
const compose =
  (...fns) =>
  (x) =>
    fns.reduceRight((v, fn) => fn(v), x);

// Pipe — left to right (more readable)
const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, fn) => fn(v), x);

const processUser = pipe(
  normalize, // 1st
  validate, // 2nd
  formatForDisplay, // 3rd
);

const result = processUser(rawInput);

// Practical example
const getActiveUserEmails = pipe(
  (users) => users.filter((u) => u.active),
  (users) => users.map((u) => u.email),
  (emails) => emails.sort(),
);

getActiveUserEmails(users); // ["alice@...", "bob@..."]
```

---

## 6. Currying & Partial Application

```javascript
// Currying — transform f(a, b, c) into f(a)(b)(c)
const curry = (fn) => {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
};

const add = curry((a, b) => a + b);
const add5 = add(5); // Partially applied
add5(3); // 8
add(5)(3); // 8
add(5, 3); // 8

// Practical: reusable predicates
const hasStatus = curry((status, order) => order.status === status);
orders.filter(hasStatus("shipped"));
orders.filter(hasStatus("pending"));

// Partial application (without full currying)
const partial =
  (fn, ...presetArgs) =>
  (...laterArgs) =>
    fn(...presetArgs, ...laterArgs);

const log = partial(console.log, "[APP]");
log("started"); // "[APP] started"
```

---

## 7. Common Functional Patterns

```javascript
// Memoization — cache results of pure functions
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const expensiveCalc = memoize((n) => {
  console.log("Computing...");
  return n * n;
});
expensiveCalc(5); // Computing... 25
expensiveCalc(5); // 25 (cached)

// Transducer-like pattern — efficient chain (single pass)
function transduce(arr, ...transforms) {
  return arr.reduce((acc, item) => {
    let val = item;
    for (const t of transforms) {
      val = t(val);
      if (val === undefined) return acc;
    }
    acc.push(val);
    return acc;
  }, []);
}

// Either/Maybe pattern (basic)
const Maybe = (value) => ({
  map: (fn) => (value == null ? Maybe(null) : Maybe(fn(value))),
  flatMap: (fn) => (value == null ? Maybe(null) : fn(value)),
  getOrElse: (fallback) => value ?? fallback,
  value,
});

Maybe(user)
  .map((u) => u.address)
  .map((a) => a.city)
  .getOrElse("Unknown"); // Safe nested access
```

---

## 8. Recursion

```javascript
// Recursive with base case
function flatten(arr) {
  return arr.reduce(
    (flat, item) =>
      Array.isArray(item) ? [...flat, ...flatten(item)] : [...flat, item],
    [],
  );
}
flatten([1, [2, [3, [4]]]]); // [1, 2, 3, 4]

// Tail-call optimizable (limited browser support)
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return factorial(n - 1, n * acc);
}

// Trampoline — safe recursion without stack overflow
function trampoline(fn) {
  return function (...args) {
    let result = fn(...args);
    while (typeof result === "function") result = result();
    return result;
  };
}

const safeFactorial = trampoline(function f(n, acc = 1) {
  if (n <= 1) return acc;
  return () => f(n - 1, n * acc); // Return thunk instead of recursing
});
safeFactorial(100000); // No stack overflow
```

---

## 9. Best Practices

- **Prefer pure functions** — they're testable, cacheable, and predictable
- **Don't mutate arguments** — always return new objects/arrays
- **Use `map/filter/reduce`** over imperative loops for data transformation
- **Compose small functions** into larger ones with `pipe`
- **Use currying** to create reusable, partially applied utilities
- **Memoize expensive pure functions** — big performance wins for free
- **Push side effects to edges** — keep business logic pure, handle I/O at boundaries
- **Use `flatMap`** to map + flatten in one step
- **Avoid deep recursion** — use trampolines or iterative alternatives
- **Don't over-abstract** — simple `map/filter` chains are often clearer than heavy FP machinery
