---
name: expressjs-input-validation
description: "Express.js input validation with Zod — validating request body, params, query, and headers using Zod schemas. Use when: creating validation schemas for API endpoints; building validation middleware; validating nested objects, arrays, enums, dates; transforming and coercing input; reusing schemas across routes; generating TypeScript types from schemas. DO NOT USE FOR: error handling middleware (use expressjs-error-handling skill); sanitization against XSS/injection (use expressjs-api-security skill)."
---

# Express.js Input Validation with Zod

## Overview

This skill covers validating API input in Express.js using Zod — schema definitions for body, params, query, and headers, reusable validation middleware, common patterns, and type inference. Apply it when users ask about validating request data in Express apps.

---

## 1. Setup

```bash
npm install zod
```

---

## 2. Validation Middleware

```typescript
// src/middleware/validate.ts
import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError, ZodType } from "../lib/zod";

interface ValidationSchema {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
  headers?: ZodType;
}

export function validate(schema: ValidationSchema) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.params) {
        req.params = (await schema.params.parseAsync(req.params)) as any;
      }
      if (schema.query) {
        req.query = (await schema.query.parseAsync(req.query)) as any;
      }
      if (schema.headers) {
        await schema.headers.parseAsync(req.headers);
      }
      next();
    } catch (err) {
      next(err); // Handled by centralized error handler (see expressjs-error-handling skill)
    }
  };
}
```

### Usage with Routes

```typescript
import { validate } from "../middleware/validate";
import { createUserSchema } from "../schemas/user.schema";

router.post(
  "/",
  validate({ body: createUserSchema.body }),
  async (req, res) => {
    // req.body is validated and typed
    const user = await userService.create(req.body);
    res.status(201).json({ data: user });
  },
);
```

---

## 3. Schema Definitions — Common Patterns

### User Schemas

```typescript
// src/schemas/user.schema.ts
import { z } from "../lib/zod";

// Reusable field schemas
const email = z.string().email("Invalid email format").toLowerCase().trim();
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");
const name = z.string().min(1, "Name is required").max(100).trim();

export const createUserSchema = {
  body: z.object({
    email,
    password,
    name,
  }),
};

export const updateUserSchema = {
  params: z.object({
    id: z.string().cuid("Invalid user ID"),
  }),
  body: z.object({
    name: name.optional(),
    email: email.optional(),
  }),
};

export const getUserSchema = {
  params: z.object({
    id: z.string().cuid("Invalid user ID"),
  }),
};

export const changePasswordSchema = {
  body: z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: password,
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};

// Infer TypeScript types from schemas
export type CreateUserInput = z.infer<typeof createUserSchema.body>;
export type UpdateUserInput = z.infer<typeof updateUserSchema.body>;
```

### Post Schemas

```typescript
// src/schemas/post.schema.ts
import { z } from "../lib/zod";

export const createPostSchema = {
  body: z.object({
    title: z.string().min(1, "Title is required").max(200).trim(),
    content: z.string().max(50000).optional(),
    categoryIds: z.array(z.string().cuid()).max(10).optional(),
    published: z.boolean().default(false),
  }),
};

export const updatePostSchema = {
  params: z.object({
    id: z.string().cuid("Invalid post ID"),
  }),
  body: z.object({
    title: z.string().min(1).max(200).trim().optional(),
    content: z.string().max(50000).optional(),
    categoryIds: z.array(z.string().cuid()).max(10).optional(),
    published: z.boolean().optional(),
  }),
};

export type CreatePostInput = z.infer<typeof createPostSchema.body>;
export type UpdatePostInput = z.infer<typeof updatePostSchema.body>;
```

### Query/Pagination Schema

```typescript
// src/schemas/common.schema.ts
import { z } from "../lib/zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z
    .enum(["createdAt", "updatedAt", "name", "title"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const searchSchema = paginationSchema.extend({
  search: z.string().max(200).trim().optional(),
});

export const listPostsSchema = {
  query: searchSchema.extend({
    published: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
    authorId: z.string().cuid().optional(),
    categoryId: z.string().cuid().optional(),
  }),
};

export type PaginationQuery = z.infer<typeof paginationSchema>;
export type ListPostsQuery = z.infer<typeof listPostsSchema.query>;
```

