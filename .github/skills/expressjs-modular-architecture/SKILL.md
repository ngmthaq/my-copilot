---
name: expressjs-modular-architecture
description: "Express.js modular architecture — structuring Express apps into modules with clear separation of concerns. Use when: organizing routes, services, repositories, middleware into modules; scaling project structure; separating business logic from HTTP layer; creating feature-based or domain-driven folder structures; wiring up dependency flow between layers. DO NOT USE FOR: middleware-specific patterns (use expressjs-middleware-architecture skill); error handling patterns (use expressjs-error-handling skill)."
---

# Express.js Modular Architecture Skill

## Overview

This skill covers structuring Express.js applications into clean, scalable modules — layered architecture (route → service → repository), feature-based organization, dependency flow, and project structure conventions. Apply it when users ask about organizing Express apps or scaling their project structure.

---

## 1. Layered Architecture Overview

```
Client Request
     │
     ▼
┌─────────────┐
│   Routes     │  ← Endpoint definitions: path, method, middleware chain
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Controllers  │  ← HTTP layer: parse req, call service, send res
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Services    │  ← Business logic: validation rules, orchestration, error throwing
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Repositories │  ← Data access: Prisma queries, database operations
└──────┬──────┘
       │
       ▼
   Database
```

### Rules

- **Routes** define endpoints, HTTP methods, and middleware chains — no logic
- **Controllers** handle HTTP concerns (parse `req`, call service, send `res`)
- **Services** contain business logic, throw `AppError` subclasses, know nothing about HTTP
- **Repositories** handle database operations, return raw data
- Dependencies flow **downward only**: Route → Controller → Service → Repository
- Never import a route from a controller, or a service from a repository

---

## 2. Project Structure

```
src/
├── index.ts                      # App entry point
├── app.ts                        # Express app setup (middleware, routes)
├── config/
│   ├── env.ts                    # Zod env validation
│   └── index.ts                  # Structured config object
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── logger.ts                 # Pino logger
│   └── audit-logger.ts          # Audit event logger
├── middleware/
│   ├── request-handler.ts        # Generic async request wrapper
│   ├── auth.ts                   # authenticate middleware
│   ├── authorize.ts              # authorize(...roles) factory
│   ├── validate.ts               # validate({ body, params, query }) factory
│   ├── request-id.ts             # Correlation ID
│   ├── request-logger.ts         # pino-http
│   ├── error-handler.ts          # Centralized error handler
│   └── not-found-handler.ts      # 404 catch-all
├── errors/
│   ├── app-error.ts              # Base AppError class
│   ├── http-errors.ts            # NotFound, Conflict, BadRequest, etc.
│   └── index.ts                  # Re-export all errors
├── dto/
│   ├── base.dto.ts               # Reusable field builders
│   └── common.dto.ts             # Pagination, ID params
├── modules/
│   ├── user/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   ├── list-user.dto.ts
│   │   │   └── index.ts          # Re-export all user DTOs
│   │   ├── user.route.ts         # Endpoint definitions + middleware chain
│   │   ├── user.controller.ts    # HTTP req/res handling
│   │   ├── user.service.ts       # User business logic
│   │   └── user.repository.ts    # User database queries
│   ├── post/
│   │   ├── dto/
│   │   │   ├── create-post.dto.ts
│   │   │   ├── update-post.dto.ts
│   │   │   ├── list-post.dto.ts
│   │   │   └── index.ts
│   │   ├── post.route.ts
│   │   ├── post.controller.ts
│   │   ├── post.service.ts
│   │   └── post.repository.ts
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   ├── refresh.dto.ts
│   │   │   └── index.ts
│   │   ├── auth.route.ts
│   │   ├── auth.controller.ts
│   │   └── auth.service.ts       # Auth uses user.repository directly
│   └── health/
│       └── health.route.ts       # Health check endpoints
├── types/
│   └── express.d.ts              # Request type extensions
└── utils/
    └── pagination.ts             # Shared utility functions
prisma.config.ts
prisma/
├── schema/
│   ├── base.prisma
│   ├── user.prisma
│   ├── post.prisma
│   ├── profile.prisma
│   └── category.prisma
├── migrations/
└── seed.ts
```

