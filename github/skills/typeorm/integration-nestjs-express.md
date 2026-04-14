---
name: typeorm-integration-nestjs-express
description: "TypeORM integration with NestJS and Express — setting up TypeOrmModule in NestJS; using @InjectRepository; creating a DataSource for Express; using repositories in services. Use when: adding TypeORM to a NestJS app; setting up TypeORM in an Express project; creating a shared database connection."
---

# TypeORM Integration with NestJS & Express

## Overview

This skill covers how to integrate TypeORM into NestJS (via `TypeOrmModule`) and Express (via a shared `DataSource`). The goal is a single, shared database connection used throughout the app.

---

## Part 1: NestJS Integration

### 1. Install TypeORM

```bash
npm install @nestjs/typeorm typeorm pg
# or: mysql2, better-sqlite3, etc.
```

### 2. Register `TypeOrmModule` in `AppModule`

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Post } from "./entities/post.entity";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Post], // list all entities here
      synchronize: false, // always false in production
      migrations: ["dist/migrations/**/*.js"],
      migrationsRun: true, // auto-run pending migrations on startup
    }),
    UserModule,
  ],
})
export class AppModule {}
```

### 3. Register Entities in Feature Modules

```typescript
// src/user/user.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
  imports: [TypeOrmModule.forFeature([User])], // makes UserRepository injectable
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

### 4. Inject Repository in Service

```typescript
// src/user/user.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.userRepository.find({
      select: { id: true, email: true, name: true },
    });
  }

  async findById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async create(data: Partial<User>) {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async update(id: number, data: Partial<User>) {
    await this.findById(id); // throws NotFoundException if missing
    await this.userRepository.update(id, data);
    return this.findById(id);
  }

  async remove(id: number) {
    await this.findById(id);
    await this.userRepository.delete(id);
  }
}
```

### 5. Inject `DataSource` for Transactions

```typescript
// src/order/order.service.ts
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class OrderService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createOrder(userId: number, productId: number, quantity: number) {
    return this.dataSource.transaction(async (manager) => {
      // transactional operations here
    });
  }
}
```

### 6. Using Environment Variables with `ConfigModule`

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get("DB_HOST"),
        port: config.get<number>("DB_PORT"),
        username: config.get("DB_USER"),
        password: config.get("DB_PASSWORD"),
        database: config.get("DB_NAME"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: false,
        migrationsRun: true,
      }),
    }),
  ],
})
export class AppModule {}
```

---

## Part 2: Express Integration

### 1. Install TypeORM

```bash
npm install typeorm reflect-metadata pg
# Add to the top of your main entry file:
# import "reflect-metadata";
```

### 2. Create the `DataSource`

```typescript
// src/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/user.entity";
import { Post } from "./entities/post.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Post],
  migrations: ["src/migrations/**/*.ts"],
  synchronize: false,
});
```

### 3. Initialize on App Startup

```typescript
// src/index.ts
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import app from "./app";

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(3000, () => console.log("Server running on port 3000"));
  })
  .catch((err) => {
    console.error("Database connection failed", err);
    process.exit(1);
  });
```

### 4. Use in a Service

```typescript
// src/services/user.service.ts
import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";

const userRepository = AppDataSource.getRepository(User);

export const UserService = {
  async findAll() {
    return userRepository.find({
      select: { id: true, email: true, name: true },
    });
  },

  async findById(id: number) {
    return userRepository.findOne({ where: { id } });
  },

  async create(data: Partial<User>) {
    const user = userRepository.create(data);
    return userRepository.save(user);
  },

  async update(id: number, data: Partial<User>) {
    await userRepository.update(id, data);
    return userRepository.findOne({ where: { id } });
  },

  async remove(id: number) {
    await userRepository.delete(id);
  },
};
```

### 5. Graceful Shutdown

```typescript
// src/index.ts
const server = app.listen(3000);

process.on("SIGINT", async () => {
  await AppDataSource.destroy(); // close all connections
  server.close(() => process.exit(0));
});

process.on("SIGTERM", async () => {
  await AppDataSource.destroy();
  server.close(() => process.exit(0));
});
```

---

## Key Rules

- **NestJS:** Use `TypeOrmModule.forFeature([Entity])` in each feature module to make the repository injectable.
- **NestJS:** Use `@InjectDataSource()` to inject the `DataSource` when you need transactions.
- **Express:** Export a single `AppDataSource` — call `initialize()` once on startup.
- **Both:** Set `synchronize: false` in all non-local environments — use migrations instead.
- **Both:** Call `DataSource.destroy()` on application shutdown to close connections cleanly.
- Always import `reflect-metadata` at the top of your app entry point before any TypeORM code.
