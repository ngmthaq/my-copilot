---
name: typescript-error-handling
description: "TypeScript error handling — typed errors, custom error classes, Result/Either patterns, exhaustive error handling, Zod validation, and type-safe error boundaries. Use when: designing error handling strategies; creating typed error hierarchies; implementing Result types; validating input with Zod. DO NOT USE FOR: Express error middleware (use expressjs-error-handling); JS error basics (use javascript-error-handling)."
---

# TypeScript Error Handling

## 1. Typed Custom Errors

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true,
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

class ValidationError extends AppError {
  constructor(
    public readonly errors: Record<string, string[]>,
    message = "Validation failed",
  ) {
    super(message, "VALIDATION_ERROR", 422);
    this.name = "ValidationError";
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}

class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}
```

---

## 2. Error Cause Chain (ES2022)

```typescript
async function getUser(id: string): Promise<User> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    throw new NotFoundError("User", id, { cause: err });
  }
}

// Update AppError to accept cause
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "AppError";
  }
}

// Walk cause chain
function getRootCause(err: Error): Error {
  let current = err;
  while (current.cause instanceof Error) current = current.cause;
  return current;
}
```

---

## 3. Result Type (No Exceptions)

```typescript
// Discriminated union — forces callers to handle both cases
type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E };

// Helper constructors
const Ok = <T>(data: T): Result<T, never> => ({ ok: true, data });
const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// Usage
function parseJson<T>(raw: string): Result<T, SyntaxError> {
  try {
    return Ok(JSON.parse(raw));
  } catch (err) {
    return Err(err as SyntaxError);
  }
}

const result = parseJson<Config>(rawInput);
if (!result.ok) {
  console.error("Parse failed:", result.error.message);
  return;
}
// result.data is Config here — TS narrowed it

// Async Result
async function fetchUser(id: string): Promise<Result<User, AppError>> {
  const user = await db.users.findUnique({ where: { id } });
  if (!user) return Err(new NotFoundError("User", id));
  return Ok(user);
}
```

---

## 4. Result Class (Chainable)

```typescript
class Result<T, E extends Error = Error> {
  private constructor(
    private readonly value: T | null,
    private readonly error: E | null,
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result(value, null) as Result<T, never>;
  }

  static fail<E extends Error>(error: E): Result<never, E> {
    return new Result(null, error) as Result<never, E>;
  }

  isOk(): this is Result<T, never> {
    return this.error === null;
  }
  isErr(): this is Result<never, E> {
    return this.error !== null;
  }

  unwrap(): T {
    if (this.error) throw this.error;
    return this.value as T;
  }

  unwrapOr(fallback: T): T {
    return this.isOk() ? (this.value as T) : fallback;
  }

  map<U>(fn: (val: T) => U): Result<U, E> {
    return this.isOk()
      ? Result.ok(fn(this.value as T))
      : Result.fail(this.error as E);
  }

  flatMap<U>(fn: (val: T) => Result<U, E>): Result<U, E> {
    return this.isOk() ? fn(this.value as T) : Result.fail(this.error as E);
  }
}

// Chain operations
const result = Result.ok(rawInput)
  .map((input) => input.trim())
  .flatMap((input) => parseConfig(input))
  .map((config) => config.port);

if (result.isOk()) {
  console.log("Port:", result.unwrap());
}
```

---

## 5. Type-Safe Error Handling with `unknown`

```typescript
// catch always gives unknown (with strict mode)
try {
  await riskyOperation();
} catch (err: unknown) {
  // Narrow before using
  if (err instanceof AppError) {
    logger.error(err.message, { code: err.code, statusCode: err.statusCode });
  } else if (err instanceof Error) {
    logger.error(err.message, { stack: err.stack });
  } else {
    logger.error("Unknown error", { err: String(err) });
  }
}

// Type guard for error-like objects
function isErrorWithCode(err: unknown): err is Error & { code: string } {
  return err instanceof Error && "code" in err;
}

