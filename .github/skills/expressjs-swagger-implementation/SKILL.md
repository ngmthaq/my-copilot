---
name: expressjs-swagger-implementation
description: "Express.js Swagger/OpenAPI implementation — auto-generating OpenAPI 3.0 docs from Zod schemas using zod-to-openapi. Use when: adding API documentation; generating OpenAPI specs from existing Zod DTOs; registering routes programmatically; serving Swagger UI; documenting auth, pagination, error responses. DO NOT USE FOR: API design patterns (use expressjs-rest-api-design skill); input validation schemas (use expressjs-input-validation skill)."
---

# Express.js Swagger Implementation Skill

## Overview

This skill covers auto-generating OpenAPI 3.0 documentation from Zod schemas using `@asteasolutions/zod-to-openapi` — register your existing DTOs, define routes programmatically, and serve Swagger UI. No JSDoc annotations or YAML files needed. Apply it when users ask about API documentation or Swagger in Express apps.

---

## 1. Setup

```bash
npm install @asteasolutions/zod-to-openapi swagger-ui-express
npm install -D @types/swagger-ui-express
```

---

## 2. Extend Zod with OpenAPI

```typescript
// src/lib/zod.ts
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export { z };
```

> **Important:** Import `z` from this file instead of `"zod"` throughout your app. This adds `.openapi()` method to all Zod schemas.

---

## 3. Register Schemas in DTOs

Add `.openapi()` to your existing Zod schemas to give them names and descriptions:

### Shared DTOs

```typescript
// src/dto/common.dto.ts
import { z } from "../lib/zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z
    .enum(["createdAt", "updatedAt", "name", "title"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const idParamSchema = z.object({
  id: z.string().cuid("Invalid ID format"),
});

export const paginationMetaSchema = z
  .object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  })
  .openapi("PaginationMeta");

export const errorSchema = z
  .object({
    status: z.literal("error"),
    code: z.string(),
    message: z.string(),
  })
  .openapi("Error");

export const validationErrorSchema = z
  .object({
    status: z.literal("error"),
    code: z.literal("VALIDATION_ERROR"),
    message: z.string(),
    errors: z.record(z.array(z.string())),
  })
  .openapi("ValidationError");

export type PaginationQuery = z.infer<typeof paginationSchema>;
```

### User DTOs

```typescript
// src/modules/user/dto/create-user.dto.ts
import { z } from "../../../lib/zod";

export const createUserSchema = {
  body: z
    .object({
      email: z.string().email().toLowerCase().trim(),
      password: z.string().min(8).max(128),
      name: z.string().min(1).max(100).trim(),
    })
    .openapi("CreateUserInput"),
};

export type CreateUserInput = z.infer<typeof createUserSchema.body>;
```

```typescript
// src/modules/user/dto/update-user.dto.ts
import { z } from "../../../lib/zod";

export const updateUserSchema = {
  body: z
    .object({
      name: z.string().min(1).max(100).trim().optional(),
      email: z.string().email().toLowerCase().trim().optional(),
    })
    .openapi("UpdateUserInput"),
};

export type UpdateUserInput = z.infer<typeof updateUserSchema.body>;
```

### User Response Schema

```typescript
// src/modules/user/dto/user-response.dto.ts
import { z } from "../../../lib/zod";

export const userSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    role: z.enum(["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"]),
    createdAt: z.string().datetime(),
  })
  .openapi("User");

export const userSummarySchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .openapi("UserSummary");
```

### Post DTOs

```typescript
// src/modules/post/dto/create-post.dto.ts
import { z } from "../../../lib/zod";

export const createPostSchema = {
  body: z
    .object({
      title: z.string().min(1).max(200).trim(),
      content: z.string().max(50000).optional(),
      categoryIds: z.array(z.string().cuid()).max(10).optional(),
      published: z.boolean().default(false),
    })
    .openapi("CreatePostInput"),
};

export type CreatePostInput = z.infer<typeof createPostSchema.body>;
```

```typescript
// src/modules/post/dto/post-response.dto.ts
import { z } from "../../../lib/zod";

export const postSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    content: z.string().nullable(),
    published: z.boolean(),
    authorId: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("Post");
```

### Auth DTOs

```typescript
// src/modules/auth/dto/login.dto.ts
import { z } from "../../../lib/zod";

export const loginSchema = {
  body: z
    .object({
      email: z.string().email(),
      password: z.string(),
    })
    .openapi("LoginInput"),
};
```

```typescript
// src/modules/auth/dto/auth-response.dto.ts
import { z } from "../../../lib/zod";
import { userSchema } from "../../user/dto/user-response.dto";

export const authResponseSchema = z
  .object({
    accessToken: z.string(),
    user: userSchema,
  })
  .openapi("AuthResponse");
```

---

## 4. OpenAPI Registry (Standalone)

The registry lives in its own file — no imports from `swagger.ts`, so `*.docs.ts` files can safely import it without circular dependencies.

