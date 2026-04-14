---
name: nestjs-dependency-injection
description: "NestJS dependency injection — registering providers with useValue/useFactory/useClass/useExisting, custom injection tokens, provider scopes, and optional dependencies. Use when: registering custom providers; injecting values or factories; managing provider scopes; using token-based injection. DO NOT USE FOR: module structure (use nestjs-module-architecture skill); config loading (use nestjs-config-management skill)."
---

# NestJS Dependency Injection Skill

## Overview

Covers NestJS's DI container — provider registration patterns, injection tokens, provider scopes, and optional injection.

---

## 1. Standard Class Provider

```typescript
// The default pattern — NestJS infers the token from the class itself
@Module({
  providers: [UserService], // shorthand for { provide: UserService, useClass: UserService }
})
export class UserModule {}

// Injection is by class type
@Injectable()
export class UserController {
  constructor(private readonly userService: UserService) {}
}
```

---

## 2. useValue — Inject a Static Value

```typescript
// Inject a configuration object, mock, or constant
const JWT_CONFIG = { secret: process.env.JWT_SECRET, expiresIn: "7d" };

@Module({
  providers: [{ provide: "JWT_CONFIG", useValue: JWT_CONFIG }],
})
export class AuthModule {}

// Consume with @Inject
@Injectable()
export class AuthService {
  constructor(
    @Inject("JWT_CONFIG") private readonly jwtConfig: typeof JWT_CONFIG,
  ) {}
}
```

---

## 3. useFactory — Dynamic Provider

```typescript
// Run async logic; inject other providers into the factory
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: "REDIS_CLIENT",
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const client = createClient({ url: config.get("REDIS_URL") });
        await client.connect();
        return client;
      },
    },
  ],
  exports: ["REDIS_CLIENT"],
})
export class RedisModule {}

// Consume
@Injectable()
export class CacheService {
  constructor(
    @Inject("REDIS_CLIENT") private readonly redis: RedisClientType,
  ) {}
}
```

---

## 4. useClass — Conditionally Swap Implementation

```typescript
// Select a different class based on environment
const mailerProvider = {
  provide: MailerService,
  useClass:
    process.env.NODE_ENV === "test" ? MockMailerService : SmtpMailerService,
};

@Module({ providers: [mailerProvider], exports: [MailerService] })
export class MailerModule {}
```

---

## 5. useExisting — Alias an Existing Provider

```typescript
// Create an alias: LoggerService token → existing PinoLogger provider
@Module({
  providers: [PinoLogger, { provide: LoggerService, useExisting: PinoLogger }],
  exports: [LoggerService, PinoLogger],
})
export class LoggingModule {}
```

---

## 6. Symbol / InjectionToken Tokens

```typescript
// Use a Symbol or InjectionToken to avoid string collisions
import { InjectionToken } from "@nestjs/common";

export const MAILER_OPTIONS: InjectionToken = Symbol("MAILER_OPTIONS");

@Module({
  providers: [
    { provide: MAILER_OPTIONS, useValue: { from: "noreply@example.com" } },
    MailerService,
  ],
})
export class MailerModule {}

@Injectable()
export class MailerService {
  constructor(@Inject(MAILER_OPTIONS) private readonly opts: MailerOptions) {}
}
```

---

## 7. Provider Scopes

```typescript
import { Injectable, Scope } from "@nestjs/common";

// DEFAULT (singleton) — one instance for the whole app lifetime
@Injectable()
export class SingletonService {}

// REQUEST — new instance per incoming HTTP request
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}
}

// TRANSIENT — new instance each time it is injected
@Injectable({ scope: Scope.TRANSIENT })
export class TransientHelper {}
```

---

## 8. Optional Dependencies

```typescript
import { Optional } from "@nestjs/common";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly cache?: CacheService, // won't throw if not provided
  ) {}

  async findOne(id: string) {
    if (this.cache) {
      const cached = await this.cache.get(`user:${id}`);
      if (cached) return cached;
    }
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

---

## 9. Forwarding References (Circular DI)

```typescript
import { forwardRef, Inject } from "@nestjs/common";

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}
}
```

---

## 10. Best Practices

- **Prefer class tokens over strings** — use the class itself or a `Symbol`/`InjectionToken` to avoid typos and collisions
- **Use `useFactory` for async setup** — connect to Redis, warm caches, or load secrets before the app starts
- **Keep scope DEFAULT** — only use `REQUEST` or `TRANSIENT` when the use case genuinely requires per-request state
- **Export providers explicitly** — a provider is only available outside its module if listed in `exports`
- **Avoid `@Inject` on class tokens** — constructor parameter type inference handles it; `@Inject` is only needed for non-class tokens
