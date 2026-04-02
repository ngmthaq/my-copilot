---
name: expressjs-database-integration
description: "Express.js database integration with Prisma ORM — setting up Prisma in Express apps, defining schemas, querying data, handling relations, transactions, and production best practices. Use when: connecting Express to PostgreSQL/MySQL/SQLite via Prisma; writing CRUD operations; managing database client lifecycle; structuring data access layers; handling connection pooling and error handling. DO NOT USE FOR: Prisma schema design in isolation (use prisma-schema-design skill); Prisma migrations (use prisma-migrations skill); raw SQL or non-Prisma ORMs."
---

# Express.js Database Integration with Prisma

## Overview

This skill covers integrating Prisma ORM into Express.js applications — client setup, CRUD operations, relations, transactions, error handling, and production-ready patterns. Apply it when users ask about connecting Express to a database using Prisma.

---

## 1. Project Setup

```bash
# Install Prisma
npm install prisma --save-dev
npm install @prisma/client

# Initialize Prisma
npx prisma init
```

### `.env`

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
```

### `prisma.config.ts` (root of project)

```typescript
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema"),
});
```

### Multi-File Schema (`prisma/schema/` folder)

```
prisma/
├── schema/
│   ├── base.prisma        # generator + datasource
│   ├── user.prisma         # User model + Role enum
│   ├── post.prisma         # Post model
│   ├── profile.prisma      # Profile model
│   └── category.prisma     # Category model
└── migrations/
```

### `prisma/schema/base.prisma`

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["prismaSchemaFolder"]
}

datasource db {
  provider = "postgresql" // or "mysql", "sqlite"
  url      = env("DATABASE_URL")
}
```

### `prisma/schema/user.prisma`

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      Role     @default(USER)
  posts     Post[]
  profile   Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

enum Role {
  USER
  MODERATOR
  ADMIN
  SUPER_ADMIN
}
```

### `prisma/schema/post.prisma`

```prisma
model Post {
  id          String     @id @default(cuid())
  title       String
  content     String?
  published   Boolean    @default(false)
  author      User       @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId    String
  categories  Category[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([authorId])
  @@map("posts")
}
```

### `prisma/schema/profile.prisma`

```prisma
model Profile {
  id     String  @id @default(cuid())
  bio    String?
  avatar String?
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String  @unique

  @@map("profiles")
}
```

### `prisma/schema/category.prisma`

```prisma
model Category {
  id    String @id @default(cuid())
  name  String @unique
  posts Post[]

  @@map("categories")
}
```

```bash
# Create and apply migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

---

## 2. Prisma Client Singleton

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### Graceful Shutdown

```typescript
// src/index.ts
import express from "express";
import { prisma } from "./lib/prisma";

const app = express();
const server = app.listen(3000);

async function gracefulShutdown() {
  await prisma.$disconnect();
  server.close();
  process.exit(0);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
```

---

## 3. Repository Pattern — Data Access Layer

```typescript
// src/repositories/user.repository.ts
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

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

```typescript
// src/repositories/post.repository.ts
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class PostRepository {
  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 20, where, orderBy } = params ?? {};
    return prisma.post.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: { select: { id: true, name: true } },
      },
    });
  }

  async findById(id: string) {
    return prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: { select: { id: true, name: true } },
      },
    });
  }

  async create(data: {
    title: string;
    content?: string;
    authorId: string;
    categoryIds?: string[];
  }) {
    return prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        author: { connect: { id: data.authorId } },
        categories: data.categoryIds
          ? { connect: data.categoryIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true } },
        categories: { select: { id: true, name: true } },
      },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      content?: string;
      published?: boolean;
      categoryIds?: string[];
    },
  ) {
    return prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        published: data.published,
        categories: data.categoryIds
          ? { set: data.categoryIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true } },
        categories: { select: { id: true, name: true } },
      },
    });
  }

  async delete(id: string) {
    return prisma.post.delete({ where: { id } });
  }

  async count(where?: Prisma.PostWhereInput) {
    return prisma.post.count({ where });
  }
}

