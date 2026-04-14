---
name: nestjs-service-layer
description: "NestJS service layer — implementing business logic as @Injectable services, composing repositories, handling domain errors, and separating concerns from controllers. Use when: writing business logic; composing multiple repositories or services; managing domain rules. DO NOT USE FOR: controller routing (use nestjs-controller-design skill); database setup (use nestjs-database-integration skill)."
---

# NestJS Service Layer Skill

## Overview

Covers writing well-structured NestJS services — business logic, error handling, composition, and clean separation from controllers.

---

## 1. Basic Service

```typescript
// user/user.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(dto: CreateUserDto) {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException("Email already in use");
    return this.prisma.user.create({ data: dto });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id); // throws NotFoundException if not found
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
  }
}
```

---

## 2. Composing Services

```typescript
// post/post.service.ts
@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService, // injected from UserModule
  ) {}

  async create(dto: CreatePostDto) {
    // Validate author exists via UserService (reuse logic, not query)
    await this.userService.findOne(dto.authorId);
    return this.prisma.post.create({ data: dto });
  }
}
```

---

## 3. Domain Error Handling

```typescript
// Throw NestJS HTTP exceptions from the service layer —
// the framework maps them to correct HTTP status codes automatically.
import {
  NotFoundException,       // 404
  ConflictException,       // 409
  ForbiddenException,      // 403
  UnauthorizedException,   // 401
  BadRequestException,     // 400
  UnprocessableEntityException, // 422
  InternalServerErrorException, // 500
} from "@nestjs/common";

async transferOwnership(postId: string, requesterId: string, newOwnerId: string) {
  const post = await this.findOne(postId); // 404 if missing
  if (post.authorId !== requesterId) {
    throw new ForbiddenException("Only the author can transfer ownership");
  }
  await this.userService.findOne(newOwnerId); // 404 if target user missing
  return this.prisma.post.update({
    where: { id: postId },
    data: { authorId: newOwnerId },
  });
}
```

---

## 4. Transactions

```typescript
// Use Prisma interactive transactions to keep operations atomic
async createUserWithProfile(dto: CreateUserWithProfileDto) {
  return this.prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: dto.email, name: dto.name },
    });
    const profile = await tx.profile.create({
      data: { userId: user.id, bio: dto.bio },
    });
    return { ...user, profile };
  });
}
```

---

## 5. Pagination

```typescript
async findAll(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    this.prisma.user.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
    this.prisma.user.count(),
  ]);
  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
```

---

## 6. Async Initialization (onModuleInit)

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClient;

  async onModuleInit() {
    this.client = await createRedisClient();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
```

---

## 7. Event-Driven Services

```typescript
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  async create(dto: CreateUserDto) {
    const user = await this.prisma.user.create({ data: dto });
    this.events.emit("user.created", user); // decoupled side effects
    return user;
  }
}

// Listener in a separate service
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class EmailService {
  @OnEvent("user.created")
  async handleUserCreated(user: User) {
    await this.sendWelcomeEmail(user.email);
  }
}
```

---

## 8. Best Practices

- **One service per feature** — colocate with its module; split only when size warrants
- **Services own the domain** — all business rules live in services, never in controllers
- **Throw HTTP exceptions** — NestJS exception filters translate them correctly to REST responses
- **Reuse `findOne` internally** — call `this.findOne(id)` before update/delete to avoid duplicate queries and centralise error messages
- **Keep services testable** — inject all dependencies; never instantiate external clients directly
- **Use `$transaction` for multi-step writes** — never issue dependent writes outside a transaction
