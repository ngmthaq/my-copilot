---
name: expressjs-env-configuration
description: "Express.js environment configuration — managing environment variables, config validation, multi-environment setups, and secrets handling. Use when: setting up .env files; validating env vars at startup; structuring config modules; managing dev/staging/production configs; using dotenv or env validation libraries; handling secrets securely. DO NOT USE FOR: Docker environment setup (use docker-compose-configuration skill); deployment pipelines (use CI/CD skills)."
---

# Express.js Environment Configuration Skill

## Overview

This skill covers managing environment variables and application configuration in Express.js — loading `.env` files, validating config at startup, structuring typed config modules, multi-environment setups, and secure secrets handling. Apply it when users ask about environment configuration in Express apps.

---

## 1. Basic Setup with dotenv

```bash
npm install dotenv
```

### `.env`

```env
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# JWT
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Redis
REDIS_URL=redis://localhost:6379

# Email
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@example.com

# Logging
LOG_LEVEL=debug
```

### `.env.example` (committed to git)

```env
NODE_ENV=development
PORT=3000
HOST=localhost

DATABASE_URL=postgresql://user:password@localhost:5432/mydb

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

ALLOWED_ORIGINS=http://localhost:3000

REDIS_URL=redis://localhost:6379

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@example.com

LOG_LEVEL=debug
```

### `.gitignore`

```gitignore
.env
.env.local
.env.production
.env.*.local
```

---

## 2. Config Validation with Zod (Recommended)

```bash
npm install zod dotenv
```

```typescript
// src/config/env.ts
import { z } from "zod";
import dotenv from "dotenv";

// Load .env file
dotenv.config();

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(["development", "staging", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default("localhost"),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // CORS
  ALLOWED_ORIGINS: z
    .string()
    .transform((val) => val.split(",").map((s) => s.trim()))
    .default("http://localhost:3000"),

  // Redis (optional)
  REDIS_URL: z.string().url().optional(),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Logging
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;

// Export type for use across the app
export type Env = z.infer<typeof envSchema>;
```

### Usage

```typescript
// src/index.ts
import { env } from "./config/env";

app.listen(env.PORT, env.HOST, () => {
  console.log(`Server running on http://${env.HOST}:${env.PORT} [${env.NODE_ENV}]`);
});
```

```typescript
// Anywhere in the app — fully typed, validated at startup
import { env } from "../config/env";

const token = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
  expiresIn: env.JWT_ACCESS_EXPIRES_IN,
});
```

---

## 3. Config Validation with @t3-oss/env-core (Alternative)

```bash
npm install @t3-oss/env-core zod
```

```typescript
// src/config/env.ts
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "staging", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    REDIS_URL: z.string().url().optional(),
  },
  runtimeEnv: process.env,
});
```

---

## 4. Structured Config Module

```typescript
// src/config/index.ts
import { env } from "./env";

export const config = {
  app: {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    host: env.HOST,
    isProduction: env.NODE_ENV === "production",
    isDevelopment: env.NODE_ENV === "development",
    isTest: env.NODE_ENV === "test",
  },

  db: {
    url: env.DATABASE_URL,
  },

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  cors: {
    allowedOrigins: env.ALLOWED_ORIGINS,
  },

  redis: {
    url: env.REDIS_URL,
  },

  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.EMAIL_FROM,
  },

  log: {
    level: env.LOG_LEVEL,
  },
} as const;

export type Config = typeof config;
```

### Usage

```typescript
import { config } from "./config";

// Clean, grouped access
app.listen(config.app.port, config.app.host);

if (config.app.isProduction) {
  app.set("trust proxy", 1);
}

const token = jwt.sign(payload, config.jwt.accessSecret, {
  expiresIn: config.jwt.accessExpiresIn,
});
```

---

## 5. Multi-Environment Configuration

### File Loading Order

```typescript
// src/config/env.ts
import dotenv from "dotenv";
import path from "path";

// Load environment-specific file first, then base .env as fallback
// .env.local always overrides (never committed)
const envFiles = [
  `.env.${process.env.NODE_ENV || "development"}.local`, // highest priority
  `.env.local`,
  `.env.${process.env.NODE_ENV || "development"}`,
  `.env`, // lowest priority (fallback defaults)
];

