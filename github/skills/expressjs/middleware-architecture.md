---
name: expressjs-middleware-architecture
description: "Express.js middleware architecture — understanding the middleware pipeline, writing custom middleware, middleware ordering, composing middleware chains, and middleware patterns. Use when: building custom middleware; understanding request/response lifecycle; ordering middleware correctly; composing reusable middleware; creating middleware factories; applying middleware per-route or globally. DO NOT USE FOR: specific middleware like auth (use expressjs-authentication-authorization skill); error handling middleware (use expressjs-error-handling skill); validation middleware (use expressjs-input-validation skill)."
---

# Express.js Middleware Architecture Skill

## Overview

This skill covers Express.js middleware architecture — how the middleware pipeline works, writing custom middleware, ordering, composition patterns, and middleware factories. Apply it when users ask about middleware design, execution order, or building reusable middleware.

---

## 1. How Middleware Works

```
Request → [Middleware 1] → [Middleware 2] → [Route Handler] → [Error Handler] → Response
              │                  │                │                  │
              ▼                  ▼                ▼                  ▼
          next()             next()          res.json()         res.json()
```

Every middleware is a function with access to `req`, `res`, and `next`. Use `requestHandler` to create type-safe middleware with automatic async error catching:

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

```typescript
// Standard middleware — call next() to continue the chain
const myMiddleware = requestHandler(async (req, res, next) => {
  // Do something with req/res
  next(); // Pass control to the next middleware
});

// Middleware that short-circuits — send response without calling next()
const myGuard = requestHandler(async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// Error middleware (4 params — must have all 4, cannot use requestHandler)
function myErrorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  // Handle error
  res.status(500).json({ error: err.message });
}
```

### Key Rules

- Call `next()` to pass control to the next middleware — forgetting it hangs the request
- Call `next(err)` to skip to the error handler
- Once `res.json()` / `res.send()` is called, do not call `next()`
- Middleware executes in the order it is registered (`app.use`)
- Error middleware must have exactly 4 parameters to be recognized by Express

---

## 2. Middleware Types & Registration

### Application-Level (Global)

```typescript
// Applied to ALL routes
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(requestLogger);
```

### Router-Level

```typescript
const router = Router();

// Applied to all routes in this router
router.use(authenticate);

router.get("/", listUsersHandler);
router.get("/:id", getUserHandler);

app.use("/api/users", router);
```

### Route-Level

```typescript
// Applied to a single route — passed as arguments before the handler
router.get("/:id", authenticate, authorize("ADMIN"), getUserHandler);

// Multiple middleware as array
router.post("/", [authenticate, validate({ body: createUserSchema.body })], createUserHandler);
```

### Error-Level (must be last)

```typescript
// Must be registered AFTER all routes
app.use(notFoundHandler); // 404 catch-all (3 params)
app.use(errorHandler); // Error handler (4 params)
```

---

## 3. Correct Middleware Ordering

```typescript
import express from "express";

const app = express();

// ─── 1. Pre-processing (runs on every request) ───
app.use(requestId); // Attach correlation ID
app.use(requestLogger); // Log request start

// ─── 2. Security ───
app.use(helmet()); // HTTP security headers
app.use(cors(corsOptions)); // CORS
app.use(rateLimit(rateLimitOptions)); // Rate limiting

// ─── 3. Body parsing ───
app.use(express.json({ limit: "10kb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── 4. Application middleware ───
app.use(metricsCollector); // Response time tracking

// ─── 5. Routes ───
app.use("/api/health", healthRoutes); // Health checks (no auth)
app.use("/api/auth", authRoutes); // Auth routes (no auth)
app.use("/api/users", userRoutes); // Protected routes
app.use("/api/posts", postRoutes);

// ─── 6. Error handling (must be last) ───
app.use(notFoundHandler); // 404 catch-all
app.use(errorHandler); // Centralized error handler
```

> **Why order matters:** Security middleware must run before routes to protect them. Body parsers must run before validation. Error handlers must be last to catch everything.

---

## 4. Writing Custom Middleware

### Simple Middleware

```typescript
// src/middleware/response-time.ts
import { requestHandler } from "./request-handler";

export const responseTime = requestHandler(async (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const duration = Number(process.hrtime.bigint() - start) / 1_000_000;
    res.setHeader("X-Response-Time", `${duration.toFixed(2)}ms`);
  });

  next();
});
```

### Middleware That Modifies Request

