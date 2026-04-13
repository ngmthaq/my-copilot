---
name: expressjs-error-handling
description: "Express.js error handling — centralized error middleware, custom error classes, async error catching, HTTP error responses, Prisma/validation error mapping, and production-safe error output. Use when: building error handling middleware; creating custom AppError classes; wrapping async route handlers; mapping third-party errors to HTTP responses; logging errors; handling 404s and unhandled rejections. DO NOT USE FOR: input validation logic (use expressjs-input-validation skill); API security headers (use expressjs-api-security skill)."
---

# Express.js Error Handling Skill

## Overview

This skill covers centralized error handling in Express.js — custom error classes, async error catching, error mapping middleware, structured error responses, and production-safe output. Apply it when users ask about handling errors in Express APIs.

---

## 1. Custom Error Classes

```typescript
// src/errors/app-error.ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
```

```typescript
// src/errors/http-errors.ts
import { AppError } from "./app-error";

export class BadRequestError extends AppError {
  constructor(message = "Bad request", code = "BAD_REQUEST") {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", code = "UNAUTHORIZED") {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", code = "FORBIDDEN") {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists", code = "CONFLICT") {
    super(message, 409, code);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>, message = "Validation failed") {
    super(message, 422, "VALIDATION_ERROR");
    this.errors = errors;
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests", code = "TOO_MANY_REQUESTS") {
    super(message, 429, code);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error", code = "INTERNAL_ERROR") {
    super(message, 500, code, false);
  }
}
```

### Usage in Routes

```typescript
import { NotFoundError, ForbiddenError } from "../errors/http-errors";

router.get("/:id", authenticate, async (req, res) => {
  const post = await postRepository.findById(req.params.id);
  if (!post) {
    throw new NotFoundError("Post not found");
  }
  if (post.authorId !== req.user!.userId) {
    throw new ForbiddenError("You do not have access to this post");
  }
  res.json({ data: post });
});
```

---

## 2. Async Error Wrapper

```typescript
// src/middleware/request-handler.ts
import { Request, Response, NextFunction, RequestHandler } from "express";

export function requestHandler<Req extends Request = Request>(
  fn: (req: Req, res: Response, next: NextFunction) => Promise<any>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as Req, res, next)).catch(next);
  };
}
```

### Usage

```typescript
import { requestHandler } from "../middleware/request-handler";

// Without requestHandler — need try/catch in every route
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const user = await userRepository.findById(req.params.id);
    if (!user) throw new NotFoundError("User not found");
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

// With requestHandler — errors automatically forwarded to error middleware
router.get(
  "/:id",
  authenticate,
  requestHandler(async (req, res) => {
    const user = await userRepository.findById(req.params.id);
    if (!user) throw new NotFoundError("User not found");
    res.json({ data: user });
  }),
);

// With typed Request — pass custom params, body, query types
interface CreatePostRequest extends Request {
  body: { title: string; content?: string; categoryIds?: string[] };
}

router.post(
  "/",
  authenticate,
  requestHandler<CreatePostRequest>(async (req, res) => {
    // req.body is typed as { title: string; content?: string; categoryIds?: string[] }
    const post = await postService.create(req.body, req.user!.userId);
    res.status(201).json({ data: post });
  }),
);

// With params typing
interface GetByIdRequest extends Request<{ id: string }> {}

router.get(
  "/:id",
  requestHandler<GetByIdRequest>(async (req, res) => {
    // req.params.id is typed as string
    const user = await userService.getById(req.params.id);
    res.json({ data: user });
  }),
);
```

### Alternative: express-async-errors (zero-config)

```bash
npm install express-async-errors
```

```typescript
// src/index.ts — import once at the top, before any routes
import "express-async-errors";
import express from "express";

const app = express();

// Now all async errors are automatically caught — no wrapper needed
app.get("/api/users/:id", authenticate, async (req, res) => {
  const user = await userRepository.findById(req.params.id);
  if (!user) throw new NotFoundError("User not found");
  res.json({ data: user });
});
```

---

## 3. Centralized Error Handler Middleware

