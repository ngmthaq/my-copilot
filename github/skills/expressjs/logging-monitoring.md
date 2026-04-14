---
name: expressjs-logging-monitoring
description: "Express.js logging & monitoring — structured logging with Pino, request/response logging middleware, correlation IDs, log levels, health checks, metrics collection, and production observability. Use when: setting up application logging; building request logging middleware; adding correlation/request IDs; configuring log levels per environment; implementing health check endpoints; collecting API metrics; integrating with monitoring tools. DO NOT USE FOR: error handling logic (use expressjs-error-handling skill); Nginx access logs (use nginx-logging-monitoring skill)."
---

# Express.js Logging & Monitoring Skill

## Overview

This skill covers structured logging and monitoring in Express.js — Pino logger setup, request/response logging middleware, correlation IDs, log levels, health checks, and metrics. Apply it when users ask about logging, observability, or monitoring in Express apps.

---

## 1. Pino Logger Setup

```bash
npm install pino pino-http pino-roll
npm install -D pino-pretty
```

```typescript
// src/lib/logger.ts
import pino from "pino";
import { config } from "../config";

function buildTransport():
  | pino.TransportSingleOptions
  | pino.TransportMultiOptions
  | undefined {
  // Development — pretty-print to console
  if (config.app.isDevelopment) {
    return {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:HH:MM:ss.l",
        ignore: "pid,hostname",
      },
    };
  }

  // Production — write to console + rotating log files
  if (config.app.isProduction) {
    return {
      targets: [
        // Console output (for Docker/cloud log collectors)
        {
          target: "pino/file",
          options: { destination: 1 }, // stdout
          level: config.log.level,
        },
        // All logs → rotating file
        {
          target: "pino-roll",
          options: {
            file: config.log.dir + "/app",
            frequency: "daily",
            dateFormat: "yyyy-MM-dd",
            mkdir: true,
            extension: ".log",
          },
          level: config.log.level,
        },
        // Error logs → separate rotating file
        {
          target: "pino-roll",
          options: {
            file: config.log.dir + "/error",
            frequency: "daily",
            dateFormat: "yyyy-MM-dd",
            mkdir: true,
            extension: ".log",
          },
          level: "error",
        },
      ],
    };
  }

  return undefined;
}

export const logger = pino({
  level: config.log.level,
  transport: buildTransport(),
  ...(config.app.isProduction && {
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "body.password",
      "body.currentPassword",
      "body.newPassword",
      "body.confirmPassword",
      "body.token",
      "body.refreshToken",
    ],
    censor: "[REDACTED]",
  },
});

export type Logger = typeof logger;
```

### Log File Output

```
logs/
├── app.2025-01-15.log      # All logs (info, warn, error, etc.)
├── app.2025-01-16.log
├── error.2025-01-15.log    # Error-only logs (error, fatal)
├── error.2025-01-16.log
├── audit.2025-01-15.log    # Audit logs (login, role change, delete, etc.)
└── audit.2025-01-16.log
```

### Config for Log Directory

```typescript
// Add to src/config/env.ts
const envSchema = z.object({
  // ... other vars
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  LOG_DIR: z.string().default("logs"),
});

// Add to src/config/index.ts
export const config = {
  // ... other config
  log: {
    level: env.LOG_LEVEL,
    dir: env.LOG_DIR,
  },
} as const;
```

### .gitignore

```gitignore
logs/
*.log
```

### Alternative: Write to File Without pino-roll (Simple)

```typescript
// Write all logs to a single file (no rotation)
import pino from "pino";

const logger = pino(
  pino.destination({ dest: "./logs/app.log", mkdir: true, sync: false }),
);

// Write to both console and file
import { multistream } from "pino";

const streams = [
  { stream: process.stdout },
  {
    stream: pino.destination({
      dest: "./logs/app.log",
      mkdir: true,
      sync: false,
    }),
  },
  {
    level: "error" as const,
    stream: pino.destination({
      dest: "./logs/error.log",
      mkdir: true,
      sync: false,
    }),
  },
];

const logger = pino({ level: "info" }, multistream(streams));
```

