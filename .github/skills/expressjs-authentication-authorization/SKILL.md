---
name: expressjs-authentication-authorization
description: "Express.js authentication & authorization — implementing JWT, session-based auth, OAuth 2.0, role-based access control (RBAC), and permission-based access in Express apps. Use when: setting up login/register flows; generating and verifying JWTs; implementing refresh tokens; configuring Passport.js strategies; building auth middleware; implementing RBAC or ABAC; protecting routes by role or permission. DO NOT USE FOR: HTTP header hardening or rate limiting (use expressjs-api-security skill); input validation schemas (use expressjs-input-validation skill)."
---

# Express.js Authentication & Authorization Skill

## Overview

This skill covers implementing authentication (verifying identity) and authorization (enforcing access) in Express.js APIs — JWT-based auth, refresh tokens, session-based auth, OAuth 2.0 with Passport.js, role-based access control (RBAC), and permission-based access. Apply it when users ask about login flows, protecting routes, or managing user roles.

---

## 1. JWT Authentication — Complete Flow

### Token Generation & Verification Utility

```typescript
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;

function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
}

function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
}
```

### Register Endpoint

```typescript
import bcrypt from "bcrypt";

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ error: "Email already registered" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name, role: "USER" },
  });

  // Generate tokens
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Set refresh token as httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});
```

### Login Endpoint

```typescript
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Generate tokens
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    accessToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});
```

### Refresh Token Endpoint

```typescript
app.post("/api/auth/refresh", async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  // Verify token exists in DB (not revoked)
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }

  // Verify JWT signature
  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  // Rotate refresh token (invalidate old, issue new)
  await prisma.refreshToken.delete({ where: { token: refreshToken } });

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: payload.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken: newAccessToken });
});
```

### Logout Endpoint

```typescript
app.post("/api/auth/logout", async (req, res) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    // Revoke refresh token
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
});

// Logout from all devices
app.post("/api/auth/logout-all", authenticate, async (req, res) => {
  await prisma.refreshToken.deleteMany({ where: { userId: req.user.userId } });
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out from all devices" });
});
```

---

## 2. Authentication Middleware

```typescript
import { Request, Response, NextFunction } from "express";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Usage
app.get("/api/profile", authenticate, (req, res) => {
  res.json({ user: req.user });
});
```

### Optional Authentication (public routes that benefit from auth context)

```typescript
function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      req.user = verifyAccessToken(authHeader.split(" ")[1]);
    } catch {
      // Token invalid — proceed as unauthenticated
    }
  }
  next();
}

// Public endpoint that personalizes response if authenticated
app.get("/api/feed", optionalAuth, (req, res) => {
  if (req.user) {
    // Return personalized feed
  } else {
    // Return default feed
  }
});
```

---

## 3. Authorization — Role-Based Access Control (RBAC)

### Simple Role Check Middleware

```typescript
type Role = "USER" | "ADMIN" | "MODERATOR" | "SUPER_ADMIN";

function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!allowedRoles.includes(req.user.role as Role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

// Usage — chain after authenticate
app.get(
  "/api/admin/users",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  async (_req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
  },
);

app.delete(
  "/api/admin/users/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  async (req, res) => {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  },
);
```

### Role Hierarchy

```typescript
const ROLE_HIERARCHY: Record<Role, number> = {
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

function authorizeMinRole(minimumRole: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userLevel = ROLE_HIERARCHY[req.user.role as Role] ?? -1;
    const requiredLevel = ROLE_HIERARCHY[minimumRole];
    if (userLevel < requiredLevel) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

// Any user with MODERATOR role or higher can access
app.put(
  "/api/posts/:id/moderate",
  authenticate,
  authorizeMinRole("MODERATOR"),
  async (req, res) => {
    // ...
  },
);
```

---

## 4. Authorization — Permission-Based Access Control

