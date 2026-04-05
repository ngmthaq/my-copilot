---
name: nestjs-graphql-dataloader-pattern
description: "NestJS GraphQL DataLoader pattern — solving N+1 with nestjs-dataloader, per-request scoping, batch functions, and integration with @ResolveField. Use when: fixing N+1 queries in NestJS GraphQL; batching database calls; implementing field resolvers for relationships. DO NOT USE FOR: resolver basics (use nestjs-graphql-resolvers skill); general performance (use nestjs-graphql-performance-optimization skill)."
---

# NestJS GraphQL DataLoader Pattern Skill

## Overview

Covers the DataLoader pattern in NestJS — solving N+1 with per-request DataLoader instances, batch functions, and integration with resolvers via DI.

---

## 1. The N+1 Problem in NestJS

```typescript
// Without DataLoader — N+1 queries
@Resolver(() => Post)
export class PostResolver {
  @ResolveField(() => User)
  async author(@Parent() post: Post) {
    // Called once per post — 100 posts = 100 DB queries
    return this.userService.findById(post.authorId);
  }
}
```

---

## 2. Setup with nestjs-dataloader

```typescript
// npm install nestjs-dataloader dataloader

// app.module.ts
import { DataloaderModule } from "nestjs-dataloader";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({ ... }),
    DataloaderModule,
  ],
})
export class AppModule {}
```

---

## 3. Creating a DataLoader (Manual Approach)

```typescript
// common/dataloader/dataloader.service.ts
import { Injectable, Scope } from "@nestjs/common";
import DataLoader from "dataloader";
import { PrismaService } from "../prisma/prisma.service";

@Injectable({ scope: Scope.REQUEST }) // New instance per request
export class DataLoaderService {
  constructor(private readonly prisma: PrismaService) {}

  // Load by primary key
  readonly userById = new DataLoader<string, User>(async (ids) => {
    const users = await this.prisma.user.findMany({
      where: { id: { in: [...ids] } },
    });
    const map = new Map(users.map((u) => [u.id, u]));
    return ids.map((id) => map.get(id) || new Error(`User ${id} not found`));
  });

  // Load one-to-many by foreign key
  readonly postsByAuthor = new DataLoader<string, Post[]>(async (authorIds) => {
    const posts = await this.prisma.post.findMany({
      where: { authorId: { in: [...authorIds] } },
    });
    const grouped = new Map<string, Post[]>();
    for (const post of posts) {
      const list = grouped.get(post.authorId) || [];
      list.push(post);
      grouped.set(post.authorId, list);
    }
    return authorIds.map((id) => grouped.get(id) || []);
  });

  // Load count
  readonly postsCountByAuthor = new DataLoader<string, number>(async (authorIds) => {
    const counts = await this.prisma.post.groupBy({
      by: ["authorId"],
      where: { authorId: { in: [...authorIds] } },
      _count: true,
    });
    const map = new Map(counts.map((c) => [c.authorId, c._count]));
    return authorIds.map((id) => map.get(id) || 0);
  });
}

// Register in module
@Module({
  providers: [DataLoaderService],
  exports: [DataLoaderService],
})
export class DataLoaderModule {}
```

---

## 4. Use in Resolvers

```typescript
@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly loaders: DataLoaderService) {}

  // DataLoader batches all .load() calls within the same tick
  // 100 posts → 1 query: SELECT * FROM users WHERE id IN (...)
  @ResolveField(() => User)
  async author(@Parent() post: Post) {
    return this.loaders.userById.load(post.authorId);
  }
}

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly loaders: DataLoaderService) {}

  @ResolveField(() => [Post])
  async posts(@Parent() user: User) {
    return this.loaders.postsByAuthor.load(user.id);
  }

  @ResolveField(() => Int)
  async postsCount(@Parent() user: User) {
    return this.loaders.postsCountByAuthor.load(user.id);
  }
}
```

---

## 5. Alternative: NestDataLoader Interface

```typescript
// Using nestjs-dataloader's interface pattern
import { NestDataLoader } from "nestjs-dataloader";

@Injectable()
export class UserLoader implements NestDataLoader<string, User> {
  constructor(private readonly prisma: PrismaService) {}

  generateDataLoader(): DataLoader<string, User> {
    return new DataLoader<string, User>(async (ids) => {
      const users = await this.prisma.user.findMany({
        where: { id: { in: [...ids] } },
      });
      const map = new Map(users.map((u) => [u.id, u]));
      return ids.map((id) => map.get(id) || new Error(`User ${id} not found`));
    });
  }
}

// Register as provider
@Module({
  providers: [{ provide: "USER_LOADER", useClass: UserLoader }],
})

// Use with @Loader decorator
@ResolveField(() => User)
async author(
  @Parent() post: Post,
  @Loader("USER_LOADER") userLoader: DataLoader<string, User>,
) {
  return userLoader.load(post.authorId);
}
```

---

## 6. DataLoader with Context (via GraphQL Context)

```typescript
// Alternative: attach loaders to GraphQL context
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  context: ({ req }) => ({
    req,
    loaders: {
      user: new DataLoader<string, User>(async (ids) => {
        const users = await prisma.user.findMany({
          where: { id: { in: [...ids] } },
        });
        const map = new Map(users.map((u) => [u.id, u]));
        return ids.map((id) => map.get(id)!);
      }),
    },
  }),
});

// Access via @Context()
@ResolveField(() => User)
async author(@Parent() post: Post, @Context() ctx: GqlContext) {
  return ctx.loaders.user.load(post.authorId);
}
```

---

## 7. Batch Function Helper

```typescript
// common/dataloader/batch.helper.ts
// Generic batch-by-id function
export function createBatchById<T extends { id: string }>(
  findMany: (ids: string[]) => Promise<T[]>,
): DataLoader.BatchLoadFn<string, T> {
  return async (ids) => {
    const items = await findMany([...ids]);
    const map = new Map(items.map((item) => [item.id, item]));
    return ids.map((id) => map.get(id) || new Error(`Not found: ${id}`));
  };
}

// Generic batch-by-foreign-key function
export function createBatchByFK<T>(
  findMany: (fkIds: string[]) => Promise<T[]>,
  getFK: (item: T) => string,
): DataLoader.BatchLoadFn<string, T[]> {
  return async (fkIds) => {
    const items = await findMany([...fkIds]);
    const grouped = new Map<string, T[]>();
    for (const item of items) {
      const key = getFK(item);
      const list = grouped.get(key) || [];
      list.push(item);
      grouped.set(key, list);
    }
    return fkIds.map((id) => grouped.get(id) || []);
  };
}

// Usage
readonly userById = new DataLoader(
  createBatchById((ids) =>
    this.prisma.user.findMany({ where: { id: { in: ids } } }),
  ),
);
```

---

## 8. Best Practices

- **Use `Scope.REQUEST`** — DataLoader instances must be per-request (new cache each request)
- **Return results in input order** — DataLoader requires this contract
- **Return `Error` for missing items** — not `null` or `undefined`
- **One loader per access pattern** — `userById`, `postsByAuthor`, `postsCountByAuthor`
- **Inject `DataLoaderService`** in resolvers — cleanest NestJS approach
- **Don't use DataLoader in mutations** — it's for read batching only
- **Use `.prime()` after mutations** — seed the cache: `loaders.userById.prime(user.id, user)`
- **Keep batch functions simple** — one DB query, map results, return in order