### Log Rotation with CLI (Alternative to pino-roll)

```bash
# Pipe Pino JSON output to a file, rotate with logrotate or pm2
node dist/index.js | tee -a logs/app.log

# PM2 handles log rotation automatically
pm2 start dist/index.js --log logs/app.log --merge-logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### Log Levels

| Level   | When to Use                                                       |
| ------- | ----------------------------------------------------------------- |
| `fatal` | App is about to crash — unrecoverable errors                      |
| `error` | Operation failed — caught exceptions, failed external calls       |
| `warn`  | Unexpected but handled — deprecated usage, retry attempts         |
| `info`  | Normal operations — server start, request completed, user actions |
| `debug` | Diagnostic detail — variable values, flow decisions               |
| `trace` | Fine-grained — entering/exiting functions, SQL queries            |

```typescript
// Environment-based log level (from env config)
// development: "debug"
// staging: "info"
// production: "warn"
// test: "error"
```

---

## 2. Request Logging Middleware (pino-http)

```typescript
// src/middleware/request-logger.ts
import pinoHttp from "pino-http";
import { logger } from "../lib/logger";
import { randomUUID } from "crypto";

export const requestLogger = pinoHttp({
  logger,

  // Generate unique request ID
  genReqId: (req) => {
    return (req.headers["x-request-id"] as string) || randomUUID();
  },

  // Customize logged request data
  customProps: (req) => ({
    requestId: req.id,
    ...(req.user && { userId: (req as any).user.userId }),
  }),

  // Customize log level based on status code
  customLogLevel: (_req, res, error) => {
    if (error || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  // Customize success log message
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },

  // Customize error log message
  customErrorMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },

  // Control what gets serialized
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },

  // Don't log health check requests
  autoLogging: {
    ignore: (req) => req.url === "/api/health",
  },
});
```

### Mount Early

```typescript
// src/index.ts
import { requestLogger } from "./middleware/request-logger";

const app = express();

// Mount request logger before routes
app.use(requestLogger);

