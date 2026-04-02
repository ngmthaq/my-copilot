---
name: nestjs-graphql-schema-design
description: "NestJS GraphQL schema design — code-first approach with decorators, ObjectType, Field, schema organization by modules, and nullability. Use when: designing GraphQL schemas in NestJS; structuring types with decorators; organizing schema across modules. DO NOT USE FOR: resolver logic (use nestjs-graphql-resolvers skill); plain Apollo setup (use graphql-schema-design skill)."
---

# NestJS GraphQL Schema Design Skill

## Overview

Covers schema design in NestJS using the code-first approach — decorators, type organization by modules, nullability, and schema generation.

---

## 1. Setup

```typescript
// npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql
// app.module.ts
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"), // Code-first
      sortSchema: true,
    }),
  ],
})
export class AppModule {}
```

---

## 2. Object Types with Decorators

```typescript
// user/models/user.model.ts
import { ObjectType, Field, ID, registerEnumType } from "@nestjs/graphql";

export enum UserRole {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  USER = "USER",
}

registerEnumType(UserRole, { name: "UserRole" });

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field({ nullable: true, description: "User bio" })
  bio?: string;

  @Field(() => [Post])
  posts: Post[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
```

---

## 3. Naming Conventions

```typescript
// Types: PascalCase (class name becomes GraphQL type name)
@ObjectType()
export class BlogPost { ... }

// Fields: camelCase (property name becomes field name)
@Field()
firstName: string;

// Enums: PascalCase type, SCREAMING_SNAKE values
enum PostStatus { DRAFT = "DRAFT", PUBLISHED = "PUBLISHED" }

// Input types: suffixed with "Input"
@InputType()
export class CreateUserInput { ... }

// Override GraphQL name if needed
@ObjectType("UserProfile")
export class UserProfileModel { ... }
```

---

## 4. Nullability Rules

```typescript
@ObjectType()
export class User {
  @Field(() => ID)
  id: string; // Non-null (default)

  @Field({ nullable: true })
  bio?: string; // Nullable field

  @Field(() => [Post])
  posts: Post[]; // [Post!]! — non-null list, non-null items (default)

  @Field(() => [Post], { nullable: true })
  drafts?: Post[]; // [Post!] — nullable list, non-null items

  @Field(() => [Post], { nullable: "items" })
  history: (Post | null)[]; // [Post]! — non-null list, nullable items

  @Field(() => [Post], { nullable: "itemsAndList" })
  archived?: (Post | null)[] | null; // [Post] — nullable list, nullable items
}
```

---

## 5. Input Types

```typescript
// user/dto/create-user.input.ts
import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class CreateUserInput {
  @Field()
  email: string;

  @Field()
  name: string;

  @Field(() => UserRole, { defaultValue: UserRole.USER })
  role: UserRole;
}

// Partial update input — extend with PartialType
import { PartialType } from "@nestjs/graphql";

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}
// All fields become optional automatically
```

---

## 6. Connection Pattern (Pagination)

```typescript
// common/models/pagination.model.ts
@ObjectType()
export class PageInfo {
  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;

  @Field({ nullable: true })
  startCursor?: string;

  @Field({ nullable: true })
  endCursor?: string;
}

// Generic connection factory
export function Paginated<T>(classRef: Type<T>) {
  @ObjectType(`${classRef.name}Edge`)
  abstract class EdgeType {
    @Field(() => classRef)
    node: T;

    @Field()
    cursor: string;
  }

  @ObjectType(`${classRef.name}Connection`)
  abstract class ConnectionType {
    @Field(() => [EdgeType])
    edges: EdgeType[];

    @Field()
    pageInfo: PageInfo;

    @Field(() => Int)
    totalCount: number;
  }

  return ConnectionType;
}

// Usage
@ObjectType()
export class PostConnection extends Paginated(Post) {}
```

---

## 7. Interfaces & Unions

```typescript
// Interface
import { InterfaceType, createUnionType } from "@nestjs/graphql";

@InterfaceType()
export abstract class Node {
  @Field(() => ID)
  id: string;
}

@ObjectType({ implements: () => [Node] })
export class User implements Node {
  @Field(() => ID)
  id: string;
  // ...
}

// Union
export const SearchResultUnion = createUnionType({
  name: "SearchResult",
  types: () => [User, Post, Comment] as const,
  resolveType(value) {
    if ("email" in value) return User;
    if ("title" in value) return Post;
    return Comment;
  },
});
```

---

## 8. Custom Scalars

```typescript
// npm install graphql-scalars
import { DateTimeResolver, JSONResolver } from "graphql-scalars";
import { GraphQLScalarType } from "graphql";

// Register in module
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  resolvers: {
    DateTime: DateTimeResolver,
    JSON: JSONResolver,
  },
  buildSchemaOptions: {
    dateScalarMode: "isoDate", // or use custom scalar
  },
});
```

---

## 9. Module Organization

```
src/
├── app.module.ts
├── common/
│   ├── models/
│   │   └── pagination.model.ts      # PageInfo, Paginated factory
│   ├── scalars/                     # Custom scalars
│   └── decorators/                  # Custom decorators
├── user/
│   ├── user.module.ts
│   ├── user.resolver.ts
│   ├── user.service.ts
│   ├── models/
│   │   └── user.model.ts           # @ObjectType User
│   └── dto/
│       ├── create-user.input.ts     # @InputType CreateUserInput
│       └── update-user.input.ts     # @InputType UpdateUserInput
├── post/
│   ├── post.module.ts
│   ├── post.resolver.ts
│   ├── post.service.ts
│   ├── models/
│   │   └── post.model.ts
│   └── dto/
│       ├── create-post.input.ts
│       └── update-post.input.ts
```

---

## 10. Best Practices

- **Use code-first** — NestJS decorators generate the schema automatically
- **Use `PartialType`/`OmitType`/`PickType`/`IntersectionType`** — avoid duplicating input types
- **Use `registerEnumType`** — required for enums to appear in the schema
- **Default is non-null** — use `nullable: true` explicitly for optional fields
- **Use `description` option** — adds documentation to the generated schema
- **One model file per type** — keep types colocated with their module
- **Use `@deprecated`** — mark fields with `deprecationReason: "Use newField"` option
