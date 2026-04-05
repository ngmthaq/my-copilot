---
name: prisma-error-handling
description: "Prisma error handling — catching PrismaClientKnownRequestError; handling P-error codes (P2002, P2025, etc.); mapping Prisma errors to HTTP responses. Use when: handling database errors; converting Prisma errors to user-friendly messages; catching unique constraint violations; handling record not found errors."
---

# Prisma Error Handling

## Overview

Prisma throws specific error types with error codes you can check to handle database errors gracefully — such as duplicate entries or missing records.

---

## 1. Prisma Error Types

| Error Class                       | When it's thrown                                                    |
| --------------------------------- | ------------------------------------------------------------------- |
| `PrismaClientKnownRequestError`   | Known database error (constraint violation, record not found, etc.) |
| `PrismaClientUnknownRequestError` | Unknown database error                                              |
| `PrismaClientValidationError`     | Wrong query arguments (e.g., missing required field)                |
| `PrismaClientInitializationError` | Failed to connect to the database                                   |

---

## 2. Common Error Codes (P-Codes)

| Code    | Meaning                                            |
| ------- | -------------------------------------------------- |
| `P2002` | Unique constraint violation (duplicate value)      |
| `P2003` | Foreign key constraint violation                   |
| `P2025` | Record not found (update/delete on missing record) |
| `P2014` | Relation violation                                 |

---

## 3. Catching Prisma Errors

```typescript
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";

try {
  await prisma.user.create({
    data: { email: "alice@example.com" },
  });
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      // Unique constraint: email already exists
      throw new ConflictError("Email is already in use");
    }

    if (error.code === "P2025") {
      // Record not found (e.g., updating a non-existent user)
      throw new NotFoundError("User not found");
    }
  }

  if (error instanceof PrismaClientValidationError) {
    // Wrong query structure — usually a developer mistake
    throw new BadRequestError("Invalid query");
  }

  // Unknown error — re-throw
  throw error;
}
```

---

## 4. Reusable Error Handler

Create a utility function to centralize Prisma error mapping:

```typescript
// src/utils/prisma-error.ts
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";

export function handlePrismaError(error: unknown): never {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        // Get the field that caused the violation
        const field = (error.meta?.target as string[])?.join(", ") ?? "field";
        throw new ConflictError(`${field} already exists`);
      }
      case "P2025":
        throw new NotFoundError("Record not found");
      case "P2003":
        throw new BadRequestError("Related record not found");
      default:
        throw new InternalServerError(`Database error: ${error.code}`);
    }
  }

  if (error instanceof PrismaClientValidationError) {
    throw new BadRequestError("Invalid data provided");
  }

  throw error; // re-throw unknown errors
}
```

Use it in your service methods:

```typescript
// src/services/user.service.ts
import { handlePrismaError } from "../utils/prisma-error";

async function createUser(data: CreateUserDto) {
  try {
    return await prisma.user.create({ data });
  } catch (error) {
    handlePrismaError(error);
  }
}

async function updateUser(id: number, data: UpdateUserDto) {
  try {
    return await prisma.user.update({ where: { id }, data });
  } catch (error) {
    handlePrismaError(error);
  }
}
```

---

## 5. Handling "Not Found" Safely

`findUnique` and `findFirst` return `null` instead of throwing — check the result:

```typescript
// This does NOT throw — returns null if not found
const user = await prisma.user.findUnique({ where: { id: 999 } });

if (!user) {
  throw new NotFoundError("User not found");
}
```

`update` and `delete` DO throw `P2025` if the record doesn't exist:

```typescript
try {
  await prisma.user.delete({ where: { id: 999 } });
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
    throw new NotFoundError("User not found");
  }
  throw error;
}
```

---

## 6. Check `error.meta` for Details

The `meta` field gives additional context about the error:

```typescript
if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
  console.log(error.meta);
  // { target: ["email"] } — shows which field caused the constraint violation
}
```

---

## Key Rules

- Always check `error.code` — not the message string (messages can change between Prisma versions).
- `findUnique`/`findFirst` return `null` for missing records — always null-check the result.
- `update`/`delete` throw `P2025` for missing records — handle it explicitly.
- Create a shared `handlePrismaError` utility so every service handles errors the same way.
- Re-throw unknown errors — never silently swallow them.
