---
name: nestjs-controller-design
description: "NestJS controller design — HTTP method decorators, route parameters, request body, query strings, response shaping, versioning, and resource-based REST endpoint patterns. Use when: defining REST controllers; handling HTTP requests; extracting @Body/@Param/@Query; building CRUD endpoints. DO NOT USE FOR: business logic (use nestjs-service-layer skill); input validation (use nestjs-input-validation skill)."
---

# NestJS Controller Design Skill

## Overview

Covers building REST controllers in NestJS — routing decorators, parameter extraction, response shaping, and resource patterns.

---

## 1. Basic Controller

```typescript
// user/user.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpCode, HttpStatus } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users") // base path: /users
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get() // GET /users
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id") // GET /users/:id
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Post() // POST /users — 201 by default
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Put(":id") // PUT /users/:id
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(":id") // DELETE /users/:id
  @HttpCode(HttpStatus.NO_CONTENT) // 204
  remove(@Param("id") id: string) {
    return this.userService.remove(id);
  }
}
```

---

## 2. Parameter Decorators

```typescript
import {
  Param, Body, Query, Headers, Ip,
  ParseIntPipe, ParseUUIDPipe,
} from "@nestjs/common";

@Get(":id")
findOne(
  @Param("id", ParseUUIDPipe) id: string,  // validated UUID
) {}

@Get()
findAll(
  @Query("page", new ParseIntPipe({ optional: true })) page = 1,
  @Query("limit", new ParseIntPipe({ optional: true })) limit = 20,
  @Query("search") search?: string,
) {}

@Post()
create(
  @Body() dto: CreateUserDto,
  @Headers("x-request-id") requestId: string,
  @Ip() ip: string,
) {}
```

---

## 3. Response Decorators

```typescript
import { Res, HttpCode, HttpStatus, Header, Redirect } from "@nestjs/common";
import { Response } from "express";

// Custom status code
@Post()
@HttpCode(HttpStatus.CREATED) // 201
create(@Body() dto: CreateUserDto) {
  return this.userService.create(dto);
}

// Custom response headers
@Get(":id")
@Header("Cache-Control", "max-age=60")
findOne(@Param("id") id: string) {
  return this.userService.findOne(id);
}

// Redirect
@Get("old-path")
@Redirect("/users", 301)
redirect() {}

// Dynamic redirect
@Get("dynamic")
dynamicRedirect() {
  return { url: "/users", statusCode: 302 };
}
```

---

## 4. Request Object

```typescript
import { Req } from "@nestjs/common";
import { Request } from "express";

@Get("profile")
profile(@Req() req: Request) {
  // Not recommended — prefer specific decorators
  return req.user;
}
```

---

## 5. Nested Resources

```typescript
// post/post.controller.ts
@Controller("users/:userId/posts") // /users/:userId/posts
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  findByUser(@Param("userId", ParseUUIDPipe) userId: string) {
    return this.postService.findByUser(userId);
  }

  @Post()
  createForUser(@Param("userId", ParseUUIDPipe) userId: string, @Body() dto: CreatePostDto) {
    return this.postService.create({ ...dto, authorId: userId });
  }
}
```

---

## 6. API Versioning

```typescript
// main.ts
app.enableVersioning({ type: VersioningType.URI });

// v1 controller
@Controller({ path: "users", version: "1" })
export class UserV1Controller {
  @Get()
  findAll() {
    /* ... */
  }
}

// v2 controller
@Controller({ path: "users", version: "2" })
export class UserV2Controller {
  @Get()
  findAll() {
    /* v2 logic */
  }
}
```

---

## 7. Applying Guards, Pipes, Interceptors at Controller Level

```typescript
import { UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";

@Controller("users")
@UseGuards(JwtAuthGuard) // applies to all routes in this controller
@UseInterceptors(LoggingInterceptor)
@UsePipes(new ValidationPipe({ whitelist: true }))
export class UserController {
  @Get()
  findAll() {
    /* ... */
  }

  @Get("me")
  @UseGuards(RolesGuard) // additional guard for a single route
  @Roles("admin")
  me() {
    /* ... */
  }
}
```

---

## 8. File Upload

```typescript
import { UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";

@Post("avatar")
@UseInterceptors(
  FileInterceptor("file", {
    storage: diskStorage({ destination: "./uploads" }),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new BadRequestException("Only images allowed"), false);
      }
      cb(null, true);
    },
  }),
)
uploadAvatar(
  @UploadedFile() file: Express.Multer.File,
  @Param("id", ParseUUIDPipe) id: string,
) {
  return this.userService.setAvatar(id, file.path);
}
```

---

## 9. Best Practices

- **Controllers are thin** — delegate all logic to services; never put business logic in a controller
- **Use DTOs** — always type `@Body()` with a DTO class; pair with `ValidationPipe`
- **Use specific param pipes** — prefer `ParseUUIDPipe`/`ParseIntPipe` over manual parsing
- **Use `@HttpCode`** — set correct status codes (204 for DELETE, 201 for POST)
- **Avoid `@Res()`** — using the raw response object bypasses interceptors and exception filters
- **Prefix routes consistently** — use `@Controller("resource")` and nest sub-paths inside