```typescript
// src/lib/openapi-registry.ts
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const registry = new OpenAPIRegistry();

// ── Security scheme ─────────────────────────────
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// ── Reusable parameters ─────────────────────────
registry.registerParameter("Page", {
  in: "query",
  name: "page",
  schema: { type: "integer", default: 1 },
});
registry.registerParameter("Limit", {
  in: "query",
  name: "limit",
  schema: { type: "integer", default: 20, maximum: 100 },
});
registry.registerParameter("SortBy", {
  in: "query",
  name: "sortBy",
  schema: {
    type: "string",
    enum: ["createdAt", "updatedAt", "name", "title"],
    default: "createdAt",
  },
});
registry.registerParameter("SortOrder", {
  in: "query",
  name: "sortOrder",
  schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
});
registry.registerParameter("ResourceId", {
  in: "path",
  name: "id",
  required: true,
  schema: { type: "string" },
});
```

```
Dependency flow (no cycles):

  openapi-registry.ts    ← standalone, no app imports
         ↑
   *.docs.ts files       ← import registry from openapi-registry.ts
         ↑
     swagger.ts          ← imports *.docs.ts, uses registry to generate spec
         ↑
       app.ts            ← imports swaggerSpec from swagger.ts
```

---

## 5. Register Routes by Module

### User Routes

```typescript
// src/modules/user/user.docs.ts
import { registry } from "../../lib/openapi-registry";
import { z } from "../../lib/zod";
import { createUserSchema, updateUserSchema } from "./dto";
import { userSchema } from "./dto/user-response.dto";
import {
  paginationMetaSchema,
  errorSchema,
  validationErrorSchema,
} from "../../dto/common.dto";

registry.registerPath({
  method: "get",
  path: "/api/users",
  tags: ["Users"],
  summary: "List users",
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      page: z.coerce.number().optional(),
      limit: z.coerce.number().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
  },
  responses: {
    200: {
      description: "Paginated list of users",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(userSchema),
            meta: paginationMetaSchema,
          }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: errorSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/users/{id}",
  tags: ["Users"],
  summary: "Get user by ID",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "User details",
      content: {
        "application/json": { schema: z.object({ data: userSchema }) },
      },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/users",
  tags: ["Users"],
  summary: "Create a new user",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: createUserSchema.body } },
    },
  },
  responses: {
    201: {
      description: "User created",
      content: {
        "application/json": { schema: z.object({ data: userSchema }) },
      },
    },
    409: {
      description: "Conflict",
      content: { "application/json": { schema: errorSchema } },
    },
    422: {
      description: "Validation error",
      content: { "application/json": { schema: validationErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/users/{id}",
  tags: ["Users"],
  summary: "Update a user",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { "application/json": { schema: updateUserSchema.body } },
    },
  },
  responses: {
    200: {
      description: "User updated",
      content: {
        "application/json": { schema: z.object({ data: userSchema }) },
      },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorSchema } },
    },
    422: {
      description: "Validation error",
      content: { "application/json": { schema: validationErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/users/{id}",
  tags: ["Users"],
  summary: "Delete a user",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: "User deleted" },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorSchema } },
    },
  },
});
```

### Auth Routes

```typescript
// src/modules/auth/auth.docs.ts
import { registry } from "../../lib/openapi-registry";
import { loginSchema } from "./dto";
import { authResponseSchema } from "./dto/auth-response.dto";
import { createUserSchema } from "../user/dto";
import { errorSchema, validationErrorSchema } from "../../dto/common.dto";

registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  request: {
    body: {
      content: { "application/json": { schema: createUserSchema.body } },
    },
  },
  responses: {
    201: {
      description: "User registered",
      content: { "application/json": { schema: authResponseSchema } },
    },
    409: {
      description: "Conflict",
      content: { "application/json": { schema: errorSchema } },
    },
    422: {
      description: "Validation error",
      content: { "application/json": { schema: validationErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: ["Auth"],
  summary: "Login",
  request: {
    body: { content: { "application/json": { schema: loginSchema.body } } },
  },
  responses: {
    200: {
      description: "Login successful",
      content: { "application/json": { schema: authResponseSchema } },
    },
    401: {
      description: "Invalid credentials",
      content: { "application/json": { schema: errorSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/refresh",
  tags: ["Auth"],
  summary: "Refresh access token",
  description: "Uses the refresh token from the httpOnly cookie.",
  responses: {
    200: {
      description: "New access token",
      content: {
        "application/json": {
          schema: z.object({ accessToken: z.string() }),
        },
      },
    },
    401: {
      description: "Invalid refresh token",
      content: { "application/json": { schema: errorSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/logout",
  tags: ["Auth"],
  summary: "Logout",
  responses: {
    200: {
      description: "Logged out",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});
```

---

## 6. Generate the OpenAPI Spec