```typescript
// src/middleware/request-id.ts
import { randomUUID } from "crypto";
import { requestHandler } from "./request-handler";

export const requestId = requestHandler(async (req, res, next) => {
  const id = (req.headers["x-request-id"] as string) || randomUUID();
  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
});
```

### Middleware That Short-Circuits

```typescript
// src/middleware/maintenance.ts
import { config } from "../config";
import { requestHandler } from "./request-handler";

export const maintenance = requestHandler(async (req, res, next) => {
  if (config.app.maintenanceMode) {
    // Short-circuit — do NOT call next()
    return res.status(503).json({
      status: "error",
      code: "MAINTENANCE",
      message: "Service is under maintenance. Please try again later.",
    });
  }
  next();
});
```

---

## 5. Middleware Factories (Configurable Middleware)

A middleware factory is a function that returns middleware — it lets you parameterize behavior:

```typescript
// src/middleware/rate-limit-by-role.ts
import rateLimit from "express-rate-limit";

export function rateLimitByRole(options: { defaultMax: number; adminMax: number; windowMs: number }) {
  return rateLimit({
    windowMs: options.windowMs,
    max: (req) => {
      if (req.user?.role === "ADMIN" || req.user?.role === "SUPER_ADMIN") {
        return options.adminMax;
      }
      return options.defaultMax;
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

// Usage
app.use(
  "/api",
  rateLimitByRole({
    defaultMax: 100,
    adminMax: 1000,
    windowMs: 15 * 60 * 1000,
  }),
);
```

```typescript
// src/middleware/authorize.ts
import { requestHandler } from "./request-handler";

type Role = "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";

export function authorize(...allowedRoles: Role[]) {
  return requestHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!allowedRoles.includes(req.user.role as Role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  });
}

// Usage
router.delete("/:id", authenticate, authorize("ADMIN", "SUPER_ADMIN"), deleteHandler);
```

```typescript
// src/middleware/cache.ts
import { requestHandler } from "./request-handler";

export function cache(ttlSeconds: number) {
  return requestHandler(async (_req, res, next) => {
    res.setHeader("Cache-Control", `public, max-age=${ttlSeconds}`);
    next();
  });
}

// Usage
router.get("/public/config", cache(3600), getConfigHandler);
```

---

## 6. Middleware Chains in Routes

Just list middleware as flat arguments — no composition utility needed:

```typescript
// Flat middleware chain — auth + role + handler
router.get("/", authenticate, authorize("ADMIN", "SUPER_ADMIN"), listUsersHandler);

// Flat middleware chain — auth + validation + handler
router.post("/", authenticate, validate({ body: createUserSchema.body }), createHandler);

// Flat middleware chain — auth + role + validation + handler
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validate({ params: idParamSchema, body: updateUserSchema.body }),
  updateHandler,
);

// Multiple middleware as array (also flat)
router.delete(
  "/:id",
  [authenticate, authorize("ADMIN", "SUPER_ADMIN"), validate({ params: idParamSchema })],
  deleteHandler,
);
```

---

## 7. Conditional Middleware

```typescript
import { requestHandler } from "./request-handler";
import { RequestHandler } from "express";

// Apply middleware only when a condition is met
export function when(condition: (req: Request) => boolean, middleware: RequestHandler) {
  return requestHandler(async (req, res, next) => {
    if (condition(req)) {
      return middleware(req, res, next);
    }
    next();
  });
}

// Usage — only rate limit non-authenticated users
app.use(when((req) => !req.headers.authorization, rateLimit({ windowMs: 60 * 1000, max: 10 })));

// Only parse JSON for specific content types
app.use(
  when((req) => req.headers["content-type"]?.includes("application/json") ?? false, express.json({ limit: "10kb" })),
);
```

---

## 8. Async Middleware

`requestHandler` already catches async errors, so just use it for async middleware:

```typescript
import { requestHandler } from "./request-handler";

// Async middleware that loads user profile — errors auto-forwarded to error handler
export const loadUserProfile = requestHandler(async (req, _res, next) => {
  if (req.user) {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.userId },
    });
    req.userProfile = profile;
  }
  next();
});

// Async middleware that checks resource existence
export const loadPost = requestHandler(async (req, _res, next) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) {
    throw new NotFoundError("Post not found");
  }
  req.post = post;
  next();
});

// Usage
router.put("/:id", authenticate, loadPost, updatePostHandler);
```

---

