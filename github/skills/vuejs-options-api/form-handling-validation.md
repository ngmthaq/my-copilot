---
name: vuejs-options-api-form-handling-validation
description: "Vue 3 Options API forms — VeeValidate component-based approach + Zod: <Form>/<Field> components, validation schemas in src/forms/, error display, and form submission within defineComponent. Use when: building any form; adding validation to inputs; handling form state."
---

# Vue 3 Options API Form Handling & Validation Skill

## Overview

This skill covers building forms with **VeeValidate** + **Zod** using the **component-based** approach (`<Form>`, `<Field>`, `<ErrorMessage>` components). Zod schemas live in `src/forms/`. Each form gets its own file. Use `@vee-validate/zod` to connect Zod schemas.

Install: `npm install vee-validate zod @vee-validate/zod`

---

## 1. Zod Schema + Initial Values (src/forms/)

Same as Composition API — single source of truth for schema, type, and initial values.

```typescript
// src/forms/loginSchema.ts
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const loginInitialValues: LoginFormValues = {
  email: "",
  password: "",
};

export const loginValidationSchema = toTypedSchema(loginSchema);
```

---

## 2. Basic Form with `<Form>` and `<Field>` Components

Use VeeValidate's component-based API which works naturally in Options API templates.

```vue
<!-- src/pages/LoginPage/LoginPage.vue -->
<script lang="ts">
import { defineComponent } from "vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import {
  loginInitialValues,
  loginValidationSchema,
  type LoginFormValues,
} from "@/forms";
import { authService } from "@/services";

export default defineComponent({
  name: "LoginPage",
  components: { Form, Field, ErrorMessage },
  data() {
    return {
      initialValues: loginInitialValues,
      validationSchema: loginValidationSchema,
      isSubmitting: false,
    };
  },
  methods: {
    async onSubmit(values: LoginFormValues) {
      this.isSubmitting = true;
      try {
        await authService.login(values);
        this.$router.push({ name: "dashboard" });
      } catch (err: any) {
        alert(err.message ?? "Login failed");
      } finally {
        this.isSubmitting = false;
      }
    },
  },
});
</script>

<template>
  <Form
    :initial-values="initialValues"
    :validation-schema="validationSchema"
    @submit="onSubmit"
  >
    <div>
      <label for="email">Email</label>
      <Field id="email" name="email" type="email" />
      <ErrorMessage name="email" class="error" />
    </div>

    <div>
      <label for="password">Password</label>
      <Field id="password" name="password" type="password" />
      <ErrorMessage name="password" class="error" />
    </div>

    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? "Logging in..." : "Login" }}
    </button>
  </Form>
</template>
```

---

## 3. Custom Input with `<Field>` Scoped Slot

Use the scoped slot for full control over the field's rendering and state.

```vue
<!-- src/components/AppInput/AppInput.vue -->
<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { Field, ErrorMessage } from "vee-validate";

export default defineComponent({
  name: "AppInput",
  components: { Field, ErrorMessage },
  props: {
    name: { type: String as PropType<string>, required: true },
    type: { type: String as PropType<string>, default: "text" },
    label: { type: String as PropType<string>, default: "" },
  },
});
</script>

<template>
  <div class="field">
    <label v-if="label" :for="name">{{ label }}</label>
    <Field :name="name" v-slot="{ field, meta }">
      <input
        :id="name"
        :type="type"
        v-bind="field"
        :class="{ 'is-invalid': meta.touched && !meta.valid }"
      />
    </Field>
    <ErrorMessage :name="name" class="error" />
  </div>
</template>
```

Usage inside a `<Form>`:

```vue
<Form :validation-schema="validationSchema" @submit="onSubmit">
  <AppInput name="email" label="Email" type="email" />
  <AppInput name="password" label="Password" type="password" />
  <button type="submit">Submit</button>
</Form>
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

## 5. Form with `<Form>` Scoped Slot — Full Access to Form State

Use the scoped slot on `<Form>` to access form-level state like errors, meta, and setFieldError.

```vue
<script lang="ts">
import { defineComponent } from "vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import {
  loginInitialValues,
  loginValidationSchema,
  type LoginFormValues,
} from "@/forms";
import { authService } from "@/services";

export default defineComponent({
  name: "LoginPage",
  components: { Form, Field, ErrorMessage },
  data() {
    return {
      initialValues: loginInitialValues,
      validationSchema: loginValidationSchema,
    };
  },
  methods: {
    async onSubmit(
      values: LoginFormValues,
      { setFieldError }: { setFieldError: Function },
    ) {
      try {
        await authService.login(values);
        this.$router.push({ name: "dashboard" });
      } catch (err: any) {
        setFieldError("email", err.response?.data?.message ?? "Login failed");
      }
    },
  },
});
</script>