export const postRepository = new PostRepository();
```

---

## 4. Express Routes with CRUD Operations

```typescript
// src/routes/user.routes.ts
import { Router, Request, Response } from "express";
import { userRepository } from "../repositories/user.repository";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// GET /api/users — list users (paginated)
router.get("/", authenticate, async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit as string) || 20),
  );
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    userRepository.findAll({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    userRepository.count(),
  ]);

  res.json({
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET /api/users/:id — get user by ID
router.get("/:id", authenticate, async (req: Request, res: Response) => {
  const user = await userRepository.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({ data: user });
});

// PUT /api/users/:id — update user
router.put("/:id", authenticate, async (req: Request, res: Response) => {
  const { name, email } = req.body;
  const user = await userRepository.update(req.params.id, { name, email });
  res.json({ data: user });
});

// DELETE /api/users/:id — delete user (admin only)
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  async (req: Request, res: Response) => {
    await userRepository.delete(req.params.id);
    res.status(204).send();
  },
);

export default router;
```

```typescript
// src/routes/post.routes.ts
import { Router, Request, Response } from "express";
import { postRepository } from "../repositories/post.repository";
import { authenticate } from "../middleware/auth";

const router = Router();

// GET /api/posts — list published posts (public)
router.get("/", async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit as string) || 20),
  );
  const skip = (page - 1) * limit;

  const search = req.query.search as string | undefined;
  const where = {
    published: true,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { content: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [posts, total] = await Promise.all([
    postRepository.findAll({
      skip,
      take: limit,
      where,
      orderBy: { createdAt: "desc" },
    }),
    postRepository.count(where),
  ]);

  res.json({
    data: posts,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/posts/:id — get post by ID
router.get("/:id", async (req: Request, res: Response) => {
  const post = await postRepository.findById(req.params.id);
  if (!post || !post.published) {
    return res.status(404).json({ error: "Post not found" });
  }
  res.json({ data: post });
});

// POST /api/posts — create post
router.post("/", authenticate, async (req: Request, res: Response) => {
  const { title, content, categoryIds } = req.body;
  const post = await postRepository.create({
    title,
    content,
    authorId: req.user!.userId,
    categoryIds,
  });
  res.status(201).json({ data: post });
});

// PUT /api/posts/:id — update post (author only)
router.put("/:id", authenticate, async (req: Request, res: Response) => {
  const existing = await postRepository.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Post not found" });
  }
  if (existing.authorId !== req.user!.userId) {
    return res.status(403).json({ error: "Not the author of this post" });
  }

  const { title, content, published, categoryIds } = req.body;
  const post = await postRepository.update(req.params.id, {
    title,
    content,
    published,
    categoryIds,
  });
  res.json({ data: post });
});

// DELETE /api/posts/:id — delete post (author or admin)
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  const existing = await postRepository.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Post not found" });
  }
  if (existing.authorId !== req.user!.userId && req.user!.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied" });
  }

  await postRepository.delete(req.params.id);
  res.status(204).send();
});

export default router;
```

### Mount Routes

```typescript
// src/index.ts
import express from "express";
import userRoutes from "./routes/user.routes";
import postRoutes from "./routes/post.routes";

const app = express();

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
```

---

## 5. Transactions

```typescript
import { prisma } from "../lib/prisma";

// Create user with profile in a single transaction
async function createUserWithProfile(data: {
  email: string;
  name: string;
  password: string;
  bio?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
      },
    });

    const profile = await tx.profile.create({
      data: {
        userId: user.id,
        bio: data.bio,
      },
    });

    return { user, profile };
  });
}

// Transfer post ownership (atomic)
async function transferPostOwnership(postId: string, newAuthorId: string) {
  return prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error("Post not found");

    const newAuthor = await tx.user.findUnique({ where: { id: newAuthorId } });
    if (!newAuthor) throw new Error("User not found");

    return tx.post.update({
      where: { id: postId },
      data: { authorId: newAuthorId },
    });
  });
}