### Usage with Pagination

```typescript
router.get(
  "/",
  validate({ query: listPostsSchema.query }),
  async (req, res) => {
    // req.query is validated and transformed:
    // page/limit are numbers (coerced from strings), published is boolean
    const posts = await postService.list(req.query as ListPostsQuery);
    res.json(posts);
  },
);
```

---

## 4. ID Param Schema (Reusable)

```typescript
// src/schemas/common.schema.ts
export const idParamSchema = z.object({
  id: z.string().cuid("Invalid ID format"),
});

// For UUID-based IDs
export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
});
```

```typescript
// Usage — combine param + body validation
router.put(
  "/:id",
  authenticate,
  validate({ params: idParamSchema, body: updatePostSchema.body }),
  async (req, res) => {
    const post = await postService.update(req.params.id, req.body);
    res.json({ data: post });
  },
);
```

---

## 5. Advanced Zod Patterns

### Conditional Fields (Discriminated Unions)

```typescript
const notificationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("email"),
    email: z.string().email(),
    subject: z.string().min(1),
  }),
  z.object({
    type: z.literal("sms"),
    phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/),
  }),
  z.object({
    type: z.literal("push"),
    deviceToken: z.string().min(1),
    title: z.string().min(1),
  }),
]);
```

### Nested Objects & Arrays

```typescript
const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  country: z.string().length(2).default("US"),
});

const createOrderSchema = {
  body: z.object({
    shippingAddress: addressSchema,
    billingAddress: addressSchema.optional(),
    items: z
      .array(
        z.object({
          productId: z.string().cuid(),
          quantity: z.number().int().positive().max(99),
          notes: z.string().max(500).optional(),
        }),
      )
      .min(1, "Order must contain at least one item")
      .max(50),
    couponCode: z.string().max(20).optional(),
  }),
};
```

### Transform & Preprocess

```typescript
const searchSchema = z.object({
  // Trim and lowercase search input
  q: z.string().trim().toLowerCase().optional(),

  // Coerce string "true"/"false" to boolean
  active: z
    .string()
    .transform((val) => val === "true")
    .optional(),

  // Coerce comma-separated string to array
  tags: z
    .string()
    .transform((val) =>
      val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    )
    .optional(),

  // Coerce string to Date
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
```

### Custom Validators

```typescript
const fileUploadSchema = z.object({
  filename: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+\.[a-zA-Z]{2,4}$/, "Invalid filename"),
  mimeType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ]),
  size: z.number().max(5 * 1024 * 1024, "File must be under 5MB"),
});

// Custom refinement with async validation
const createUserSchema = z
  .object({
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
```

---

## 6. Enum Validation

```typescript
// Sync with Prisma enum or database values
const ROLES = ["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"] as const;
const roleSchema = z.enum(ROLES);

const POST_STATUS = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
const statusSchema = z.enum(POST_STATUS);

// Usage in body schema
const updateUserRoleSchema = {
  params: idParamSchema,
  body: z.object({
    role: roleSchema,
  }),
};
```

---

## 7. Headers Validation

```typescript
const apiKeyHeaderSchema = z.object({
  "x-api-key": z.string().min(1, "API key is required"),
});

const contentTypeSchema = z.object({
  "content-type": z
    .string()
    .refine(
      (val) => val.includes("application/json"),
      "Content-Type must be application/json",
    ),
});

router.post(
  "/webhook",
  validate({ headers: apiKeyHeaderSchema }),
  async (req, res) => {
    // x-api-key header is guaranteed to be present
  },
);
```

---

## 8. Schema Composition & Reuse

