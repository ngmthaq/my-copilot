---
name: dart-convention
description: "Dart coding convention and Effective Dart — covers general formatting rules, dart format, naming conventions, import organization, Dart-specific rules, collections & null handling, comments & documentation, analysis options, and all Effective Dart guidelines (Style, Documentation, Usage, Design). Use when: formatting or refactoring Dart code; reviewing for style consistency; applying naming conventions; organizing imports; checking Effective Dart compliance. DO NOT USE FOR: Flutter widget conventions (use flutter-convention); Flutter architecture patterns (use flutter-convention)."
---

# Dart Convention

## When to Use

- Formatting or refactoring Dart code to match project style
- Reviewing a PR or file for style consistency
- Applying naming conventions to variables, functions, classes, or files
- Organizing import statements in Dart files
- Deciding indentation, quote style, or trailing commas in Dart code
- Checking compliance with Effective Dart guidelines

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

### Files & Folders

| Context         | Convention               | Example                     |
| --------------- | ------------------------ | --------------------------- |
| Dart files      | `lower_snake_case.dart`  | `user_repository.dart`      |
| Model/DTO files | `lower_snake_case.dart`  | `user_dto.dart`             |
| Test files      | Same name + `_test.dart` | `user_repository_test.dart` |
| Folders         | `lower_snake_case/`      | `features/auth/`            |

---

## 4. Import Organization

Order imports in this exact sequence, separated by blank lines:

1. `dart:` core libraries
2. `package:` imports (external)
3. Internal `package:myapp/` absolute imports
4. Relative imports (`../`, `./`)

```dart
import 'dart:async';
import 'dart:convert';

import 'package:dio/dio.dart';

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

@override
void initState() {
  super.initState();
}

// Avoid
dynamic data = fetchSomething();
var x = something!.value;
```

---

## 6. Functions & Methods

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

## 7. Collections & Null Handling

- Prefer collection literals over constructors (`[]`, `{}`, `<Type>[]`).
- Use `?.` and `??` instead of null checks with `if`.

```dart
// Good
final names = <String>[];
final config = <String, dynamic>{};

final userName = user?.name ?? 'Guest';
```

---

## 8. Comments & Documentation

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

## 9. Analysis Options

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
- [ ] Imports are ordered and grouped correctly (dart → external → internal → relative)
- [ ] No `dynamic` or `var` where a specific type is known
- [ ] No leftover `print()` statements or commented-out code
- [ ] File and folder names are `lower_snake_case`

---

## Effective Dart

Over the past several years, we've written a ton of Dart code and learned a lot about what works well and what doesn't. We're sharing this with you so you can write consistent, robust, fast code too. There are two overarching themes:

1.  **Be consistent.** When it comes to things like formatting, and casing, arguments about which is better are subjective and impossible to resolve. What we do know is that being _consistent_ is objectively helpful.

    If two pieces of code look different it should be because they _are_ different in some meaningful way. When a bit of code stands out and catches your eye, it should do so for a useful reason.

2.  **Be brief.** Dart was designed to be familiar, so it inherits many of the same statements and expressions as C, Java, JavaScript and other languages. But we created Dart because there is a lot of room to improve on what those languages offer. We added a bunch of features, from string interpolation to initializing formals, to help you express your intent more simply and easily.

    If there are multiple ways to say something, you should generally pick the most concise one. This is not to say you should `code golf` yourself into cramming a whole program into a single line. The goal is code that is _economical_, not _dense_.

### The topics

We split the guidelines into a few separate topics for easy digestion:

- **Style** – This defines the rules for laying out and organizing code, or at least the parts that `dart format` doesn't handle for you. The style topic also specifies how identifiers are formatted: `camelCase`, `using_underscores`, etc.

- **Documentation** – This tells you everything you need to know about what goes inside comments. Both doc comments and regular, run-of-the-mill code comments.

- **Usage** – This teaches you how to make the best use of language features to implement behavior. If it's in a statement or expression, it's covered here.

- **Design** – This is the softest topic, but the one with the widest scope. It covers what we've learned about designing consistent, usable APIs for libraries. If it's in a type signature or declaration, this goes over it.

### How to read the topics

Each topic is broken into a few sections. Sections contain a list of guidelines. Each guideline starts with one of these words:

- **DO** guidelines describe practices that should always be followed. There will almost never be a valid reason to stray from them.

- **DON'T** guidelines are the converse: things that are almost never a good idea. Hopefully, we don't have as many of these as other languages do because we have less historical baggage.

