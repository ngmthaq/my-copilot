---
name: typeorm-error-handling
description: "TypeORM error handling — catching TypeORM errors; handling unique constraint violations (QueryFailedError); mapping database errors to HTTP responses. Use when: handling database errors; converting TypeORM errors to user-friendly messages; catching duplicate entry errors; handling record not found."
---

# TypeORM Error Handling

## Overview

TypeORM throws `QueryFailedError` for database-level errors (constraint violations, invalid values, etc.). Unlike Prisma, TypeORM doesn't have structured error codes — you identify errors from the underlying database driver's error codes.

---

## 1. TypeORM Error Types

| Error Class                      | When it's thrown                                                 |
| -------------------------------- | ---------------------------------------------------------------- |
| `QueryFailedError`               | Database rejects the query (constraint violation, bad SQL, etc.) |
| `EntityNotFoundError`            | Thrown by `findOneOrFail` when no record matches                 |
| `CannotExecuteNotConnectedError` | Query attempted without a database connection                    |

---

## 2. Database Error Codes

TypeORM wraps the native database driver error. Access the underlying code via `error.driverError`:

### PostgreSQL (pg)

| Code    | Meaning                          |
| ------- | -------------------------------- |
| `23505` | Unique constraint violation      |
| `23503` | Foreign key constraint violation |
| `23502` | NOT NULL constraint violation    |
| `23514` | Check constraint violation       |

### MySQL

| Code   | Meaning                            |
| ------ | ---------------------------------- |
| `1062` | Duplicate entry (unique violation) |
| `1451` | Foreign key constraint violation   |
| `1048` | Column cannot be null              |

---

## 3. Catching TypeORM Errors

```typescript
import { QueryFailedError } from "typeorm";

try {
  await userRepository.save({ email: "alice@example.com", name: "Alice" });
} catch (error) {
  if (error instanceof QueryFailedError) {
    const dbError = error.driverError as { code?: string };

    // PostgreSQL unique violation
    if (dbError.code === "23505") {
      throw new ConflictError("Email is already in use");
    }

    // PostgreSQL foreign key violation
    if (dbError.code === "23503") {
      throw new BadRequestError("Related record not found");
    }
  }

  throw error; // re-throw unknown errors
}
```

---

## 4. Reusable Error Handler

```typescript
// src/utils/typeorm-error.ts
import { QueryFailedError, EntityNotFoundError } from "typeorm";

interface DriverError {
  code?: string;
  errno?: number; // MySQL
}

export function handleTypeOrmError(error: unknown): never {
  if (error instanceof EntityNotFoundError) {
    throw new NotFoundError("Record not found");
  }

  if (error instanceof QueryFailedError) {
    const dbError = error.driverError as DriverError;
    const code = dbError.code ?? String(dbError.errno ?? "");

    switch (code) {
      // PostgreSQL
      case "23505":
      // MySQL
      case "1062":
        throw new ConflictError("A record with this value already exists");

      // PostgreSQL
      case "23503":
      // MySQL
      case "1451":
        throw new BadRequestError("Related record not found");

      // PostgreSQL
      case "23502":
      // MySQL
      case "1048":
        throw new BadRequestError("A required field is missing");

      default:
        throw new InternalServerError(`Database error: ${code}`);
    }
  }

  throw error; // re-throw unknown errors
}
```

Use it in your service methods:

```typescript
// src/services/user.service.ts
import { handleTypeOrmError } from "../utils/typeorm-error";

async function createUser(data: CreateUserDto) {
  try {
    const user = userRepository.create(data);
    return await userRepository.save(user);
  } catch (error) {
    handleTypeOrmError(error);
  }
}

async function updateUser(id: number, data: UpdateUserDto) {
  try {
    await userRepository.update(id, data);
    return userRepository.findOneBy({ id });
  } catch (error) {
    handleTypeOrmError(error);
  }
}
```

---

## 5. Handling "Not Found" Records

`findOne` returns `null` — always check the result:

```typescript
// findOne returns null if not found — check explicitly
const user = await userRepository.findOne({ where: { id: 999 } });

if (!user) {
  throw new NotFoundError("User not found");
}
```

Use `findOneOrFail` to let TypeORM throw `EntityNotFoundError` automatically:

```typescript
try {
  const user = await userRepository.findOneOrFail({ where: { id: 999 } });
} catch (error) {
  if (error instanceof EntityNotFoundError) {
    throw new NotFoundError("User not found");
  }
  throw error;
}
```

---

## 6. Getting the Violated Constraint Name (PostgreSQL)

For more specific error messages, check which constraint was violated:

```typescript
if (error instanceof QueryFailedError) {
  const dbError = error.driverError as { code?: string; constraint?: string };

  if (dbError.code === "23505") {
    if (dbError.constraint === "UQ_users_email") {
      throw new ConflictError("Email is already in use");
    }
    if (dbError.constraint === "UQ_users_username") {
      throw new ConflictError("Username is already taken");
    }
    throw new ConflictError("A duplicate value already exists");
  }
}
```

---

## Key Rules

- Always check `error instanceof QueryFailedError` — not the message string (messages vary by DB driver).
- `findOne` returns `null` for missing records — always null-check the result.
- Use `findOneOrFail` when you always expect the record to exist and want automatic error throwing.
- Create a shared `handleTypeOrmError` utility for consistent error handling across all services.
- Re-throw unknown errors — never silently swallow them.
- The `driverError.code` values differ between PostgreSQL and MySQL — handle both if your app supports multiple databases.
