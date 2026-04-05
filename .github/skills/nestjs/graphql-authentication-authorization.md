---
name: nestjs-graphql-authentication-authorization
description: "NestJS GraphQL authentication and authorization — JWT guards, @UseGuards, roles decorator, @CurrentUser, and GqlAuthGuard. Use when: protecting GraphQL resolvers; implementing login; checking roles; using guards with GraphQL. DO NOT USE FOR: REST auth (use nestjs-guards-authentication skill); error handling (use nestjs-graphql-error-handling skill)."
---

# NestJS GraphQL Authentication & Authorization Skill

## Overview

Covers auth in NestJS GraphQL — JWT guards adapted for GraphQL, custom decorators, role-based access, and field-level authorization.

---

## 1. GqlAuthGuard (JWT)

```typescript
// auth/guards/gql-auth.guard.ts
import { ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GqlAuthGuard extends AuthGuard("jwt") {
  // Override to extract request from GraphQL context (not HTTP)
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```

---

## 2. @CurrentUser Decorator

```typescript
// auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context);
  return ctx.getContext().req.user;
});
```

---

## 3. Protecting Resolvers

```typescript
import { UseGuards } from "@nestjs/common";

@Resolver(() => User)
export class UserResolver {
  // Public query — no guard
  @Query(() => User, { nullable: true })
  async user(@Args("id", { type: () => ID }) id: string) {
    return this.userService.findById(id);
  }

  // Authenticated query
  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User) {
    return user;
  }

  // Authenticated mutation
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateProfile(@CurrentUser() user: User, @Args("input") input: UpdateProfileInput) {
    return this.userService.update(user.id, input);
  }
}
```

---

## 4. Login / Register (Public Mutations)

```typescript
// auth/auth.resolver.ts
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
}

// auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(input: LoginInput): Promise<AuthPayload> {
    const user = await this.userService.findByEmail(input.email);
    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return {
      token: this.jwtService.sign({ sub: user.id }),
      user,
    };
  }

  async register(input: RegisterInput): Promise<AuthPayload> {
    const hashed = await bcrypt.hash(input.password, 10);
    const user = await this.userService.create({ ...input, password: hashed });
    return {
      token: this.jwtService.sign({ sub: user.id }),
      user,
    };
  }
}
```

---

## 5. Role-Based Access (RBAC)

```typescript
// auth/decorators/roles.decorator.ts
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// auth/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;
    return requiredRoles.includes(user.role);
  }
}

// Usage
@Mutation(() => Boolean)
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
async deleteUser(@Args("id", { type: () => ID }) id: string) {
  await this.userService.delete(id);
  return true;
}
```

---

## 6. Guard at Class Level

```typescript
// Apply auth to all resolvers in a class
@Resolver(() => User)
@UseGuards(GqlAuthGuard)
export class UserResolver {
  // All methods require authentication

  @Query(() => User)
  async me(@CurrentUser() user: User) {
    return user;
  }

  @Mutation(() => User)
  async updateProfile(@CurrentUser() user: User, @Args("input") input: UpdateProfileInput) {
    return this.userService.update(user.id, input);
  }

  // Admin-only with additional RolesGuard
  @Mutation(() => Boolean)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteUser(@Args("id", { type: () => ID }) id: string) {
    await this.userService.delete(id);
    return true;
  }
}
```

---

## 7. Field-Level Authorization

```typescript
@Resolver(() => User)
export class UserResolver {
  // Hide sensitive field from non-owners
  @ResolveField(() => String, { nullable: true })
  email(@Parent() user: User, @CurrentUser() currentUser: User | null) {
    if (currentUser?.id === user.id || currentUser?.role === UserRole.ADMIN) {
      return user.email;
    }
    return null;
  }
}
```

---

## 8. Optional Auth (Public + Authenticated)

```typescript
// Guard that doesn't throw when unauthenticated
@Injectable()
export class GqlOptionalAuthGuard extends AuthGuard("jwt") {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  handleRequest(err: any, user: any) {
    // Return null instead of throwing if no token
    return user || null;
  }
}

// Usage — currentUser is null for anonymous users
@Query(() => [Post])
@UseGuards(GqlOptionalAuthGuard)
async posts(@CurrentUser() user: User | null) {
  if (user) return this.postService.findAllIncludingDrafts(user.id);
  return this.postService.findPublished();
}
```

---

## 9. Best Practices

- **Extend `AuthGuard("jwt")`** with `getRequest` override for GraphQL context
- **Use `@CurrentUser()` decorator** — clean, reusable way to access the authenticated user
- **Use `@UseGuards(GqlAuthGuard)`** at method or class level
- **Stack guards** — `@UseGuards(GqlAuthGuard, RolesGuard)` for auth + roles
- **Keep login/register public** — don't apply auth guards to these mutations
- **Use `GqlOptionalAuthGuard`** for endpoints that work for both anonymous and authenticated users
- **Authorize in services** for ownership checks — guards handle role-level auth
- **Register `JwtModule`** in `AuthModule` with `@nestjs/jwt`
