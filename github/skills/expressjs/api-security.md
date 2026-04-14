---
name: expressjs-api-security
description: "Express.js API security — hardening REST APIs against common vulnerabilities. Use when: setting up Helmet, CORS, rate limiting, CSRF protection; sanitizing user input; preventing injection attacks (SQL, NoSQL, XSS, command injection); securing HTTP headers; implementing request size limits; configuring HTTPS and TLS; applying OWASP best practices in Express apps. DO NOT USE FOR: authentication/authorization logic (use expressjs-authentication-authorization skill); input validation schemas (use expressjs-input-validation skill)."
---

# Express.js API Security Skill

## Overview

This skill covers hardening Express.js APIs against common security threats — HTTP header protection, CORS, rate limiting, input sanitization, injection prevention, and OWASP best practices. Apply it when users ask about securing an Express API or preventing attacks.

---

## 1. Essential Security Middleware Stack

```typescript
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

const app = express();

// 1. Set security HTTP headers
app.use(helmet());

// 2. Enable CORS with specific origins
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // 24 hours preflight cache
  }),
);

// 3. Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// 4. Body parsing with size limits
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 5. Data sanitization against NoSQL injection
app.use(mongoSanitize());

// 6. Prevent HTTP parameter pollution
app.use(hpp());
```

---

## 2. Helmet — HTTP Header Protection

```typescript
import helmet from "helmet";

// Default: applies all recommended headers
app.use(helmet());

// Fine-grained control
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", process.env.API_URL],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

// Disable CSP for APIs that don't serve HTML
app.use(helmet({ contentSecurityPolicy: false }));
```

### Headers Helmet Sets by Default

| Header                      | Purpose                                      |
| --------------------------- | -------------------------------------------- |
| `Content-Security-Policy`   | Prevents XSS by restricting resource origins |
| `Strict-Transport-Security` | Forces HTTPS connections                     |
| `X-Content-Type-Options`    | Prevents MIME-type sniffing                  |
| `X-Frame-Options`           | Prevents clickjacking                        |
| `X-XSS-Protection`          | Legacy XSS filter (deprecated but still set) |
| `Referrer-Policy`           | Controls referrer header leakage             |
| `X-DNS-Prefetch-Control`    | Controls DNS prefetching                     |

---

## 3. CORS Configuration

```typescript
import cors from "cors";

// Strict: only allow specific origins
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ["https://example.com", "https://app.example.com"];

    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  exposedHeaders: ["X-Total-Count", "X-Request-ID"],
  credentials: true,
  maxAge: 86400,
};

app.use(cors(corsOptions));

// Per-route CORS (for public APIs)
app.get("/api/public/health", cors({ origin: "*" }), (req, res) => {
  res.json({ status: "ok" });
});
```

---

## 4. Rate Limiting

```typescript
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { createClient } from "redis";

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", globalLimiter);

// Strict limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
  skipSuccessfulRequests: true,
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Redis-backed rate limiter (for distributed/multi-instance setups)
const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

const distributedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
});
app.use("/api", distributedLimiter);
```

---

## 5. Input Sanitization & Injection Prevention

### XSS Prevention

```typescript
import xss from "xss";

// Sanitize user input before storing
function sanitizeInput(input: string): string {
  return xss(input);
}

// Middleware to sanitize request body
function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === "string") {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
}

app.use(sanitizeBody);
```

### NoSQL Injection Prevention

```typescript
import mongoSanitize from "express-mongo-sanitize";

// Remove keys starting with $ or containing .
app.use(mongoSanitize());

// Or replace prohibited characters instead of removing
app.use(mongoSanitize({ replaceWith: "_" }));
```

### SQL Injection Prevention

```typescript
// NEVER do this — vulnerable to SQL injection
const query = `SELECT * FROM users WHERE id = '${req.params.id}'`;

// ALWAYS use parameterized queries
// With pg (node-postgres)
const result = await pool.query("SELECT * FROM users WHERE id = $1", [
  req.params.id,
]);

// With Prisma (safe by default)
const user = await prisma.user.findUnique({ where: { id: req.params.id } });

// With Knex
const user = await knex("users").where("id", req.params.id).first();
```

### Command Injection Prevention

