---
name: expressjs-rest-api-design
description: "Express.js REST API design — RESTful resource naming, HTTP methods, status codes, response formats, pagination, filtering, sorting, versioning, and HATEOAS. Use when: designing API endpoints; choosing HTTP methods and status codes; structuring JSON responses; implementing pagination and filtering; versioning APIs; following REST conventions. DO NOT USE FOR: authentication logic (use expressjs-authentication-authorization skill); input validation (use expressjs-input-validation skill); project structure (use expressjs-modular-architecture skill)."
---

# Express.js REST API Design Skill

## Overview

This skill covers RESTful API design principles in Express.js — resource naming, HTTP methods, status codes, consistent response formats, pagination, filtering, sorting, versioning, and error responses. Apply it when users ask about designing or structuring REST API endpoints.

---

## 1. Resource Naming Conventions

```
# Resources are nouns (plural), never verbs
✅ GET    /api/users
✅ GET    /api/users/:id
✅ POST   /api/users
✅ PUT    /api/users/:id
✅ PATCH  /api/users/:id
✅ DELETE /api/users/:id

# Nested resources for relationships
✅ GET    /api/users/:userId/posts
✅ POST   /api/users/:userId/posts
✅ GET    /api/posts/:postId/comments

# Avoid verbs in URLs
❌ GET    /api/getUsers
❌ POST   /api/createUser
❌ POST   /api/deleteUser/:id

# Use kebab-case for multi-word resources
✅ GET    /api/blog-posts
✅ GET    /api/order-items
❌ GET    /api/blogPosts
❌ GET    /api/order_items

# Actions that don't map to CRUD — use a sub-resource or verb as last resort
✅ POST   /api/users/:id/activate
✅ POST   /api/orders/:id/cancel
✅ POST   /api/auth/login
✅ POST   /api/auth/logout
```

---

## 2. HTTP Methods & When to Use Them

| Method   | Purpose               | Idempotent | Request Body | Example                 |
| -------- | --------------------- | ---------- | ------------ | ----------------------- |
| `GET`    | Retrieve resource(s)  | Yes        | No           | `GET /api/users`        |
| `POST`   | Create a new resource | No         | Yes          | `POST /api/users`       |
| `PUT`    | Full update (replace) | Yes        | Yes          | `PUT /api/users/:id`    |
| `PATCH`  | Partial update        | Yes        | Yes          | `PATCH /api/users/:id`  |
| `DELETE` | Remove a resource     | Yes        | No           | `DELETE /api/users/:id` |

### PUT vs PATCH

```typescript
// PUT — replaces the entire resource (all fields required)
router.put(
  "/:id",
  authenticate,
  validate({ params: idParamSchema, body: fullUpdateUserSchema.body }),
  userController.replace,
);

// PATCH — updates only provided fields (all fields optional)
router.patch(
  "/:id",
  authenticate,
  validate({ params: idParamSchema, body: partialUpdateUserSchema.body }),
  userController.update,
);
```

---

## 3. HTTP Status Codes

### Success (2xx)

| Code  | Meaning    | When to Use                       |
| ----- | ---------- | --------------------------------- |
| `200` | OK         | GET, PUT, PATCH success           |
| `201` | Created    | POST success (resource created)   |
| `204` | No Content | DELETE success (no response body) |

### Client Error (4xx)

| Code  | Meaning              | When to Use                                      |
| ----- | -------------------- | ------------------------------------------------ |
| `400` | Bad Request          | Malformed request, invalid JSON                  |
| `401` | Unauthorized         | Missing or invalid authentication                |
| `403` | Forbidden            | Authenticated but insufficient permissions       |
| `404` | Not Found            | Resource does not exist                          |
| `409` | Conflict             | Duplicate resource (unique constraint violation) |
| `422` | Unprocessable Entity | Validation errors (valid JSON, invalid data)     |
| `429` | Too Many Requests    | Rate limit exceeded                              |

### Server Error (5xx)

| Code  | Meaning               | When to Use                       |
| ----- | --------------------- | --------------------------------- |
| `500` | Internal Server Error | Unexpected server failure         |
| `503` | Service Unavailable   | Maintenance mode, dependency down |

---

## 4. Consistent Response Format

### Success Responses

```typescript
// Single resource
{
  "data": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}

// Collection with pagination
{
  "data": [
    { "id": "clx1234567890", "title": "First Post", ... },
    { "id": "clx0987654321", "title": "Second Post", ... }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}

// Empty collection
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}

// Action response (no resource returned)
{
  "message": "Logged out successfully"
}
```

### Error Responses

```typescript
// Standard error
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "User not found"
}

// Validation error
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email format"],
    "password": ["Must be at least 8 characters"]
  }
}
```

### Response Helper Utility

