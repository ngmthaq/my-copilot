---
name: reactjs-design-component
description: "React.js component design — building reusable components, props design, composition patterns, presentational vs container split. Use when: creating a new component; deciding how to split responsibilities; making a component flexible and reusable."
---

# React.js Component Design Skill

## Overview

This skill covers how to design clean, reusable React components — clear props contracts, composition over configuration, and separating logic from presentation.

---

## 1. Basic Component Template

```typescript
// src/components/Button/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} btn--${size}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? <span className="spinner" /> : children}
    </button>
  );
}
```

---

## 2. Presentational vs Container Split

Keep UI rendering and data fetching separate.

```typescript
// ✅ Presentational — only cares about display
interface UserCardProps {
  name: string;
  email: string;
  avatarUrl: string;
  isOnline: boolean;
}

export function UserCard({ name, email, avatarUrl, isOnline }: UserCardProps) {
  return (
    <div className="user-card">
      <img src={avatarUrl} alt={name} />
      <h3>{name}</h3>
      <p>{email}</p>
      <span className={isOnline ? "badge--green" : "badge--gray"}>
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
}
```

```typescript
// ✅ Container — handles data fetching, passes props down
export function UserCardContainer({ userId }: { userId: string }) {
  const { data, isLoading, isError } = useUser(userId);

  if (isLoading) return <Skeleton />;
  if (isError) return <ErrorMessage />;

  return <UserCard {...data} />;
}
```

---

## 3. Composition Pattern

Prefer composing small pieces over a single mega-component with many props.

```typescript
// ✅ Composable Card component
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`card ${className ?? ""}`}>{children}</div>;
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card__header">{children}</div>;
}

function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card__body">{children}</div>;
}

function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="card__footer">{children}</div>;
}

// Attach sub-components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content goes here.</Card.Body>
  <Card.Footer><Button>Save</Button></Card.Footer>
</Card>
```

---

## 4. Render Props / Slot Pattern

Use `children` as a function or accept JSX slots to keep components flexible.

```typescript
// ✅ Slot pattern — caller controls what renders in each region
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode; // optional slot
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

// Usage
<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Confirm Delete"
  footer={
    <>
      <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="danger" onClick={handleDelete}>Delete</Button>
    </>
  }
>
  Are you sure you want to delete this item?
</Modal>
```

---

## 5. Component Hierarchy

Organize components into four layers — each layer knows about the one below it, never the one above.

```
pages/          ← page-level components (one per route, imported by routes/)
  └── uses components/, queries/, mutations/, stores/

components/     ← reusable UI building blocks (no knowledge of routes or pages)
  └── uses hooks/, utils/

layouts/        ← shell/chrome (AppBar, Sidebar, etc.)
  └── used by routes/__root.tsx via <Outlet />

routes/         ← TanStack Router config only (createFileRoute, beforeLoad, guards)
  └── imports from pages/
```

**Rules:**

- `pages/` components may use queries, mutations, atoms, and components freely.
- `components/` must never import from `pages/`, `routes/`, `queries/`, or `mutations/` — they are pure UI.
- `routes/` files should be thin: only TanStack Router config, no JSX beyond the import.

```typescript
// ✅ Correct layering example

// components/UserCard/UserCard.styled.ts — Emotion styled components
import { styled } from "@mui/material/styles";
export const CardWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

// components/UserCard/UserCard.tsx — pure UI, no data fetching
import { CardWrapper } from "./UserCard.styled";
export function UserCard({ name, email }: { name: string; email: string }) {
  return <CardWrapper><h3>{name}</h3><p>{email}</p></CardWrapper>;
}

// pages/UsersPage/UsersPage.tsx — fetches data, composes components
import { useUsers } from "@/queries";
import { UserCard } from "@/components";

export function UsersPage() {
  const { data: users, isLoading } = useUsers();
  if (isLoading) return <p>Loading...</p>;
  return <>{users?.map((u) => <UserCard key={u.id} {...u} />)}</>;
}

// routes/users/index.tsx — router config only
import { createFileRoute } from "@tanstack/react-router";
import { UsersPage } from "@/pages";

export const Route = createFileRoute("/users/")({
  component: UsersPage,
});
```

---

## 6. Component Design Checklist

- Props are the **public API** — keep them minimal and intentional.
- Default props for optional values to avoid undefined checks in JSX.
- Never manage async data inside a presentational component — use a container.
- If a component exceeds ~150 lines, split it into sub-components.
- Export props interface so callers can extend or reference it.