```typescript
// src/lib/swagger.ts
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./openapi-registry";
import { config } from "../config";

// Import all docs files (registers routes on the shared registry)
import "../modules/user/user.docs";
import "../modules/post/post.docs";
import "../modules/auth/auth.docs";

const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerSpec = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "My API",
    version: "1.0.0",
    description: "REST API documentation",
  },
  servers: [
    {
      url: `http://${config.app.host}:${config.app.port}`,
      description: config.app.nodeEnv,
    },
  ],
  tags: [
    { name: "Auth", description: "Authentication & registration" },
    { name: "Users", description: "User management" },
    { name: "Posts", description: "Blog post operations" },
  ],
});
```

---

## 7. Serve Swagger UI

```typescript
// src/app.ts
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./lib/swagger";

// Serve Swagger UI
if (!config.app.isProduction) {
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: "My API Docs",
    }),
  );

  // Serve raw OpenAPI JSON spec
  app.get("/api/docs.json", (_req, res) => {
    res.json(swaggerSpec);
  });
}
```

### Protecting Docs in Production

```typescript
import basicAuth from "express-basic-auth";

if (config.app.isProduction) {
  app.use(
    "/api/docs",
    basicAuth({
      users: { admin: config.swagger.password },
      challenge: true,
    }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec),
  );
} else {
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { explorer: true }),
  );
}
```

---

## 8. Full Example

```typescript
// src/lib/openapi-registry.ts
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});
```

```typescript
// src/lib/swagger.ts
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./openapi-registry";
import { config } from "../config";

// Import docs (registers all routes on the registry)
import "../modules/user/user.docs";
import "../modules/post/post.docs";
import "../modules/auth/auth.docs";

// Generate spec
const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerSpec = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "My API",
    version: "1.0.0",
    description: "REST API documentation",
  },
  servers: [
    {
      url: `http://${config.app.host}:${config.app.port}`,
      description: config.app.nodeEnv,
    },
  ],
  tags: [
    { name: "Auth", description: "Authentication & registration" },
    { name: "Users", description: "User management" },
    { name: "Posts", description: "Blog post operations" },
  ],
});
```

---

## 9. Project Structure

```
src/
├── index.ts
├── app.ts                            # ◄ Mount Swagger UI
├── lib/
│   ├── zod.ts                        # ◄ Extend Zod with OpenAPI
│   ├── openapi-registry.ts           # ◄ Registry singleton (no app imports)
│   └── swagger.ts                    # ◄ Imports docs, generates spec
├── dto/
│   ├── base.dto.ts                   # Reusable fields (uses lib/zod)
│   └── common.dto.ts                 # ◄ PaginationMeta, Error schemas with .openapi()
├── modules/
│   ├── user/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts    # ◄ .openapi("CreateUserInput")
│   │   │   ├── update-user.dto.ts    # ◄ .openapi("UpdateUserInput")
│   │   │   ├── user-response.dto.ts  # ◄ .openapi("User")
│   │   │   └── index.ts
│   │   ├── user.docs.ts              # ◄ registerPath() for all user routes
│   │   ├── user.route.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.repository.ts
│   ├── post/
│   │   ├── dto/
│   │   │   ├── create-post.dto.ts
│   │   │   ├── post-response.dto.ts
│   │   │   └── index.ts
│   │   ├── post.docs.ts              # ◄ registerPath() for all post routes
│   │   ├── post.route.ts
│   │   ├── post.controller.ts
│   │   ├── post.service.ts
│   │   └── post.repository.ts
│   └── auth/
│       ├── dto/
│       │   ├── login.dto.ts
│       │   ├── auth-response.dto.ts
│       │   └── index.ts
│       ├── auth.docs.ts              # ◄ registerPath() for all auth routes
│       ├── auth.route.ts
│       └── auth.controller.ts
└── ...
```

---

## 10. Best Practices

- **Import `z` from `lib/zod.ts`** — not from `"zod"` directly — ensures `.openapi()` is available everywhere
- **Add `.openapi("SchemaName")` to DTOs** — reuse existing Zod schemas, don't duplicate for docs
- **One `*.docs.ts` per module** — keeps route documentation co-located with the module but separate from route logic
- **Create response DTOs** — `user-response.dto.ts`, `post-response.dto.ts` for documenting what the API returns
- **Reuse schemas in `registerPath`** — reference your DTO schemas directly, the generator resolves `$ref`s automatically
- **Document all error responses** — 401, 403, 404, 409, 422 with the shared `errorSchema` / `validationErrorSchema`
- **Mark protected endpoints** — `security: [{ bearerAuth: [] }]` on routes requiring auth
- **Serve raw spec at `/api/docs.json`** — useful for code generation and CI validation
- **Protect docs in production** — use basic auth or disable entirely

---

## 11. Required Packages

```bash
# Core
npm install @asteasolutions/zod-to-openapi swagger-ui-express
npm install -D @types/swagger-ui-express

# Optional: protect docs in production
npm install express-basic-auth
```
