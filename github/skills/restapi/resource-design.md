# Resource Design

## Core Rule

URLs identify **things (nouns)**, not actions (verbs). The HTTP method describes the action.

---

## Naming Rules

| Rule                         | Good               | Bad                        |
| ---------------------------- | ------------------ | -------------------------- |
| Use nouns, not verbs         | `/users`           | `/getUsers`                |
| Use plural nouns             | `/products`        | `/product`                 |
| Use lowercase                | `/user-profiles`   | `/UserProfiles`            |
| Use hyphens, not underscores | `/blog-posts`      | `/blog_posts`              |
| Keep it hierarchical         | `/users/42/orders` | `/getUserOrders?userId=42` |

---

## URL Structure Pattern

```
/resources                    # collection
/resources/:id                # single item
/resources/:id/sub-resources  # nested collection
/resources/:id/sub-resources/:subId  # nested item
```

**Examples:**

```
/users                    → all users
/users/42                 → user with id 42
/users/42/orders          → all orders for user 42
/users/42/orders/7        → order 7 of user 42
```

---

## Nesting Guidelines

- **Nest** when a resource only makes sense in the context of its parent (e.g., comments on a post).
- **Do not nest more than 2 levels deep** — it becomes unreadable.
- **Avoid deep nesting** — prefer flat URLs with filters instead:

```
# Too deep — avoid
GET /users/42/orders/7/items/3/reviews

# Better — flatter with context via query param
GET /reviews?itemId=3
```

---

## Non-CRUD Actions

For operations that don't fit CRUD, use a **verb as a sub-resource** under the noun:

```
POST /orders/99/cancel
POST /users/42/verify-email
POST /payments/55/refund
```

Do **not** put verbs in the base resource path:

```
# Bad
POST /cancelOrder
POST /verifyUserEmail
```

---

## Consistency Checklist

- [ ] All resource names are plural nouns
- [ ] URLs are lowercase with hyphens
- [ ] Nesting does not exceed 2 levels
- [ ] Non-CRUD actions use `POST /resource/:id/action`
- [ ] No verbs in the base path
