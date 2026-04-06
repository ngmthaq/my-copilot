---
name: dart-packages-dependencies
description: "Dart packages & dependencies — pubspec.yaml structure, version constraints, pub get/upgrade/outdated, pub.dev, hosted/git/path dependencies, dev_dependencies, dependency_overrides, creating and publishing packages, package layout conventions, and managing transitive dependencies. Use when: adding or updating dependencies; configuring pubspec.yaml; creating a publishable package; resolving version conflicts. DO NOT USE FOR: importing within a package (use dart-basic-syntax); CLI tooling setup (use dart-cli-development)."
---

# Dart Packages & Dependencies

## 1. `pubspec.yaml` Structure

```yaml
# pubspec.yaml — the package manifest (required in every Dart/Flutter project)

name: my_app # unique package name (snake_case)
description: A sample Dart application.
version: 1.0.0 # SemVer — required for published packages

environment:
  sdk: ">=3.0.0 <4.0.0" # SDK constraint (required)

dependencies:
  http: ^1.2.0
  path: ^1.9.0
  json_annotation: ^4.8.1

dev_dependencies:
  lints: ^3.0.0
  test: ^1.24.0
  build_runner: ^2.4.7
  json_serializable: ^6.7.1

# Override a transitive dependency version (use sparingly)
dependency_overrides:
  some_package: ^2.0.0
```

---

## 2. Version Constraints

Dart uses **SemVer** (Major.Minor.Patch):

| Constraint       | Meaning                                                | Example  |
| ---------------- | ------------------------------------------------------ | -------- |
| `^1.2.0`         | Compatible — `>=1.2.0 <2.0.0` (caret, most common)     | `^1.2.0` |
| `>=1.0.0 <2.0.0` | Explicit range                                         |          |
| `any`            | Any version (avoid — no guarantee)                     |          |
| `1.2.0`          | Exact pin (use for dev_dependencies or security fixes) |          |
| `>=2.0.0`        | Minimum only (no upper bound — risky)                  |          |

```yaml
dependencies:
  # ✅ Caret constraint — most common choice
  http: ^1.2.0 # allows 1.x.y where x >= 2

  # ✅ Explicit range — when you need fine-grained control
  crypto: ">=3.0.0 <4.0.0"

  # ❌ Avoid pinning exact versions in app pubspec (ok for packages)
  # logger: 2.0.1
```

---

## 3. Dependency Sources

### Hosted (pub.dev) — default

```yaml
dependencies:
  http: ^1.2.0 # resolves from pub.dev
```

### Path — local package

```yaml
dependencies:
  my_local_package:
    path: ../my_local_package # relative path to another package dir
```

### Git — from a Git repository

```yaml
dependencies:
  some_package:
    git:
      url: https://github.com/org/some_package.git
      ref: main # branch, tag, or commit SHA
      path: packages/some_package # optional subdirectory

  # Tag pin for reproducibility
  another_package:
    git:
      url: https://github.com/org/another.git
      ref: v2.3.1
```

---

## 4. `dart pub` Commands

```bash
# Install all dependencies (creates pubspec.lock)
dart pub get

# Upgrade to latest compatible versions
dart pub upgrade

# Upgrade a specific package
dart pub upgrade http

# Check for newer versions
dart pub outdated

# Add a dependency (updates pubspec.yaml automatically)
dart pub add http
dart pub add http:^1.2.0

# Add a dev dependency
dart pub add dev:lints
dart pub add dev:test

# Remove a dependency
dart pub remove http

# Verify package health
dart pub deps            # show dependency tree
dart pub deps --style=compact

# Run code generation
dart run build_runner build
dart run build_runner watch  # continuous rebuild
```

---

## 5. `pubspec.lock`

The lock file pins exact resolved versions for reproducible builds:

```yaml
# pubspec.lock (auto-generated — DO NOT manually edit)
packages:
  http:
    dependency: "direct main"
    description:
      name: http
      url: "https://pub.dev"
    source: hosted
    version: "1.2.1"
```

| Project Type    | Commit `pubspec.lock`?        |
| --------------- | ----------------------------- |
| Application     | ✅ Yes                        |
| Library/Package | ❌ No (let consumers resolve) |