```typescript
// src/utils/response.ts
import { Response } from "express";

export function sendSuccess(res: Response, data: unknown, statusCode = 200) {
  res.status(statusCode).json({ data });
}

export function sendCreated(res: Response, data: unknown) {
  res.status(201).json({ data });
}

export function sendNoContent(res: Response) {
  res.status(204).send();
}

export function sendPaginated(res: Response, data: unknown[], meta: { page: number; limit: number; total: number }) {
  const totalPages = Math.ceil(meta.total / meta.limit);
  res.json({
    data,
    meta: {
      ...meta,
      totalPages,
      hasNextPage: meta.page < totalPages,
      hasPreviousPage: meta.page > 1,
    },
  });
}
```

### Usage in Controllers

```typescript
// src/modules/user/user.controller.ts
import { requestHandler } from "../../middleware/request-handler";
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from "../../utils/response";
import { userService } from "./user.service";

export class UserController {
  list = requestHandler(async (req, res) => {
    const { data, meta } = await userService.list(req.query as any);
    sendPaginated(res, data, meta);
  });

  getById = requestHandler(async (req, res) => {
    const user = await userService.getById(req.params.id);
    sendSuccess(res, user);
  });

  create = requestHandler(async (req, res) => {
    const user = await userService.create(req.body);
    sendCreated(res, user);
  });

  update = requestHandler(async (req, res) => {
    const user = await userService.update(req.params.id, req.body);
    sendSuccess(res, user);
  });

  delete = requestHandler(async (req, res) => {
    await userService.delete(req.params.id);
    sendNoContent(res);
  });
}

export const userController = new UserController();
```

---

## 5. Pagination

### Query Parameters

```
GET /api/posts?page=2&limit=20
```

### Pagination DTO

```typescript
// src/dto/common.dto.ts
import { z } from "../lib/zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;
```

### Service Implementation

```typescript
async list(query: PaginationQuery) {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    postRepository.findAll({ skip, take: limit }),
    postRepository.count(),
  ]);

  return { data, meta: { page, limit, total } };
}
```

### Cursor-Based Pagination (for large datasets)

```
GET /api/posts?cursor=clx1234567890&limit=20
```

```typescript
export const cursorPaginationSchema = z.object({
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

async listWithCursor(query: CursorPaginationQuery) {
  const { cursor, limit } = query;

  const data = await prisma.post.findMany({
    take: limit + 1, // Fetch one extra to check if there's a next page
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1, // Skip the cursor itself
    }),
    orderBy: { createdAt: "desc" },
  });

  const hasNextPage = data.length > limit;
  if (hasNextPage) data.pop(); // Remove the extra item

  return {
    data,
    meta: {
      nextCursor: hasNextPage ? data[data.length - 1].id : null,
      hasNextPage,
    },
  };
}
```

---

## 6. Filtering & Search

### Query Parameters

```
GET /api/posts?published=true&authorId=clx123&search=typescript
GET /api/users?role=ADMIN&search=john
```

### Filter DTO

```typescript
// src/modules/post/dto/list-post.dto.ts
import { z } from "../lib/zod";
import { paginationSchema } from "../../../dto/common.dto";

export const listPostSchema = {
  query: paginationSchema.extend({
    search: z.string().max(200).trim().optional(),
    published: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
    authorId: z.string().cuid().optional(),
    categoryId: z.string().cuid().optional(),
  }),
};

export type ListPostQuery = z.infer<typeof listPostSchema.query>;
```

### Service Implementation

```typescript
async list(query: ListPostQuery) {
  const { page, limit, search, published, authorId, categoryId } = query;
  const skip = (page - 1) * limit;

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
    postRepository.findAll({ skip, take: limit, where }),
    postRepository.count(where),
  ]);

  return { data, meta: { page, limit, total } };
}
```

---

## 7. Sorting

### Query Parameters

```
GET /api/posts?sortBy=createdAt&sortOrder=desc
GET /api/users?sortBy=name&sortOrder=asc
```

### Sort DTO

```typescript
// Extend pagination with sort options
export const sortablePaginationSchema = paginationSchema.extend({
  sortBy: z.enum(["createdAt", "updatedAt", "name", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
```

### Service Implementation

```typescript
async list(query: SortablePaginationQuery) {
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

  return { data, meta: { page, limit, total } };
}
```

---

## 8. Field Selection (Sparse Fieldsets)

```
GET /api/users?fields=id,name,email
GET /api/posts?fields=id,title,createdAt
```

```typescript
export const fieldSelectionSchema = z.object({
  fields: z
    .string()
    .transform((val) =>
      val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    )
    .optional(),
});

// Service builds Prisma select from fields
function buildSelect(fields: string[] | undefined, allowedFields: string[]) {
  if (!fields) return undefined;
  const select: Record<string, boolean> = {};
  for (const field of fields) {
    if (allowedFields.includes(field)) {
      select[field] = true;
    }
  }
  return Object.keys(select).length > 0 ? select : undefined;
}
```

---

## 9. API Versioning

### URL Path Versioning (Recommended)

