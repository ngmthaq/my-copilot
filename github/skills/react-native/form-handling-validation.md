---
name: react-native-form-handling-validation
description: "React Native forms — Formik + Zod: form setup, validation schemas in src/forms/, field wiring, error display, keyboard handling, and form submission. Use when: building any form; adding validation to inputs; handling form state."
---

# React Native Form Handling & Validation Skill

## Overview

This skill covers building forms with **Formik** + **Zod** in React Native. Zod schemas live in `src/forms/` alongside their initial values. Use `zod-formik-adapter` to connect Zod schemas to Formik.

Install: `npx expo install formik zod zod-formik-adapter`

---

## 1. Zod Schema + Initial Values (src/forms/)

```typescript
// src/forms/loginSchema.ts
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const loginInitialValues: LoginFormValues = {
  email: "",
  password: "",
};

export const loginValidationSchema = toFormikValidationSchema(loginSchema);
```

---

## 2. Basic Form with Formik

```typescript
// src/screens/LoginScreen/LoginScreen.tsx
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Formik } from "formik";
import { TextInput, Button, HelperText } from "react-native-paper";
import { loginInitialValues, loginValidationSchema, type LoginFormValues } from "@/forms";
import { useLogin } from "@/mutations";

export function LoginScreen() {
  const login = useLogin();

  const handleSubmit = async (values: LoginFormValues) => {
    login.mutate(values);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Formik
          initialValues={loginInitialValues}
          validationSchema={loginValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View style={styles.form}>
              <TextInput
                label="Email"
                mode="outlined"
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                keyboardType="email-address"
                autoCapitalize="none"
                error={Boolean(touched.email && errors.email)}
              />
              <HelperText type="error" visible={Boolean(touched.email && errors.email)}>
                {errors.email}
              </HelperText>

              <TextInput
                label="Password"
                mode="outlined"
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                secureTextEntry
                error={Boolean(touched.password && errors.password)}
              />
              <HelperText type="error" visible={Boolean(touched.password && errors.password)}>
                {errors.password}
              </HelperText>

              <Button
                mode="contained"
                onPress={() => handleSubmit()}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.button}
              >
                Login
              </Button>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
  form: { gap: 4 },
  button: { marginTop: 16 },
});
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
    phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number"),
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
  phone: "",
};

export const registerValidationSchema =
  toFormikValidationSchema(registerSchema);
```

---

## 4. useFormik Hook (Without Formik Component)

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
    <View>
      <TextInput
        label="Email"
        mode="outlined"
        value={formik.values.email}
        onChangeText={formik.handleChange("email")}
        onBlur={formik.handleBlur("email")}
        error={Boolean(formik.touched.email && formik.errors.email)}
      />
      {formik.touched.email && formik.errors.email && (
        <HelperText type="error">{formik.errors.email}</HelperText>
      )}

      <Button mode="contained" onPress={() => formik.handleSubmit()} loading={formik.isSubmitting}>
        Login
      </Button>
    </View>
  );
}
```

---

## 5. Multi-Field Focus Chain

Chain focus between inputs using refs for smoother keyboard experience.

```typescript
import { useRef } from "react";
import { TextInput as RNTextInput } from "react-native";

export function RegisterForm() {
  const emailRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);

  return (
    <Formik
      initialValues={registerInitialValues}
      validationSchema={registerValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ handleChange, handleBlur, handleSubmit, values }) => (
        <View>
          <TextInput
            label="Name"
            value={values.name}
            onChangeText={handleChange("name")}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            blurOnSubmit={false}
          />
          <TextInput
            ref={emailRef}
            label="Email"
            value={values.email}
            onChangeText={handleChange("email")}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            blurOnSubmit={false}
          />
          <TextInput
            ref={passwordRef}
            label="Password"
            value={values.password}
            onChangeText={handleChange("password")}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={() => handleSubmit()}
          />
          <Button mode="contained" onPress={() => handleSubmit()}>Register</Button>
        </View>
      )}
    </Formik>
  );
}
```

---

## 6. Pre-Fill Form with Existing Data

```typescript
import { useUser } from "@/queries";

export function EditProfileForm({ userId }: { userId: string }) {
  const { data: user } = useUser(userId);

  if (!user) return <ActivityIndicator />;

  return (
    <Formik
      initialValues={{ name: user.name, email: user.email }}
      validationSchema={editProfileValidationSchema}
      enableReinitialize // ✅ re-initialize when user data loads
      onSubmit={handleSubmit}
    >
      {/* ... */}
    </Formik>
  );
}
```

---

## 7. Keyboard Handling Tips

- Wrap forms in `KeyboardAvoidingView` with `behavior="padding"` on iOS
- Use `ScrollView` with `keyboardShouldPersistTaps="handled"` to allow tapping buttons while keyboard is open
- Use `returnKeyType` and `onSubmitEditing` to chain input focus
- Use `Keyboard.dismiss()` to close keyboard programmatically
