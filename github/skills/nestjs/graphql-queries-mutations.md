---
name: nestjs-graphql-queries-mutations
description: "NestJS GraphQL queries and mutations — @Query, @Mutation, @Args decorators, input types, return types, and resolver method signatures. Use when: defining queries and mutations in NestJS resolvers; using Args decorators; structuring operations. DO NOT USE FOR: resolver organization (use nestjs-graphql-resolvers skill); subscriptions (use nestjs-graphql-subscriptions skill)."
---

# NestJS GraphQL Queries & Mutations Skill

## Overview

Covers defining queries and mutations in NestJS — `@Query`, `@Mutation`, `@Args` decorators, input/return types, and pagination.

---

## 1. Basic Queries

```typescript
import { Resolver, Query, Args, ID, Int } from "@nestjs/graphql";
import { User } from "./models/user.model";
import { UserService } from "./user.service";

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  // Single resource — nullable (may not exist)
  @Query(() => User, { nullable: true, name: "user" })
  async getUser(@Args("id", { type: () => ID }) id: string) {
    return this.userService.findById(id);
  }

  // Current user — non-null (requires auth)
  @Query(() => User)
  async me(@CurrentUser() user: User) {
    return user;
  }

  // List with pagination
  @Query(() => [User])
  async users(
    @Args("page", { type: () => Int, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Int, defaultValue: 20 }) limit: number,
  ) {
    return this.userService.findAll({ page, limit });
  }
}
```

---

## 2. Using ArgsType (Multiple Arguments)

```typescript
// dto/get-users.args.ts
import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetUsersArgs {
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 20 })
  limit: number;

  @Field({ nullable: true })
  search?: string;

  @Field(() => UserRole, { nullable: true })
  role?: UserRole;

  @Field({ defaultValue: "createdAt" })
  sortBy: string;

  @Field({ defaultValue: "desc" })
  sortOrder: string;
}

// Usage in resolver — @Args() without name unpacks the ArgsType
@Query(() => UserConnection)
async users(@Args() args: GetUsersArgs) {
  return this.userService.findAll(args);
}
```

---

## 3. Basic Mutations

```typescript
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  async createUser(@Args("input") input: CreateUserInput) {
    return this.userService.create(input);
  }

  @Mutation(() => User)
  async updateUser(@Args("id", { type: () => ID }) id: string, @Args("input") input: UpdateUserInput) {
    return this.userService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args("id", { type: () => ID }) id: string) {
    await this.userService.delete(id);
    return true;
  }
}
```

---

## 4. Mutation with Payload Type

```typescript
// models/auth-payload.model.ts
@ObjectType()
export class AuthPayload {
  @Field()
  token: string;

  @Field(() => User)
  user: User;
}

// auth.resolver.ts
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async login(@Args("input") input: LoginInput) {
    return this.authService.login(input);
  }

  @Mutation(() => AuthPayload)
  async register(@Args("input") input: RegisterInput) {
    return this.authService.register(input);
  }

  @Mutation(() => Boolean)
  async logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id);
  }
}
```

---

## 5. Input Types

```typescript
// dto/create-user.input.ts
@InputType()
export class CreateUserInput {
  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  password: string;
}

// dto/update-user.input.ts — all fields optional
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}

// Combine with class-validator for validation
import { IsEmail, MinLength } from "class-validator";

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(2)
  name: string;

  @Field()
  @MinLength(8)
  password: string;
}
```

---

## 6. Paginated Queries (Connection Pattern)

```typescript
// common/dto/pagination.args.ts
@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { defaultValue: 20 })
  @Min(1)
  @Max(100)
  first: number;

  @Field({ nullable: true })
  after?: string;
}

// Resolver
@Query(() => PostConnection)
async posts(@Args() pagination: PaginationArgs) {
  return this.postService.findWithCursor(pagination);
}
```

---

## 7. @Args Options

```typescript
// Named arg with type
@Args("id", { type: () => ID }) id: string

// Named arg with default
@Args("limit", { type: () => Int, defaultValue: 20 }) limit: number

// Nullable arg
@Args("search", { nullable: true }) search?: string

// Input type arg (name inferred from parameter)
@Args("input") input: CreateUserInput

// ArgsType (all fields unpacked as separate args)
@Args() args: GetUsersArgs

// Description
@Args("id", { type: () => ID, description: "User's unique ID" }) id: string
```

---

## 8. Best Practices

- **Use `@InputType()` for mutation inputs** — wrap related args in an input object
- **Use `@ArgsType()` for query filters** — unpacks as separate GraphQL arguments
- **Use `PartialType` for updates** — avoids duplicating create input fields
- **Add `class-validator`** decorators for input validation (with `ValidationPipe`)
- **Specify return types explicitly** — `@Query(() => User)` not just `@Query()`
- **Name operations clearly** — `name: "user"` if method name differs from desired query name
- **Use `{ nullable: true }`** for optional args and single-resource queries
- **Use payload types** for complex mutation results — `AuthPayload` not just `User`
