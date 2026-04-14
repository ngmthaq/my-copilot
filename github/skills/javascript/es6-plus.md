---
name: javascript-es6-plus
description: "JavaScript ES6+ features — destructuring, spread/rest, template literals, optional chaining, nullish coalescing, iterators, generators, Proxy, Reflect, and modern syntax. Use when: writing modern JS; refactoring legacy code to ES6+; using destructuring or spread patterns. DO NOT USE FOR: async/await (use javascript-async-programming); modules (use javascript-module-system); classes (use javascript-object-oriented)."
---

# JavaScript ES6+ Features

## 1. Destructuring

```javascript
// Object destructuring
const { name, age, role = "user" } = user;

// Rename + default
const { name: userName, email: userEmail = "N/A" } = user;

// Nested
const {
  address: { city, zip },
} = user;

// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];
// first=1, second=2, rest=[3,4,5]

// Skip elements
const [, , third] = [1, 2, 3]; // third=3

// Swap variables
let a = 1,
  b = 2;
[a, b] = [b, a];

// Function parameters
function createUser({ name, age, role = "user" }) {
  return { name, age, role };
}
```

---

## 2. Spread & Rest

```javascript
// Spread — expand iterables
const merged = [...arr1, ...arr2];
const clone = { ...original, updatedField: "new" };
Math.max(...numbers);

// Rest — collect remaining
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}

// Object rest
const { password, ...safeUser } = user; // Remove password
```

---

## 3. Template Literals

```javascript
const greeting = `Hello, ${name}!`;

// Multiline
const html = `
  <div class="${className}">
    <p>${content}</p>
  </div>
`;

// Tagged templates
function sql(strings, ...values) {
  return { text: strings.join("$1"), params: values };
}
const query = sql`SELECT * FROM users WHERE id = ${userId}`;
```

---

## 4. Optional Chaining & Nullish Coalescing

```javascript
// Optional chaining (?.) — short-circuits to undefined
const city = user?.address?.city;
const first = users?.[0]?.name;
const result = obj?.method?.();

// Nullish coalescing (??) — only null/undefined trigger fallback
const port = config.port ?? 3000;
// Unlike ||, doesn't trigger on 0 or ""

// Combined
const theme = user?.settings?.theme ?? "light";

// Nullish assignment (??=)
config.timeout ??= 5000; // Only assigns if null/undefined

// Logical assignment
opts.verbose ||= false;
opts.cache &&= validate(opts.cache);
```

---

## 5. Enhanced Object Literals

```javascript
const name = "Alice";
const age = 30;

const user = {
  name, // Shorthand property
  age,
  greet() {
    // Shorthand method
    return `Hi, ${this.name}`;
  },
  [dynamicKey]: value, // Computed property name
};
```

---

## 6. Symbol

```javascript
const id = Symbol("id");
const id2 = Symbol("id");
id === id2; // false — always unique

// Non-enumerable object keys
const obj = { [id]: 123, name: "Alice" };
Object.keys(obj); // ["name"]
Object.getOwnPropertySymbols(obj); // [Symbol(id)]

// Well-known symbols — customize behavior
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next: () =>
        current <= end ? { value: current++, done: false } : { done: true },
    };
  }
}
[...new Range(1, 5)]; // [1, 2, 3, 4, 5]

// Global registry
Symbol.for("shared") === Symbol.for("shared"); // true
```

---

## 7. Iterators & Generators

```javascript
// Generator function — lazy evaluation
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
fib.next().value; // 0
fib.next().value; // 1

// Take first N
function* take(gen, n) {
  let count = 0;
  for (const val of gen) {
    if (count++ >= n) return;
    yield val;
  }
}
[...take(fibonacci(), 7)]; // [0, 1, 1, 2, 3, 5, 8]

// yield* — delegate to another generator/iterable
function* concat(...iterables) {
  for (const it of iterables) yield* it;
}
```

---

## 8. Map, Set, WeakMap, WeakSet

```javascript
// Map — any key type, ordered
const map = new Map();
map.set(objKey, "value");
map.get(objKey); // "value"
map.has("key"); // true/false
for (const [key, val] of map) {
  /* ... */
}

// Set — unique values
const set = new Set([1, 2, 2, 3]); // {1, 2, 3}
[...new Set(arr)]; // deduplicate

// WeakMap — keys must be objects, garbage-collectible
const cache = new WeakMap();
// Perfect for caching without memory leaks
```

---

## 9. Proxy & Reflect

```javascript
// Proxy — intercept object operations
const validated = new Proxy(
  {},
  {
    set(target, prop, value) {
      if (prop === "age" && typeof value !== "number") {
        throw new TypeError("Age must be a number");
      }
      target[prop] = value;
      return true;
    },
  },
);

// Reactive/observable pattern
function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, prop, value) {
      const old = target[prop];
      target[prop] = value;
      onChange(prop, value, old);
      return true;
    },
  });
}

// Reflect — default behavior for proxy traps
const logged = new Proxy(obj, {
  get(target, prop, receiver) {
    console.log(`Accessed: ${String(prop)}`);
    return Reflect.get(target, prop, receiver);
  },
});
```

---

## 10. Modern Syntax (ES2022+)

```javascript
// Array
arr.at(-1); // Last element
arr.findLast(fn); // Last match
arr.toSorted(); // Non-mutating sort
arr.toReversed(); // Non-mutating reverse
arr.with(2, "replaced"); // Non-mutating index set
Object.groupBy(arr, fn); // Group into object

// Object
Object.entries(obj); // [[key, val], ...]
Object.fromEntries(entries); // Reverse of entries
Object.hasOwn(obj, "key"); // Better hasOwnProperty
structuredClone(obj); // Deep clone

// String
str.replaceAll("a", "b");

// Error cause
throw new Error("Failed", { cause: originalError });
```
