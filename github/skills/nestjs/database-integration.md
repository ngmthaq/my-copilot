---
name: nestjs-database-integration
description: "NestJS database integration — connecting PostgreSQL/MySQL with Prisma or TypeORM, setting up a global database module, repository pattern, async configuration, and health checks. Use when: connecting a database to NestJS; setting up repository/entity patterns; configuring a database module. DO NOT USE FOR: Prisma-specific query patterns (use prisma-client-queries skill); schema design (use prisma-schema-design skill)."
---

# NestJS Database Integration Skill

## Overview

Covers connecting a database to NestJS with Prisma (recommended) or TypeORM — module setup, repositories, global access, and health checks.

---

## 1. Prisma Integration

### Install

```bash
npm install @prisma/client
npm install --save-dev prisma
npx prisma init
```

### PrismaService

```typescript
// database/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### DatabaseModule (Global)

```typescript
// database/database.module.ts
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}

// app.module.ts
@Module({
  imports: [DatabaseModule, UserModule],
})
export class AppModule {}
```

### Usage in a Service

```typescript
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  create(data: CreateUserDto) {
    return this.prisma.user.create({ data });
  }

  update(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
```

---

## 2. TypeORM Integration

### Install

```bash
npm install @nestjs/typeorm typeorm pg   # PostgreSQL; swap pg for mysql2 etc.
```

### Module Setup

```typescript
// app.module.ts
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        url: config.getOrThrow("DATABASE_URL"),
        autoLoadEntities: true, // auto-register entities from forFeature()
        synchronize: config.get("NODE_ENV") !== "production", // never true in prod
      }),
    }),
    UserModule,
  ],
})
export class AppModule {}
```

### Entity

```typescript
// user/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ select: false }) // exclude from default queries
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Repository in a Feature Module

```typescript
// user/user.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User])], // registers UserRepository
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

// user/user.service.ts
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: string) {
    return this.userRepository.findOneByOrFail({ id });
  }

  create(dto: CreateUserDto) {
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.userRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }
}
```

---

## 3. Database Health Check

```bash
npm install @nestjs/terminus
```

```typescript
// health/health.module.ts
import { TerminusModule } from "@nestjs/terminus";
import { PrismaHealthIndicator } from "./prisma.health";

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
})
export class HealthModule {}

// health/prisma.health.ts
import { Injectable } from "@nestjs/common";
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from "@nestjs/terminus";

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch (err) {
      throw new HealthCheckError(
        "Prisma check failed",
        this.getStatus(key, false),
      );
    }
  }
}

// health/health.controller.ts
import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.prismaHealth.isHealthy("database")]);
  }
}
```

---

## 4. Best Practices

- **Use Prisma for new projects** — type-safe queries, auto-generated client, and excellent migration tooling
- **Mark `PrismaService` as `@Global()`** — available everywhere without repeated imports
- **Never use `synchronize: true` in production** — use Prisma Migrate or TypeORM migrations instead
- **Use `autoLoadEntities: true`** with TypeORM — avoids having to import every entity in the root module
- **Add a health check endpoint** — expose `/health` with a DB ping; useful for load balancers and Kubernetes probes
- **Handle `PrismaClientKnownRequestError`** — use an exception filter to map P2002/P2025 to HTTP 409/404