- **PREFER** guidelines are practices that you _should_ follow. However, there may be circumstances where it makes sense to do otherwise. Just make sure you understand the full implications of ignoring the guideline when you do.

- **AVOID** guidelines are the dual to "prefer": stuff you shouldn't do but where there may be good reasons to on rare occasions.

- **CONSIDER** guidelines are practices that you might or might not want to follow, depending on circumstances, precedents, and your own preference.

Some guidelines describe an **exception** where the rule does _not_ apply. When listed, the exceptions may not be exhaustive—you might still need to use your judgement on other cases.

This sounds like the police are going to beat down your door if you don't have your laces tied correctly. Things aren't that bad. Most of the guidelines here are common sense and we're all reasonable people. The goal, as always, is nice, readable and maintainable code.

### Rules

#### Style

##### Identifiers

- DO name types using `UpperCamelCase`.
- DO name extensions using `UpperCamelCase`.
- DO name packages, directories, and source files using `lowercase_with_underscores`.
- DO name import prefixes using `lowercase_with_underscores`.
- DO name other identifiers using `lowerCamelCase`.
- PREFER using `lowerCamelCase` for constant names.
- DO capitalize acronyms and abbreviations longer than two letters like words.
- PREFER using wildcards for unused callback parameters.
- DON'T use a leading underscore for identifiers that aren't private.
- DON'T use prefix letters.
- DON'T explicitly name libraries.

##### Ordering

- DO place `dart:` imports before other imports.
- DO place `package:` imports before relative imports.
- DO specify exports in a separate section after all imports.
- DO sort sections alphabetically.

##### Formatting

- DO format your code using `dart format`.
- CONSIDER changing your code to make it more formatter-friendly.
- PREFER lines 80 characters or fewer.
- DO use curly braces for all flow control statements.

#### Documentation

##### Comments

- DO format comments like sentences.
- DON'T use block comments for documentation.

##### Doc comments

- DO use `///` doc comments to document members and types.
- PREFER writing doc comments for public APIs.
- CONSIDER writing a library-level doc comment.
- CONSIDER writing doc comments for private APIs.
- DO start doc comments with a single-sentence summary.
- DO separate the first sentence of a doc comment into its own paragraph.
- AVOID redundancy with the surrounding context.
- PREFER starting comments of a function or method with third-person verbs if its main purpose is a side effect.
- PREFER starting a non-boolean variable or property comment with a noun phrase.
- PREFER starting a boolean variable or property comment with "Whether" followed by a noun or gerund phrase.
- PREFER a noun phrase or non-imperative verb phrase for a function or method if returning a value is its primary purpose.
- DON'T write documentation for both the getter and setter of a property.
- PREFER starting library or type comments with noun phrases.
- CONSIDER including code samples in doc comments.
- DO use square brackets in doc comments to refer to in-scope identifiers.
- DO use prose to explain parameters, return values, and exceptions.
- DO put doc comments before metadata annotations.

##### Markdown

- AVOID using markdown excessively.
- AVOID using HTML for formatting.
- PREFER backtick fences for code blocks.

##### Writing

- PREFER brevity.
- AVOID abbreviations and acronyms unless they are obvious.
- PREFER using "this" instead of "the" to refer to a member's instance.

#### Usage

##### Libraries

- DO use strings in `part of` directives.
- DON'T import libraries that are inside the `src` directory of another package.
- DON'T allow an import path to reach into or out of `lib`.
- PREFER relative import paths.

##### Null

- DON'T explicitly initialize variables to `null`.
- DON'T use an explicit default value of `null`.
- DON'T use `true` or `false` in equality operations.
- AVOID `late` variables if you need to check whether they are initialized.
- CONSIDER type promotion or null-check patterns for using nullable types.

##### Strings

- DO use adjacent strings to concatenate string literals.
- PREFER using interpolation to compose strings and values.
- AVOID using curly braces in interpolation when not needed.

##### Collections

- DO use collection literals when possible.
- DON'T use `.length` to see if a collection is empty.
- AVOID using `Iterable.forEach()` with a function literal.
- DON'T use `List.from()` unless you intend to change the type of the result.
- DO use `whereType()` to filter a collection by type.
- DON'T use `cast()` when a nearby operation will do.
- AVOID using `cast()`.

##### Functions

- DO use a function declaration to bind a function to a name.
- DON'T create a lambda when a tear-off will do.

##### Variables

- DO follow a consistent rule for `var` and `final` on local variables.
- AVOID storing what you can calculate.

##### Members

