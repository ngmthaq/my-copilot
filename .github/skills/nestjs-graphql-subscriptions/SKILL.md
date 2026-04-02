---
name: nestjs-graphql-subscriptions
description: "NestJS GraphQL subscriptions — @Subscription decorator, PubSub, filtering, WebSocket setup, and authentication. Use when: implementing real-time features in NestJS; setting up subscriptions; publishing events from mutations. DO NOT USE FOR: queries/mutations (use nestjs-graphql-queries-mutations skill); resolver basics (use nestjs-graphql-resolvers skill)."
---

# NestJS GraphQL Subscriptions Skill

## Overview

Covers real-time GraphQL in NestJS — `@Subscription` decorator, PubSub, event publishing, filtering, and WebSocket auth.

---

## 1. Setup

```typescript
// npm install graphql-subscriptions graphql-ws
// For production: npm install graphql-redis-subscriptions ioredis

// app.module.ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  subscriptions: {
    "graphql-ws": {
      // Auth for WebSocket connections
      onConnect: (ctx) => {
        const token = ctx.connectionParams?.authorization as string;
        if (!token) throw new Error("Missing auth token");
      },
    },
  },
});
```

---

## 2. PubSub Provider

```typescript
// common/pubsub/pubsub.module.ts
import { Global, Module } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";

// In-memory PubSub (dev only)
const PUB_SUB = "PUB_SUB";

@Global()
@Module({
  providers: [{ provide: PUB_SUB, useValue: new PubSub() }],
  exports: [PUB_SUB],
})
export class PubSubModule {}

// Production: Redis PubSub
import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis from "ioredis";

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useFactory: () =>
        new RedisPubSub({
          publisher: new Redis(),
          subscriber: new Redis(),
        }),
    },
  ],
  exports: [PUB_SUB],
})
export class PubSubModule {}
```

---

## 3. Event Constants

```typescript
// common/constants/events.ts
export const EVENTS = {
  POST_CREATED: "POST_CREATED",
  POST_UPDATED: "POST_UPDATED",
  COMMENT_ADDED: "COMMENT_ADDED",
  NOTIFICATION: "NOTIFICATION",
} as const;
```

---

## 4. @Subscription Decorator

```typescript
import { Resolver, Subscription, Mutation, Args } from "@nestjs/graphql";
import { Inject } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";

@Resolver(() => Post)
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    @Inject("PUB_SUB") private readonly pubSub: PubSub,
  ) {}

  // Simple subscription — receives all events
  @Subscription(() => Post)
  postCreated() {
    return this.pubSub.asyncIterableIterator(EVENTS.POST_CREATED);
  }

  // Subscription with filtering
  @Subscription(() => Post, {
    filter: (payload, variables) => {
      // Only send if authorId matches the subscription arg
      if (!variables.authorId) return true;
      return payload.postUpdated.authorId === variables.authorId;
    },
  })
  postUpdated(@Args("authorId", { nullable: true }) authorId?: string) {
    return this.pubSub.asyncIterableIterator(EVENTS.POST_UPDATED);
  }

  // Subscription with payload transformation
  @Subscription(() => Comment, {
    filter: (payload, variables) =>
      payload.commentAdded.postId === variables.postId,
    resolve: (payload) => payload.commentAdded,
  })
  commentAdded(@Args("postId", { type: () => ID }) postId: string) {
    return this.pubSub.asyncIterableIterator(EVENTS.COMMENT_ADDED);
  }
}
```

---

## 5. Publishing Events from Mutations

```typescript
@Resolver(() => Post)
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    @Inject("PUB_SUB") private readonly pubSub: PubSub,
  ) {}

  @Mutation(() => Post)
  async createPost(@Args("input") input: CreatePostInput) {
    const post = await this.postService.create(input);

    // Publish — key must match subscription method name
    await this.pubSub.publish(EVENTS.POST_CREATED, { postCreated: post });

    return post;
  }

  @Mutation(() => Comment)
  async addComment(@Args("input") input: AddCommentInput) {
    const comment = await this.postService.addComment(input);

    await this.pubSub.publish(EVENTS.COMMENT_ADDED, {
      commentAdded: comment,
    });

    return comment;
  }
}
```

---

## 6. Auth in Subscriptions

```typescript
// Option 1: Auth in onConnect (connection-level)
GraphQLModule.forRoot<ApolloDriverConfig>({
  subscriptions: {
    "graphql-ws": {
      onConnect: async (ctx) => {
        const token = ctx.connectionParams?.authorization as string;
        if (!token) throw new UnauthorizedException();

        const user = await authService.validateToken(token);
        ctx.extra.user = user; // Attach to context
      },
    },
  },
  context: ({ req, extra }) => ({
    req,
    user: extra?.user, // Available in subscription resolvers
  }),
});

// Option 2: Guard on subscription resolver
@Subscription(() => Notification, {
  filter: (payload, variables, context) => {
    // Only send to the notification's target user
    return payload.notification.userId === context.user?.id;
  },
})
@UseGuards(GqlAuthGuard)
notification(@CurrentUser() user: User) {
  return this.pubSub.asyncIterableIterator(EVENTS.NOTIFICATION);
}
```

---

## 7. Client Usage

```typescript
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:3000/graphql",
    connectionParams: { authorization: `Bearer ${token}` },
  }),
);

// React
const COMMENT_SUB = gql`
  subscription OnCommentAdded($postId: ID!) {
    commentAdded(postId: $postId) {
      id
      text
      author {
        name
      }
    }
  }
`;

function Comments({ postId }) {
  const { data } = useSubscription(COMMENT_SUB, {
    variables: { postId },
  });
}
```

---

## 8. Best Practices

- **Use `graphql-ws`** — the modern WebSocket protocol (not `subscriptions-transport-ws`)
- **Use Redis PubSub in production** — in-memory PubSub doesn't work across instances
- **Make PubSub a global module** — inject with `@Inject("PUB_SUB")` everywhere
- **Always filter events** — don't broadcast everything to every subscriber
- **Authenticate in `onConnect`** — validate token once per WebSocket connection
- **Use `resolve` option** to transform payloads before sending to clients
- **Publish from services** — not resolvers — for reusability (events from jobs, webhooks, etc.)
- **Keep payloads small** — send IDs and let clients refetch if needed
