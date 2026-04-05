---
name: nestjs-input-validation
description: "NestJS input validation — ValidationPipe with class-validator, whitelist/forbidNonWhitelisted, class-transformer, DTO patterns, custom validators, and global vs. route-level pipe setup. Use when: validating request bodies; enforcing DTO schemas; stripping unknown fields; applying custom validation rules. DO NOT USE FOR: param parsing transforms (use nestjs-pipes-validation skill)."
---

# NestJS Input Validation Skill

## Overview

Covers request body and query validation in NestJS using `ValidationPipe`, `class-validator`, and `class-transformer`.

---

## 1. Installation

```bash
npm install class-validator class-transformer
```

---

## 2. Global ValidationPipe

```typescript
// main.ts — apply globally so every endpoint is validated automatically
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: true, // throw 400 on unknown properties
      transform: true, // auto-transform payloads to DTO instances
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.listen(3000);
}
```

---

## 3. DTO with class-validator

```typescript
// user/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsUrl,
  IsPhoneNumber,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(120)
  @Type(() => Number)
  age?: number;

  @IsOptional()
  @IsUrl()
  website?: string;
}
```

---

## 4. Partial / Mapped DTOs

```typescript
// user/dto/update-user.dto.ts
import { PartialType, PickType, OmitType, IntersectionType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";

// All fields become optional
export class UpdateUserDto extends PartialType(CreateUserDto) {}

// Only specific fields
export class ChangeEmailDto extends PickType(CreateUserDto, ["email"] as const) {}

// Exclude specific fields
export class CreateUserWithoutPasswordDto extends OmitType(CreateUserDto, ["password"] as const) {}
```

---

## 5. Nested DTO Validation

```typescript
import { ValidateNested, IsArray, ArrayMinSize } from "class-validator";
import { Type } from "class-transformer";

export class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  @Length(2, 2)
  countryCode: string;
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @ValidateNested() // validate the nested object
  @Type(() => AddressDto) // tell class-transformer the type
  address: AddressDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  shippingAddresses: AddressDto[];
}
```

---

## 6. Query Parameter Validation

```typescript
// common/dto/pagination.dto.ts
import { IsOptional, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// Controller usage
@Get()
findAll(@Query() query: PaginationDto) {
  return this.userService.findAll(query.page, query.limit);
}
```

---

## 7. Custom Validator

```typescript
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

@ValidatorConstraint({ name: "isUnique", async: true })
export class IsUniqueEmailConstraint implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(email: string) {
    const user = await this.userService.findByEmail(email);
    return !user; // true = valid (no existing user)
  }

  defaultMessage({ value }: ValidationArguments) {
    return `Email "${value}" is already in use`;
  }
}

export function IsUniqueEmail(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsUniqueEmailConstraint,
    });
  };
}

// DTO usage
export class CreateUserDto {
  @IsEmail()
  @IsUniqueEmail()
  email: string;
}

// Register in module so DI works
@Module({
  providers: [IsUniqueEmailConstraint],
})
export class UserModule {}

// Enable DI in validators (main.ts)
useContainer(app.select(AppModule), { fallbackOnErrors: true });
```

---

## 8. Validation Groups

```typescript
// Apply different rules based on context
import { IsNotEmpty, IsOptional } from "class-validator";

export class UserDto {
  @IsNotEmpty({ groups: ["create"] })
  @IsOptional({ groups: ["update"] })
  password?: string;
}

// Pipe with group
new ValidationPipe({ groups: ["create"] });
```

---

## 9. Best Practices

- **Use `whitelist: true` globally** — silently strip extra fields before they reach the service
- **Use `forbidNonWhitelisted: true`** — return a 400 when clients send unexpected fields; helps catch integration bugs
- **Use `transform: true`** — automatically convert query string numbers to `number` type via `@Type(() => Number)`
- **Use `PartialType` for update DTOs** — avoids duplicating validators; all rules are inherited and made optional
- **Use `@ValidateNested` + `@Type`** — both decorators are required for nested object validation
- **Enable `useContainer`** — required to inject NestJS services into custom validator constraints