---

## 3. App Setup — `app.ts`

```typescript
// src/app.ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { config } from "./config";
import { requestId } from "./middleware/request-id";
import { requestLogger } from "./middleware/request-logger";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found-handler";
import { userRoutes } from "./modules/user/user.route";
import { postRoutes } from "./modules/post/post.route";
import { authRoutes } from "./modules/auth/auth.route";
import { healthRoutes } from "./modules/health/health.route";

const app = express();

// Pre-processing
app.use(requestId);
app.use(requestLogger);

// Security
app.use(helmet());
app.use(cors({ origin: config.cors.allowedOrigins, credentials: true }));

// Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
```

```typescript
// src/index.ts
import { app } from "./app";
import { config } from "./config";
import { prisma } from "./lib/prisma";
import { logger } from "./lib/logger";

const server = app.listen(config.app.port, config.app.host, () => {
  logger.info(
    `Server running on http://${config.app.host}:${config.app.port} [${config.app.nodeEnv}]`,
  );
});

async function gracefulShutdown() {
  logger.info("Shutting down...");
  await prisma.$disconnect();
  server.close();
  process.exit(0);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

process.on("unhandledRejection", (reason: Error) => {
  logger.error(reason, "UNHANDLED REJECTION");
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  logger.error(error, "UNCAUGHT EXCEPTION");
  process.exit(1);
});
```

---

## 4. Repository Layer

Repositories are thin wrappers around Prisma queries — no business logic:

```typescript
// src/modules/user/user.repository.ts
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export class UserRepository {
  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 20, where, orderBy } = params ?? {};
    return prisma.user.findMany({
      skip,
      take,
      where,
      orderBy,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profile: true,
        createdAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  async count(where?: Prisma.UserWhereInput) {
    return prisma.user.count({ where });
  }
}

export const userRepository = new UserRepository();
```

---

## 5. Service Layer

Services contain business logic, throw errors, and orchestrate repositories:

```typescript
// src/modules/user/user.service.ts
import bcrypt from "bcrypt";
import { userRepository } from "./user.repository";
import { NotFoundError, ConflictError } from "../../errors";
import { CreateUserInput, UpdateUserInput } from "./dto";
import { PaginationQuery } from "../../dto/common.dto";

export class UserService {
  async list(query: PaginationQuery) {
    const { page, limit, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      userRepository.findAll({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      userRepository.count(),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async create(data: CreateUserInput) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    return userRepository.create({ ...data, password: hashedPassword });
  }

  async update(id: string, data: UpdateUserInput) {
    await this.getById(id); // Throws NotFoundError if not found
    return userRepository.update(id, data);
  }

  async delete(id: string) {
    await this.getById(id);
    return userRepository.delete(id);
  }
}

export const userService = new UserService();
```

```typescript
// src/modules/post/post.service.ts
import { postRepository } from "./post.repository";
import { NotFoundError, ForbiddenError } from "../../errors";
import { CreatePostInput, UpdatePostInput } from "./dto";
import { ListPostsQuery } from "../../dto/common.dto";

export class PostService {
  async list(query: ListPostsQuery) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      published,
      authorId,
      categoryId,
    } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(published !== undefined && { published }),
      ...(authorId && { authorId }),
      ...(categoryId && { categories: { some: { id: categoryId } } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { content: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      postRepository.findAll({
        skip,
        take: limit,
        where,
        orderBy: { [sortBy]: sortOrder },
      }),
      postRepository.count(where),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const post = await postRepository.findById(id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }
    return post;
  }

  async create(data: CreatePostInput, authorId: string) {
    return postRepository.create({ ...data, authorId });
  }

  async update(id: string, data: UpdatePostInput, userId: string) {
    const post = await this.getById(id);
    if (post.authorId !== userId) {
      throw new ForbiddenError("Not the author of this post");
    }
    return postRepository.update(id, data);
  }

  async delete(id: string, userId: string, userRole: string) {
    const post = await this.getById(id);
    if (
      post.authorId !== userId &&
      userRole !== "ADMIN" &&
      userRole !== "SUPER_ADMIN"
    ) {
      throw new ForbiddenError("Access denied");
    }
    return postRepository.delete(id);
  }
}

export const postService = new PostService();
```

---

## 6. Controller Layer

Controllers handle HTTP concerns — parse `req`, call service, send `res`:

```typescript
// src/modules/user/user.controller.ts
import { requestHandler } from "../../middleware/request-handler";
import { userService } from "./user.service";
import { PaginationQuery } from "../../dto/common.dto";

export class UserController {
  list = requestHandler(async (req, res) => {
    const result = await userService.list(req.query as PaginationQuery);
    res.json(result);
  });

  getById = requestHandler(async (req, res) => {
    const user = await userService.getById(req.params.id);
    res.json({ data: user });
  });

  create = requestHandler(async (req, res) => {
    const user = await userService.create(req.body);
    res.status(201).json({ data: user });
  });

  update = requestHandler(async (req, res) => {
    const user = await userService.update(req.params.id, req.body);
    res.json({ data: user });
  });

  delete = requestHandler(async (req, res) => {
    await userService.delete(req.params.id);
    res.status(204).send();
  });
}

export const userController = new UserController();
```

```typescript
// src/modules/post/post.controller.ts
import { requestHandler } from "../../middleware/request-handler";
import { postService } from "./post.service";
import { ListPostsQuery } from "../../dto/common.dto";

export class PostController {
  list = requestHandler(async (req, res) => {
    const result = await postService.list(req.query as ListPostsQuery);
    res.json(result);
  });

  getById = requestHandler(async (req, res) => {
    const post = await postService.getById(req.params.id);
    res.json({ data: post });
  });

  create = requestHandler(async (req, res) => {
    const post = await postService.create(req.body, req.user!.userId);
    res.status(201).json({ data: post });
  });

  update = requestHandler(async (req, res) => {
    const post = await postService.update(req.params.id, req.body, req.user!.userId);
    res.json({ data: post });
  });

  delete = requestHandler(async (req, res) => {
    await postService.delete(req.params.id, req.user!.userId, req.user!.role);
    res.status(204).send();
  });
}

export const postController = new PostController();
```

```typescript
// src/modules/auth/auth.controller.ts
import { requestHandler } from "../../middleware/request-handler";
import { authService } from "./auth.service";

export class AuthController {
  register = requestHandler(async (req, res) => {
    const result = await authService.register(req.body);
    res.cookie("refreshToken", result.refreshToken, authService.cookieOptions());
    res.status(201).json({ accessToken: result.accessToken, user: result.user });
  });

  login = requestHandler(async (req, res) => {
    const result = await authService.login(req.body);
    res.cookie("refreshToken", result.refreshToken, authService.cookieOptions());
    res.json({ accessToken: result.accessToken, user: result.user });
  });

  refresh = requestHandler(async (req, res) => {
    const result = await authService.refresh(req.cookies.refreshToken);
    res.cookie("refreshToken", result.refreshToken, authService.cookieOptions());
    res.json({ accessToken: result.accessToken });
  });

  logout = requestHandler(async (req, res) => {
    await authService.logout(req.cookies.refreshToken);
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  });

  logoutAll = requestHandler(async (req, res) => {
    await authService.logoutAll(req.user!.userId);
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out from all devices" });
  });
}

export const authController = new AuthController();
```

---

## 7. Route Layer

Routes define endpoints, middleware chains, and point to controller methods — no logic:

```typescript
// src/modules/user/user.route.ts
import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { userController } from "./user.controller";
import { createUserSchema, updateUserSchema, getUserSchema } from "./dto";
import { paginationSchema } from "../../dto/common.dto";

const router = Router();

router.get("/", authenticate, validate({ query: paginationSchema }), userController.list);
router.get("/:id", authenticate, validate({ params: getUserSchema.params }), userController.getById);
router.post("/", authenticate, authorize("ADMIN", "SUPER_ADMIN"), validate({ body: createUserSchema.body }), userController.create);
router.put("/:id", authenticate, validate({ params: updateUserSchema.params, body: updateUserSchema.body }), userController.update);
router.delete("/:id", authenticate, authorize("ADMIN", "SUPER_ADMIN"), validate({ params: getUserSchema.params }), userController.delete);

export { router as userRoutes };
```

```typescript
// src/modules/post/post.route.ts
import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { postController } from "./post.controller";
import { createPostSchema, updatePostSchema } from "./dto";
import { listPostsSchema, idParamSchema } from "../../dto/common.dto";

const router = Router();

router.get("/", validate({ query: listPostsSchema.query }), postController.list);
router.get("/:id", validate({ params: idParamSchema }), postController.getById);
router.post("/", authenticate, validate({ body: createPostSchema.body }), postController.create);
router.put("/:id", authenticate, validate({ params: idParamSchema, body: updatePostSchema.body }), postController.update);
router.delete("/:id", authenticate, validate({ params: idParamSchema }), postController.delete);

export { router as postRoutes };
```

```typescript
// src/modules/auth/auth.route.ts
import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { authController } from "./auth.controller";
import { loginSchema, registerSchema } from "./dto";

const router = Router();

router.post("/register", validate({ body: registerSchema.body }), authController.register);
router.post("/login", validate({ body: loginSchema.body }), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);

export { router as authRoutes };
```

```typescript
// src/modules/health/health.route.ts
import { Router } from "express";
import { prisma } from "../../lib/prisma";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime() });
});

router.get("/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

export { router as healthRoutes };
```

---

## 8. Cross-Module Communication

When a service needs data from another module, import the **repository** or **service** — never the route:

```typescript
// src/modules/auth/auth.service.ts
import { userRepository } from "../user/user.repository"; // ✅ Import repository from another module

export class AuthService {
  async login(data: { email: string; password: string }) {
    const user = await userRepository.findByEmail(data.email);
    // ...
  }
}
```

```
✅ auth.service → user.repository    (service uses another module's repository)
✅ post.service → user.repository    (check user exists before assigning author)
✅ auth.service → user.service       (service uses another module's service)
❌ user.repository → user.service    (repository must NOT depend on service)
❌ user.service → user.route         (service must NOT depend on route)
```

---

## 9. Shared Utilities

```typescript
// src/utils/pagination.ts
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPreviousPage: page > 1,
  };
}
```

```typescript
// Usage in any service
import { buildPaginationMeta } from "../../utils/pagination";

const meta = buildPaginationMeta(total, query.page, query.limit);
return { data, meta };
```

---

## 10. Adding a New Module Checklist

When adding a new feature (e.g., `comment`):

1. **DTOs** — create `src/modules/comment/dto/` with `create-comment.dto.ts`, `update-comment.dto.ts`, `index.ts`
2. **Prisma model** — add `prisma/schema/comment.prisma`, run `prisma migrate dev`
3. **Repository** — create `src/modules/comment/comment.repository.ts`
4. **Service** — create `src/modules/comment/comment.service.ts`
5. **Controller** — create `src/modules/comment/comment.controller.ts`
6. **Route** — create `src/modules/comment/comment.route.ts`
7. **Mount** — add `app.use("/api/comments", commentRoutes)` in `app.ts`

Each file follows the same pattern as existing modules — copy `user.*` as a template.

---

## 11. Best Practices

- **Routes are declarative** — routes only define path, method, middleware, and controller method — zero logic
- **Controllers handle HTTP** — parse `req`, call service, send `res` — no business logic
- **Services handle business logic** — throw `AppError` subclasses, know nothing about `req`/`res`
- **Repositories handle data** — thin Prisma wrappers, no business rules
- **One module = one domain entity** — `user/`, `post/`, `auth/`, not `controllers/`, `models/`
- **Dependencies flow downward** — route → controller → service → repository, never upward
- **Cross-module via service or repository** — never import routes or controllers from another module
- **Export singletons** — `export const userController = new UserController()` at bottom of file
- **DTOs live inside modules** — `modules/user/dto/` with one file per operation; shared DTOs (pagination, ID params) go in `src/dto/`
- **Use `requestHandler`** in controllers — wraps each method, auto-catches async errors
- **Separate `app.ts` from `index.ts`** — `app.ts` exports the Express app (testable), `index.ts` starts the server