// Batch operations with transaction
async function publishAllDraftsByAuthor(authorId: string) {
  return prisma.$transaction(async (tx) => {
    const drafts = await tx.post.findMany({
      where: { authorId, published: false },
    });

    await tx.post.updateMany({
      where: { authorId, published: false },
      data: { published: true },
    });

    return { publishedCount: drafts.length };
  });
}
```

---

## 6. Filtering, Sorting & Search

```typescript
// Flexible query builder for list endpoints
interface ListPostsQuery {
  page?: number;
  limit?: number;
  search?: string;
  authorId?: string;
  published?: boolean;
  categoryId?: string;
  sortBy?: "createdAt" | "title" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

async function listPosts(query: ListPostsQuery) {
  const {
    page = 1,
    limit = 20,
    search,
    authorId,
    published,
    categoryId,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const where: Prisma.PostWhereInput = {
    ...(published !== undefined && { published }),
    ...(authorId && { authorId }),
    ...(categoryId && { categories: { some: { id: categoryId } } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.post.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: { [sortBy]: sortOrder },
      include: {
        author: { select: { id: true, name: true } },
        categories: { select: { id: true, name: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
```

---

## 7. Prisma Error Handling Middleware

```typescript
import { Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

export function prismaErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        // Unique constraint violation
        const target = (err.meta?.target as string[]) || [];
        return res.status(409).json({
          error: `A record with this ${target.join(", ")} already exists`,
        });
      }
      case "P2025":
        // Record not found
        return res.status(404).json({ error: "Record not found" });
      case "P2003":
        // Foreign key constraint violation
        return res.status(400).json({ error: "Related record not found" });
      case "P2014":
        // Required relation violation
        return res.status(400).json({ error: "Required relation violation" });
      default:
        return res.status(400).json({ error: "Database operation failed" });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ error: "Invalid data provided" });
  }

  next(err);
}

// Mount after all routes
app.use(prismaErrorHandler);
```

---

## 8. Soft Delete Pattern

```typescript
// Add to schema.prisma:
// model User {
//   ...
//   deletedAt DateTime?
// }

// Prisma middleware for soft delete
prisma.$use(async (params, next) => {
  // Intercept delete → update with deletedAt
  if (params.action === "delete") {
    params.action = "update";
    params.args.data = { deletedAt: new Date() };
  }
  if (params.action === "deleteMany") {
    params.action = "updateMany";
    if (params.args.data) {
      params.args.data.deletedAt = new Date();
    } else {
      params.args.data = { deletedAt: new Date() };
    }
  }

  // Exclude soft-deleted records from reads
  if (params.action === "findFirst" || params.action === "findMany") {
    if (!params.args) params.args = {};
    if (!params.args.where) params.args.where = {};
    params.args.where.deletedAt = null;
  }

  return next(params);
});
```

---

## 9. Connection Pooling & Production Config

```typescript
// Production Prisma client with connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log:
    process.env.NODE_ENV === "production"
      ? ["error"]
      : ["query", "error", "warn"],
});

// Connection pool settings via DATABASE_URL query params:
// postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=30
```

### Health Check Endpoint

```typescript
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});
```

---

## 10. Project Structure

```
src/
├── index.ts                      # App entry point, server setup
├── app.ts                        # Express app setup
├── lib/
│   └── prisma.ts                 # ◄ Prisma client singleton
├── middleware/
│   ├── error-handler.ts          # ◄ Prisma error mapping
│   └── ...
├── modules/
│   ├── user/
│   │   ├── dto/
│   │   ├── user.route.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.repository.ts    # ◄ User Prisma queries
│   └── post/
│       ├── dto/
│       ├── post.route.ts
│       ├── post.controller.ts
│       ├── post.service.ts
│       └── post.repository.ts    # ◄ Post Prisma queries
├── types/
│   └── express.d.ts
└── ...
prisma.config.ts                  # ◄ Prisma configuration (schema path, etc.)
prisma/
├── schema/                       # ◄ Multi-file schema
│   ├── base.prisma               # Generator + datasource config
│   ├── user.prisma               # User model + Role enum
│   ├── post.prisma               # Post model
│   ├── profile.prisma            # Profile model
│   └── category.prisma           # Category model
├── migrations/                   # Migration files
└── seed.ts                       # Seed script
```

---

## 11. Best Practices

- **Use a Prisma client singleton** — avoid creating multiple instances (connection pool exhaustion)
- **Always use `select` or `include`** — never return all fields, especially `password`
- **Use the repository pattern** — isolate database logic from route handlers
- **Handle Prisma errors centrally** — map error codes to HTTP status codes in middleware
- **Use transactions** for operations that must succeed or fail together
- **Set `onDelete: Cascade`** on relations where child records should be removed with the parent
- **Add `@@index`** on frequently queried foreign keys and filter columns
- **Use pagination everywhere** — never return unbounded result sets
- **Split models into separate `.prisma` files** under `prisma/schema/` — one model per file for clarity
- **Use `prisma.config.ts`** to configure schema path and early access features
- **Run `prisma generate`** after every schema change
- **Gracefully disconnect** on process shutdown (`prisma.$disconnect()`)

---

## 12. Required Packages

```bash
npm install @prisma/client
npm install -D prisma
```
