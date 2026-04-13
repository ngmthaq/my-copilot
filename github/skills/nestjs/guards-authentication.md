---
name: nestjs-guards-authentication
description: "NestJS guards and authentication — implementing CanActivate, JWT auth with Passport, role-based access control, @Public() bypass decorator, and applying guards globally vs. per route. Use when: protecting REST endpoints; implementing JWT auth; attaching the authenticated user to the request; role-based access. DO NOT USE FOR: GraphQL auth (use nestjs-graphql-authentication-authorization skill)."
---

# NestJS Guards & Authentication Skill

## Overview

Covers protecting NestJS REST endpoints — `CanActivate`, Passport JWT strategy, `@UseGuards`, role-based access, and global guard setup.

---

## 1. Installation

```bash
npm install @nestjs/passport passport passport-jwt @nestjs/jwt
npm install --save-dev @types/passport-jwt
```

---

## 2. JWT Strategy

```typescript
// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UserService } from "../../user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow("JWT_SECRET"),
    });
  }

  // Called on every authenticated request; return value is set as req.user
  async validate(payload: { sub: string }) {
    const user = await this.userService.findOne(payload.sub);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
```

---

## 3. JWT Auth Guard

```typescript
// auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Allow routes decorated with @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

---

## 4. @Public() Decorator (Bypass Auth)

```typescript
// auth/decorators/public.decorator.ts
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Usage in a controller
@Public()
@Post("login")
login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}
```

---

## 5. @CurrentUser Decorator

```typescript
// auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);

// Usage
@Get("me")
getProfile(@CurrentUser() user: User) {
  return user;
}
```

---

## 6. Role-Based Access Control

```typescript
// auth/decorators/roles.decorator.ts
import { SetMetadata } from "@nestjs/common";
export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user?.role === role);
  }
}

// Usage
@Get("admin-only")
@Roles("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
adminEndpoint() { /* ... */ }
```

---

## 7. Auth Service & JWT Signing

```typescript
// auth/auth.service.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const token = this.jwtService.sign({ sub: user.id });
    return { accessToken: token, user };
  }

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 12);
    return this.userService.create({ ...dto, password: hashed });
  }
}
```

---

## 8. Applying Guard Globally

```typescript
// main.ts — applied to all routes; @Public() bypasses it
import { APP_GUARD } from "@nestjs/core";

// In AppModule providers:
providers: [
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_GUARD, useClass: RolesGuard },
];
```

---

## 9. Auth Module

```typescript
// auth/auth.module.ts
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow("JWT_SECRET"),
        signOptions: { expiresIn: config.get("JWT_EXPIRES_IN", "7d") },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

---

## 10. Best Practices

- **Apply `JwtAuthGuard` globally** — use `APP_GUARD` and opt out with `@Public()` rather than opt-in per route
- **Hash passwords with bcrypt** — use `bcrypt.hash(password, 12)`; never store plain text
- **Use `getOrThrow`** — crash at startup if `JWT_SECRET` is missing
- **Keep `validate()` lean** — fetch only what is needed for `req.user`; avoid heavy queries
- **Separate `JwtAuthGuard` from `RolesGuard`** — auth and authorisation are distinct concerns
- **Never expose sensitive fields** — exclude `password` from the user object returned by `validate()`