```typescript
// src/middleware/error-handler.ts
import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../errors";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { config } from "../config";

interface ErrorResponse {
  status: "error";
  code: string;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  // Log the error
  console.error(`[ERROR] ${err.message}`, {
    name: err.name,
    stack: err.stack,
    ...(err instanceof AppError && {
      code: err.code,
      statusCode: err.statusCode,
    }),
  });

  // 1. Custom AppError (known, operational errors)
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      status: "error",
      code: err.code,
      message: err.message,
      errors: err.errors,
    } satisfies ErrorResponse);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      code: err.code,
      message: err.message,
    } satisfies ErrorResponse);
  }

  // 2. Zod validation errors
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".");
      if (!errors[key]) errors[key] = [];
      errors[key].push(issue.message);
    }
    return res.status(422).json({
      status: "error",
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors,
    } satisfies ErrorResponse);
  }

  // 3. Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(err, res);
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: "error",
      code: "INVALID_DATA",
      message: "Invalid data provided",
    } satisfies ErrorResponse);
  }

  // 4. JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      code: "INVALID_TOKEN",
      message: "Invalid token",
    } satisfies ErrorResponse);
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      code: "TOKEN_EXPIRED",
      message: "Token has expired",
    } satisfies ErrorResponse);
  }

  // 5. Syntax error (malformed JSON body)
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      status: "error",
      code: "INVALID_JSON",
      message: "Malformed JSON in request body",
    } satisfies ErrorResponse);
  }

  // 6. Unknown/unexpected errors — never leak details in production
  const response: ErrorResponse = {
    status: "error",
    code: "INTERNAL_ERROR",
    message: config.app.isProduction ? "Internal server error" : err.message,
  };

  if (!config.app.isProduction) {
    response.stack = err.stack;
  }

  res.status(500).json(response);
}
```

### Prisma Error Mapper

```typescript
function handlePrismaError(err: Prisma.PrismaClientKnownRequestError, res: Response) {
  switch (err.code) {
    case "P2002": {
      const fields = (err.meta?.target as string[]) || ["field"];
      return res.status(409).json({
        status: "error",
        code: "DUPLICATE_ENTRY",
        message: `A record with this ${fields.join(", ")} already exists`,
      });
    }
    case "P2025":
      return res.status(404).json({
        status: "error",
        code: "NOT_FOUND",
        message: "Record not found",
      });
    case "P2003":
      return res.status(400).json({
        status: "error",
        code: "FOREIGN_KEY_ERROR",
        message: "Referenced record does not exist",
      });
    case "P2014":
      return res.status(400).json({
        status: "error",
        code: "RELATION_VIOLATION",
        message: "Required relation violation",
      });
    default:
      return res.status(400).json({
        status: "error",
        code: "DATABASE_ERROR",
        message: "Database operation failed",
      });
  }
}
```

---

## 4. 404 Handler

```typescript
// src/middleware/not-found-handler.ts
import { Request, Response } from "express";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    status: "error",
    code: "ROUTE_NOT_FOUND",
    message: `Cannot ${_req.method} ${_req.originalUrl}`,
  });
}
```

---

## 5. Unhandled Rejection & Uncaught Exception Handlers

```typescript
// src/index.ts
process.on("unhandledRejection", (reason: Error) => {
  console.error("UNHANDLED REJECTION:", reason);
  // Let the process crash so the process manager (PM2, Docker) can restart it
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  console.error("UNCAUGHT EXCEPTION:", error);
  process.exit(1);
});
```

---

## 6. Mounting Order (Critical)

```typescript
// src/index.ts
import "express-async-errors";
import express from "express";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found-handler";
import userRoutes from "./routes/user.routes";
import postRoutes from "./routes/post.routes";

const app = express();

// 1. Body parsers & security middleware
app.use(express.json({ limit: "10kb" }));

// 2. Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// 3. 404 handler — AFTER all routes
app.use(notFoundHandler);

// 4. Error handler — LAST middleware (must have 4 params)
app.use(errorHandler);
```

> **Order matters:** The 404 handler must come after all routes, and the error handler must be the very last middleware registered.

---

## 7. Consistent Error Response Format

All errors follow a unified JSON structure:

```typescript
// Success response
{
  "data": { ... },
  "meta": { ... }  // optional (pagination, etc.)
}

// Error response
{
  "status": "error",
  "code": "NOT_FOUND",           // machine-readable error code
  "message": "User not found",   // human-readable message
  "errors": {                    // optional — validation errors only
    "email": ["Invalid email format"],
    "password": ["Must be at least 8 characters"]
  }
}
```

