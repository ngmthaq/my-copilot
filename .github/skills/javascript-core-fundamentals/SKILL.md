---
name: javascript-core-fundamentals
description: "JavaScript core fundamentals — data types, type coercion, equality, scope, hoisting, closures, prototypes, and 'this' keyword. Use when: explaining JS type system; debugging coercion bugs; understanding scope chains; working with closures; prototypal inheritance. DO NOT USE FOR: async patterns (use javascript-async-programming); ES6+ features (use javascript-es6-plus); DOM (use javascript-dom-manipulation)."
---

# JavaScript Core Fundamentals

## 1. Data Types

### Primitives (immutable, stored by value)

```javascript
// 7 primitive types
typeof "hello"; // "string"
typeof 42; // "number"
typeof 42n; // "bigint"
typeof true; // "boolean"
typeof undefined; // "undefined"
typeof Symbol(); // "symbol"
typeof null; // "object" ← historical bug, it's actually null

// Reference types (stored by reference)
typeof {}; // "object"
typeof []; // "object"
typeof function () {}; // "function"
```

### Checking Types Reliably

```javascript
Array.isArray([1, 2]); // true
value === null; // check for null
value instanceof Date; // check constructor chain
Object.prototype.toString.call(value); // "[object Array]", "[object Null]", etc.
```

---

## 2. Type Coercion

### Implicit Coercion (avoid in production)

```javascript
"5" + 3; // "53"  — number coerced to string
"5" - 3; // 2     — string coerced to number
true + 1; // 2     — boolean coerced to number
"" == false; // true  — both coerced to 0
null == undefined; // true — special rule
```

### Explicit Coercion (prefer this)

```javascript
Number("42"); // 42
String(42); // "42"
Boolean(""); // false
parseInt("42px"); // 42
parseFloat("3.14") + // 3.14
  "42"; // 42 (unary plus)
```

### Falsy Values (memorize these 8)

```javascript
// false, 0, -0, 0n, "", null, undefined, NaN
// Everything else is truthy, including [] and {}
```

---

## 3. Equality

```javascript
// === (strict) — no coercion, always prefer
42 === "42"     // false
null === undefined // false

// == (loose) — coerces types, avoid
42 == "42"      // true
null == undefined // true

// Object comparison — by reference, not value
{ a: 1 } === { a: 1 } // false — different references
const obj = { a: 1 };
obj === obj            // true — same reference
```

---

## 4. Scope

```javascript
// Global scope
var globalVar = "global";

// Function scope — var is function-scoped
function example() {
  var x = 10;
  if (true) {
    var x = 20; // Same variable! Overwrites
  }
  console.log(x); // 20
}

// Block scope — let/const are block-scoped
function example2() {
  let x = 10;
  if (true) {
    let x = 20; // Different variable
  }
  console.log(x); // 10
}

// Scope chain — inner scopes access outer variables
function outer() {
  const x = 10;
  function inner() {
    console.log(x); // 10 — looks up scope chain
  }
  inner();
}
```

---

## 5. Hoisting

```javascript
// var declarations are hoisted (not assignments)
console.log(a); // undefined (not ReferenceError)
var a = 5;

// let/const are hoisted but NOT initialized (TDZ)
console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 5;

// Function declarations are fully hoisted
greet(); // "hello" — works before declaration
function greet() {
  return "hello";
}

// Function expressions are NOT hoisted
greet2(); // TypeError: greet2 is not a function
var greet2 = function () {
  return "hello";
};
```

---

## 6. Closures

```javascript
// A closure is a function + its lexical environment
function createCounter() {
  let count = 0; // Enclosed variable
  return {
    increment: () => ++count,
    getCount: () => count,
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.getCount(); // 2 — count is preserved

// Practical: private state
function createUser(name) {
  let _password = null;
  return {
    getName: () => name,
    setPassword: (pw) => {
      _password = pw;
    },
    checkPassword: (pw) => pw === _password,
  };
}

// Common pitfall: closures in loops
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 3, 3, 3 — var is shared
}
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 0, 1, 2 — let creates new binding
}
```

---

## 7. `this` Keyword

```javascript
// Rule 1: Default binding — global (or undefined in strict mode)
function show() {
  console.log(this);
}
show(); // window (browser) or global (Node), undefined in strict mode

// Rule 2: Implicit binding — object calling the method
const obj = {
  name: "Alice",
  greet() {
    return this.name;
  },
};
obj.greet(); // "Alice"

// Rule 3: Explicit binding — call, apply, bind
function greet(greeting) {
  return `${greeting}, ${this.name}`;
}
greet.call({ name: "Bob" }, "Hi"); // "Hi, Bob"
greet.apply({ name: "Bob" }, ["Hi"]); // "Hi, Bob"
const bound = greet.bind({ name: "Bob" });
bound("Hi"); // "Hi, Bob"

// Rule 4: new binding — this = new empty object
function Person(name) {
  this.name = name;
}
const p = new Person("Carol"); // this = { name: "Carol" }

// Rule 5: Arrow functions — inherit this from enclosing scope
const obj2 = {
  name: "Dave",
  greet: () => this.name, // ← this is NOT obj2, it's the outer scope
  greetCorrect() {
    const inner = () => this.name; // ← this IS obj2 (inherited)
    return inner();
  },
};
```

### `this` Priority: new > explicit (call/apply/bind) > implicit (obj.method) > default

---

## 8. Prototypes & Inheritance

```javascript
// Every object has a [[Prototype]] (accessed via __proto__ or Object.getPrototypeOf)
const animal = {
  speak() {
    return `${this.name} makes a sound`;
  },
};

const dog = Object.create(animal);
dog.name = "Rex";
dog.speak(); // "Rex makes a sound" — found via prototype chain

// Constructor function pattern
function Vehicle(type) {
  this.type = type;
}
Vehicle.prototype.describe = function () {
  return `A ${this.type}`;
};

const car = new Vehicle("car");
car.describe(); // "A car"
car.__proto__ === Vehicle.prototype; // true
car instanceof Vehicle; // true

// Prototype chain
// car → Vehicle.prototype → Object.prototype → null
```

---

## 9. Value vs Reference

```javascript
// Primitives — copied by value
let a = 10;
let b = a;
b = 20;
console.log(a); // 10 — unchanged

// Objects — copied by reference
let obj1 = { x: 1 };
let obj2 = obj1;
obj2.x = 2;
console.log(obj1.x); // 2 — same object!

// Shallow copy
const copy = { ...obj1 }; // spread
const copy2 = Object.assign({}, obj1);

// Deep copy
const deep = structuredClone(obj1); // modern, handles circular refs
const deep2 = JSON.parse(JSON.stringify(obj1)); // legacy, no functions/dates
```

---

## 10. Best Practices

- **Use `===` always** — avoid `==` and implicit coercion
- **Use `let`/`const`** — never `var` (block scope prevents hoisting bugs)
- **Prefer `const`** — only use `let` when reassignment is needed
- **Use arrow functions** for callbacks — predictable `this` from lexical scope
- **Use explicit coercion** — `Number(x)`, `String(x)`, `Boolean(x)`
- **Avoid modifying prototypes** of built-in objects (`Array.prototype`, etc.)
- **Use `structuredClone`** for deep copies instead of `JSON.parse(JSON.stringify())`
- **Check types explicitly** — `Array.isArray()`, `=== null`, `typeof`