for (const file of envFiles) {
  dotenv.config({ path: path.resolve(process.cwd(), file), override: false });
}
```

### Environment Files

```
.env                    # Shared defaults (committed)
.env.development        # Dev-specific (committed)
.env.staging            # Staging-specific (committed)
.env.production         # Production-specific (committed)
.env.test               # Test-specific (committed)
.env.local              # Local overrides (NOT committed)
.env.development.local  # Local dev overrides (NOT committed)
```

### `.env.development`

```env
NODE_ENV=development
LOG_LEVEL=debug
```

### `.env.production`

```env
NODE_ENV=production
LOG_LEVEL=warn
```

### `.env.test`

```env
NODE_ENV=test
DATABASE_URL=postgresql://user:password@localhost:5432/mydb_test
LOG_LEVEL=error
```

---

## 6. Secrets Management

### Runtime Secret Validation

```typescript
// Validate secrets are not default/placeholder values in production
function validateSecrets(env: Env) {
  if (env.NODE_ENV !== "production") return;

  const placeholders = ["your-secret", "changeme", "password", "secret"];
  const secrets: (keyof Env)[] = ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

  for (const key of secrets) {
    const value = env[key] as string;
    if (!value || placeholders.some((p) => value.toLowerCase().includes(p))) {
      console.error(`FATAL: ${key} contains a placeholder value in production`);
      process.exit(1);
    }
  }
}
```

### Generate Secure Secrets

```bash
# Generate a 64-character random secret
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

# Or using openssl
openssl rand -base64 48
```

### Using secrets from cloud providers

```typescript
// src/config/secrets.ts
// Example: AWS Secrets Manager
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });

export async function loadSecrets(): Promise<Record<string, string>> {
  const command = new GetSecretValueCommand({ SecretId: "my-app/production" });
  const response = await client.send(command);

  if (!response.SecretString) throw new Error("Secret not found");
  return JSON.parse(response.SecretString);
}

// Load secrets before starting the app
// src/index.ts
async function bootstrap() {
  if (config.app.isProduction) {
    const secrets = await loadSecrets();
    Object.assign(process.env, secrets);
  }

  // Re-validate env after loading secrets
  const { env } = await import("./config/env");
  // ... start server
}

bootstrap();
```

---

## 7. Feature Flags via Environment

```typescript
// src/config/env.ts — add to schema
const envSchema = z.object({
  // ... other vars

  // Feature flags (coerce string "true"/"false" to boolean)
  FEATURE_NEW_DASHBOARD: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  FEATURE_BETA_API: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
});
```

```typescript
// src/config/index.ts
export const config = {
  // ... other config

  features: {
    newDashboard: env.FEATURE_NEW_DASHBOARD,
    betaApi: env.FEATURE_BETA_API,
  },
} as const;
```

```typescript
// Usage in routes
if (config.features.betaApi) {
  app.use("/api/v2", v2Routes);
}
```

---

## 8. Config for External Services

```typescript
// src/config/env.ts — grouped external service config
const envSchema = z.object({
  // ... base vars

  // AWS S3
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // SendGrid
  SENDGRID_API_KEY: z.string().optional(),
});
```

```typescript
// src/config/index.ts
export const config = {
  // ... other config

  aws: {
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: env.S3_BUCKET_NAME,
  },

  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  },

  sendgrid: {
    apiKey: env.SENDGRID_API_KEY,
  },
} as const;
```

---

## 9. Project Structure

```
src/
├── index.ts                      # App entry point
├── app.ts                        # Express app setup
├── config/                       # ◄ Environment configuration
│   ├── env.ts                    # Zod schema + validation + dotenv loading
│   └── index.ts                  # Structured config object (grouped by domain)
├── lib/
├── middleware/
├── modules/
│   └── ...
└── ...
.env                              # Shared defaults (committed as .env.example)
.env.development                  # Dev overrides
.env.production                   # Prod overrides
.env.test                         # Test overrides
.env.local                        # Local overrides (NOT committed)
.env.example                      # Template for required vars (committed)
.gitignore                        # Exclude .env, .env.local, .env.*.local
```

---

## 10. Best Practices

- **Validate all env vars at startup** — fail fast with clear error messages, not at runtime
- **Use Zod for validation** — get type safety, coercion, defaults, and descriptive errors
- **Never import `process.env` directly** — always go through the validated `env` / `config` module
- **Commit `.env.example`** with placeholder values — never commit `.env` with real secrets
- **Use `.env.local` for personal overrides** — always gitignored, highest priority
- **Group config by domain** (`jwt`, `db`, `cors`, etc.) — easier to find and maintain
- **Keep secrets out of code** — use cloud secret managers in production (AWS Secrets Manager, Vault, etc.)
- **Use `z.coerce.number()`** for numeric env vars — `process.env` values are always strings
- **Set sensible defaults** for non-secret values (`PORT`, `LOG_LEVEL`, `NODE_ENV`)
- **Validate secrets are not placeholders** in production — prevent accidental deployment with dummy values

---

## 11. Required Packages

```bash
# Core
npm install dotenv zod

# Alternative (t3-env)
npm install @t3-oss/env-core zod

# Cloud secrets (optional)
npm install @aws-sdk/client-secrets-manager
```