// Now req.log is available in all route handlers
app.get("/api/users/:id", authenticate, async (req, res) => {
  req.log.info({ userId: req.params.id }, "Fetching user");
  const user = await userService.getById(req.params.id);
  res.json({ data: user });
});
```

---

## 3. Correlation / Request ID

```typescript
// src/middleware/request-id.ts
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = (req.headers["x-request-id"] as string) || randomUUID();
  req.id = id;
  res.setHeader("x-request-id", id);
  next();
}
```

```typescript
// Mount before request logger
app.use(requestId);
app.use(requestLogger);
```

### Pass Correlation ID to Downstream Services

```typescript
// When calling external APIs, forward the request ID
async function callExternalService(req: Request, data: any) {
  const response = await fetch("https://api.external.com/endpoint", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-request-id": req.id as string,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

---

## 4. Contextual Logging in Services

```typescript
// src/services/user.service.ts
import { logger } from "../lib/logger";

export class UserService {
  private log = logger.child({ service: "UserService" });

  async create(data: CreateUserInput) {
    this.log.info({ email: data.email }, "Creating new user");

    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      this.log.warn(
        { email: data.email },
        "Duplicate email registration attempt",
      );
      throw new ConflictError("Email already registered");
    }

    const user = await userRepository.create(data);
    this.log.info(
      { userId: user.id, email: user.email },
      "User created successfully",
    );
    return user;
  }

  async delete(id: string) {
    this.log.info({ userId: id }, "Deleting user");
    await userRepository.delete(id);
    this.log.info({ userId: id }, "User deleted successfully");
  }
}
```

### Child Logger with Request Context

```typescript
// Pass request logger to service methods for full traceability
router.post("/", authenticate, async (req, res) => {
  const log = req.log.child({ service: "UserService" });
  log.info("Creating user");

  const user = await userService.create(req.body);
  log.info({ userId: user.id }, "User created");

  res.status(201).json({ data: user });
});
```

---

## 5. Audit Logging

```typescript
// src/lib/audit-logger.ts
import pino from "pino";
import { config } from "../config";

// Dedicated audit logger — always writes to rotating file + console in dev
const auditLog = pino({
  level: "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    targets: [
      // Audit log file (both dev and prod)
      {
        target: "pino-roll",
        options: {
          file: config.log.dir + "/audit",
          frequency: "daily",
          dateFormat: "yyyy-MM-dd",
          mkdir: true,
          extension: ".log",
        },
        level: "info",
      },
      // Pretty console output in development
      ...(config.app.isDevelopment
        ? [
            {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "SYS:HH:MM:ss.l",
                ignore: "pid,hostname",
                destination: 1,
              },
              level: "info" as const,
            },
          ]
        : []),
    ],
  },
});

interface AuditEvent {
  action: string;
  userId: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}

export function logAuditEvent(event: AuditEvent) {
  auditLog.info({ type: "audit", ...event }, `AUDIT: ${event.action}`);
}
```

```typescript
// Usage in routes/services
import { logAuditEvent } from "../lib/audit-logger";

router.delete("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  await userService.delete(req.params.id);

  logAuditEvent({
    action: "USER_DELETED",
    userId: req.user!.userId,
    targetType: "user",
    targetId: req.params.id,
    ip: req.ip,
  });

  res.status(204).send();
});

// Auth events
logAuditEvent({
  action: "LOGIN_SUCCESS",
  userId: user.id,
  targetType: "session",
  targetId: sessionId,
  ip: req.ip,
});
logAuditEvent({
  action: "LOGIN_FAILED",
  userId: "unknown",
  targetType: "auth",
  targetId: email,
  metadata: { reason: "invalid_password" },
  ip: req.ip,
});
logAuditEvent({
  action: "PASSWORD_CHANGED",
  userId: user.id,
  targetType: "user",
  targetId: user.id,
  ip: req.ip,
});
logAuditEvent({
  action: "ROLE_CHANGED",
  userId: admin.id,
  targetType: "user",
  targetId: targetUser.id,
  metadata: { from: "USER", to: "ADMIN" },
  ip: req.ip,
});
```

---

## 6. Health Check & Readiness Endpoints

```typescript
// src/routes/health.routes.ts
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { createClient } from "redis";

const router = Router();

// Liveness — is the process running?
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Readiness — can we serve traffic? (check dependencies)
router.get("/ready", async (_req, res) => {
  const checks: Record<string, "ok" | "error"> = {};

  // Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  // Redis (if used)
  try {
    const redis = createClient({ url: process.env.REDIS_URL });
    await redis.connect();
    await redis.ping();
    await redis.disconnect();
    checks.redis = "ok";
  } catch {
    checks.redis = "error";
  }

  const allHealthy = Object.values(checks).every((s) => s === "ok");

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    checks,
  });
});

export default router;
```

```typescript
// Mount without auth
app.use("/api", healthRoutes);
```

---

## 7. Response Time & Metrics Middleware

```typescript
// src/middleware/metrics.ts
import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

interface RouteMetric {
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
}

const metrics: RouteMetric[] = [];

export function metricsCollector(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const responseTimeMs = Number(end - start) / 1_000_000;

    const metric: RouteMetric = {
      method: req.method,
      path: req.route?.path || req.path,
      statusCode: res.statusCode,
      responseTime: Math.round(responseTimeMs * 100) / 100,
    };

    metrics.push(metric);

    // Log slow requests
    if (responseTimeMs > 1000) {
      logger.warn(metric, "Slow request detected");
    }
  });

  next();
}

// Metrics endpoint (for internal monitoring)
export function getMetrics() {
  return {
    totalRequests: metrics.length,
    averageResponseTime:
      metrics.length > 0
        ? Math.round(
            (metrics.reduce((sum, m) => sum + m.responseTime, 0) /
              metrics.length) *
              100,
          ) / 100
        : 0,
    statusCodes: metrics.reduce(
      (acc, m) => {
        const group = `${Math.floor(m.statusCode / 100)}xx`;
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };
}
```

```typescript
app.use(metricsCollector);

// Internal metrics endpoint
app.get(
  "/api/internal/metrics",
  authenticate,
  authorize("ADMIN"),
  (_req, res) => {
    res.json(getMetrics());
  },
);
```

---

## 8. Error Logging Integration

```typescript
// src/middleware/error-handler.ts — integrate with logger
import { logger } from "../lib/logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Use request-scoped logger if available (includes requestId)
  const log = req.log || logger;

  if (err instanceof AppError && err.isOperational) {
    log.warn({ err, statusCode: err.statusCode, code: err.code }, err.message);
  } else {
    log.error({ err, stack: err.stack }, "Unhandled error");
  }

  // ... send error response
}
```

---

## 9. Log Output Examples

### Development (pino-pretty)

```
10:23:45.123 INFO: Server running on http://localhost:3000 [development]
10:23:46.456 INFO: GET /api/users 200
    requestId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    responseTime: 12
10:23:47.789 WARN: POST /api/auth/login 401
    requestId: "b2c3d4e5-f6a7-8901-bcde-f12345678901"
    responseTime: 45
10:23:48.012 ERROR: GET /api/posts/invalid-id 500
    requestId: "c3d4e5f6-a7b8-9012-cdef-123456789012"
    err: "PrismaClientKnownRequestError: Record not found"
```

### Production (JSON — machine-parseable)

```json
{"level":"info","time":"2025-01-15T10:23:45.123Z","msg":"GET /api/users 200","requestId":"a1b2c3d4","responseTime":12,"method":"GET","url":"/api/users","statusCode":200}
{"level":"warn","time":"2025-01-15T10:23:47.789Z","msg":"AUDIT: LOGIN_FAILED","type":"audit","action":"LOGIN_FAILED","targetId":"user@example.com","ip":"192.168.1.1"}
{"level":"error","time":"2025-01-15T10:23:48.012Z","msg":"Unhandled error","requestId":"c3d4e5f6","err":{"type":"Error","message":"Connection refused","stack":"..."}}
```

---

## 10. Project Structure

```
src/
├── index.ts                      # Server start
├── app.ts                        # ◄ Middleware mounting order
├── lib/
│   ├── logger.ts                 # ◄ Pino logger singleton
│   └── audit-logger.ts          # ◄ Dedicated audit logger (separate file transport)
├── middleware/
│   ├── request-logger.ts         # ◄ pino-http request/response logging
│   ├── request-id.ts             # ◄ Correlation ID middleware
│   ├── metrics.ts                # ◄ Response time + metrics collector
│   ├── error-handler.ts          # ◄ Error logging integration
│   └── ...
├── modules/
│   ├── health/
│   │   └── health.route.ts      # ◄ /health and /ready endpoints
│   └── user/
│       ├── user.controller.ts
│       ├── user.service.ts       # ◄ Uses logger.child({ service: "UserService" })
│       └── ...
└── ...
```

---

## 11. Best Practices

- **Use structured JSON logging in production** — never `console.log`, always Pino with structured fields
- **Use pino-pretty only in development** — human-readable in dev, machine-parseable in prod
- **Redact sensitive fields** — passwords, tokens, authorization headers
- **Use child loggers** — `logger.child({ service: "UserService" })` for context without repetition
- **Set log level per environment** — `debug` in dev, `warn` in prod, `error` in test
- **Add correlation IDs** — trace a request across services with `x-request-id`
- **Log audit events separately** — security-relevant actions (login, role change, delete) with user/IP context
- **Skip health check logs** — they generate noise; use `autoLogging.ignore` in pino-http
- **Log slow requests** — warn on requests exceeding a threshold (e.g., 1s)
- **Use `req.log`** — pino-http attaches a request-scoped logger with requestId already included
- **Separate liveness from readiness** — `/health` for process alive, `/ready` for dependency checks

---

## 12. Required Packages

```bash
# Core
npm install pino pino-http

# File logging with rotation
npm install pino-roll

# Development
npm install -D pino-pretty
```
