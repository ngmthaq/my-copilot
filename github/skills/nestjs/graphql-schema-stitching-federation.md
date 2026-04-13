---
name: nestjs-graphql-schema-stitching-federation
description: "NestJS GraphQL schema stitching and federation — Apollo Federation with NestJS, subgraph setup, @Directive, entity references, and gateway composition. Use when: composing multiple NestJS GraphQL services; setting up federation subgraphs; extending types across services. DO NOT USE FOR: single-service schema (use nestjs-graphql-schema-design skill); plain Apollo federation (use graphql-schema-stitching-federation skill)."
---

# NestJS GraphQL Schema Stitching & Federation Skill

## Overview

Covers composing multiple NestJS GraphQL services — Apollo Federation subgraphs, entity references, and gateway setup.

---

## 1. Subgraph Setup

```typescript
// npm install @nestjs/graphql @nestjs/apollo @apollo/server @apollo/subgraph

// app.module.ts — Users subgraph
import { ApolloFederationDriver, ApolloFederationDriverConfig } from "@nestjs/apollo";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver, // Not ApolloDriver
      autoSchemaFile: { federation: 2 }, // Federation v2
    }),
    UserModule,
  ],
})
export class AppModule {}
```

---

## 2. Defining Entities (@Key Directive)

```typescript
// user/models/user.model.ts
import { ObjectType, Field, ID, Directive } from "@nestjs/graphql";

@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field(() => UserRole)
  role: UserRole;
}
```

---

## 3. Reference Resolver (resolveReference)

```typescript
// user/user.resolver.ts
import { Resolver, ResolveReference } from "@nestjs/graphql";

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { nullable: true })
  async user(@Args("id", { type: () => ID }) id: string) {
    return this.userService.findById(id);
  }

  // Called by the gateway when another subgraph references a User
  @ResolveReference()
  async resolveReference(reference: { __typename: string; id: string }) {
    return this.userService.findById(reference.id);
  }
}
```

---

## 4. Extending Types from Another Subgraph

```typescript
// Posts subgraph — extends User from Users subgraph

// post/models/user.model.ts (reference type — not the full User)
@ObjectType()
@Directive('@key(fields: "id")')
@Directive("@external")
export class User {
  @Field(() => ID)
  id: string;
}

// post/models/post.model.ts
@ObjectType()
@Directive('@key(fields: "id")')
export class Post {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => User)
  author: User;

  @Field()
  createdAt: Date;
}
```

```typescript
// post/post.resolver.ts
@Resolver(() => Post)
export class PostResolver {
  @ResolveField(() => User)
  author(@Parent() post: Post) {
    // Return a reference — gateway resolves the full User via Users subgraph
    return { __typename: "User", id: post.authorId };
  }
}

// Extend User with posts field (contributed by Posts subgraph)
@Resolver(() => User)
export class UserPostsResolver {
  constructor(private readonly postService: PostService) {}

  @ResolveField(() => [Post])
  async posts(@Parent() user: User) {
    return this.postService.findByAuthorId(user.id);
  }
}
```

---

## 5. Gateway Setup (Apollo Router)

```yaml
# supergraph.yaml
federation_version: =2.0
subgraphs:
  users:
    routing_url: http://localhost:3001/graphql
    schema:
      subgraph_url: http://localhost:3001/graphql
  posts:
    routing_url: http://localhost:3002/graphql
    schema:
      subgraph_url: http://localhost:3002/graphql
  comments:
    routing_url: http://localhost:3003/graphql
    schema:
      subgraph_url: http://localhost:3003/graphql
```

```bash
# Compose and run
rover supergraph compose --config supergraph.yaml > supergraph.graphql
./router --supergraph supergraph.graphql
```

---

## 6. NestJS Gateway (Alternative to Apollo Router)

```typescript
// npm install @nestjs/graphql @apollo/gateway @nestjs/apollo

// gateway/app.module.ts
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from "@nestjs/apollo";
import { IntrospectAndCompose } from "@apollo/gateway";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            { name: "users", url: "http://localhost:3001/graphql" },
            { name: "posts", url: "http://localhost:3002/graphql" },
          ],
        }),
      },
    }),
  ],
})
export class GatewayModule {}
```

---

## 7. Federation Directives in Code-First

```typescript
// @key — entity identifier
@Directive('@key(fields: "id")')

// Multiple keys
@Directive('@key(fields: "id")')
@Directive('@key(fields: "sku")')

// @external — field defined in another subgraph
@Directive("@external")

// @requires — depends on external field
@Directive('@requires(fields: "email")')

// @shareable — resolved by multiple subgraphs
@Directive("@shareable")

// @override — take ownership from another subgraph
@Directive('@override(from: "legacy-service")')

// Apply to fields
@Field()
@Directive("@external")
email: string;

@Field()
@Directive('@requires(fields: "email")')
emailDomain: string;
```

---

## 8. Architecture

```
┌───────────┐
│  Clients  │
└─────┬─────┘
      │
┌─────▼─────────┐
│ Apollo Router  │   ← Composes supergraph, routes queries
│  or Gateway    │
└──┬────┬────┬──┘
   │    │    │
┌──▼─┐┌─▼──┐┌▼────────┐
│Users││Posts││Comments  │  ← NestJS subgraphs (own DB, own deploy)
│3001 ││3002││3003      │
└────┘└────┘└─────────┘
```

---

## 9. Best Practices

- **Use Federation v2** — `autoSchemaFile: { federation: 2 }`
- **Use `ApolloFederationDriver`** for subgraphs, not `ApolloDriver`
- **Implement `@ResolveReference()`** on every entity type
- **Return references** — `{ __typename: "User", id: post.authorId }` lets gateway resolve
- **Keep subgraphs independent** — each NestJS app has its own DB and deploys separately
- **Use Apollo Router** in production — faster than NestJS gateway
- **Use `@Directive()` decorator** for federation directives in code-first
- **Test subgraphs in isolation** — each should work as a standalone GraphQL API
