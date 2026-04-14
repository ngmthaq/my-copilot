---
name: nestjs-config-management
description: "NestJS config management — setting up @nestjs/config with .env files, typed ConfigService access, Joi/Zod schema validation at startup, and namespace-based config organisation. Use when: loading environment variables; validating config at startup; accessing settings in services. DO NOT USE FOR: DI wiring (use nestjs-dependency-injection skill); secrets management in production infrastructure."
---

# NestJS Config Management Skill

## Overview

Covers loading, validating, and accessing application configuration in NestJS using `@nestjs/config`.

---

## 1. Installation & Basic Setup

```bash
npm install @nestjs/config
npm install joi           # for schema validation
```

```typescript
// app.module.ts
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // no need to import ConfigModule in every module
      envFilePath: ".env", // default; can be [".env.local", ".env"]
    }),
  ],
})
export class AppModule {}
```

---

## 2. Accessing Config in Services

```typescript
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(private readonly config: ConfigService) {}

  getJwtSecret(): string {
    // Second argument is the default value (TypeScript generic infers return type)
    return this.config.getOrThrow<string>("JWT_SECRET");
  }

  getPort(): number {
    return this.config.get<number>("PORT", 3000);
  }
}
```

---

## 3. Joi Validation at Startup

```typescript
// config/env.validation.ts
import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").required(),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default("7d"),
  REDIS_URL: Joi.string().uri().optional(),
});

// app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: envValidationSchema,
  validationOptions: { abortEarly: false }, // report all errors at once
});
```

---

## 4. Namespace Config (forFeature / registerAs)

```typescript
// config/database.config.ts
import { registerAs } from "@nestjs/config";

export const databaseConfig = registerAs("database", () => ({
  url: process.env.DATABASE_URL,
  poolSize: parseInt(process.env.DB_POOL_SIZE ?? "10", 10),
  ssl: process.env.NODE_ENV === "production",
}));

// app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  load: [databaseConfig],
});

// Typed access in a service
@Injectable()
export class DatabaseService {
  constructor(
    @InjectConfig("database")
    private readonly dbConfig: ConfigType<typeof databaseConfig>,
  ) {}
  // dbConfig.url, dbConfig.poolSize, dbConfig.ssl are all typed
}

// Or via ConfigService with dotted path
this.config.get("database.url");
```

---

## 5. Custom Config Factory

```typescript
// config/app.config.ts
export default () => ({
  port: parseInt(process.env.PORT ?? "3000", 10),
  database: {
    url: process.env.DATABASE_URL,
    poolSize: parseInt(process.env.DB_POOL_SIZE ?? "5", 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },
  redis: {
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
  },
});

// app.module.ts
import appConfig from "./config/app.config";

ConfigModule.forRoot({ isGlobal: true, load: [appConfig] });

// Access deeply nested values
this.config.get<string>("jwt.secret");
this.config.get<number>("database.poolSize");
```

---

## 6. Using Config in main.ts

```typescript
// main.ts
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.getOrThrow<number>("PORT");
  await app.listen(port);
}
bootstrap();
```

---

## 7. Multiple .env Files

```typescript
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [
    `.env.${process.env.NODE_ENV}.local`,
    `.env.${process.env.NODE_ENV}`,
    ".env.local",
    ".env",
  ],
  // Files earlier in the array take precedence
});
```

---

## 8. Best Practices

- **Use `getOrThrow`** — fail fast at startup if a required variable is missing instead of getting `undefined` at runtime
- **Validate at startup** — use Joi or a custom `validate` function so missing env vars crash early, not on first request
- **Use `registerAs`** — namespace configs by domain (`database`, `jwt`, `redis`) for typed access and better organisation
- **Commit `.env.example`** — document all required variables with safe placeholder values
- **Never hardcode secrets** — read all secrets from environment; use a secrets manager in production
- **Set `isGlobal: true`** — avoids importing `ConfigModule` in every feature module