```typescript
// NEVER do this — vulnerable to command injection
import { exec } from "child_process";
exec(`convert ${req.body.filename} output.png`); // dangerous!

// Use execFile with explicit arguments instead
import { execFile } from "child_process";
execFile("convert", [req.body.filename, "output.png"]); // safe

// Better: validate the filename first
const SAFE_FILENAME = /^[a-zA-Z0-9_-]+\.[a-zA-Z]{3,4}$/;
if (!SAFE_FILENAME.test(req.body.filename)) {
  return res.status(400).json({ error: "Invalid filename" });
}
```

---

## 6. CSRF Protection

```typescript
import { doubleCsrf } from "csrf-csrf";

const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET!,
  cookieName: "__csrf",
  cookieOptions: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
  size: 64,
  getTokenFromRequest: (req) => req.headers["x-csrf-token"] as string,
});

// Apply CSRF protection to state-changing routes
app.use("/api", doubleCsrfProtection);

// Endpoint to get CSRF token
app.get("/api/csrf-token", (req, res) => {
  res.json({ token: generateToken(req, res) });
});
```

> **Note:** For pure REST APIs consumed only by non-browser clients (mobile apps, server-to-server), CSRF protection is unnecessary. Use it when your API is consumed by a browser with cookie-based sessions.

---

## 7. Request Size & Payload Limits

```typescript
// Limit JSON body size
app.use(express.json({ limit: "10kb" }));

// Limit URL-encoded body size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Limit file upload size (with multer)
import multer from "multer";

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

app.post("/api/upload", upload.single("avatar"), (req, res) => {
  res.json({ file: req.file?.filename });
});

// Request timeout (prevent slow loris attacks)
import timeout from "connect-timeout";
app.use(timeout("30s"));
app.use((req, _res, next) => {
  if (!req.timedout) next();
});
```

---

## 8. HTTPS & TLS

```typescript
import https from "https";
import fs from "fs";

// Force HTTPS redirect
app.use((req, res, next) => {
  if (
    req.headers["x-forwarded-proto"] !== "https" &&
    process.env.NODE_ENV === "production"
  ) {
    return res.redirect(301, `https://${req.hostname}${req.url}`);
  }
  next();
});

// HTTPS server (for non-reverse-proxy setups)
const httpsOptions = {
  key: fs.readFileSync("/path/to/private.key"),
  cert: fs.readFileSync("/path/to/certificate.crt"),
  ca: fs.readFileSync("/path/to/ca-bundle.crt"),
};

https.createServer(httpsOptions, app).listen(443);
```

> **In production**, terminate TLS at the reverse proxy (Nginx, ALB, Cloudflare) rather than in Node.js. Set `app.set('trust proxy', 1)` when behind a proxy.

---

## 9. Security Response Headers & Error Handling

```typescript
// Remove the X-Powered-By header
app.disable("x-powered-by");

// Security-focused error handler — never leak stack traces or internal details
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err); // log full error internally

  // Never expose internal errors to the client
  if (process.env.NODE_ENV === "production") {
    res.status(500).json({ error: "Internal server error" });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Custom 404 — don't reveal application structure
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});
```

---

## 10. API Key & Secret Management

```typescript
// NEVER hardcode secrets
// Bad:
const API_KEY = "sk-1234567890abcdef";

// Good: use environment variables
const API_KEY = process.env.API_KEY;

// Validate required env vars at startup
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "API_KEY"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}
```

---

## 11. Security Checklist

- [ ] **Helmet** enabled with appropriate CSP directives
- [ ] **CORS** configured with explicit allowed origins (not `*` in production)
- [ ] **Rate limiting** on all routes, stricter on auth endpoints
- [ ] **Body size limits** set on JSON, URL-encoded, and file uploads
- [ ] **Input sanitized** against XSS, NoSQL injection, and SQL injection
- [ ] **Parameterized queries** used for all database operations
- [ ] **HTTPS enforced** in production; HSTS header set
- [ ] **`X-Powered-By` disabled** to prevent fingerprinting
- [ ] **Error messages** do not leak stack traces or internal details in production
- [ ] **Secrets** loaded from environment variables, never hardcoded
- [ ] **Dependencies** audited regularly (`npm audit`)
- [ ] **CSRF protection** applied if using cookie-based sessions in browsers

---

## 12. Required Packages

```bash
npm install helmet cors express-rate-limit express-mongo-sanitize hpp xss csrf-csrf multer connect-timeout
npm install -D @types/cors @types/hpp
```
