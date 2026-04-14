---
name: cpp-convention
description: "C++ coding convention — covers formatting rules, clang-format configuration, naming conventions, include organization, comment style, project layout, and header file conventions. Use when: formatting or refactoring C++ code; reviewing for style consistency; setting up clang-format; applying naming conventions; organizing includes. DO NOT USE FOR: build system configuration (use cpp-build-system); template patterns (use cpp-templates)."
---

# C++ Convention

Follow a consistent modern C++ style (Google C++ Style or LLVM style) with clang-format enforcement. Prefer modern C++ idioms over C-style patterns.

## When to Use

- Formatting or refactoring C++ code
- Reviewing a PR or file for style consistency
- Setting up clang-format configuration
- Applying naming conventions to variables, functions, types, or files
- Organizing and sorting `#include` statements
- Deciding on project structure and layout

---

## 1. General Formatting Rules

| Rule                | Value                                  |
| ------------------- | -------------------------------------- |
| Indentation         | 4 spaces                               |
| Max line length     | 100–120 characters                     |
| Braces              | K&R style (opening brace on same line) |
| Trailing whitespace | None                                   |
| Blank lines         | 1 between methods, 2 between sections  |
| End of file         | Single newline                         |
| Line endings        | LF (`\n`)                              |

### Brace Style

```cpp
// K&R style — opening brace on same line
if (condition) {
    doSomething();
} else {
    doOther();
}

// Functions — also same line (Google style)
int calculateSum(int a, int b) {
    return a + b;
}

// Namespaces — no extra indentation
namespace myapp {
namespace utils {

void helper() {
    // ...
}

}  // namespace utils
}  // namespace myapp

// Single-statement blocks — always use braces
if (ptr == nullptr) {
    return -1;  // ✓ Always braces, even for one line
}
```

---

## 2. clang-format Configuration

Use `.clang-format` at the project root:

```yaml
BasedOnStyle: Google
IndentWidth: 4
ColumnLimit: 100
BreakBeforeBraces: Attach
AllowShortFunctionsOnASingleLine: Inline
AllowShortIfStatementsOnASingleLine: false
AlwaysBreakTemplateDeclarations: Yes
SortIncludes: CaseSensitive
IncludeBlocks: Regroup
IncludeCategories:
  - Regex: '^".*"'
    Priority: 1
  - Regex: "^<.*>"
    Priority: 2
Standard: c++20
NamespaceIndentation: None
```

---

## 3. Naming Conventions

| Element             | Convention                  | Example                                 |
| ------------------- | --------------------------- | --------------------------------------- |
| Variables           | `snake_case`                | `user_count`, `is_active`               |
| Member variables    | `snake_case_`               | `name_`, `buffer_size_`                 |
| Functions/Methods   | `camelCase` or `snake_case` | `getUserName()` or `get_user_name()`    |
| Classes/Structs     | `PascalCase`                | `UserManager`, `HttpClient`             |
| Enums (scoped)      | `PascalCase`                | `enum class Color { Red, Green, Blue }` |
| Enum values         | `PascalCase`                | `Color::DarkRed`                        |
| Template parameters | `PascalCase`                | `template <typename ValueType>`         |
| Namespaces          | `snake_case`                | `namespace my_app`, `namespace net`     |
| Constants           | `kPascalCase`               | `kMaxRetries`, `kBufferSize`            |
| Macros (avoid)      | `UPPER_SNAKE_CASE`          | `MY_APP_VERSION`                        |
| File names          | `snake_case`                | `user_manager.cpp`, `http_client.h`     |
| Header guards       | `PROJECT_PATH_FILE_H_`      | `MY_APP_NET_HTTP_CLIENT_H_`             |

### Naming Anti-Patterns

```cpp
// BAD — single letter or ambiguous names
int d = getData();
auto p = std::make_unique<Node>();
int temp = process(d);

// GOOD — descriptive names
int data_length = getDataLength();
auto node = std::make_unique<Node>();
int processed_count = processBatch(data_length);

// BAD — Hungarian notation
int iCount;
std::string szName;
float fTotal;

// GOOD — clear intent without type prefixes
int count;
std::string name;
float total;

// BAD — underscore prefix on non-member variables (reserved)
int _count;  // reserved for implementation

// GOOD — trailing underscore for class members
class Widget {
    int count_;  // ✓ member variable
};
```

---

## 4. Include Organization

