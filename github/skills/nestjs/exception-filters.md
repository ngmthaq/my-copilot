---
name: nestjs-exception-filters
description: "NestJS exception filters — ExceptionFilter interface, @Catch decorator, custom HTTP error response shapes, handling Prisma/TypeORM errors, applying filters globally vs. per route, and mapping domain errors to HTTP status codes. Use when: formatting error responses; catching specific exceptions; applying global vs. local filters. DO NOT USE FOR: GraphQL error handling (use nestjs-graphql-error-handling skill)."
---

# NestJS Exception Filters Skill

## Overview

Covers building exception filters in NestJS to intercept and format error responses consistently.

---

## 1. Built-in HTTP Exceptions

```typescript
// NestJS provides HTTP exception classes — throw them from services or controllers
import {
  BadRequestException, // 400
  UnauthorizedException, // 401
  ForbiddenException, // 403
  NotFoundException, // 404
  ConflictException, // 409
  UnprocessableEntityException, // 422
  InternalServerErrorException, // 500
} from "@nestjs/common";

// Basic usage
throw new NotFoundException("User not found");

// With detail object
throw new BadRequestException({
  message: "Validation failed",
  errors: ["email is required", "password too short"],
});
```

---

## 2. Custom HTTP Exception

```typescript
// common/exceptions/business.exception.ts
import { HttpException, HttpStatus } from "@nestjs/common";

export class BusinessException extends HttpException {
  constructor(
    readonly code: string,
    message: string,
    status: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY,
  ) {
    super({ code, message, status }, status);
  }
}

// Usage
throw new BusinessException("INSUFFICIENT_FUNDS", "Account balance is too low");
```

---

## 3. Global HTTP Exception Filter

```typescript
// common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const error =
      typeof exceptionResponse === "string"
        ? { message: exceptionResponse }
        : (exceptionResponse as Record<string, unknown>);

    const body = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...error,
    };

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url}`, exception.stack);
    }

    response.status(status).json(body);
  }
}
```

---

## 4. Catch-all Filter (All Exceptions)

```typescript
// common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch() // no argument = catches everything
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : "Internal server error";

    this.logger.error(
      `Unhandled exception on ${request.method} ${request.url}`,
      exception,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

---

## 5. Prisma Error Filter

```typescript
// common/filters/prisma-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Response } from "express";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Database error";

    switch (exception.code) {
      case "P2002": // unique constraint violation
        status = HttpStatus.CONFLICT;
        message = `Duplicate value on field: ${(exception.meta?.target as string[])?.join(", ")}`;
        break;
      case "P2025": // record not found
        status = HttpStatus.NOT_FOUND;
        message = "Record not found";
        break;
      case "P2003": // foreign key constraint
        status = HttpStatus.BAD_REQUEST;
        message = "Related record does not exist";
        break;
    }

    response.status(status).json({ statusCode: status, message });
  }
}
```

---

## 6. Applying Filters

```typescript
import { UseFilters } from "@nestjs/common";

// 1. Global — main.ts
app.useGlobalFilters(
  new AllExceptionsFilter(),
  new PrismaExceptionFilter(),
  new HttpExceptionFilter(),
);

// 2. Global via module (with DI support — preferred)
// In AppModule providers:
{ provide: APP_FILTER, useClass: AllExceptionsFilter }
{ provide: APP_FILTER, useClass: PrismaExceptionFilter }
{ provide: APP_FILTER, useClass: HttpExceptionFilter }

// 3. Controller level
@Controller("users")
@UseFilters(PrismaExceptionFilter)
export class UserController {}

// 4. Route level
@Post()
@UseFilters(HttpExceptionFilter)
create(@Body() dto: CreateUserDto) {}
```

---

## 7. Filter Order (Most Specific First)

When registering multiple global filters, the LAST registered filter in `APP_FILTER` list catches first (LIFO). Register from most generic to most specific:

```typescript
{ provide: APP_FILTER, useClass: AllExceptionsFilter },   // fallback
{ provide: APP_FILTER, useClass: PrismaExceptionFilter }, // DB errors
{ provide: APP_FILTER, useClass: HttpExceptionFilter },   // HTTP errors (runs first)
```

---

## 8. Best Practices

- **Register filters as `APP_FILTER`** — enables full DI so filters can inject services like loggers
- **Combine specific + catch-all** — `HttpExceptionFilter` for known errors, `AllExceptionsFilter` as a safety net
- **Add a `PrismaExceptionFilter`** — converts DB constraint errors (P2002, P2025) to meaningful HTTP responses
- **Use consistent error shape** — always return `{ statusCode, timestamp, path, message }`
- **Log 5xx errors** — log with stack trace; suppress stack for 4xx (client errors)
- **Never leak stack traces** — omit `exception.stack` from the JSON response in production