```typescript
// src/app.ts
import { userRoutesV1 } from "./modules/user/user.route";
import { userRoutesV2 } from "./modules/user/user.route.v2";

app.use("/api/v1/users", userRoutesV1);
app.use("/api/v2/users", userRoutesV2);
```

### Header Versioning (Alternative)

```typescript
// src/middleware/api-version.ts
import { requestHandler } from "./request-handler";

export function apiVersion(version: string) {
  return requestHandler(async (req, res, next) => {
    const requestedVersion = req.headers["api-version"] || req.headers["accept-version"] || "1";
    if (requestedVersion !== version) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_API_VERSION",
        message: `This endpoint requires API version ${version}`,
      });
    }
    next();
  });
}
```

---

## 10. Bulk Operations

```typescript
// POST /api/users/bulk — create multiple resources
router.post(
  "/bulk",
  authenticate,
  authorize("ADMIN"),
  validate({ body: bulkCreateUserSchema.body }),
  userController.bulkCreate,
);

// PATCH /api/users/bulk — update multiple resources
router.patch(
  "/bulk",
  authenticate,
  authorize("ADMIN"),
  validate({ body: bulkUpdateUserSchema.body }),
  userController.bulkUpdate,
);

// DELETE /api/users/bulk — delete multiple resources
router.delete(
  "/bulk",
  authenticate,
  authorize("ADMIN"),
  validate({ body: bulkDeleteSchema.body }),
  userController.bulkDelete,
);
```

```typescript
// DTOs
export const bulkCreateUserSchema = {
  body: z.object({
    items: z.array(createUserSchema.body).min(1).max(100),
  }),
};

export const bulkDeleteSchema = {
  body: z.object({
    ids: z.array(z.string().cuid()).min(1).max(100),
  }),
};
```

```typescript
// Controller
bulkCreate = requestHandler(async (req, res) => {
  const results = await userService.bulkCreate(req.body.items);
  sendCreated(res, results);
});

bulkDelete = requestHandler(async (req, res) => {
  await userService.bulkDelete(req.body.ids);
  sendNoContent(res);
});
```

---

## 11. Complete Route Example

```typescript
// src/modules/post/post.route.ts
import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { postController } from "./post.controller";
import { createPostSchema, updatePostSchema, listPostSchema } from "./dto";
import { idParamSchema } from "../../dto/common.dto";

const router = Router();

// Public
router.get("/", validate({ query: listPostSchema.query }), postController.list);
router.get("/:id", validate({ params: idParamSchema }), postController.getById);

// Authenticated
router.post("/", authenticate, validate({ body: createPostSchema.body }), postController.create);
router.patch(
  "/:id",
  authenticate,
  validate({ params: idParamSchema, body: updatePostSchema.body }),
  postController.update,
);
router.delete("/:id", authenticate, validate({ params: idParamSchema }), postController.delete);

// Admin
router.post(
  "/bulk",
  authenticate,
  authorize("ADMIN"),
  validate({ body: bulkCreatePostSchema.body }),
  postController.bulkCreate,
);

export { router as postRoutes };
```

---

## 12. Project Structure

```
src/
├── index.ts
├── app.ts
├── dto/                          # Shared DTOs
│   ├── base.dto.ts               # Reusable field builders
│   └── common.dto.ts             # ◄ Pagination, sorting, ID params
├── utils/
│   └── response.ts               # ◄ sendSuccess, sendCreated, sendPaginated
├── middleware/
│   └── ...
├── modules/
│   ├── user/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   ├── list-user.dto.ts
│   │   │   └── index.ts
│   │   ├── user.route.ts         # ◄ RESTful endpoint definitions
│   │   ├── user.controller.ts    # ◄ HTTP handling with response helpers
│   │   ├── user.service.ts
│   │   └── user.repository.ts
│   └── post/
│       ├── dto/
│       ├── post.route.ts
│       ├── post.controller.ts
│       ├── post.service.ts
│       └── post.repository.ts
└── ...
```

---

## 13. Best Practices

- **Use plural nouns** for resources — `/api/users`, not `/api/user`
- **Use kebab-case** for multi-word resources — `/api/blog-posts`, not `/api/blogPosts`
- **Use correct HTTP methods** — GET reads, POST creates, PATCH updates, DELETE removes
- **Use correct status codes** — 201 for created, 204 for deleted, 422 for validation errors
- **Return consistent JSON structure** — always `{ data }` for success, `{ status, code, message }` for errors
- **Paginate all list endpoints** — never return unbounded collections
- **Use query params for filtering/sorting** — `?published=true&sortBy=createdAt&sortOrder=desc`
- **Validate and coerce query params** — Express sends them as strings, use Zod `z.coerce`
- **Use `sendPaginated` / `sendSuccess` helpers** — enforce consistent response format
- **Version your API from day one** — `/api/v1/` prefix is cheap insurance
- **Use PATCH over PUT** for updates — most updates are partial, not full replacements
- **Keep URLs shallow** — max 2 levels of nesting (`/users/:id/posts`, not `/users/:id/posts/:postId/comments/:commentId`)
