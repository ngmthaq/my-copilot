---
name: c-preprocessor
description: "C preprocessor — macros, object-like and function-like macros, conditional compilation, include guards, pragma directives, predefined macros, X-macros, stringification, token pasting, and macro safety. Use when: writing macros; conditional compilation; include guards; pragma directives; predefined macros; X-macros. DO NOT USE FOR: inline functions (use c-functions); build system configuration (use c-build-system)."
---

# C Preprocessor

## 1. Include Guards

```c
/* Traditional include guard — portable, universally supported */
#ifndef PROJECT_MODULE_H
#define PROJECT_MODULE_H

/* header contents */

#endif /* PROJECT_MODULE_H */

/* Pragma once — non-standard but widely supported */
#pragma once

/* header contents */
```

### Guard Naming Convention

```c
/* Pattern: PROJECT_PATH_FILENAME_H */
#ifndef MYAPP_CORE_CONFIG_H      /* include/myapp/core/config.h */
#ifndef MYAPP_UTILS_STRING_H     /* include/myapp/utils/string.h */
#ifndef MYAPP_NET_HTTP_CLIENT_H  /* include/myapp/net/http_client.h */
```

---

## 2. Object-Like Macros (Constants)

```c
/* Numeric constants */
#define MAX_BUFFER_SIZE  4096
#define MAX_CONNECTIONS  100
#define PI               3.14159265358979

/* String constants */
#define APP_NAME    "MyApplication"
#define APP_VERSION "1.2.3"

/* Prefer enums over #define for related integer constants */
enum { MAX_RETRIES = 3, TIMEOUT_MS = 5000 };

/* Type-safe alternative: static const (when applicable) */
static const size_t kBufferSize = 4096;
```

---

## 3. Function-Like Macros

```c
/* Basic function-like macro */
#define MAX(a, b)  ((a) > (b) ? (a) : (b))
#define MIN(a, b)  ((a) < (b) ? (a) : (b))
#define ABS(x)     ((x) >= 0 ? (x) : -(x))

/* CRITICAL: Always parenthesize parameters and the whole expression */
#define BAD_SQUARE(x)  x * x           /* ✗ BAD_SQUARE(1+2) = 1+2*1+2 = 5 */
#define SQUARE(x)      ((x) * (x))     /* ✓ SQUARE(1+2) = ((1+2)*(1+2)) = 9 */

/* WARNING: side effects evaluated multiple times */
int a = 5;
MAX(a++, 3);  /* ✗ a++ evaluated twice — undefined behavior */

/* PREFER inline functions over function-like macros */
static inline int max_int(int a, int b)
{
    return (a > b) ? a : b;  /* ✓ no double-evaluation, type-safe */
}
```

### Multi-Statement Macros

```c
/* Use do { ... } while (0) for multi-statement macros */
#define LOG_ERROR(msg)          \
    do {                        \
        fprintf(stderr, "[ERROR] %s:%d: %s\n", __FILE__, __LINE__, (msg)); \
    } while (0)

/* This works correctly in all contexts */
if (error)
    LOG_ERROR("something failed");  /* ✓ single statement */
else
    continue;

/* Without do-while(0), the else would bind to the wrong if */
```

---

## 4. Stringification and Token Pasting

### Stringification (`#`)

```c
/* Convert macro argument to string literal */
#define STRINGIFY(x)    #x
#define TOSTRING(x)     STRINGIFY(x)

STRINGIFY(hello)          /* "hello" */
STRINGIFY(1 + 2)          /* "1 + 2" */

/* Useful for printing variable names */
#define PRINT_VAR(var)  printf(#var " = %d\n", (var))

int count = 42;
PRINT_VAR(count);  /* prints: count = 42 */

/* Expand macro value before stringifying */
#define VERSION 3
STRINGIFY(VERSION)   /* "VERSION"  — stringifies the name */
TOSTRING(VERSION)    /* "3"        — expands VERSION first, then stringifies */
```

### Token Pasting (`##`)

```c
/* Concatenate tokens at preprocessing time */
#define CONCAT(a, b)  a##b

CONCAT(my_, function)()   /* my_function() */
int CONCAT(var_, 1) = 10; /* int var_1 = 10; */

/* Generate function names */
#define DEFINE_GETTER(type, name)  \
    type get_##name(const config_t *cfg) { return cfg->name; }

DEFINE_GETTER(int, width)    /* int get_width(const config_t *cfg) { ... } */
DEFINE_GETTER(int, height)   /* int get_height(const config_t *cfg) { ... } */
```

---

## 5. Conditional Compilation

