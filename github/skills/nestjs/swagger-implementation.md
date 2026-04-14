---
name: nestjs-swagger-implementation
description: "NestJS Swagger/OpenAPI documentation — setting up @nestjs/swagger, @ApiProperty on DTOs, @ApiOperation/@ApiTags on controllers, bearer auth, response schemas, and generating the OpenAPI spec. Use when: documenting a REST API; adding Swagger UI; decorating DTOs and endpoints for OpenAPI. DO NOT USE FOR: input validation rules (use nestjs-input-validation skill)."
---

# NestJS Swagger Implementation Skill

## Overview

Covers generating OpenAPI documentation for NestJS REST APIs using `@nestjs/swagger`.

---

## 1. Installation & Setup

```bash
npm install @nestjs/swagger
```

```typescript
// main.ts
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("My API")
    .setDescription("REST API documentation")
    .setVersion("1.0")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "access-token", // reference name used in @ApiBearerAuth()
    )
    .addTag("users", "User management endpoints")
    .addTag("auth", "Authentication endpoints")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(3000);
}
```

---

## 2. Documenting DTOs

```typescript
// user/dto/create-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from "class-validator";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export class CreateUserDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "SecurePass123!",
    minLength: 8,
    description: "User password",
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: "Jane Doe" })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
```

---

## 3. Documenting Controllers

```typescript
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";

@ApiTags("users")
@ApiBearerAuth("access-token")
@Controller("users")
export class UserController {
  @Get()
  @ApiOperation({
    summary: "List all users",
    description: "Returns a paginated list of users.",
  })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: "Users retrieved", type: [UserDto] })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findAll(@Query() query: PaginationDto) {
    return this.userService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiParam({ name: "id", format: "uuid", description: "User UUID" })
  @ApiResponse({ status: 200, description: "User found", type: UserDto })
  @ApiResponse({ status: 404, description: "User not found" })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: "User created", type: UserDto })
  @ApiResponse({ status: 409, description: "Email already in use" })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a user" })
  @ApiResponse({ status: 200, description: "User updated", type: UserDto })
  @ApiResponse({ status: 404, description: "User not found" })
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete a user" })
  @ApiResponse({ status: 204, description: "User deleted" })
  @ApiResponse({ status: 404, description: "User not found" })
  remove(@Param("id") id: string) {
    return this.userService.remove(id);
  }
}
```

---

## 4. Response DTO (Entity Schema)

```typescript
// user/dto/user.dto.ts
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class UserDto {
  @Expose()
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string;

  @Expose()
  @ApiProperty({ example: "user@example.com" })
  email: string;

  @Expose()
  @ApiProperty({ example: "Jane Doe" })
  name: string;

  @Expose()
  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  // password field is excluded via @Exclude()
}
```

---

## 5. Paginated Response Schema

```typescript
// common/dto/paginated.dto.ts
import { ApiProperty } from "@nestjs/swagger";

export class PaginationMeta {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export function PaginatedDto<T>(ItemDto: new () => T) {
  class PaginatedDtoClass {
    @ApiProperty({ isArray: true, type: ItemDto })
    data: T[];

    @ApiProperty()
    meta: PaginationMeta;
  }
  return PaginatedDtoClass;
}

// Usage as return type
@ApiResponse({ status: 200, type: PaginatedDto(UserDto) })
```

---

## 6. Mapped Types (Swagger-Aware)

```typescript
// Use @nestjs/swagger mapped types (not @nestjs/mapped-types) for Swagger support
import { PartialType, PickType, OmitType } from "@nestjs/swagger";

export class UpdateUserDto extends PartialType(CreateUserDto) {}
export class ChangePasswordDto extends PickType(CreateUserDto, [
  "password",
] as const) {}
```

---

## 7. Export OpenAPI JSON

```typescript
// Generate spec file for CI / SDK generation
import { writeFileSync } from "fs";

const document = SwaggerModule.createDocument(app, config);
writeFileSync("./openapi.json", JSON.stringify(document, null, 2));
```

---

## 8. Best Practices

- **Use `@nestjs/swagger` mapped types** (`PartialType`, `OmitType`, etc.) — the `@nestjs/mapped-types` versions don't carry Swagger metadata
- **Document every response code** — include 400/401/403/404/409 as appropriate; clients rely on this
- **Use `@ApiProperty` with `example`** — realistic examples make Swagger UI much more useful
- **Import from `@nestjs/swagger` for DTO types** — request and response types appear in the "Schemas" section automatically
- **Protect the docs in production** — add an IP restriction or basic auth middleware around `/api/docs`
- **Generate `openapi.json` in CI** — use it to catch breaking changes and generate client SDKs
