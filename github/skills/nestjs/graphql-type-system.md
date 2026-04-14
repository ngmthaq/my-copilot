---
name: nestjs-graphql-type-system
description: "NestJS GraphQL type system — ObjectType, InputType, enums, interfaces, unions, scalars, and Field decorators with code-first approach. Use when: defining types with NestJS decorators; choosing type modifiers; working with enums and unions. DO NOT USE FOR: schema organization (use nestjs-graphql-schema-design skill); resolver implementation (use nestjs-graphql-resolvers skill)."
---

# NestJS GraphQL Type System Skill

## Overview

Covers all GraphQL types in NestJS code-first — ObjectType, InputType, enums, interfaces, unions, scalars, and Field options.

---

## 1. Scalar Types & Field Decorators

```typescript
import { ObjectType, Field, ID, Int, Float } from "@nestjs/graphql";

@ObjectType()
export class Example {
  @Field(() => ID) // ID! — unique identifier
  id: string;

  @Field() // String! — inferred from TypeScript type
  name: string;

  @Field(() => Int) // Int! — must specify, TS `number` is ambiguous
  age: number;

  @Field(() => Float) // Float!
  score: number;

  @Field() // Boolean! — inferred
  active: boolean;

  @Field() // DateTime! — Date maps to ISO string
  createdAt: Date;
}

// TypeScript → GraphQL inference:
// string  → String
// boolean → Boolean
// Date    → DateTime (with dateScalarMode: "isoDate")
// number  → AMBIGUOUS — must specify Int or Float explicitly
```

---

## 2. Object Types

```typescript
@ObjectType({ description: "A registered user" })
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => [Post], { description: "User's published posts" })
  posts: Post[];

  @Field(() => Int, { description: "Total number of posts" })
  postsCount: number;

  @Field()
  createdAt: Date;
}
```

---

## 3. Enum Types

```typescript
// MUST register enums explicitly
import { registerEnumType } from "@nestjs/graphql";

export enum UserRole {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  USER = "USER",
}

registerEnumType(UserRole, {
  name: "UserRole",
  description: "User permission levels",
  valuesMap: {
    ADMIN: { description: "Full system access" },
    MODERATOR: { description: "Content moderation access" },
  },
});

// Usage in types
@Field(() => UserRole)
role: UserRole;

// With default value in input
@Field(() => UserRole, { defaultValue: UserRole.USER })
role: UserRole;
```

---

## 4. Input Types

```typescript
import {
  InputType,
  Field,
  PartialType,
  OmitType,
  PickType,
  IntersectionType,
} from "@nestjs/graphql";

@InputType()
export class CreateUserInput {
  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  password: string;

  @Field(() => UserRole, { defaultValue: UserRole.USER })
  role: UserRole;
}

// Partial — all fields optional (for updates)
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}

// Omit — exclude fields
@InputType()
export class UpdateProfileInput extends OmitType(CreateUserInput, [
  "password",
  "role",
]) {}

// Pick — select fields
@InputType()
export class LoginInput extends PickType(CreateUserInput, [
  "email",
  "password",
]) {}

// Intersection — merge two input types
@InputType()
export class CreateAdminInput extends IntersectionType(
  CreateUserInput,
  AdminMetadataInput,
) {}
```

---

## 5. Interfaces

```typescript
import { InterfaceType, Field, ID } from "@nestjs/graphql";

@InterfaceType()
export abstract class Node {
  @Field(() => ID)
  id: string;
}

@InterfaceType()
export abstract class Timestamped {
  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// Implementing interfaces
@ObjectType({ implements: () => [Node, Timestamped] })
export class User implements Node, Timestamped {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
```

```typescript
// Resolve type for interface queries
@InterfaceType({
  resolveType(value) {
    if ("email" in value) return User;
    if ("title" in value) return Post;
    return null;
  },
})
export abstract class Node { ... }
```

---

## 6. Union Types

```typescript
import { createUnionType } from "@nestjs/graphql";

export const SearchResultUnion = createUnionType({
  name: "SearchResult",
  types: () => [User, Post, Comment] as const,
  resolveType(value) {
    if ("email" in value) return User;
    if ("title" in value) return Post;
    if ("text" in value) return Comment;
    return null;
  },
});

// Usage in resolver
@Query(() => [SearchResultUnion])
async search(@Args("query") query: string) {
  // ...
}
```

---

## 7. Nullability Options

```typescript
@ObjectType()
export class User {
  @Field()
  name: string; // String! (non-null, default)

  @Field({ nullable: true })
  bio?: string; // String (nullable)

  @Field(() => [Post])
  posts: Post[]; // [Post!]! (default for arrays)

  @Field(() => [Post], { nullable: true })
  drafts?: Post[]; // [Post!] (nullable list)

  @Field(() => [Post], { nullable: "items" })
  history: (Post | null)[]; // [Post]! (nullable items)

  @Field(() => [Post], { nullable: "itemsAndList" })
  archived?: (Post | null)[] | null; // [Post] (both nullable)
}
```

---

## 8. Custom Scalars

```typescript
// Using graphql-scalars library
// npm install graphql-scalars
import { DateTimeResolver, JSONResolver, EmailAddressResolver } from "graphql-scalars";

// Register in GraphQLModule
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  resolvers: {
    DateTime: DateTimeResolver,
    JSON: JSONResolver,
    EmailAddress: EmailAddressResolver,
  },
});

// Use in types via GraphQL scalar type
import { GraphQLEmailAddress } from "graphql-scalars";

@Field(() => GraphQLEmailAddress)
email: string;
```

---

## 9. Best Practices

- **Always specify `() => Int` or `() => Float`** for numbers — TypeScript `number` is ambiguous
- **Always `registerEnumType`** — enums won't appear in schema without it
- **Use `PartialType`** for update inputs — avoids duplicating fields
- **Use `nullable: true`** explicitly — NestJS defaults to non-null
- **Add `description`** to ObjectType and Field — generates schema docs
- **Use `() => [Type]` for arrays** — NestJS needs the explicit array wrapper
- **Prefer code-first** — decorators keep types and code colocated
