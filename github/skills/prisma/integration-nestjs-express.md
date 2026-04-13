---
name: prisma-integration-nestjs-express
description: "Prisma integration with NestJS and Express — setting up PrismaService in NestJS; creating a Prisma module; using Prisma in Express services and repositories. Use when: adding Prisma to a NestJS app; setting up Prisma in an Express project; creating a shared database service."
---

# Prisma Integration with NestJS & Express

## Overview

This skill covers how to integrate Prisma into NestJS (as a module/service) and Express (as a singleton service). The goal is to have a single, shared Prisma instance that connects once and is reused throughout the app.

---

## Part 1: NestJS Integration

### 1. Install Prisma

```bash
npm install @prisma/client
npm install --save-dev prisma

npx prisma init        # creates prisma/schema.prisma and .env
npx prisma migrate dev # run after defining your schema
```

### 2. Create `PrismaService`

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect(); // connect when the module initializes
  }

  async onModuleDestroy() {
    await this.$disconnect(); // disconnect when the app shuts down
  }
}
```

### 3. Create `PrismaModule`

```typescript
// src/prisma/prisma.module.ts
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global() // makes PrismaService available everywhere without re-importing
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### 4. Register in `AppModule`

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    PrismaModule, // register once globally
    UserModule,
  ],
})
export class AppModule {}
```

### 5. Use `PrismaService` in a NestJS Service

```typescript
// src/user/user.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true },
    });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async create(data: { email: string; name?: string }) {
    return this.prisma.user.create({ data });
  }

  async update(id: number, data: { name?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
```

### 6. Register the Service in a Feature Module

```typescript
// src/user/user.module.ts
import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
  controllers: [UserController],
  providers: [UserService],
  // No need to import PrismaModule here because it's @Global()
})
export class UserModule {}
```

---

## Part 2: Express Integration

### 1. Install Prisma

```bash
npm install @prisma/client
npm install --save-dev prisma

npx prisma init
npx prisma migrate dev
```

### 2. Create a Singleton Prisma Instance

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
```

### 3. Use in a Service

```typescript
// src/services/user.service.ts
import prisma from "../lib/prisma";

export const UserService = {
  async findAll() {
    return prisma.user.findMany({
      select: { id: true, email: true, name: true },
    });
  },

  async findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: { email: string; name?: string }) {
    return prisma.user.create({ data });
  },

  async update(id: number, data: { name?: string }) {
    return prisma.user.update({ where: { id }, data });
  },

  async remove(id: number) {
    return prisma.user.delete({ where: { id } });
  },
};
```

### 4. Use in a Route

```typescript
// src/routes/user.routes.ts
import { Router } from "express";
import { UserService } from "../services/user.service";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const users = await UserService.findAll();
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await UserService.findById(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
});

export default router;
```

### 5. Graceful Shutdown

```typescript
// src/index.ts
import app from "./app";
import prisma from "./lib/prisma";

const server = app.listen(3000, () => {
  console.log("Server running on port 3000");
});

// Disconnect Prisma on shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
```

---

## Key Rules

- **NestJS:** Use `@Global()` on `PrismaModule` so it's available app-wide without re-importing.
- **NestJS:** Implement `OnModuleInit` and `OnModuleDestroy` to manage the connection lifecycle.
- **Express:** Export a single `prisma` instance from `src/lib/prisma.ts` — never create multiple instances.
- **Both:** Always `$disconnect()` on application shutdown to avoid hanging connections.
- **Both:** Inject/import Prisma into services, not directly into route/controller handlers.
