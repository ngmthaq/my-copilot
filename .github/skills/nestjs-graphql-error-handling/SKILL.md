---
name: nestjs-graphql-error-handling
description: "NestJS GraphQL error handling — exception filters, GraphQLError, custom exceptions, validation pipes, and error formatting. Use when: handling errors in NestJS GraphQL resolvers; formatting error responses; using exception filters; validating inputs. DO NOT USE FOR: REST exception filters (use nestjs-exception-filters skill); auth errors (use nestjs-graphql-authentication-authorization skill)."
---

# NestJS GraphQL Error Handling Skill

## Overview

Covers error handling in NestJS GraphQL — throwing errors, exception filters, validation pipes, custom exceptions, and error formatting.

---

## 1. Throwing Errors in Resolvers

```typescript
import { GraphQLError } from "graphql";
import { NotFoundException } from "@nestjs/common";

@Resolver(() => User)
export class UserResolver {
  // Option 1: NestJS built-in exceptions (auto-formatted for GraphQL)
  @Query(() => User)
  async user(@Args("id", { type: () => ID }) id: string) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  // Option 2: GraphQLError with extensions
  @Mutation(() => User)
  async createUser(@Args("input") input: CreateUserInput) {
    const existing = await this.userService.findByEmail(input.email);
    if (existing) {
      throw new GraphQLError("Email already in use", {
        extensions: { code: "CONFLICT" },
      });
    }
    return this.userService.create(input);
  }
}
```

---

## 2. NestJS Exception → GraphQL Error Mapping

| NestJS Exception               | HTTP Code | GraphQL `extensions.code` |
| ------------------------------ | --------- | ------------------------- |
| `BadRequestException`          | 400       | `BAD_REQUEST`             |
| `UnauthorizedException`        | 401       | `UNAUTHENTICATED`         |
| `ForbiddenException`           | 403       | `FORBIDDEN`               |
| `NotFoundException`            | 404       | `NOT_FOUND`               |
| `ConflictException`            | 409       | `CONFLICT`                |
| `UnprocessableEntityException` | 422       | `UNPROCESSABLE_ENTITY`    |

NestJS automatically converts these to GraphQL errors with appropriate codes.

---

## 3. Custom Exceptions

```typescript
// common/exceptions/graphql.exceptions.ts
import { GraphQLError } from "graphql";

export class NotFoundError extends GraphQLError {
  constructor(resource: string) {
    super(`${resource} not found`, {
      extensions: { code: "NOT_FOUND" },
    });
  }
}

export class ValidationError extends GraphQLError {
  constructor(errors: Record<string, string[]>) {
    super("Validation failed", {
      extensions: { code: "VALIDATION_ERROR", errors },
    });
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(message = "Not authorized") {
    super(message, {
      extensions: { code: "FORBIDDEN" },
    });
  }
}

// Usage
throw new NotFoundError("User");
throw new ValidationError({ email: ["Invalid format"] });
```

---

## 4. Input Validation with Pipes

```typescript
// main.ts — enable global validation
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);

// dto/create-user.input.ts
import { IsEmail, MinLength, IsOptional } from "class-validator";

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @Field()
  @MinLength(2, { message: "Name must be at least 2 characters" })
  name: string;

  @Field()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  password: string;
}

// Validation errors are automatically formatted as GraphQL errors:
// {
//   "errors": [{
//     "message": "Bad Request",
//     "extensions": {
//       "code": "BAD_REQUEST",
//       "response": { "message": ["Invalid email format", ...] }
//     }
//   }]
// }
```

---

## 5. GraphQL Exception Filter

```typescript
// common/filters/graphql-exception.filter.ts
import { Catch, ArgumentsHost } from "@nestjs/common";
import { GqlExceptionFilter, GqlArgumentsHost } from "@nestjs/graphql";
import { GraphQLError } from "graphql";

@Catch()
export class GraphqlExceptionFilter implements GqlExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);

    // Log the full error
    console.error("GraphQL Error:", exception);

    // Already a GraphQLError — pass through
    if (exception instanceof GraphQLError) {
      return exception;
    }

    // NestJS HttpException — convert
    if (exception.getStatus) {
      return new GraphQLError(exception.message, {
        extensions: {
          code: exception.constructor.name.replace("Exception", "").toUpperCase(),
          status: exception.getStatus(),
        },
      });
    }

    // Unknown error — hide details in production
    return new GraphQLError("Internal server error", {
      extensions: { code: "INTERNAL_ERROR" },
    });
  }
}

// Register globally
// app.module.ts
@Module({
  providers: [
    { provide: APP_FILTER, useClass: GraphqlExceptionFilter },
  ],
})
```

---

## 6. Error Formatting in GraphQLModule

```typescript
// app.module.ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  formatError: (formattedError) => {
    // Strip stacktrace in production
    if (process.env.NODE_ENV === "production") {
      delete formattedError.extensions?.stacktrace;
    }

    // Hide internal errors
    if (formattedError.extensions?.code === "INTERNAL_SERVER_ERROR") {
      return {
        message: "An unexpected error occurred",
        extensions: { code: "INTERNAL_ERROR" },
      };
    }

    return formattedError;
  },
});
```

---

## 7. Union-Based Error Handling

```typescript
// models/mutation-result.model.ts
@ObjectType()
export class MutationError {
  @Field()
  message: string;

  @Field()
  code: string;
}

@ObjectType()
export class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
export class ValidationErrors {
  @Field(() => [FieldError])
  errors: FieldError[];
}

export const CreateUserResult = createUnionType({
  name: "CreateUserResult",
  types: () => [User, ValidationErrors, MutationError] as const,
});

// Resolver
@Mutation(() => CreateUserResult)
async createUser(@Args("input") input: CreateUserInput) {
  const validation = this.userService.validate(input);
  if (!validation.ok) return { errors: validation.errors }; // ValidationErrors
  return this.userService.create(input); // User
}
```

---

## 8. Best Practices

- **Use NestJS exceptions** (`NotFoundException`, etc.) — auto-mapped to GraphQL errors
- **Enable `ValidationPipe`** globally — validates `@InputType()` with class-validator
- **Use `formatError`** to strip sensitive info in production
- **Log all errors server-side** — use exception filter or plugin for centralized logging
- **Use error codes** — clients should match on `extensions.code`, not message strings
- **Don't expose stack traces** — strip in production via `formatError`
- **Use union types** for type-safe error handling in mutations when needed