```typescript
// src/schemas/base.schema.ts
import { z } from "../lib/zod";

// Reusable field builders
export const fields = {
  id: () => z.string().cuid("Invalid ID"),
  uuid: () => z.string().uuid("Invalid UUID"),
  email: () => z.string().email("Invalid email").toLowerCase().trim(),
  name: () => z.string().min(1, "Required").max(100).trim(),
  password: () =>
    z
      .string()
      .min(8, "At least 8 characters")
      .max(128)
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[a-z]/, "Must contain lowercase")
      .regex(/[0-9]/, "Must contain number"),
  url: () => z.string().url("Invalid URL"),
  date: () => z.coerce.date(),
  positiveInt: () => z.coerce.number().int().positive(),
  boolean: () =>
    z
      .string()
      .transform((val) => val === "true")
      .or(z.boolean()),
};
```

```typescript
// src/schemas/user.schema.ts
import { fields } from "./base.schema";

export const createUserSchema = {
  body: z.object({
    email: fields.email(),
    password: fields.password(),
    name: fields.name(),
  }),
};

// Partial reuse — pick/omit/extend
export const updateUserSchema = {
  params: z.object({ id: fields.id() }),
  body: createUserSchema.body.partial().omit({ password: true }),
};
```

---

## 9. Typed Request with Validation

```typescript
// Combine with requestHandler from expressjs-error-handling skill
import { requestHandler } from "../middleware/request-handler";
import { validate } from "../middleware/validate";

// Define schema
const createPostSchema = {
  body: z.object({
    title: z.string().min(1).max(200),
    content: z.string().optional(),
  }),
};

// Infer request type from schema
type CreatePostBody = z.infer<typeof createPostSchema.body>;
interface CreatePostRequest extends Request {
  body: CreatePostBody;
}

// Fully typed route
router.post(
  "/",
  authenticate,
  validate({ body: createPostSchema.body }),
  requestHandler<CreatePostRequest>(async (req, res) => {
    // req.body is typed as { title: string; content?: string }
    const post = await postService.create(req.body, req.user!.userId);
    res.status(201).json({ data: post });
  }),
);
```

---

## 10. Project Structure

```
src/
├── index.ts
├── app.ts
├── dto/                          # ◄ Shared DTOs
│   ├── base.dto.ts               # Reusable field builders
│   └── common.dto.ts             # Pagination, ID params, search
├── middleware/
│   └── validate.ts               # ◄ Validation middleware
├── modules/
│   ├── user/
│   │   ├── dto/                  # ◄ User DTOs
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   ├── list-user.dto.ts
│   │   │   └── index.ts
│   │   ├── user.route.ts         # Routes with validate() middleware
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.repository.ts
│   └── post/
│       ├── dto/                  # ◄ Post DTOs
│       │   ├── create-post.dto.ts
│       │   ├── update-post.dto.ts
│       │   └── index.ts
│       ├── post.route.ts
│       ├── post.controller.ts
│       ├── post.service.ts
│       └── post.repository.ts
└── ...
```

---

## 11. Best Practices

- **Import `z` from `lib/zod`** — not from `"zod"` directly — ensures `.openapi()` is available for Swagger documentation
- **Validate at the boundary** — validate all external input (body, params, query, headers) before it reaches business logic
- **Use `.trim()` on string fields** — prevent whitespace-only values and leading/trailing spaces
- **Use `z.coerce`** for query params — Express parses query values as strings, coerce to numbers/booleans/dates
- **Infer types from schemas** — use `z.infer<typeof schema>` instead of duplicating interfaces
- **Reuse field schemas** — define common fields (email, password, ID) once in a base module
- **Use `.partial()` for update schemas** — derive from create schema with all fields optional
- **Use discriminated unions** for polymorphic input — cleaner than `.refine()` for conditional fields
- **Let Zod errors bubble up** — handle them centrally in the error handler middleware, not per route
- **Set reasonable `.max()` limits** — prevent oversized payloads (string lengths, array sizes)
- **Use `.default()` for optional fields with fallbacks** — especially for pagination (`page`, `limit`, `sortOrder`)

---

## 12. Required Packages

```bash
npm install zod
```