## 9. Extending Request with Custom Properties

```typescript
// src/types/express.d.ts
import { TokenPayload } from "../middleware/auth";
import { Profile } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: TokenPayload;
      userProfile?: Profile | null;
      startTime?: bigint;
    }
  }
}
```

> Place this file in your `types/` directory and ensure `tsconfig.json` includes it.

---

## 10. Third-Party Middleware Reference

| Middleware             | Purpose                       | Registration Order            |
| ---------------------- | ----------------------------- | ----------------------------- |
| `helmet`               | Security HTTP headers         | Early (before routes)         |
| `cors`                 | Cross-origin resource sharing | Early (before routes)         |
| `express-rate-limit`   | Rate limiting                 | After CORS, before routes     |
| `express.json()`       | Parse JSON bodies             | Before validation/routes      |
| `express.urlencoded()` | Parse form bodies             | Before validation/routes      |
| `cookie-parser`        | Parse cookies                 | Before auth (if cookie-based) |
| `compression`          | Gzip response compression     | Before routes                 |
| `morgan` / `pino-http` | Request logging               | Early (after request ID)      |

---

## 11. Anti-Patterns to Avoid

```typescript
// ❌ Forgetting next() — request hangs forever
const badMiddleware = requestHandler(async (req, res, next) => {
  console.log("Request received");
  // Missing next()!
});

// ✅ Always call next() to continue the chain
const goodMiddleware = requestHandler(async (req, res, next) => {
  console.log("Request received");
  next();
});

// ❌ Calling next() after sending response
const doubleSend = requestHandler(async (req, res, next) => {
  res.json({ data: "done" });
  next(); // Error: headers already sent
});

// ✅ Return after sending response — do NOT call next()
const correctSend = requestHandler(async (req, res, next) => {
  if (someCondition) {
    return res.json({ data: "done" });
  }
  next();
});

// ❌ Error middleware with 3 params — Express won't recognize it as error handler
app.use((err, req, res) => {
  // This is treated as regular middleware, not error middleware!
  res.status(500).json({ error: err.message });
});

// ✅ Error middleware must have exactly 4 params (cannot use requestHandler)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: err.message });
});

// ❌ Registering error handler before routes
app.use(errorHandler); // This won't catch route errors!
app.use("/api", routes);

// ✅ Error handler must be after all routes
app.use("/api", routes);
app.use(errorHandler);

// ❌ Modifying res after it's sent (in async callbacks)
router.get(
  "/",
  requestHandler(async (req, res) => {
    res.json({ status: "ok" });
    const data = await fetchSomething(); // This runs after response is sent
    res.json(data); // Error: headers already sent
  }),
);

// ✅ Await before sending response
router.get(
  "/",
  requestHandler(async (req, res) => {
    const data = await fetchSomething();
    res.json(data);
  }),
);
```

---

## 12. Project Structure

```
src/
├── index.ts                      # Server start
├── app.ts                        # ◄ Middleware registration order
├── middleware/                    # ◄ All middleware
│   ├── request-handler.ts        # Generic async request wrapper
│   ├── auth.ts                   # authenticate middleware
│   ├── authorize.ts              # authorize(...roles) factory
│   ├── validate.ts               # validate({ body, params, query }) factory
│   ├── request-id.ts             # Correlation ID
│   ├── request-logger.ts         # pino-http request logging
│   ├── metrics.ts                # Response time collector
│   ├── error-handler.ts          # Centralized error handler (4 params)
│   └── not-found-handler.ts      # 404 catch-all
├── modules/
│   └── user/
│       ├── dto/
│       ├── user.route.ts         # Middleware chains per route
│       ├── user.controller.ts
│       ├── user.service.ts
│       └── user.repository.ts
├── types/
│   └── express.d.ts              # Request type extensions
└── ...
```

---

## 13. Best Practices

- **Order matters** — security → parsing → application → routes → errors
- **Always call `next()`** unless you intentionally end the response
- **Use middleware factories** for configurable, reusable middleware
- **Compose chains** for common patterns (auth + role + validation)
- **Keep middleware focused** — one responsibility per middleware
- **Use `requestHandler`** for all middleware and route handlers — auto-catches async errors
- **Extend `Request` via declaration merging** — type-safe custom properties
- **Error middleware needs 4 params** — Express checks the function's arity
- **Register error handlers last** — they only catch errors from middleware above them
- **Never send response twice** — check `res.headersSent` if unsure