<template>
  <Form
    v-slot="{ isSubmitting, meta }"
    :initial-values="initialValues"
    :validation-schema="validationSchema"
    @submit="onSubmit"
  >
    <div>
      <label for="email">Email</label>
      <Field id="email" name="email" type="email" />
      <ErrorMessage name="email" class="error" />
    </div>

    <div>
      <label for="password">Password</label>
      <Field id="password" name="password" type="password" />
      <ErrorMessage name="password" class="error" />
    </div>

    <button type="submit" :disabled="isSubmitting || !meta.valid">
      {{ isSubmitting ? "Logging in..." : "Login" }}
    </button>
  </Form>
</template>
```

---

## 6. Pre-fill Form with Existing Data

```vue
<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import { editUserValidationSchema } from "@/forms";
import { userService } from "@/services";
import type { User } from "@/types";

export default defineComponent({
  name: "EditUserForm",
  components: { Form, Field, ErrorMessage },
  props: {
    userId: { type: String as PropType<string>, required: true },
  },
  data() {
    return {
      initialValues: { name: "", email: "" },
      isLoading: true,
      validationSchema: editUserValidationSchema,
    };
  },
  async created() {
    try {
      const user = await userService.getUser(this.userId);
      // ✅ Set initial values from fetched data before form renders
      this.initialValues = { name: user.name, email: user.email };
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    async onSubmit(values: Partial<User>) {
      await userService.updateUser(this.userId, values);
      this.$router.push({ name: "users" });
    },
  },
});
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <Form
    v-else
    :initial-values="initialValues"
    :validation-schema="validationSchema"
    @submit="onSubmit"
  >
    <AppInput name="name" label="Name" />
    <AppInput name="email" label="Email" type="email" />
    <button type="submit">Save</button>
  </Form>
</template>
```

---

## 7. Server-Side Error Handling

The `onSubmit` handler receives a second argument with form helpers.

```typescript
methods: {
  async onSubmit(
    values: RegisterFormValues,
    { setFieldError, setErrors }: { setFieldError: Function; setErrors: Function },
  ) {
    try {
      await userService.createUser(values);
      this.$router.push({ name: "users" });
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        // Set multiple field errors at once
        setErrors(apiErrors); // { email: "Already taken", name: "Too short" }
      } else {
        setFieldError("email", err.response?.data?.message ?? "Something went wrong");
      }
    }
  },
},
```

---

## 8. Select, Checkbox, and Radio with `<Field>`

```vue
<template>
  <!-- Select -->
  <Field name="role" as="select">
    <option value="">Select a role</option>
    <option value="admin">Admin</option>
    <option value="user">User</option>
  </Field>
  <ErrorMessage name="role" class="error" />

  <!-- Checkbox -->
  <Field name="agree" type="checkbox" :value="true" />
  <label for="agree">I agree to the terms</label>
  <ErrorMessage name="agree" class="error" />

  <!-- Radio buttons -->
  <label> <Field name="gender" type="radio" value="male" /> Male </label>
  <label> <Field name="gender" type="radio" value="female" /> Female </label>
  <ErrorMessage name="gender" class="error" />
</template>
```

---

## 9. Dynamic Field Arrays

For forms with repeatable field groups, use `<FieldArray>`:

```vue
<script lang="ts">
import { defineComponent } from "vue";
import { Form, Field, FieldArray, ErrorMessage } from "vee-validate";

export default defineComponent({
  name: "InviteForm",
  components: { Form, Field, FieldArray, ErrorMessage },
  data() {
    return {
      initialValues: {
        invites: [{ email: "" }],
      },
    };
  },
  methods: {
    onSubmit(values: { invites: { email: string }[] }) {
      console.log(values.invites);
    },
  },
});
</script>

<template>
  <Form :initial-values="initialValues" @submit="onSubmit">
    <FieldArray name="invites" v-slot="{ fields, push, remove }">
      <div v-for="(entry, idx) in fields" :key="entry.key">
        <Field
          :name="`invites[${idx}].email`"
          type="email"
          placeholder="Email"
        />
        <ErrorMessage :name="`invites[${idx}].email`" class="error" />
        <button type="button" @click="remove(idx)">Remove</button>
      </div>
      <button type="button" @click="push({ email: '' })">Add invite</button>
    </FieldArray>
    <button type="submit">Send invites</button>
  </Form>
</template>
```
