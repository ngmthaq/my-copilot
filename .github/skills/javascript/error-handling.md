---
name: javascript-error-handling
description: "JavaScript error handling — try/catch/finally, custom errors, error types, stack traces, async error handling, and global handlers. Use when: implementing error handling; creating custom error classes; debugging errors; setting up global error catchers. DO NOT USE FOR: Express error middleware (use expressjs-error-handling); async patterns (use javascript-async-programming)."
---

# JavaScript Error Handling

## 1. Try/Catch/Finally

```javascript
try {
  const data = JSON.parse(input);
  process(data);
} catch (err) {
  console.error("Parse failed:", err.message);
} finally {
  cleanup(); // Always runs — even after return or throw
}

// Catch binding is optional (ES2019)
try {
  riskyOp();
} catch {
  /* ignore */
}

// Rethrow when you can't handle it
try {
  connectToDb();
} catch (err) {
  if (err.code === "ECONNREFUSED") {
    fallbackToCache();
  } else {
    throw err; // Let caller handle unknown errors
  }
}
```

---

## 2. Error Types

```javascript
// Built-in error types
new Error("Generic error");
new TypeError("Expected a string"); // Wrong type
new RangeError("Index out of bounds"); // Value out of range
new ReferenceError("x is not defined"); // Undefined variable
new SyntaxError("Unexpected token"); // Parse error
new URIError("Invalid URI"); // Bad URI

// Error properties
const err = new Error("Something broke");
err.message; // "Something broke"
err.name; // "Error"
err.stack; // Stack trace string
err.cause; // Linked error (ES2022)
```

---

## 3. Custom Error Classes

```javascript
class AppError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(field, message) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
    this.field = field;
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

// Usage
throw new ValidationError("email", "Invalid email format");
throw new NotFoundError("User", userId);

// Catch specific types
try {
  await findUser(id);
} catch (err) {
  if (err instanceof NotFoundError) return res.status(404).json({ error: err.message });
  if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
  throw err;
}
```

---

## 4. Error Cause (ES2022)

```javascript
// Chain errors with cause for debugging
async function getUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    return await res.json();
  } catch (err) {
    throw new Error(`Failed to get user ${id}`, { cause: err });
  }
}

// Inspect cause chain
function getRootCause(err) {
  let current = err;
  while (current.cause) current = current.cause;
  return current;
}
```

---

## 5. Async Error Handling

```javascript
// async/await — use try/catch
async function fetchData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
}

// Promise chains — use .catch()
fetch(url)
  .then((res) => res.json())
  .then((data) => process(data))
  .catch((err) => console.error(err));

// Go-style error tuple
async function to(promise) {
  try {
    return [await promise, null];
  } catch (err) {
    return [null, err];
  }
}
const [data, err] = await to(fetchData("/api/users"));
if (err) return handleError(err);
```

---

## 6. Global Error Handlers

```javascript
// Browser — uncaught errors
window.addEventListener("error", (e) => {
  console.error("Uncaught:", e.error);
  reportToService(e.error);
});

// Browser — unhandled promise rejections
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled rejection:", e.reason);
  e.preventDefault(); // Prevent default console error
});

// Node.js
process.on("uncaughtException", (err) => {
  console.error("Uncaught:", err);
  process.exit(1); // Exit and let process manager restart
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});
```

---

## 7. Validation & Guard Patterns

```javascript
// Assert function
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
assert(user != null, "User is required");
assert(age > 0, "Age must be positive");

// Guard clauses — fail fast
function divide(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new TypeError("Arguments must be numbers");
  }
  if (b === 0) throw new RangeError("Division by zero");
  return a / b;
}

// Type narrowing with errors
function getUser(id) {
  const user = db.find(id);
  if (!user) throw new NotFoundError("User", id);
  return user; // TypeScript: user is guaranteed non-null here
}
```

---

## 8. Error Logging & Reporting

```javascript
// Structured error logging
function logError(err, context = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    name: err.name,
    message: err.message,
    code: err.code,
    stack: err.stack,
    cause: err.cause?.message,
    ...context,
  };
  console.error(JSON.stringify(entry));
  // Send to monitoring service
  reportToSentry?.(err, context);
}

try {
  await processOrder(orderId);
} catch (err) {
  logError(err, { orderId, userId: req.user.id });
  throw err;
}
```

---

## 9. Best Practices

- **Use custom error classes** — distinguish error types with `instanceof`
- **Chain errors with `cause`** — preserve the original error for debugging
- **Fail fast with guard clauses** — validate inputs at function boundaries
- **Never swallow errors silently** — always log or re-throw
- **Use specific error types** — `TypeError`, `RangeError`, not just `Error`
- **Handle async errors** — unhandled rejections crash Node.js
- **Keep error messages actionable** — include what, why, and what to do
- **Don't expose internals** — sanitize error messages in responses to clients
- **Set up global handlers** — catch what falls through for logging
- **Use `Error.captureStackTrace`** — clean stack traces for custom errors
