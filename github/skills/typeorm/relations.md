---
name: typeorm-relations
description: "TypeORM relations — modeling OneToOne, OneToMany, ManyToOne, and ManyToMany relationships; eager vs lazy loading; cascades; JoinColumn and JoinTable. Use when: defining foreign keys; querying related data; creating records with related data."
---

# TypeORM Relations

## Overview

TypeORM supports four relation types: `@OneToOne`, `@OneToMany`/`@ManyToOne`, and `@ManyToMany`. Relations are defined with decorators on entity classes and can be loaded eagerly or on-demand.

---

## 1. One-to-One

Each user has exactly one profile.

```typescript
// src/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Profile } from "./profile.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;
}
```

```typescript
// src/entities/profile.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";

@Entity("profiles")
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  bio: string | null;

  @OneToOne(() => User, (user) => user.profile, { onDelete: "CASCADE" })
  @JoinColumn() // ← puts the foreign key (userId) on this table
  user: User;
}
```

### Query

```typescript
// Load user with profile
const user = await userRepository.findOne({
  where: { id: 1 },
  relations: { profile: true },
});

// Create user and profile together (cascade: true allows this)
const user = userRepository.create({
  email: "alice@example.com",
  profile: { bio: "Hello, I'm Alice!" },
});
await userRepository.save(user);
```

---

## 2. One-to-Many / Many-to-One

One user can have many posts. This is the most common relation type.

```typescript
// src/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Post } from "./post.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
}
```

```typescript
// src/entities/post.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { User } from "./user.entity";

@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Index() // index the foreign key for fast lookups
  @Column()
  authorId: number;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "authorId" })
  author: User;
}
```

### Query

```typescript
// Load user with all their posts
const user = await userRepository.findOne({
  where: { id: 1 },
  relations: { posts: true },
});

// Create a post linked to an existing user
const post = postRepository.create({
  title: "My first post",
  authorId: 1, // set the FK directly
});
await postRepository.save(post);

// Or link via the relation object
const post = postRepository.create({
  title: "My first post",
  author: { id: 1 }, // TypeORM resolves the FK automatically
});
await postRepository.save(post);
```

---

## 3. Many-to-Many

Posts can have many tags; tags can belong to many posts.

### Without extra columns (TypeORM manages the join table)

```typescript
// src/entities/post.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Tag } from "./tag.entity";

@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToMany(() => Tag, (tag) => tag.posts, { cascade: true })
  @JoinTable() // ← put @JoinTable on the owning side (Post owns the relation)
  tags: Tag[];
}
```

```typescript
// src/entities/tag.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Post } from "./post.entity";

@Entity("tags")
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Post, (post) => post.tags)
  posts: Post[];
}
```

### With extra columns (explicit join entity)

```typescript
// src/entities/post-tag.entity.ts
import { Entity, ManyToOne, PrimaryColumn, Column, CreateDateColumn } from "typeorm";
import { Post } from "./post.entity";
import { Tag } from "./tag.entity";

@Entity("post_tags")
export class PostTag {
  @PrimaryColumn()
  postId: number;

  @PrimaryColumn()
  tagId: number;

  @CreateDateColumn()
  assignedAt: Date; // extra field on the join table

  @ManyToOne(() => Post, { onDelete: "CASCADE" })
  post: Post;

  @ManyToOne(() => Tag, { onDelete: "CASCADE" })
  tag: Tag;
}
```

### Query (implicit many-to-many)

```typescript
// Create post with tags
const tag1 = await tagRepository.findOneBy({ id: 1 });
const tag2 = await tagRepository.findOneBy({ id: 2 });

const post = postRepository.create({
  title: "My post",
  tags: [tag1!, tag2!],
});
await postRepository.save(post);

// Add a tag to an existing post
const post = await postRepository.findOne({
  where: { id: 1 },
  relations: { tags: true },
});
post!.tags.push(newTag);
await postRepository.save(post!);

// Remove a tag
post!.tags = post!.tags.filter((t) => t.id !== tagIdToRemove);
await postRepository.save(post!);
```

---

## 4. Cascade Options

Control what happens to related records when the parent is saved or deleted:

```typescript
// cascade: true — saves/updates/deletes related records automatically
@OneToMany(() => Post, (post) => post.author, { cascade: true })
posts: Post[];

// onDelete: "CASCADE" — DB-level cascade delete
@ManyToOne(() => User, { onDelete: "CASCADE" })
author: User;
```

| Option                 | Meaning                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `cascade: true`        | TypeORM cascades insert/update/remove/soft-remove operations |
| `onDelete: "CASCADE"`  | Database deletes child rows when parent is deleted           |
| `onDelete: "SET NULL"` | Database sets FK to NULL when parent is deleted              |
| `onDelete: "RESTRICT"` | Database blocks parent deletion if children exist            |

---

## 5. Eager vs Lazy Loading

```typescript
// Eager: always loads the relation (regardless of `relations` option)
@OneToOne(() => Profile, { eager: true })
profile: Profile;

// Lazy: returns a Promise — loads only when you await it
@OneToMany(() => Post, (post) => post.author, { lazy: true })
posts: Promise<Post[]>;

// Usage
const posts = await user.posts; // triggers a DB query
```

> Prefer explicit `relations: {}` in queries over eager loading — it's more predictable.

---

## Key Rules

- Always put `@JoinColumn()` on the entity that holds the foreign key (the "owning" side).
- For `@ManyToMany`, put `@JoinTable()` on the owning side only.
- Add `@Index()` on all foreign key columns to speed up joins.
- Use `onDelete: "CASCADE"` for owned relations (profile, posts belong to user).
- Prefer loading relations explicitly with `relations: {}` over `eager: true` to avoid unexpected queries.
