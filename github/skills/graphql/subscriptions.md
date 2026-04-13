---
name: graphql-subscriptions
description: "GraphQL subscriptions — real-time data with WebSockets, PubSub, subscription resolvers, filtering, and authentication. Use when: implementing real-time features; setting up WebSocket transport; publishing events from mutations; filtering subscription events. DO NOT USE FOR: queries/mutations (use graphql-queries-mutations skill); resolver basics (use graphql-resolvers skill)."
---

# GraphQL Subscriptions Skill

## Overview

Covers real-time GraphQL — subscriptions via WebSockets, PubSub pattern, event publishing, filtering, and auth.

---

## 1. Schema Definition

```graphql
type Subscription {
  postCreated: Post!
  postUpdated(authorId: ID): Post!
  commentAdded(postId: ID!): Comment!
  notificationReceived: Notification!
}

type Mutation {
  createPost(input: CreatePostInput!): Post!
  addComment(input: AddCommentInput!): Comment!
}
```

---

## 2. Server Setup (graphql-ws)

```typescript
// npm install graphql-ws ws @graphql-tools/schema
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import express from "express";

const app = express();
const httpServer = createServer(app);
const schema = makeExecutableSchema({ typeDefs, resolvers });

// WebSocket server for subscriptions
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

const serverCleanup = useServer(
  {
    schema,
    // Auth for WebSocket connections
    context: async (ctx) => {
      const token = ctx.connectionParams?.authorization as string;
      const currentUser = token ? await getUserFromToken(token) : null;
      return { currentUser, prisma };
    },
  },
  wsServer,
);

// Apollo Server with both HTTP and WS
const server = new ApolloServer({
  schema,
  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});
```

---

## 3. PubSub

```typescript
// In-memory PubSub (dev only)
import { PubSub } from "graphql-subscriptions";
const pubsub = new PubSub();

// Production: use Redis PubSub
// npm install graphql-redis-subscriptions ioredis
import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis from "ioredis";

const pubsub = new RedisPubSub({
  publisher: new Redis(),
  subscriber: new Redis(),
});

// Event names
const EVENTS = {
  POST_CREATED: "POST_CREATED",
  POST_UPDATED: "POST_UPDATED",
  COMMENT_ADDED: "COMMENT_ADDED",
} as const;
```

---

## 4. Subscription Resolvers

```typescript
const resolvers = {
  Subscription: {
    postCreated: {
      // subscribe returns an AsyncIterator
      subscribe: () => pubsub.asyncIterableIterator([EVENTS.POST_CREATED]),
    },

    // With filtering — only receive events matching criteria
    postUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator([EVENTS.POST_UPDATED]),
        (payload, variables) => {
          // Only send if authorId matches (or no filter)
          if (!variables.authorId) return true;
          return payload.postUpdated.authorId === variables.authorId;
        },
      ),
    },

    commentAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator([EVENTS.COMMENT_ADDED]),
        (payload, variables) => {
          return payload.commentAdded.postId === variables.postId;
        },
      ),
    },
  },
};
```

---

## 5. Publishing Events from Mutations

```typescript
const resolvers = {
  Mutation: {
    createPost: async (_parent, { input }, { prisma }) => {
      const post = await prisma.post.create({ data: input });

      // Publish event — key must match subscription field name
      await pubsub.publish(EVENTS.POST_CREATED, { postCreated: post });

      return post;
    },

    addComment: async (_parent, { input }, { prisma }) => {
      const comment = await prisma.comment.create({
        data: input,
        include: { post: true },
      });

      await pubsub.publish(EVENTS.COMMENT_ADDED, { commentAdded: comment });

      return comment;
    },
  },
};
```

---

## 6. Client Usage

```typescript
import { gql, useSubscription } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

// Client setup with WebSocket link
const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000/graphql",
    connectionParams: { authorization: `Bearer ${token}` },
  }),
);

// React hook
const COMMENT_SUBSCRIPTION = gql`
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
  const { data } = useSubscription(COMMENT_SUBSCRIPTION, {
    variables: { postId },
  });

  // data?.commentAdded is the latest comment
}
```

---

## 7. Auth in Subscriptions

```typescript
import { GraphQLError } from "graphql";

const resolvers = {
  Subscription: {
    notificationReceived: {
      subscribe: (_parent, _args, { currentUser }) => {
        if (!currentUser) {
          throw new GraphQLError("Not authenticated", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }

        // Filter to only this user's notifications
        return withFilter(
          () => pubsub.asyncIterableIterator(["NOTIFICATION"]),
          (payload) => payload.notificationReceived.userId === currentUser.id,
        )();
      },
    },
  },
};
```

---

## 8. Best Practices

- **Use `graphql-ws`** — the modern WebSocket protocol (not deprecated `subscriptions-transport-ws`)
- **Use Redis PubSub in production** — in-memory PubSub doesn't work across server instances
- **Always filter events** — don't send every event to every subscriber
- **Authenticate WebSocket connections** — verify tokens in `connectionParams`
- **Keep payloads small** — subscribe to IDs, let the client refetch if needed
- **Handle disconnects gracefully** — clients should auto-reconnect
- **Use subscriptions sparingly** — polling is simpler for low-frequency updates
- **Clean up on disconnect** — unsubscribe from PubSub when client disconnects
