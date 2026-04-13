---
name: nestjs-module-architecture
description: "NestJS module architecture — feature modules, shared modules, global modules, dynamic modules with forRoot/forFeature, circular dependency resolution, and lazy-loaded modules. Use when: structuring a NestJS app; sharing providers; building reusable modules. DO NOT USE FOR: controller routing (use nestjs-controller-design skill); DI mechanics (use nestjs-dependency-injection skill)."
---

# NestJS Module Architecture Skill

## Overview

Covers how to structure an application with NestJS modules — feature modules, shared modules, global modules, and dynamic module patterns.

---

## 1. Feature Module

```typescript
// user/user.module.ts
import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [], // other modules whose exports this module needs
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // make UserService available to importing modules
})
export class UserModule {}
```

---

## 2. Root App Module

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { PostModule } from "./post/post.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, UserModule, PostModule],
})
export class AppModule {}
```

---

## 3. Shared Module

```typescript
// shared/shared.module.ts — provides utilities reused by many feature modules
import { Module } from "@nestjs/common";
import { HashService } from "./hash.service";
import { EmailService } from "./email.service";

@Module({
  providers: [HashService, EmailService],
  exports: [HashService, EmailService], // must export what others need
})
export class SharedModule {}

// feature module consuming SharedModule
@Module({
  imports: [SharedModule],
  providers: [UserService],
})
export class UserModule {}
```

---

## 4. Global Module

```typescript
// database/database.module.ts — registered once, no need to import everywhere
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}

// Any module can now inject PrismaService without importing DatabaseModule
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
}
```

---

## 5. Dynamic Module — forRoot / forFeature

```typescript
// notifications/notifications.module.ts
import { DynamicModule, Module, ModuleMetadata } from "@nestjs/common";

export interface NotificationsOptions {
  transport: "email" | "sms";
  apiKey: string;
}

@Module({})
export class NotificationsModule {
  // App-level config (called in AppModule)
  static forRoot(options: NotificationsOptions): DynamicModule {
    return {
      module: NotificationsModule,
      global: true,
      providers: [{ provide: "NOTIFICATIONS_OPTIONS", useValue: options }, NotificationsService],
      exports: [NotificationsService],
    };
  }

  // Feature-level override (called in a feature module)
  static forFeature(channelId: string): DynamicModule {
    return {
      module: NotificationsModule,
      providers: [{ provide: "CHANNEL_ID", useValue: channelId }],
      exports: [],
    };
  }
}

// Usage in AppModule
@Module({
  imports: [NotificationsModule.forRoot({ transport: "email", apiKey: "..." })],
})
export class AppModule {}
```

---

## 6. Async Dynamic Module (forRootAsync)

```typescript
@Module({})
export class NotificationsModule {
  static forRootAsync(options: {
    useFactory: (...args: unknown[]) => NotificationsOptions;
    inject?: unknown[];
    imports?: ModuleMetadata["imports"];
  }): DynamicModule {
    return {
      module: NotificationsModule,
      global: true,
      imports: options.imports ?? [],
      providers: [
        {
          provide: "NOTIFICATIONS_OPTIONS",
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        NotificationsService,
      ],
      exports: [NotificationsService],
    };
  }
}

// Usage — pulls config from ConfigService
NotificationsModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    transport: config.get("NOTIF_TRANSPORT"),
    apiKey: config.get("NOTIF_API_KEY"),
  }),
});
```

---

## 7. Circular Dependency Resolution

```typescript
// When ModuleA imports ModuleB and ModuleB imports ModuleA
// user/user.module.ts
import { forwardRef, Module } from "@nestjs/common";

@Module({
  imports: [forwardRef(() => PostModule)], // break the cycle
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

// post/post.module.ts
@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}

// Inject with forwardRef in the service too
@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
  ) {}
}
```

---

## 8. Recommended Folder Structure

```
src/
├── app.module.ts
├── main.ts
├── common/                    # Shared utilities, decorators, guards
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── config/                    # ConfigModule setup
│   └── config.module.ts
├── database/                  # Prisma / TypeORM / Mongoose module
│   ├── database.module.ts
│   └── prisma.service.ts
├── user/                      # Feature module
│   ├── user.module.ts
│   ├── user.controller.ts
│   ├── user.service.ts
│   ├── dto/
│   └── entities/
└── post/
    ├── post.module.ts
    ├── post.controller.ts
    ├── post.service.ts
    ├── dto/
    └── entities/
```

---

## 9. Best Practices

- **One module per feature** — keep controllers, services, and DTOs inside their feature folder
- **Export only what is needed** — don't export everything; only export what consumers require
- **Use `@Global()` sparingly** — only for infrastructure modules (DB, config, logging) used everywhere
- **Prefer `forRootAsync`** — use async dynamic modules when configuration depends on `ConfigService`
- **Avoid circular imports** — prefer extracting shared logic into a third module instead of `forwardRef`
- **Import `SharedModule` in each feature** — do not rely on transitive imports; always import explicitly
