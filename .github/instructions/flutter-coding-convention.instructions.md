---
applyTo: "**/*.dart"
---

# Flutter / Dart Coding Convention

## When to Use

- Formatting or refactoring Dart/Flutter code to match project style
- Reviewing a PR or file for style consistency
- Applying naming conventions to variables, functions, classes, or files
- Organizing import statements in Dart files
- Deciding indentation, quote style, or trailing commas in Dart code

---

## 1. General Formatting Rules

| Rule            | Value                                                  |
| --------------- | ------------------------------------------------------ |
| Indentation     | 2 spaces (no tabs)                                     |
| Max line length | 80 characters (Dart convention; `dart format` default) |
| Quotes          | Single quotes (`'`) for strings                        |
| Trailing commas | Required on all multi-line argument/parameter lists    |
| Brace style     | Same line (`1tbs`)                                     |
| End of file     | Single newline (`\n`)                                  |
| Line endings    | LF (`\n`)                                              |
| Semicolons      | Required at end of statements                          |

---

## 2. Dart Format

Run `dart format` (or `flutter format`) to auto-format all Dart files:

```bash
dart format .
flutter format .

# Check only (CI)
dart format --output=none --set-exit-if-changed .
```

Use the default `dart format` line length of 80. Do NOT override with `--line-length` unless the team explicitly decides otherwise.

---

## 3. Naming Conventions

### Variables & Functions

- Use `lowerCamelCase` for all local variables, function names, method names, and parameters.
- Boolean variables should use `is`, `has`, `can`, `should` prefixes.

```dart
final isLoading = true;
final hasPermission = false;

void getUserById(String id) { ... }

bool canSubmitForm() => !isLoading && isFormValid;
```

### Constants

- Use `lowerCamelCase` for `const` values (Dart convention — NOT `UPPER_SNAKE_CASE`).

```dart
const defaultPageSize = 20;
const maxRetryCount = 3;
const appName = 'MyApp';
```

### Classes, Enums & Typedefs

- Use `UpperCamelCase` (PascalCase) for class names, enum names, typedef names, and extension names.

```dart
class UserRepository { ... }
class AuthException implements Exception { ... }

enum UserRole { admin, editor, viewer }

typedef UserId = String;

extension StringExtension on String { ... }
```

### Widgets

- Use `UpperCamelCase` for all widget class names.
- File name must match the widget name in `lower_snake_case`.

```dart
// File: user_profile_card.dart
class UserProfileCard extends StatelessWidget { ... }

// File: login_screen.dart
class LoginScreen extends StatefulWidget { ... }
```

### Files & Folders

| Context           | Convention                     | Example                     |
| ----------------- | ------------------------------ | --------------------------- |
| Dart files        | `lower_snake_case.dart`        | `user_repository.dart`      |
| Widget files      | `lower_snake_case.dart`        | `user_profile_card.dart`    |
| Screen files      | `lower_snake_case_screen.dart` | `login_screen.dart`         |
| Provider/Notifier | `lower_snake_case.dart`        | `auth_notifier.dart`        |
| Model/DTO files   | `lower_snake_case.dart`        | `user_dto.dart`             |
| Test files        | Same name + `_test.dart`       | `user_repository_test.dart` |
| Folders           | `lower_snake_case/`            | `features/auth/`            |

---

## 4. Import Organization

Order imports in this exact sequence, separated by blank lines:

1. `dart:` core libraries
2. `package:flutter/` imports
3. External `package:` imports
4. Internal `package:myapp/` absolute imports
5. Relative imports (`../`, `./`)

```dart
import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:myapp/core/network/dio_client.dart';
import 'package:myapp/features/auth/domain/user.dart';

import '../widgets/user_card.dart';
import 'helpers.dart';
```

---

## 5. Dart-Specific Rules