### Error Codes Reference

| Code                | HTTP | Description                                |
| ------------------- | ---- | ------------------------------------------ |
| `BAD_REQUEST`       | 400  | Malformed request                          |
| `INVALID_JSON`      | 400  | Malformed JSON body                        |
| `INVALID_DATA`      | 400  | Invalid data for database operation        |
| `UNAUTHORIZED`      | 401  | Missing or invalid authentication          |
| `INVALID_TOKEN`     | 401  | JWT verification failed                    |
| `TOKEN_EXPIRED`     | 401  | JWT has expired                            |
| `FORBIDDEN`         | 403  | Authenticated but insufficient permissions |
| `NOT_FOUND`         | 404  | Resource not found                         |
| `ROUTE_NOT_FOUND`   | 404  | No matching route                          |
| `CONFLICT`          | 409  | Resource already exists                    |
| `DUPLICATE_ENTRY`   | 409  | Unique constraint violation                |
| `VALIDATION_ERROR`  | 422  | Input validation failed                    |
| `TOO_MANY_REQUESTS` | 429  | Rate limit exceeded                        |
| `INTERNAL_ERROR`    | 500  | Unexpected server error                    |

---

## 8. Error Handling in Service Layer

```typescript
// src/services/user.service.ts
import { userRepository } from "../repositories/user.repository";
import { NotFoundError, ConflictError, BadRequestError } from "../errors/http-errors";
import bcrypt from "bcrypt";

export class UserService {
  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async create(data: { email: string; name: string; password: string }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    return userRepository.create({
      ...data,
      password: hashedPassword,
    });
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await userRepository.findByEmail(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new BadRequestError("Current password is incorrect", "INVALID_PASSWORD");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    return userRepository.update(userId, { password: hashedPassword });
  }
}

export const userService = new UserService();
```

### Clean Routes with Service Layer

```typescript
// src/routes/user.routes.ts
import { Router } from "express";
import { userService } from "../services/user.service";
import { authenticate } from "../middleware/auth";

const router = Router();

// Errors thrown in the service bubble up to the error handler automatically
router.get("/:id", authenticate, async (req, res) => {
  const user = await userService.getById(req.params.id);
  res.json({ data: user });
});

router.post("/", async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json({ data: user });
});

export default router;
```

---

## 9. Project Structure

```
src/
├── index.ts                      # App entry point
├── app.ts                        # Express app setup (middleware, routes)
├── errors/                       # ◄ Error classes
│   ├── app-error.ts              # Base AppError class
│   ├── http-errors.ts            # BadRequest, NotFound, Conflict, etc.
│   └── index.ts                  # Re-export all error classes
├── middleware/
│   ├── request-handler.ts        # Generic async request wrapper
│   ├── error-handler.ts          # ◄ Centralized error middleware
│   └── not-found-handler.ts      # ◄ 404 catch-all
├── modules/
│   └── user/
│       ├── dto/                  # Validation schemas + types
│       ├── user.route.ts
│       ├── user.controller.ts
│       ├── user.service.ts       # ◄ Business logic with error throwing
│       └── user.repository.ts
└── ...
```

---

## 10. Best Practices

- **Throw, don't return errors** — throw `AppError` subclasses and let the centralized handler catch them
- **Use `express-async-errors`** or `requestHandler` — never let async errors silently disappear
- **Distinguish operational vs programming errors** — operational errors (404, 409) are expected; programming errors (TypeError, null reference) should crash and restart
- **Never leak stack traces in production** — only include `stack` when `NODE_ENV !== "production"`
- **Use machine-readable error codes** — clients should switch on `code`, not parse `message`
- **Map third-party errors centrally** — handle Prisma, Zod, JWT errors in one place, not per route
- **Register error middleware last** — Express only calls 4-param middleware for errors
- **Register 404 handler after all routes** — it catches unmatched requests
- **Keep routes thin** — move error-throwing logic to the service layer
- **Handle `unhandledRejection` and `uncaughtException`** — log and exit so the process manager restarts

---

## 11. Required Packages

```bash
# Async error handling (pick one)
npm install express-async-errors  # zero-config, recommended

# Validation (errors are mapped in error handler)
npm install zod

# Prisma (errors are mapped in error handler)
npm install @prisma/client
```
