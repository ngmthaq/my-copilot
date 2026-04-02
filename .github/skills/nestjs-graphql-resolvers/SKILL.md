---
name: nestjs-graphql-resolvers
description: "NestJS GraphQL resolvers — @Resolver, @ResolveField, @Parent, context access, and resolver organization with dependency injection. Use when: implementing resolver logic in NestJS; using field resolvers; accessing services via DI; organizing resolvers by module. DO NOT USE FOR: schema design (use nestjs-graphql-schema-design skill); DataLoader (use nestjs-graphql-dataloader-pattern skill)."
---

# NestJS GraphQL Resolvers Skill

## Overview

Covers resolver implementation in NestJS — `@Resolver`, `@ResolveField`, `@Parent`, dependency injection, and module-based organization.

---

## 1. Basic Resolver

```typescript
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from "@nestjs/graphql";
import { User } from "./models/user.model";
import { UserService } from "./user.service";

@Resolver(() => User)
export class UserResolver {
  // Services injected via NestJS DI
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { nullable: true })
  async user(@Args("id", { type: () => ID }) id: string) {
    return this.userService.findById(id);
  }

  @Query(() => [User])
  async users() {
    return this.userService.findAll();
  }

  @Mutation(() => User)
  async createUser(@Args("input") input: CreateUserInput) {
    return this.userService.create(input);
  }

  @Mutation(() => User)
  async updateUser(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateUserInput,
  ) {
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

## 2. Field Resolvers (@ResolveField)

```typescript
@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
  ) {}

  // @Parent() gives the parent User object
  @ResolveField(() => [Post])
  async posts(@Parent() user: User) {
    return this.postService.findByAuthorId(user.id);
  }

  // Computed field
  @ResolveField(() => Int)
  async postsCount(@Parent() user: User) {
    return this.postService.countByAuthorId(user.id);
  }

  // Derived field
  @ResolveField(() => String)
  fullName(@Parent() user: User) {
    return `${user.firstName} ${user.lastName}`;
  }
}

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly userService: UserService) {}

  @ResolveField(() => User)
  async author(@Parent() post: Post) {
    return this.userService.findById(post.authorId);
  }
}
```

---

## 3. Accessing Context

```typescript
import { Context } from "@nestjs/graphql";

@Resolver(() => User)
export class UserResolver {
  // Access the full GraphQL context
  @Query(() => User)
  async me(@Context() ctx: GqlContext) {
    return ctx.req.user;
  }

  // Or use a custom decorator (recommended)
  @Query(() => User)
  async me(@CurrentUser() user: User) {
    return user;
  }
}

// Custom @CurrentUser decorator
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
```

---

## 4. Resolver with DataLoader

```typescript
@Resolver(() => Post)
export class PostResolver {
  constructor(
    @Inject(UserLoader) private readonly userLoader: DataLoader<string, User>,
  ) {}

  @ResolveField(() => User)
  async author(@Parent() post: Post) {
    return this.userLoader.load(post.authorId);
  }
}
```

---

## 5. Union & Interface Resolvers

```typescript
// Union resolver
@Resolver(() => SearchResultUnion)
export class SearchResolver {
  @Query(() => [SearchResultUnion])
  async search(@Args("query") query: string) {
    const [users, posts] = await Promise.all([
      this.userService.search(query),
      this.postService.search(query),
    ]);
    return [...users, ...posts];
  }

  // resolveType is defined in createUnionType (see type-system skill)
}
```

---

## 6. Module Registration

```typescript
// user/user.module.ts
@Module({
  imports: [PrismaModule, PostModule],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}

// post/post.module.ts
@Module({
  imports: [PrismaModule],
  providers: [PostResolver, PostService],
  exports: [PostService],
})
export class PostModule {}

// app.module.ts
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    UserModule,
    PostModule,
  ],
})
export class AppModule {}
// NestJS auto-discovers all @Resolver() classes from imported modules
```

---

## 7. Resolver Organization

```
src/
├── user/
│   ├── user.module.ts
│   ├── user.resolver.ts         # @Query, @Mutation, @ResolveField
│   ├── user.service.ts          # Business logic
│   ├── models/
│   │   └── user.model.ts        # @ObjectType
│   └── dto/
│       ├── create-user.input.ts  # @InputType
│       └── update-user.input.ts
├── post/
│   ├── post.module.ts
│   ├── post.resolver.ts
│   ├── post.service.ts
│   ├── models/
│   │   └── post.model.ts
│   └── dto/
│       └── ...
```

---

## 8. Best Practices

- **One resolver per type** — `@Resolver(() => User)` handles User's queries, mutations, and field resolvers
- **Keep resolvers thin** — delegate logic to services (injected via DI)
- **Use `@ResolveField`** for relationships and computed fields
- **Use `@Parent()`** to access the parent object in field resolvers
- **Use custom decorators** (`@CurrentUser()`) instead of raw `@Context()`
- **Use DataLoader** in `@ResolveField` to avoid N+1 queries
- **Register resolvers in modules** — NestJS auto-discovers them from providers
- **Don't import resolver classes across modules** — import the module instead