- DON'T wrap a field in a getter and setter unnecessarily.
- PREFER using a `final` field to make a read-only property.
- CONSIDER using `=>` for simple members.
- DON'T use `this.` except to redirect to a named constructor or to avoid shadowing.
- DO initialize fields at their declaration when possible.

##### Constructors

- DO use initializing formals when possible.
- DON'T use `late` when a constructor initializer list will do.
- DO use `;` instead of `{}` for empty constructor bodies.
- DON'T use `new`.
- DON'T use `const` redundantly.

##### Error handling

- AVOID catches without `on` clauses.
- DON'T discard errors from catches without `on` clauses.
- DO throw objects that implement `Error` only for programmatic errors.
- DON'T explicitly catch `Error` or types that implement it.
- DO use `rethrow` to rethrow a caught exception.

##### Asynchrony

- PREFER async/await over using raw futures.
- DON'T use `async` when it has no useful effect.
- CONSIDER using higher-order methods to transform a stream.
- AVOID using Completer directly.
- DO test for `Future<T>` when disambiguating a `FutureOr<T>` whose type argument could be `Object`.

#### Design

##### Names

- DO use terms consistently.
- AVOID abbreviations.
- PREFER putting the most descriptive noun last.
- CONSIDER making the code read like a sentence.
- PREFER a noun phrase for a non-boolean property or variable.
- PREFER a non-imperative verb phrase for a boolean property or variable.
- CONSIDER omitting the verb for a named boolean parameter.
- PREFER the "positive" name for a boolean property or variable.
- PREFER an imperative verb phrase for a function or method whose main purpose is a side effect.
- PREFER a noun phrase or non-imperative verb phrase for a function or method if returning a value is its primary purpose.
- CONSIDER an imperative verb phrase for a function or method if you want to draw attention to the work it performs.
- AVOID starting a method name with `get`.
- PREFER naming a method `to...()` if it copies the object's state to a new object.
- PREFER naming a method `as...()` if it returns a different representation backed by the original object.
- AVOID describing the parameters in the function's or method's name.
- DO follow existing mnemonic conventions when naming type parameters.

##### Libraries

- PREFER making declarations private.
- CONSIDER declaring multiple classes in the same library.

##### Classes and mixins

- AVOID defining a one-member abstract class when a simple function will do.
- AVOID defining a class that contains only static members.
- AVOID extending a class that isn't intended to be subclassed.
- DO use class modifiers to control if your class can be extended.
- AVOID implementing a class that isn't intended to be an interface.
- DO use class modifiers to control if your class can be an interface.
- PREFER defining a pure `mixin` or pure `class` to a `mixin class`.

##### Constructors

- CONSIDER making your constructor `const` if the class supports it.

##### Members

- PREFER making fields and top-level variables `final`.
- DO use getters for operations that conceptually access properties.
- DO use setters for operations that conceptually change properties.
- DON'T define a setter without a corresponding getter.
- AVOID using runtime type tests to fake overloading.
- AVOID public `late final` fields without initializers.
- AVOID returning nullable `Future`, `Stream`, and collection types.
- AVOID returning `this` from methods just to enable a fluent interface.

##### Types

- DO type annotate variables without initializers.
- DO type annotate fields and top-level variables if the type isn't obvious.
- DON'T redundantly type annotate initialized local variables.
- DO annotate return types on function declarations.
- DO annotate parameter types on function declarations.
- DON'T annotate inferred parameter types on function expressions.
- DON'T type annotate initializing formals.
- DO write type arguments on generic invocations that aren't inferred.
- DON'T write type arguments on generic invocations that are inferred.
- AVOID writing incomplete generic types.
- DO annotate with `dynamic` instead of letting inference fail.
- PREFER signatures in function type annotations.
- DON'T specify a return type for a setter.
- DON'T use the legacy typedef syntax.
- PREFER inline function types over typedefs.
- PREFER using function type syntax for parameters.
- AVOID using `dynamic` unless you want to disable static checking.
- DO use `Future<void>` as the return type of asynchronous members that do not produce values.
- AVOID using `FutureOr<T>` as a return type.

##### Parameters

- AVOID positional boolean parameters.
- AVOID optional positional parameters if the user may want to omit earlier parameters.
- AVOID mandatory parameters that accept a special "no argument" value.
- DO use inclusive start and exclusive end parameters to accept a range.

##### Equality

- DO override `hashCode` if you override `==`.
- DO make your `==` operator obey the mathematical rules of equality.
- AVOID defining custom equality for mutable classes.
- DON'T make the parameter to `==` nullable.
