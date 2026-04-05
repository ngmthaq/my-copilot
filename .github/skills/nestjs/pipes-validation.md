---
name: nestjs-pipes-validation
description: "NestJS pipes — built-in transform pipes (ParseIntPipe, ParseUUIDPipe, ParseBoolPipe), custom transformation and validation pipes, and applying pipes at param/route/global level. Use when: parsing and transforming route parameters; building custom value transformers; sanitising inputs before handlers receive them. DO NOT USE FOR: body DTO validation (use nestjs-input-validation skill)."
---

# NestJS Pipes Skill

## Overview

Covers NestJS pipes for transforming and validating route parameters, query strings, and request bodies.

---

## 1. Built-in Pipes

```typescript
import {
  ParseIntPipe, ParseUUIDPipe, ParseBoolPipe,
  ParseFloatPipe, ParseArrayPipe, ParseEnumPipe,
  DefaultValuePipe,
} from "@nestjs/common";

@Get(":id")
findOne(
  @Param("id", ParseUUIDPipe) id: string,  // validates UUID v4 format
) {}

@Get()
findAll(
  @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query("active", new DefaultValuePipe(false), ParseBoolPipe) active: boolean,
  @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
) {}

@Get("score/:value")
getByScore(
  @Param("value", ParseFloatPipe) value: number,
) {}

// Enum pipe
enum Status { ACTIVE = "active", INACTIVE = "inactive" }

@Get("by-status")
findByStatus(
  @Query("status", new ParseEnumPipe(Status)) status: Status,
) {}
```

---

## 2. ParseArrayPipe

```typescript
@Delete()
removeMany(
  @Query("ids", new ParseArrayPipe({ items: String, separator: "," })) ids: string[],
) {
  // GET /users?ids=uuid1,uuid2,uuid3
  return this.userService.removeMany(ids);
}
```

---

## 3. Custom Transformation Pipe

```typescript
// pipes/trim.pipe.ts — trim whitespace from all string values
import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata) {
    if (typeof value === "string") return value.trim();
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([k, v]) => [
          k,
          typeof v === "string" ? v.trim() : v,
        ]),
      );
    }
    return value;
  }
}

// Apply per route
@Post()
create(@Body(TrimPipe) dto: CreateUserDto) {}
```

---

## 4. Custom Validation Pipe

```typescript
// pipes/parse-positive-int.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from "@nestjs/common";

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed <= 0) {
      throw new BadRequestException(
        `${metadata.data ?? "value"} must be a positive integer`,
      );
    }
    return parsed;
  }
}

// Usage
@Get("page/:page")
getPage(@Param("page", ParsePositiveIntPipe) page: number) {}
```

---

## 5. Pipe with Options (Factory Pattern)

```typescript
// pipes/parse-id.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import { validate as isUuid } from "uuid";

@Injectable()
export class ParseIdPipe implements PipeTransform<string, string> {
  constructor(private readonly fieldName = "id") {}

  transform(value: string): string {
    if (!isUuid(value)) {
      throw new BadRequestException(`${this.fieldName} must be a valid UUID`);
    }
    return value;
  }
}

// Usage with label
@Get(":userId")
findOne(@Param("userId", new ParseIdPipe("userId")) userId: string) {}
```

---

## 6. Applying Pipes at Different Levels

```typescript
import { UsePipes, ValidationPipe } from "@nestjs/common";

// 1. Parameter level
@Get(":id")
findOne(@Param("id", ParseUUIDPipe) id: string) {}

// 2. Route level
@Post()
@UsePipes(new ValidationPipe({ whitelist: true }))
create(@Body() dto: CreateUserDto) {}

// 3. Controller level — applies to all routes
@Controller("users")
@UsePipes(new ValidationPipe({ transform: true }))
export class UserController {}

// 4. Global level (main.ts)
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
```

---

## 7. Combining Pipes

```typescript
// Pipes execute left-to-right
@Get()
findAll(
  @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
  // DefaultValuePipe runs first (fills in default), then ParseIntPipe converts to number
) {}
```

---

## 8. Best Practices

- **Prefer built-in pipes for type coercion** — `ParseIntPipe`, `ParseUUIDPipe`, etc. produce consistent, properly formatted errors
- **Apply `ParseUUIDPipe` on all `:id` params** — rejects malformed IDs before they hit the database
- **Use `DefaultValuePipe` before `ParseIntPipe`** — ensures optional query params have a value before type conversion
- **Keep pipes single-purpose** — one pipe = one transformation; compose multiple pipes instead of building complex ones
- **Use `global ValidationPipe`** — define it once in `main.ts` and rely on DTOs for body validation; avoid scattering `@UsePipes` everywhere