---

## 6. Directory Layout for a Dart Package

```
my_package/
├── pubspec.yaml          # manifest
├── pubspec.lock          # lock file (app only)
├── README.md
├── CHANGELOG.md
├── LICENSE
├── analysis_options.yaml # linting config
├── lib/
│   ├── my_package.dart   # main library export barrel
│   └── src/
│       ├── models/
│       ├── services/
│       └── utils/
├── bin/                  # executable entry points
│   └── my_tool.dart
├── test/                 # unit and integration tests
│   └── my_package_test.dart
└── example/              # usage examples
    └── main.dart
```

### `lib/my_package.dart` — barrel export

```dart
/// Main entry point for the my_package library.
library my_package;

export 'src/models/user.dart';
export 'src/services/user_service.dart';
export 'src/utils/validators.dart';
```

---

## 7. Creating a Package

```bash
# Generate a new Dart package scaffold
dart create --template=package my_package

# Generate a Dart CLI app scaffold
dart create --template=cli my_tool
```

### `analysis_options.yaml`

```yaml
include: package:lints/recommended.yaml

analyzer:
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"
  errors:
    missing_required_param: error
    missing_return: error

linter:
  rules:
    - always_declare_return_types
    - avoid_dynamic_calls
    - prefer_const_constructors
    - prefer_final_fields
```

---

## 8. Publishing to pub.dev

```bash
# Validate the package before publishing
dart pub publish --dry-run

# Publish (requires pub.dev authentication)
dart pub publish
```

### Requirements for publishing

- `pubspec.yaml` must have `name`, `version`, `description`, `environment`
- `LICENSE` file must exist
- `README.md` is strongly recommended
- All source files must be in `lib/`

### `pubspec.yaml` extras for published packages

```yaml
name: my_package
description: A concise description (60–180 characters recommended).
version: 1.0.0
homepage: https://github.com/you/my_package
repository: https://github.com/you/my_package
issue_tracker: https://github.com/you/my_package/issues
documentation: https://pub.dev/documentation/my_package/latest/

environment:
  sdk: ">=3.0.0 <4.0.0"

topics:
  - networking
  - http
```

---

## 9. Code Generation (`build_runner`)

```yaml
dev_dependencies:
  build_runner: ^2.4.7
  json_serializable: ^6.7.1 # for JSON
  freezed: ^2.4.7 # for immutable value objects
  freezed_annotation: ^2.4.1
```

```bash
# One-time build
dart run build_runner build --delete-conflicting-outputs

# Watch mode (rebuilds on file changes)
dart run build_runner watch --delete-conflicting-outputs
```

```dart
// Example: json_serializable
import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart'; // generated file

@JsonSerializable()
class User {
  final String id;
  final String name;
  final String email;

  const User({required this.id, required this.name, required this.email});

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}
```

---

## 10. Resolving Version Conflicts

```bash
# See the full dependency tree
dart pub deps

# See outdated packages and their latest compatible versions
dart pub outdated

# Force-upgrade a specific package (may break others)
dart pub upgrade --major-versions

# Override a transitive dependency to fix a conflict (use temporarily)
```

```yaml
# In pubspec.yaml — last resort for transitive conflicts
dependency_overrides:
  conflicting_package: ^3.0.0
```

---

## Anti-Patterns

```yaml
# ❌ No upper bound on SDK constraint — breaks with future SDKs
environment:
  sdk: ">=3.0.0"

# ✅ Always set an upper bound
environment:
  sdk: ">=3.0.0 <4.0.0"

# ❌ Pinning exact versions in an app — prevents security updates
dependencies:
  http: 1.2.0

# ✅ Use caret constraints
dependencies:
  http: ^1.2.0

# ❌ Committing pubspec.lock for a library package
# ✅ Commit only for application packages

# ❌ Putting all code in lib/my_package.dart (one giant file)
# ✅ Organize in lib/src/ and export selectively from the barrel

# ❌ Using dependency_overrides in production published packages
# ✅ Use only temporarily; fix the real constraint issue upstream
```