// Safe error message extraction
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}
```

---

## 6. Zod Validation Errors

```typescript
import { z, ZodError } from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).max(150).optional(),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

// Parse and handle errors
function validateUser(
  input: unknown,
): Result<CreateUserInput, ValidationError> {
  const parsed = CreateUserSchema.safeParse(input);
  if (!parsed.success) {
    const errors = formatZodErrors(parsed.error);
    return Err(new ValidationError(errors));
  }
  return Ok(parsed.data);
}

// Format Zod errors into Record<field, messages[]>
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!formatted[key]) formatted[key] = [];
    formatted[key].push(issue.message);
  }
  return formatted;
}
```

---

## 7. Exhaustive Error Handling

```typescript
// Use discriminated unions for error types
type ApiError =
  | { type: "not_found"; resource: string; id: string }
  | { type: "validation"; errors: Record<string, string[]> }
  | { type: "unauthorized"; reason: string }
  | { type: "rate_limited"; retryAfter: number };

function handleApiError(error: ApiError): Response {
  switch (error.type) {
    case "not_found":
      return respond(404, `${error.resource} ${error.id} not found`);
    case "validation":
      return respond(422, "Validation failed", { errors: error.errors });
    case "unauthorized":
      return respond(401, error.reason);
    case "rate_limited":
      return respond(429, `Retry after ${error.retryAfter}s`);
    default:
      // Compile error if a case is missing
      const _exhaustive: never = error;
      throw new Error(`Unhandled error type: ${_exhaustive}`);
  }
}
```

---

## 8. Async Error Patterns

```typescript
// Wrapper for Go-style error handling
async function to<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    return Ok(await promise);
  } catch (err) {
    return Err(err instanceof Error ? err : new Error(String(err)));
  }
}

const result = await to(fetchUser(id));
if (!result.ok) return handleError(result.error);
const user = result.data;

// Retry with typed errors
async function retry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delay?: number } = {},
): Promise<T> {
  const { retries = 3, delay = 1000 } = options;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, delay * 2 ** i));
    }
  }
  throw new Error("Unreachable");
}

// Typed error map
async function mapError<T, E extends Error>(
  promise: Promise<T>,
  mapper: (err: unknown) => E,
): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    throw mapper(err);
  }
}

const user = await mapError(
  db.users.findUniqueOrThrow({ where: { id } }),
  () => new NotFoundError("User", id),
);
```

---

## 9. Type Narrowing After Errors

```typescript
// Assert functions — narrow types by throwing
function assertDefined<T>(
  value: T | null | undefined,
  message?: string,
): asserts value is T {
  if (value == null) throw new Error(message ?? "Value is null/undefined");
}

function assertString(value: unknown): asserts value is string {
  if (typeof value !== "string") throw new TypeError("Expected string");
}

// Usage — TS narrows after assertion
const user = await db.users.findUnique({ where: { id } });
assertDefined(user, `User ${id} not found`);
user.name; // TS knows user is non-null

// Guard + early return pattern
async function getUser(id: string): Promise<User> {
  const user = await db.users.findUnique({ where: { id } });
  if (!user) throw new NotFoundError("User", id);
  return user; // Return type is User, not User | null
}
```

---

## 10. Best Practices

- **Use `unknown` in catch blocks** — never assume error type
- **Use Result types** for expected failures — save exceptions for unexpected ones
- **Use discriminated union errors** — exhaustive handling with `never` check
- **Chain errors with `cause`** — preserve the original error context
- **Use Zod for input validation** — type-safe parsing with structured errors
- **Use assertion functions** to narrow types after validation
- **Don't swallow errors** — always log or re-throw
- **Fail fast at boundaries** — validate input at API/service entry points
- **Use custom error classes** — `instanceof` checking is type-safe
- **Keep error messages actionable** — include what failed and what to do
