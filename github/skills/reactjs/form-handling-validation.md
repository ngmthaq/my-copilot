---
name: reactjs-form-handling-validation
description: "React.js forms — Formik + Zod: form setup, validation schemas in src/forms/, field wiring, error display, and form submission. Use when: building any form; adding validation to inputs; handling form state."
---

# React.js Form Handling & Validation Skill

## Overview

This skill covers building forms with **Formik** + **Zod**. Zod schemas live in `src/forms/` alongside their initial values. Each form gets its own file. Use `zod-formik-adapter` to connect Zod schemas to Formik's `validationSchema` prop.

Install: `npm install formik zod zod-formik-adapter`

---

## 1. Zod Schema + Initial Values (src/forms/)

Define the schema, infer the TypeScript type, and set initial values in the same file — single source of truth.

```typescript
// src/forms/loginSchema.ts
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";

// 1. Define Zod schema
const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// 2. Infer TypeScript type from schema
export type LoginFormValues = z.infer<typeof loginSchema>;

// 3. Initial values must satisfy the inferred type
export const loginInitialValues: LoginFormValues = {
  email: "",
  password: "",
};

// 4. Convert schema to Formik-compatible validationSchema
export const loginValidationSchema = toFormikValidationSchema(loginSchema);
```

---

## 2. Basic Form with Formik

```typescript
// src/routes/LoginPage.tsx
import { Formik, Form, Field, ErrorMessage } from "formik";
import { loginInitialValues, loginValidationSchema, type LoginFormValues } from "@/forms";

export function LoginPage() {
  const handleSubmit = async (values: LoginFormValues) => {
    await login(values); // call your mutation
  };

  return (
    <Formik
      initialValues={loginInitialValues}
      validationSchema={loginValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <div>
            <label htmlFor="email">Email</label>
            <Field id="email" name="email" type="email" />
            <ErrorMessage name="email" component="p" className="error" />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <Field id="password" name="password" type="password" />
            <ErrorMessage name="password" component="p" className="error" />
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
```

---

## 3. Common Zod Validation Patterns

```typescript
// src/forms/registerSchema.ts
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name is too short").max(50, "Name is too long"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password too short"),
    confirmPassword: z.string(),
    age: z
      .number({ invalid_type_error: "Age must be a number" })
      .min(18, "Must be 18 or older"),
    role: z.enum(["admin", "user"], {
      errorMap: () => ({ message: "Invalid role" }),
    }),
    agree: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // attach error to this field
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const registerInitialValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  age: 0,
  role: "user",
  agree: true,
};

export const registerValidationSchema =
  toFormikValidationSchema(registerSchema);
```

---

## 4. useFormik Hook (without JSX helper components)

Use `useFormik` when you want full control over rendering without Formik's `Field`/`Form` components.

```typescript
import { useFormik } from "formik";
import { loginInitialValues, loginValidationSchema, type LoginFormValues } from "@/forms";

export function LoginForm() {
  const formik = useFormik<LoginFormValues>({
    initialValues: loginInitialValues,
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      await login(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div>
        <label>Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.email && formik.errors.email && (
          <p className="error">{formik.errors.email}</p>
        )}
      </div>

      <button type="submit" disabled={formik.isSubmitting}>
        Login
      </button>
    </form>
  );
}
```

---

## 5. Select, Checkbox, and Custom Inputs

```typescript
// Select — use Field with "as"
<Field as="select" name="role">
  <option value="">Select a role</option>
  <option value="admin">Admin</option>
  <option value="user">User</option>
</Field>
<ErrorMessage name="role" component="p" className="error" />

// Checkbox
<Field type="checkbox" name="agree" id="agree" />
<label htmlFor="agree">I agree to the terms</label>
<ErrorMessage name="agree" component="p" className="error" />
```

---

## 6. Pre-fill Form with Existing Data

```typescript
import { useUser } from "@/queries";

export function EditUserForm({ userId }: { userId: string }) {
  const { data: user } = useUser(userId);

  if (!user) return <Spinner />;

  return (
    <Formik
      initialValues={{ name: user.name, email: user.email }}
      validationSchema={editUserValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize // ✅ re-initialize when user data loads
    >
      {({ isSubmitting }) => (
        <Form>
          <Field name="name" />
          <ErrorMessage name="name" component="p" className="error" />
          <Field name="email" type="email" />
          <ErrorMessage name="email" component="p" className="error" />
          <button type="submit" disabled={isSubmitting}>Save</button>
        </Form>
      )}
    </Formik>
  );
}
```

---

## 7. Server-Side Error Handling

```typescript
import { useCreateUser } from "@/mutations";

export function CreateUserForm() {
  const { mutateAsync: createUser } = useCreateUser();

  return (
    <Formik
      initialValues={createUserInitialValues}
      validationSchema={createUserValidationSchema}
      onSubmit={async (values, { setFieldError, setSubmitting }) => {
        try {
          await createUser(values);
        } catch (err: any) {
          // Map API error to a specific field
          setFieldError("email", err.response?.data?.message ?? "Something went wrong");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {/* form fields */}
    </Formik>
  );
}
```