- Always use `final` for variables that are not reassigned; use `var` only when the value changes.
- Prefer `const` constructors whenever possible — they improve performance.
- Avoid `dynamic`; prefer explicit types or `Object?` and narrow with type checks.
- Use `late` only when a non-nullable variable is guaranteed to be initialised before use.
- Avoid non-null assertion (`!`) unless you are certain the value is non-null; prefer `?.` and `??`.
- Always annotate return types on public functions and methods.
- Use `@override` on every method that overrides a parent.

```dart
// Good
final String userName = 'Alice';
const padding = EdgeInsets.all(16);

Widget build(BuildContext context) { ... }

@override
void initState() {
  super.initState();
}

// Avoid
dynamic data = fetchSomething();
var x = something!.value;
```

---

## 6. Widget Conventions

- Always mark widget constructors `const` when all fields are final and known at compile time.
- Always add `{super.key}` to widget constructors.
- Extract subtrees into separate widgets rather than helper methods returning `Widget`.
- Never put business logic inside `build()` — delegate to providers, notifiers, or services.

```dart
// Good
class PriceTag extends StatelessWidget {
  const PriceTag({super.key, required this.price});
  final double price;

  @override
  Widget build(BuildContext context) {
    return Text('\$${price.toStringAsFixed(2)}');
  }
}

// Avoid
Widget _buildPriceTag(double price) {
  return Text('\$${price.toStringAsFixed(2)}');
}
```

---

## 7. Functions & Methods

- Keep methods short — single responsibility. Split if a method exceeds ~30 lines.
- Prefer named parameters for functions with 2+ parameters.
- Use `=>` (arrow) syntax only for single-expression functions/getters.

```dart
// Named parameters
void showDialog({
  required String title,
  required String message,
  VoidCallback? onConfirm,
}) { ... }

// Arrow syntax for single expressions
double get totalPrice => items.fold(0, (sum, item) => sum + item.price);
```

---

## 8. Collections & Null Handling

- Prefer collection literals over constructors (`[]`, `{}`, `<Type>[]`).
- Use `?.` and `??` instead of null checks with `if`.
- Use `...` spread and collection-if/for in widget lists.

```dart
// Good
final names = <String>[];
final config = <String, dynamic>{};

final userName = user?.name ?? 'Guest';

Column(
  children: [
    const Header(),
    if (isLoggedIn) const ProfileWidget(),
    ...items.map((e) => ItemTile(item: e)),
  ],
)
```

---

## 9. Comments & Documentation

- Use `//` for inline comments explaining _why_, not _what_.
- Use `///` (triple-slash doc comments) for public classes, methods, and fields.
- Do NOT leave commented-out dead code in committed files.

```dart
/// Returns the formatted display name for this user.
///
/// Falls back to [email] if [name] is null or empty.
String get displayName => name?.isNotEmpty == true ? name! : email;
```

---

## 10. Analysis Options

Include `analysis_options.yaml` at the project root:

```yaml
include: package:flutter_lints/flutter.yaml

linter:
  rules:
    - prefer_const_constructors
    - prefer_const_literals_to_create_immutables
    - prefer_final_fields
    - prefer_final_locals
    - avoid_dynamic_calls
    - always_use_package_imports
    - sort_pub_dependencies
    - use_super_parameters

analyzer:
  errors:
    missing_required_param: error
    missing_return: error
    invalid_annotation_target: ignore # for freezed/json_serializable
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"
```

---

## Quick Checklist

Before committing, verify:

- [ ] Indentation is 2 spaces, no tabs
- [ ] Lines do not exceed 80 characters
- [ ] Single quotes used for all string literals
- [ ] Trailing commas on all multi-line argument/parameter lists
- [ ] `dart format .` passes with no changes
- [ ] Imports are ordered and grouped correctly (dart → flutter → external → internal → relative)
- [ ] No `dynamic` or `var` where a specific type is known
- [ ] Widget constructors have `const` and `{super.key}`
- [ ] No business logic inside `build()` methods
- [ ] No leftover `print()` statements or commented-out code
- [ ] File and folder names are `lower_snake_case`