```typescript
// Define permissions as descriptive constant IDs
const PERMISSIONS = {
  // Users
  CAN_LIST_USERS: "CAN_LIST_USERS",
  CAN_READ_USER_DETAIL: "CAN_READ_USER_DETAIL",
  CAN_CREATE_USER: "CAN_CREATE_USER",
  CAN_UPDATE_USER: "CAN_UPDATE_USER",
  CAN_DELETE_USER: "CAN_DELETE_USER",

  // Posts
  CAN_LIST_POSTS: "CAN_LIST_POSTS",
  CAN_READ_POST_DETAIL: "CAN_READ_POST_DETAIL",
  CAN_CREATE_POST: "CAN_CREATE_POST",
  CAN_UPDATE_POST: "CAN_UPDATE_POST",
  CAN_DELETE_POST: "CAN_DELETE_POST",

  // Admin
  CAN_ACCESS_ADMIN_PANEL: "CAN_ACCESS_ADMIN_PANEL",
  CAN_MANAGE_ROLES: "CAN_MANAGE_ROLES",
} as const;

type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  USER: [
    PERMISSIONS.CAN_LIST_POSTS,
    PERMISSIONS.CAN_READ_POST_DETAIL,
    PERMISSIONS.CAN_CREATE_POST,
  ],
  MODERATOR: [
    PERMISSIONS.CAN_LIST_POSTS,
    PERMISSIONS.CAN_READ_POST_DETAIL,
    PERMISSIONS.CAN_CREATE_POST,
    PERMISSIONS.CAN_UPDATE_POST,
    PERMISSIONS.CAN_DELETE_POST,
    PERMISSIONS.CAN_LIST_USERS,
    PERMISSIONS.CAN_READ_USER_DETAIL,
  ],
  ADMIN: [
    PERMISSIONS.CAN_LIST_POSTS,
    PERMISSIONS.CAN_READ_POST_DETAIL,
    PERMISSIONS.CAN_CREATE_POST,
    PERMISSIONS.CAN_UPDATE_POST,
    PERMISSIONS.CAN_DELETE_POST,
    PERMISSIONS.CAN_LIST_USERS,
    PERMISSIONS.CAN_READ_USER_DETAIL,
    PERMISSIONS.CAN_CREATE_USER,
    PERMISSIONS.CAN_UPDATE_USER,
    PERMISSIONS.CAN_ACCESS_ADMIN_PANEL,
  ],
  SUPER_ADMIN: [
    PERMISSIONS.CAN_LIST_POSTS,
    PERMISSIONS.CAN_READ_POST_DETAIL,
    PERMISSIONS.CAN_CREATE_POST,
    PERMISSIONS.CAN_UPDATE_POST,
    PERMISSIONS.CAN_DELETE_POST,
    PERMISSIONS.CAN_LIST_USERS,
    PERMISSIONS.CAN_READ_USER_DETAIL,
    PERMISSIONS.CAN_CREATE_USER,
    PERMISSIONS.CAN_UPDATE_USER,
    PERMISSIONS.CAN_DELETE_USER,
    PERMISSIONS.CAN_ACCESS_ADMIN_PANEL,
    PERMISSIONS.CAN_MANAGE_ROLES,
  ],
};

function requirePermissions(...requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role as Role] || [];
    const hasAll = requiredPermissions.every((p) =>
      userPermissions.includes(p),
    );

    if (!hasAll) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

// Usage
app.get(
  "/api/users",
  authenticate,
  requirePermissions(PERMISSIONS.CAN_LIST_USERS),
  async (_req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
  },
);

app.delete(
  "/api/users/:id",
  authenticate,
  requirePermissions(PERMISSIONS.CAN_DELETE_USER),
  async (req, res) => {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  },
);

// Require multiple permissions
app.post(
  "/api/admin/roles",
  authenticate,
  requirePermissions(
    PERMISSIONS.CAN_ACCESS_ADMIN_PANEL,
    PERMISSIONS.CAN_MANAGE_ROLES,
  ),
  async (req, res) => {
    // ...
  },
);
```

---

## 5. Resource Ownership Check

```typescript
// Ensure user can only access/modify their own resources (or is admin)
function authorizeOwnerOrAdmin(resourceUserIdParam: string = "id") {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const resourceUserId = req.params[resourceUserIdParam];
    const isOwner = req.user.userId === resourceUserId;
    const isAdmin =
      (ROLE_HIERARCHY[req.user.role as Role] ?? -1) >= ROLE_HIERARCHY.ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}

// User can update their own profile; admins can update anyone's
app.put(
  "/api/users/:id",
  authenticate,
  authorizeOwnerOrAdmin("id"),
  async (req, res) => {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(user);
  },
);
```

---

## 6. Session-Based Authentication (with express-session)

```typescript
import session from "express-session";
import connectRedis from "connect-redis";
import { createClient } from "redis";

const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

app.use(
  session({
    store: new connectRedis({ client: redisClient }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  }),
);

// Login — create session
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  req.session.userId = user.id;
  req.session.role = user.role;

  res.json({ user: { id: user.id, email: user.email, role: user.role } });
});

// Session auth middleware
function sessionAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

// Logout — destroy session
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});
```

