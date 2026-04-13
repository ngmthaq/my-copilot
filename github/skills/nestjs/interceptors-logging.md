---
name: nestjs-interceptors-logging
description: "NestJS interceptors and logging — NestInterceptor lifecycle, response transformation, request/response logging, execution time measurement, Pino/Winston integration, and applying interceptors globally vs. per route. Use when: transforming response shapes; logging requests and responses; measuring execution time; integrating a structured logger. DO NOT USE FOR: error formatting (use nestjs-exception-filters skill)."
---

# NestJS Interceptors & Logging Skill

## Overview

Covers NestJS interceptors for cross-cutting concerns — response wrapping, request logging, timing, and structured logger integration.

---

## 1. Basic Interceptor Structure

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap, map } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - now;
        console.log(`${method} ${url} — ${ms}ms`);
      }),
    );
  }
}
```

---

## 2. Response Transformation (Wrapping)

```typescript
// interceptors/transform.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data) => ({
        data,
        timestamp: new Date().toISOString(),
        path: req.url,
      })),
    );
  }
}

// Apply globally in main.ts
app.useGlobalInterceptors(new TransformInterceptor());
```

---

## 3. Request Logging with Context

```typescript
// interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { throwError } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, user } = req;
    const start = Date.now();

    this.logger.log(`→ ${method} ${url}`, { userId: user?.id, body });

    return next.handle().pipe(
      tap((response) => {
        const ms = Date.now() - start;
        this.logger.log(`← ${method} ${url} ${ms}ms`, { userId: user?.id });
      }),
      catchError((err) => {
        const ms = Date.now() - start;
        this.logger.error(`← ${method} ${url} ${ms}ms FAILED`, err.stack);
        return throwError(() => err);
      }),
    );
  }
}
```

---

## 4. Execution Time Header

```typescript
// interceptors/timing.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const res = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap(() => {
        res.setHeader("X-Response-Time", `${Date.now() - start}ms`);
      }),
    );
  }
}
```

---

## 5. Caching Interceptor Pattern

```typescript
// interceptors/cache.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(@Inject("REDIS_CLIENT") private readonly redis: RedisClient) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    if (req.method !== "GET") return next.handle();

    const key = `cache:${req.url}`;
    const cached = await this.redis.get(key);
    if (cached) return of(JSON.parse(cached));

    return next.handle().pipe(
      tap(async (data) => {
        await this.redis.setEx(key, 60, JSON.stringify(data));
      }),
    );
  }
}
```

---

## 6. Applying Interceptors

```typescript
import { UseInterceptors } from "@nestjs/common";

// 1. Global — main.ts
app.useGlobalInterceptors(new TransformInterceptor(), new LoggingInterceptor());

// 2. Global via module (with DI support)
// In AppModule providers:
{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }

// 3. Controller level
@Controller("users")
@UseInterceptors(TimingInterceptor)
export class UserController {}

// 4. Route level
@Get()
@UseInterceptors(HttpCacheInterceptor)
findAll() {}
```

---

## 7. Pino Logger Integration

```bash
npm install nestjs-pino pino-http
npm install --save-dev pino-pretty
```

```typescript
// app.module.ts
import { LoggerModule } from "nestjs-pino";

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === "production" ? "info" : "debug",
        transport: process.env.NODE_ENV !== "production" ? { target: "pino-pretty" } : undefined,
        redact: ["req.headers.authorization"], // mask sensitive headers
      },
    }),
  ],
})
export class AppModule {}

// Inject into a service
import { Logger } from "nestjs-pino";

@Injectable()
export class UserService {
  constructor(private readonly logger: Logger) {}

  async create(dto: CreateUserDto) {
    this.logger.log({ email: dto.email }, "Creating user");
    const user = await this.prisma.user.create({ data: dto });
    this.logger.log({ userId: user.id }, "User created");
    return user;
  }
}

// main.ts — use Pino as NestJS logger
import { Logger } from "nestjs-pino";
const app = await NestFactory.create(AppModule, { bufferLogs: true });
app.useLogger(app.get(Logger));
```

---

## 8. Best Practices

- **Use `APP_INTERCEPTOR`** — register global interceptors in the module so they participate in DI and can inject services
- **Keep interceptors single-purpose** — one interceptor per concern (logging, timing, caching, transformation)
- **Use structured logging** — log JSON objects (`{ userId, method, url, ms }`) rather than interpolated strings
- **Redact sensitive fields** — never log `Authorization` headers, passwords, or tokens
- **Use `catchError` in logging interceptors** — capture failed requests too, then re-throw the error
- **Avoid heavy logic in interceptors** — keep synchronous ops fast; use async sparingly
