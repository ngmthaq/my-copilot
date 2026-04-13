---
name: nestjs-graphql-performance-optimization
description: "NestJS GraphQL performance optimization — query complexity, depth limiting, caching, persisted queries, and monitoring with NestJS plugins. Use when: optimizing slow queries; limiting abuse; implementing caching; monitoring resolver performance. DO NOT USE FOR: DataLoader (use nestjs-graphql-dataloader-pattern skill); schema design (use nestjs-graphql-schema-design skill)."
---

# NestJS GraphQL Performance Optimization Skill

## Overview

Covers performance techniques in NestJS GraphQL — depth/complexity limits, caching, persisted queries, and monitoring.

---

## 1. Query Depth Limiting

```typescript
// npm install graphql-depth-limit
import depthLimit from "graphql-depth-limit";

// app.module.ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  validationRules: [depthLimit(7)], // Max 7 levels deep
});

// Rejects:
// query { user { posts { comments { author { posts { comments { ... } } } } } } }
```

---

## 2. Query Complexity Analysis

```typescript
// npm install graphql-query-complexity
import { createComplexityLimitRule, fieldExtensionsEstimator, simpleEstimator } from "graphql-query-complexity";

GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  validationRules: [
    createComplexityLimitRule(1000, {
      estimators: [fieldExtensionsEstimator(), simpleEstimator({ defaultComplexity: 1 })],
    }),
  ],
});
```

```typescript
// Set complexity on specific fields via @Field options
@ObjectType()
export class User {
  @Field(() => [Post], { complexity: 10 })
  posts: Post[];

  // Dynamic complexity based on pagination arg
  @Field(() => PostConnection, {
    complexity: (options) => options.args.first * options.childComplexity,
  })
  postConnection: PostConnection;
}
```

---

## 3. Response Caching

```typescript
// npm install @apollo/server-plugin-response-cache
import responseCachePlugin from "@apollo/server-plugin-response-cache";

GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  plugins: [responseCachePlugin()],
});
```

```typescript
// Cache hints via decorator (code-first)
import { CacheControl } from "./decorators/cache-control.decorator";

@ObjectType()
export class Post {
  @Field()
  title: string;

  @Field(() => Int)
  @CacheControl({ maxAge: 0 }) // Never cache
  viewCount: number;
}

// Or set in resolvers
@Query(() => [Post])
async posts(@Info() info: GraphQLResolveInfo) {
  info.cacheControl.setCacheHint({ maxAge: 60 });
  return this.postService.findPublished();
}
```

---

## 4. Persisted Queries (APQ)

```typescript
import { ApolloServerPluginPersistedQueries } from "@apollo/server/plugin/persistedQueries";
import { KeyvAdapter } from "@apollo/utils.keyvadapter";
import Keyv from "keyv";

GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  plugins: [
    ApolloServerPluginPersistedQueries({
      cache: new KeyvAdapter(new Keyv("redis://localhost:6379")),
    }),
  ],
});
// Client sends hash instead of full query → saves bandwidth, prevents arbitrary queries
```

---

## 5. Pagination Limits

```typescript
// dto/pagination.args.ts
@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { defaultValue: 20 })
  @Min(1)
  @Max(100) // Cap at 100
  first: number;

  @Field({ nullable: true })
  after?: string;
}

// Service enforces the cap
async findAll(args: PaginationArgs) {
  const limit = Math.min(args.first, 100);
  return this.prisma.post.findMany({ take: limit });
}
```

---

## 6. Field-Level Optimization (Select Only Requested Fields)

```typescript
import { Info } from "@nestjs/graphql";
import { GraphQLResolveInfo } from "graphql";
import { parseResolveInfo } from "graphql-parse-resolve-info";

@Resolver(() => User)
export class UserResolver {
  @Query(() => [User])
  async users(@Info() info: GraphQLResolveInfo) {
    const parsedInfo = parseResolveInfo(info);
    const requestedFields = Object.keys(parsedInfo.fieldsByTypeName.User);

    // Build Prisma select from requested fields
    const select: Record<string, boolean> = {};
    for (const field of requestedFields) {
      if (!["posts", "postsCount"].includes(field)) {
        select[field] = true;
      }
    }

    return this.prisma.user.findMany({ select });
  }
}
```

---

## 7. Slow Query Logging Plugin

```typescript
// common/plugins/slow-query.plugin.ts
import { Plugin } from "@nestjs/apollo";
import { ApolloServerPlugin, GraphQLRequestListener } from "@apollo/server";
import { Logger } from "@nestjs/common";

@Plugin()
export class SlowQueryPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger("GraphQL");

  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    const start = Date.now();

    return {
      async willSendResponse(ctx) {
        const duration = Date.now() - start;
        if (duration > 1000) {
          this.logger.warn(`Slow query (${duration}ms): ${ctx.request.query?.slice(0, 200)}`);
        }
      },
    };
  }
}

// Register as provider
@Module({
  providers: [SlowQueryPlugin],
})
export class AppModule {}
```

---

## 8. NestJS Caching with Interceptors

```typescript
// Use NestJS CacheModule for resolver-level caching
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";

@Resolver(() => Post)
export class PostResolver {
  @Query(() => [Post])
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60) // Cache for 60 seconds
  async popularPosts() {
    return this.postService.findPopular();
  }
}
```

---

## 9. Best Practices

- **Set depth limits** — 5-10 levels is reasonable
- **Set complexity limits** — prevent expensive nested queries
- **Use DataLoader first** — solve N+1 before adding caching
- **Enforce pagination caps** — max 100 items per page
- **Use APQ in production** — reduces bandwidth, prevents arbitrary queries
- **Cache public data** — use response cache for anonymous/shared queries
- **Log slow queries** — NestJS `@Plugin()` decorator integrates with Apollo
- **Use `@Info()` sparingly** — only optimize hot paths that need selective DB fetching