---

## 7. OAuth 2.0 with Passport.js

### Google OAuth Strategy

```typescript
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      // Find or create user
      let user = await prisma.user.findUnique({
        where: { googleId: profile.id },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            googleId: profile.id,
            email: profile.emails?.[0]?.value || "",
            name: profile.displayName,
            role: "USER",
          },
        });
      }

      done(null, user);
    },
  ),
);

// Routes
app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    // Issue JWT after successful OAuth
    const user = req.user as any;
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend with access token
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`,
    );
  },
);
```

### GitHub OAuth Strategy

```typescript
import { Strategy as GitHubStrategy } from "passport-github2";

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: "/api/auth/github/callback",
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: any,
      done: any,
    ) => {
      let user = await prisma.user.findUnique({
        where: { githubId: profile.id },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            githubId: profile.id,
            email: profile.emails?.[0]?.value || "",
            name: profile.displayName || profile.username,
            role: "USER",
          },
        });
      }

      done(null, user);
    },
  ),
);

app.get(
  "/api/auth/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

app.get(
  "/api/auth/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const user = req.user as any;
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = generateAccessToken(payload);
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`,
    );
  },
);
```

---

## 8. Password Reset Flow

```typescript
import crypto from "crypto";

// Request password reset
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.json({
      message: "If the email exists, a reset link has been sent.",
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  // Send email with reset link (use your email service)
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendEmail(
    user.email,
    "Password Reset",
    `Reset your password: ${resetUrl}`,
  );

  res.json({ message: "If the email exists, a reset link has been sent." });
});

// Reset password
app.post("/api/auth/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const resetRecord = await prisma.passwordReset.findFirst({
    where: { token: hashedToken, expiresAt: { gt: new Date() } },
  });

  if (!resetRecord) {
    return res.status(400).json({ error: "Invalid or expired reset token" });
  }

  // Update password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: resetRecord.userId },
    data: { password: hashedPassword },
  });

  // Invalidate all reset tokens and refresh tokens for this user
  await prisma.passwordReset.deleteMany({
    where: { userId: resetRecord.userId },
  });
  await prisma.refreshToken.deleteMany({
    where: { userId: resetRecord.userId },
  });

  res.json({ message: "Password reset successfully" });
});
```

---

## 9. API Key Authentication (for service-to-service)

```typescript
function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  // Hash the key and look it up (never store raw API keys)
  const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");

  const keyRecord = await prisma.apiKey.findUnique({
    where: { hashedKey },
    include: { user: true },
  });

  if (!keyRecord || !keyRecord.isActive) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  req.user = {
    userId: keyRecord.user.id,
    email: keyRecord.user.email,
    role: keyRecord.user.role,
  };
  next();
}

// Generate API key for a user
app.post("/api/keys", authenticate, async (req, res) => {
  const rawKey = `sk_${crypto.randomBytes(32).toString("hex")}`;
  const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");

  await prisma.apiKey.create({
    data: { hashedKey, name: req.body.name, userId: req.user!.userId },
  });

  // Only return the raw key once — it cannot be retrieved later
  res.status(201).json({
    apiKey: rawKey,
    message: "Store this key securely. It will not be shown again.",
  });
});
```

---

## 10. Security Best Practices

- **Hash passwords** with bcrypt (cost factor 12+), never store plain text
- **Use short-lived access tokens** (15m) with long-lived refresh tokens (7d)
- **Rotate refresh tokens** on each use (invalidate old, issue new)
- **Store refresh tokens in httpOnly, secure, sameSite cookies** — never in localStorage
- **Never leak whether an email exists** in login/register/forgot-password responses
- **Invalidate all tokens** on password change or security events
- **Use constant-time comparison** for tokens (`crypto.timingSafeEqual`) to prevent timing attacks
- **Rate limit auth endpoints** aggressively (5 attempts per 15 minutes)
- **Log authentication events** (login, logout, failed attempts) for auditing

---

## 11. Required Packages

```bash
# JWT auth
npm install jsonwebtoken bcrypt cookie-parser
npm install -D @types/jsonwebtoken @types/bcrypt @types/cookie-parser

# Session auth
npm install express-session connect-redis
npm install -D @types/express-session

# OAuth
npm install passport passport-google-oauth20 passport-github2
npm install -D @types/passport @types/passport-google-oauth20 @types/passport-github2
```