Order includes from most specific to most general, separated by blank lines:

```cpp
// 1. Corresponding header (for .cpp files)
#include "my_module.h"

// 2. Project headers
#include "utils/string_utils.h"
#include "core/config.h"

// 3. Third-party library headers
#include <fmt/core.h>
#include <spdlog/spdlog.h>

// 4. C++ standard library headers
#include <algorithm>
#include <memory>
#include <string>
#include <vector>

// 5. C compatibility headers (use C++ versions)
#include <cstdint>
#include <cstring>
#include <cstdio>
```

### Include Rules

- Always include what you use directly — don't rely on transitive includes
- Use `""` for project headers, `<>` for system/library headers
- Prefer `#pragma once` over traditional include guards (widely supported)
- Use C++ headers (`<cstdint>`) instead of C headers (`<stdint.h>`)
- Never include `.cpp` files

---

## 5. Comment Style

```cpp
// Single-line comments use C++ style

/*
 * Multi-line comments use C-style block comments
 * with aligned asterisks
 */

/// @brief Calculate the sum of two integers.
///
/// @param a First operand
/// @param b Second operand
/// @return The sum of a and b
int calculateSum(int a, int b);

// TODO: Refactor this once the API stabilizes
// FIXME: Off-by-one error in boundary check
// HACK: Workaround for compiler bug in GCC 12
```

### Comment Rules

- Prefer `//` for single-line comments
- Use Doxygen-style `///` or `/** */` for public API documentation
- Comment **why**, not **what** — the code should explain what
- Keep comments up-to-date when modifying code

---

## 6. Project Layout

```
project/
├── include/              # Public headers
│   └── project/
│       ├── module_a.h
│       └── module_b.h
├── src/                  # Source files
│   ├── module_a.cpp
│   ├── module_b.cpp
│   └── main.cpp
├── test/                 # Test files
│   ├── module_a_test.cpp
│   └── module_b_test.cpp
├── lib/                  # Third-party libraries
├── cmake/                # CMake modules
├── .clang-format         # Formatting config
├── .clang-tidy           # Static analysis config
├── CMakeLists.txt        # Build configuration
├── conanfile.txt         # Conan dependencies (optional)
└── README.md
```

---

## 7. Modern C++ Style Rules

```cpp
// ✓ Use auto when the type is obvious from context
auto name = std::string("Alice");
auto ptr = std::make_unique<Widget>();
auto it = container.begin();

// ✗ Avoid auto when it obscures the type
auto result = computeSomething();  // What type is this?

// ✓ Use nullptr instead of NULL or 0
if (ptr == nullptr) { ... }

// ✓ Use using instead of typedef
using StringVector = std::vector<std::string>;
using Callback = std::function<void(int)>;

// ✗ Avoid typedef
typedef std::vector<std::string> StringVector;  // old style

// ✓ Use scoped enums
enum class Color { Red, Green, Blue };

// ✗ Avoid unscoped enums
enum Color { Red, Green, Blue };  // pollutes namespace

// ✓ Use constexpr for compile-time constants
constexpr int kMaxSize = 1024;
constexpr double kPi = 3.14159265358979;

// ✓ Use range-based for loops
for (const auto& item : container) { ... }

// ✓ Use structured bindings (C++17)
auto [key, value] = *map.begin();

// ✓ Mark methods const when they don't modify state
int getCount() const { return count_; }

// ✓ Mark classes final when not designed for inheritance
class ConcreteHandler final : public Handler { ... };

// ✓ Use [[nodiscard]] for functions where ignoring return is a bug
[[nodiscard]] ErrorCode initialize();
```

---

## 8. Anti-Patterns

```cpp
// ✗ Using C-style casts
int x = (int)3.14;

// ✓ Use C++ casts
int x = static_cast<int>(3.14);

// ✗ Using raw new/delete
auto* obj = new MyClass();
delete obj;

// ✓ Use smart pointers
auto obj = std::make_unique<MyClass>();

// ✗ Using C-style arrays
int arr[10];

// ✓ Use std::array or std::vector
std::array<int, 10> arr{};
std::vector<int> dynamic_arr;

// ✗ Using C-style strings in new code
char name[64];

// ✓ Use std::string
std::string name;

// ✗ Using #define for constants
#define MAX_SIZE 1024

// ✓ Use constexpr
constexpr int kMaxSize = 1024;
```
