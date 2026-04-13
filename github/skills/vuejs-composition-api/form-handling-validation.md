---
name: vuejs-form-handling-validation
description: "Vue 3 forms — VeeValidate + Zod: form setup, validation schemas in src/forms/, field wiring, error display, and form submission. Use when: building any form; adding validation to inputs; handling form state."
---

# Vue 3 Form Handling & Validation Skill

## Overview

This skill covers building forms with **VeeValidate** + **Zod**. Zod schemas live in `src/forms/` alongside their initial values. Each form gets its own file. Use `@vee-validate/zod` to connect Zod schemas to VeeValidate's `useForm`.

Install: `npm install vee-validate zod @vee-validate/zod`

---

## 1. Zod Schema + Initial Values (src/forms/)

Define the schema, infer the TypeScript type, and set initial values in the same file — single source of truth.

```typescript
// src/forms/loginSchema.ts
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";

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

// 4. Convert schema to VeeValidate-compatible typed schema
export const loginValidationSchema = toTypedSchema(loginSchema);
```

---

## 2. Basic Form with useForm

```vue
<!-- src/pages/LoginPage/LoginPage.vue -->
<script setup lang="ts">
import { useForm } from "vee-validate";
import { loginInitialValues, loginValidationSchema, type LoginFormValues } from "@/forms";

const { handleSubmit, isSubmitting } = useForm<LoginFormValues>({
  initialValues: loginInitialValues,
  validationSchema: loginValidationSchema,
});

const onSubmit = handleSubmit(async (values) => {
  await login(values); // call your mutation
});
</script>

<template>
  <form @submit="onSubmit">
    <div>
      <label for="email">Email</label>
      <AppInput id="email" name="email" type="email" />
    </div>

    <div>
      <label for="password">Password</label>
      <AppInput id="password" name="password" type="password" />
    </div>

    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? "Logging in..." : "Login" }}
    </button>
  </form>
</template>
```

---

## 3. Field Component with useField

Use `useField` inside a custom input component to connect it to the parent form.

```vue
<!-- src/components/AppInput/AppInput.vue -->
<script setup lang="ts">
import { useField } from "vee-validate";

const props = defineProps<{
  name: string;
  type?: string;
  label?: string;
}>();

const { value, errorMessage, handleBlur, handleChange } = useField<string>(() => props.name);
</script>

<template>
  <div class="field">
    <label v-if="label" :for="name">{{ label }}</label>
    <input :id="name" :name="name" :type="type ?? 'text'" :value="value" @input="handleChange" @blur="handleBlur" />
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>
```

---

## 4. Common Zod Validation Patterns

```typescript
// src/forms/registerSchema.ts
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name is too short").max(50, "Name is too long"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password too short"),
    confirmPassword: z.string(),
    age: z.number({ invalid_type_error: "Age must be a number" }).min(18, "Must be 18 or older"),
    role: z.enum(["admin", "user"], { errorMap: () => ({ message: "Invalid role" }) }),
    agree: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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

export const registerValidationSchema = toTypedSchema(registerSchema);
```

---

## 5. useForm — Full Manual Control

Use `useField` per field when you need full control over each input without a custom component.

```vue
<script setup lang="ts">
import { useForm, useField } from "vee-validate";
import { loginInitialValues, loginValidationSchema, type LoginFormValues } from "@/forms";

const { handleSubmit, isSubmitting } = useForm<LoginFormValues>({
  initialValues: loginInitialValues,
  validationSchema: loginValidationSchema,
});

const {
  value: email,
  errorMessage: emailError,
  handleChange: onEmailChange,
  handleBlur: onEmailBlur,
} = useField<string>("email");

const {
  value: password,
  errorMessage: passwordError,
  handleChange: onPasswordChange,
  handleBlur: onPasswordBlur,
} = useField<string>("password");

const onSubmit = handleSubmit(async (values) => {
  await login(values);
});
</script>

<template>
  <form @submit="onSubmit">
    <div>
      <label>Email</label>
      <input type="email" :value="email" @input="onEmailChange" @blur="onEmailBlur" />
      <p v-if="emailError" class="error">{{ emailError }}</p>
    </div>

    <button type="submit" :disabled="isSubmitting">Login</button>
  </form>
</template>
```

---

## 6. Pre-fill Form with Existing Data

```vue
<script setup lang="ts">
import { useForm } from "vee-validate";
import { watch } from "vue";
import { useUser } from "@/queries";
import { editUserValidationSchema } from "@/forms";

const props = defineProps<{ userId: string }>();
const { data: user } = useUser(() => props.userId);

const { handleSubmit, resetForm, isSubmitting } = useForm({
  validationSchema: editUserValidationSchema,
});

// ✅ Re-initialize when user data loads
watch(
  user,
  (newUser) => {
    if (newUser) {
      resetForm({ values: { name: newUser.name, email: newUser.email } });
    }
  },
  { immediate: true },
);

const onSubmit = handleSubmit(async (values) => {
  await updateUser(props.userId, values);
});
</script>
```

---

## 7. Server-Side Error Handling

```vue
<script setup lang="ts">
import { useForm } from "vee-validate";
import { useCreateUser } from "@/mutations";

const { mutateAsync: createUser } = useCreateUser();

const { handleSubmit, setFieldError, isSubmitting } = useForm({
  initialValues: createUserInitialValues,
  validationSchema: createUserValidationSchema,
});

const onSubmit = handleSubmit(async (values) => {
  try {
    await createUser(values);
  } catch (err: any) {
    // Map API error to a specific field
    setFieldError("email", err.response?.data?.message ?? "Something went wrong");
  }
});
</script>
```

---

## 8. Select and Checkbox

```vue
<script setup lang="ts">
import { useField } from "vee-validate";

const { value: role, errorMessage: roleError } = useField<string>("role");
const { value: agree, errorMessage: agreeError } = useField<boolean>("agree");
</script>

<template>
  <!-- Select -->
  <select v-model="role">
    <option value="">Select a role</option>
    <option value="admin">Admin</option>
    <option value="user">User</option>
  </select>
  <p v-if="roleError" class="error">{{ roleError }}</p>

  <!-- Checkbox -->
  <input type="checkbox" id="agree" v-model="agree" />
  <label for="agree">I agree to the terms</label>
  <p v-if="agreeError" class="error">{{ agreeError }}</p>
</template>
```