```c
/* #if / #elif / #else / #endif */
#if defined(_WIN32)
    #include <windows.h>
#elif defined(__linux__)
    #include <unistd.h>
#elif defined(__APPLE__)
    #include <TargetConditionals.h>
#else
    #error "Unsupported platform"
#endif

/* #ifdef / #ifndef — shorthand for #if defined() */
#ifdef DEBUG
    #define LOG(fmt, ...) fprintf(stderr, fmt, ##__VA_ARGS__)
#else
    #define LOG(fmt, ...) ((void)0)  /* no-op */
#endif

/* Feature toggles */
#ifndef FEATURE_LOGGING
#define FEATURE_LOGGING 1
#endif

#if FEATURE_LOGGING
void log_message(const char *msg);
#endif

/* Version checks */
#if __STDC_VERSION__ >= 201112L
    /* C11 features available */
    #include <stdnoreturn.h>
#endif
```

---

## 6. Predefined Macros

```c
/* Standard predefined macros */
__FILE__          /* current file name (string literal) */
__LINE__          /* current line number (integer) */
__func__          /* current function name (C99, string) */
__DATE__          /* compilation date "Mmm dd yyyy" */
__TIME__          /* compilation time "hh:mm:ss" */
__STDC__          /* 1 if conforming to C standard */
__STDC_VERSION__  /* C standard version (e.g., 201710L for C17) */

/* Useful for debugging macros */
#define ASSERT(expr)                                              \
    do {                                                          \
        if (!(expr)) {                                            \
            fprintf(stderr, "Assertion failed: %s\n"              \
                    "  File: %s, Line: %d, Function: %s\n",      \
                    #expr, __FILE__, __LINE__, __func__);         \
            abort();                                              \
        }                                                         \
    } while (0)
```

---

## 7. Variadic Macros (C99)

```c
/* __VA_ARGS__ captures variable arguments */
#define LOG_INFO(fmt, ...)  \
    fprintf(stdout, "[INFO] " fmt "\n", ##__VA_ARGS__)

#define LOG_ERROR(fmt, ...) \
    fprintf(stderr, "[ERROR %s:%d] " fmt "\n", __FILE__, __LINE__, ##__VA_ARGS__)

/* ## before __VA_ARGS__ removes trailing comma when no args (GCC extension) */
LOG_INFO("Server started");                    /* no extra args */
LOG_INFO("Port: %d", 8080);                   /* one arg */
LOG_ERROR("Failed to open %s: %s", path, strerror(errno));  /* multiple */
```

---

## 8. X-Macros

```c
/* Define data once, generate multiple constructs */
#define ERROR_LIST          \
    X(ERR_NONE,    "No error")        \
    X(ERR_NOMEM,   "Out of memory")   \
    X(ERR_IO,      "I/O error")       \
    X(ERR_PARSE,   "Parse error")     \
    X(ERR_TIMEOUT, "Timeout")

/* Generate enum */
typedef enum {
    #define X(code, msg) code,
    ERROR_LIST
    #undef X
    ERR_COUNT  /* total number of error codes */
} error_code_t;

/* Generate string lookup */
const char *error_to_string(error_code_t code)
{
    static const char *messages[] = {
        #define X(code, msg) [code] = msg,
        ERROR_LIST
        #undef X
    };
    if (code < 0 || code >= ERR_COUNT) {
        return "Unknown error";
    }
    return messages[code];
}
```

---

## 9. Pragma Directives

```c
/* Compiler-specific pragmas */
#pragma once                          /* include guard alternative */

/* Diagnostic control (GCC/Clang) */
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wunused-parameter"
void callback(int unused_param) { }
#pragma GCC diagnostic pop

/* Structure packing */
#pragma pack(push, 1)
typedef struct {
    uint8_t type;
    uint32_t value;  /* no padding — packed to 5 bytes total */
} packed_msg_t;
#pragma pack(pop)

/* Platform-independent packing (GCC/Clang) */
typedef struct __attribute__((packed)) {
    uint8_t type;
    uint32_t value;
} packed_msg_t;
```

---

## 10. Macro Anti-Patterns

```c
/* ✗ Don't use macros for constants when enums or const work */
#define MAX_SIZE 100           /* ✗ no type safety */
enum { MAX_SIZE = 100 };      /* ✓ type-safe, visible in debugger */

/* ✗ Don't use function-like macros when inline functions work */
#define SQUARE(x) ((x)*(x))   /* ✗ double evaluation risk */
static inline int square(int x) { return x * x; }  /* ✓ safe */

/* ✗ Don't use macros to circumvent the type system */
#define ADD(a, b) ((a) + (b)) /* works for any type, but no type checking */

/* ✗ Don't nest macros deeply — makes debugging impossible */
/* ✗ Don't use macros that depend on local variable names */
#define RETURN_IF_NULL(ptr) if ((ptr) == NULL) return -1  /* ✗ fragile */
```
