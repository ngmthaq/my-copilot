---
name: c-convention
description: "C coding convention — covers formatting rules, clang-format configuration, naming conventions, include organization, comment style, project layout, and header file conventions. Use when: formatting or refactoring C code; reviewing for style consistency; setting up clang-format; applying naming conventions; organizing includes. DO NOT USE FOR: preprocessor details (use c-preprocessor); build system configuration (use c-build-system)."
---

# C Convention

This is the **base convention** for all C projects. Follow a consistent style (Linux kernel style or Google C style) with modern tooling (clang-format) for enforcement.

## When to Use

- Formatting or refactoring C code
- Reviewing a PR or file for style consistency
- Setting up clang-format configuration
- Applying naming conventions to variables, functions, types, or files
- Organizing and sorting `#include` statements
- Deciding on project structure and layout

---

## 1. General Formatting Rules

| Rule                | Value                                     |
| ------------------- | ----------------------------------------- |
| Indentation         | 4 spaces (or tabs for Linux kernel style) |
| Max line length     | 80–120 characters                         |
| Braces              | K&R style (opening brace on same line)    |
| Trailing whitespace | None                                      |
| Blank lines         | 1 between functions, 2 between sections   |
| End of file         | Single newline                            |
| Line endings        | LF (`\n`)                                 |

### Brace Style

```c
/* K&R style — preferred */
if (condition) {
    do_something();
} else {
    do_other();
}

/* Function definitions — opening brace on new line (Linux kernel style) */
int calculate_sum(int a, int b)
{
    return a + b;
}

/* Single-statement blocks — always use braces */
if (ptr == NULL) {
    return -1;  /* ✓ Always braces, even for one line */
}
```

---

## 2. clang-format Configuration

Use `.clang-format` at the project root:

```yaml
BasedOnStyle: LLVM
IndentWidth: 4
ColumnLimit: 100
BreakBeforeBraces: Linux
AllowShortFunctionsOnASingleLine: None
AllowShortIfStatementsOnASingleLine: false
AlwaysBreakAfterReturnType: None
SortIncludes: CaseSensitive
IncludeBlocks: Regroup
IncludeCategories:
  - Regex: '^".*"'
    Priority: 1
  - Regex: "^<.*>"
    Priority: 2
```

---

## 3. Naming Conventions

| Element             | Convention             | Example                           |
| ------------------- | ---------------------- | --------------------------------- |
| Variables           | `snake_case`           | `user_count`, `is_active`         |
| Functions           | `snake_case`           | `get_user()`, `calculate_total()` |
| Types (struct/enum) | `snake_case_t`         | `user_t`, `config_t`              |
| Typedef             | `snake_case_t`         | `size_t`, `uint32_t`              |
| Macros/Constants    | `UPPER_SNAKE_CASE`     | `MAX_RETRIES`, `BUFFER_SIZE`      |
| Enum values         | `UPPER_SNAKE_CASE`     | `STATUS_OK`, `STATUS_ERROR`       |
| Global variables    | `g_` prefix            | `g_config`, `g_logger`            |
| Static variables    | `s_` prefix            | `s_instance_count`                |
| Pointer variables   | `p_` prefix (optional) | `p_node`, `p_buffer`              |
| Header guards       | `PROJECT_MODULE_H`     | `MY_APP_UTILS_H`                  |
| File names          | `snake_case`           | `linked_list.c`, `hash_table.h`   |

### Naming Anti-Patterns

```c
/* BAD — single letter or ambiguous names */
int d = get_data();
void *p = malloc(n);
int temp = process(d);

/* GOOD — descriptive names */
int data_length = get_data_length();
void *buffer = malloc(buffer_size);
int processed_count = process_batch(data_length);

/* BAD — Hungarian notation (outdated) */
int iCount;
char *szName;
float fTotal;

/* GOOD — clear intent without type prefixes */
int count;
char *name;
float total;
```

---

## 4. Include Organization

Order includes from most specific to most general, separated by blank lines:

```c
/* 1. Corresponding header (for .c files) */
#include "my_module.h"

/* 2. Project headers */
#include "utils/string_utils.h"
#include "core/config.h"

/* 3. Third-party library headers */
#include <libxml/parser.h>
#include <openssl/sha.h>

/* 4. Standard library headers */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
```

### Include Rules

- Always include what you use directly — don't rely on transitive includes
- Use `""` for project headers, `<>` for system/library headers
- Never include `.c` files
- Use include guards or `#pragma once` in all headers

---

## 5. Comment Style

```c
/* Single-line comments use C-style block comments */

/*
 * Multi-line comments use this format
 * with aligned asterisks
 */

/**
 * @brief Calculate the sum of two integers.
 *
 * @param a First operand
 * @param b Second operand
 * @return The sum of a and b
 */
int calculate_sum(int a, int b);

/* TODO: Refactor this once the API stabilizes */
/* FIXME: Off-by-one error in boundary check */
/* HACK: Workaround for compiler bug in GCC 12 */
```

### Comment Rules

- Prefer C-style `/* */` over C++-style `//` for maximum portability (C89 compat)
- Use Doxygen-style `/** */` for public API documentation
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
│   ├── module_a.c
│   ├── module_b.c
│   └── main.c
├── test/                 # Test files
│   ├── test_module_a.c
│   └── test_module_b.c
├── lib/                  # Third-party libraries
├── build/                # Build output (gitignored)
├── Makefile              # or CMakeLists.txt
├── .clang-format
├── .gitignore
└── README.md
```

### Header File Template

```c
#ifndef PROJECT_MODULE_H
#define PROJECT_MODULE_H

#ifdef __cplusplus
extern "C" {
#endif

/* Includes */
#include <stdint.h>
#include <stdbool.h>

/* Type definitions */
typedef struct {
    int id;
    char name[64];
} user_t;

/* Function declarations */
user_t *user_create(int id, const char *name);
void user_destroy(user_t *user);

#ifdef __cplusplus
}
#endif

#endif /* PROJECT_MODULE_H */
```

---

## 7. General Best Practices

- Always initialize variables at declaration when possible
- Use `const` for parameters and variables that should not change
- Prefer `size_t` for sizes and array indices
- Use `stdint.h` types (`uint32_t`, `int16_t`) for fixed-width integers
- Use `stdbool.h` for boolean values (`bool`, `true`, `false`)
- Avoid magic numbers — use named constants or enums
- Keep functions short — under 40 lines is ideal
- One declaration per line
- Always check return values of functions that can fail
