---
name: c-functions
description: "C functions — function declarations and definitions, function pointers, callbacks, variadic functions, inline functions, static functions, recursion, and parameter passing conventions. Use when: writing functions; function pointers; callbacks; variadic functions; inline functions; static functions. DO NOT USE FOR: preprocessor macros (use c-preprocessor); memory management (use c-pointers-memory); OOP patterns with structs (use c-data-structures)."
---

# C Functions

## 1. Function Declarations and Definitions

### Declaration (Prototype)

```c
/* In header file — declares the function signature */
int calculate_sum(int a, int b);
void process_data(const char *input, size_t length);
char *create_greeting(const char *name);  /* caller must free */
```

### Definition

```c
/* In source file — provides the implementation */
int calculate_sum(int a, int b)
{
    return a + b;
}
```

### Forward Declaration

```c
/* Declare before use when functions reference each other */
static void func_b(int x);

static void func_a(int x)
{
    if (x > 0) {
        func_b(x - 1);
    }
}

static void func_b(int x)
{
    if (x > 0) {
        func_a(x - 1);
    }
}
```

---

## 2. Parameter Passing

### Pass by Value

```c
/* C always passes by value — the function gets a copy */
void double_value(int x)
{
    x *= 2;  /* modifies local copy only */
}

int n = 5;
double_value(n);  /* n is still 5 */
```

### Pass by Pointer (Simulated Pass by Reference)

```c
/* Pass a pointer to modify the original */
void double_value(int *x)
{
    if (x == NULL) {
        return;
    }
    *x *= 2;  /* modifies the original */
}

int n = 5;
double_value(&n);  /* n is now 10 */
```

### Output Parameters

```c
/* Use pointers for multiple return values */
bool divide(int a, int b, int *quotient, int *remainder)
{
    if (b == 0) {
        return false;
    }
    *quotient = a / b;
    *remainder = a % b;
    return true;
}

int q, r;
if (divide(17, 5, &q, &r)) {
    printf("%d / %d = %d remainder %d\n", 17, 5, q, r);
}
```

### const Parameters

```c
/* Use const for input-only parameters — documents intent and prevents accidental modification */
size_t string_count_char(const char *str, char target)
{
    size_t count = 0;
    for (const char *p = str; *p != '\0'; p++) {
        if (*p == target) {
            count++;
        }
    }
    return count;
}
```

---

## 3. Function Pointers

### Basic Syntax

```c
/* Declaration: return_type (*name)(parameter_types) */
int (*operation)(int, int);

/* Assignment */
int add(int a, int b) { return a + b; }
int sub(int a, int b) { return a - b; }

operation = add;
int result = operation(3, 4);  /* 7 */

operation = sub;
result = operation(3, 4);      /* -1 */
```

### Typedef for Readability

```c
typedef int (*math_op_fn)(int, int);

math_op_fn get_operation(char op)
{
    switch (op) {
    case '+': return add;
    case '-': return sub;
    case '*': return mul;
    default:  return NULL;
    }
}

math_op_fn fn = get_operation('+');
if (fn != NULL) {
    int result = fn(10, 5);
}
```

### Arrays of Function Pointers (Dispatch Table)

```c
typedef void (*command_handler_fn)(const char *args);

typedef struct {
    const char *name;
    command_handler_fn handler;
} command_entry_t;

static void cmd_help(const char *args) { /* ... */ }
static void cmd_quit(const char *args) { /* ... */ }
static void cmd_list(const char *args) { /* ... */ }

static const command_entry_t commands[] = {
    {"help", cmd_help},
    {"quit", cmd_quit},
    {"list", cmd_list},
};

void dispatch_command(const char *name, const char *args)
{
    for (size_t i = 0; i < ARRAY_SIZE(commands); i++) {
        if (strcmp(commands[i].name, name) == 0) {
            commands[i].handler(args);
            return;
        }
    }
    fprintf(stderr, "Unknown command: %s\n", name);
}
```

---

## 4. Callback Pattern

```c
/* Generic callback with user data (context) */
typedef void (*event_callback_fn)(int event_type, void *user_data);

typedef struct {
    event_callback_fn callback;
    void *user_data;
} event_listener_t;

void register_listener(event_listener_t *listener,
                        event_callback_fn callback,
                        void *user_data)
{
    listener->callback = callback;
    listener->user_data = user_data;
}

void fire_event(const event_listener_t *listener, int event_type)
{
    if (listener->callback != NULL) {
        listener->callback(event_type, listener->user_data);
    }
}

/* Usage */
void on_click(int event_type, void *user_data)
{
    const char *button_name = (const char *)user_data;
    printf("Button '%s' clicked (event %d)\n", button_name, event_type);
}

event_listener_t listener;
register_listener(&listener, on_click, "Submit");
fire_event(&listener, 1);
```

---

## 5. Variadic Functions

```c
#include <stdarg.h>

/* Sum a variable number of integers, terminated by -1 */
int sum_values(int first, ...)
{
    va_list args;
    int total = first;
    int value;

    va_start(args, first);
    while ((value = va_arg(args, int)) != -1) {
        total += value;
    }
    va_end(args);

    return total;
}

int result = sum_values(1, 2, 3, 4, -1);  /* 10 */

/* Safer: pass the count explicitly */
int sum_n(size_t count, ...)
{
    va_list args;
    int total = 0;

    va_start(args, count);
    for (size_t i = 0; i < count; i++) {
        total += va_arg(args, int);
    }
    va_end(args);

    return total;
}

int result = sum_n(4, 1, 2, 3, 4);  /* 10 */
```

### Custom printf-like Function

```c
__attribute__((format(printf, 1, 2)))
void log_message(const char *fmt, ...)
{
    va_list args;
    va_start(args, fmt);
    fprintf(stderr, "[LOG] ");
    vfprintf(stderr, fmt, args);
    fprintf(stderr, "\n");
    va_end(args);
}

log_message("User %s logged in from %s", username, ip_address);
```

---

## 6. Inline Functions

```c
/* Hint to compiler — inline the function body at call sites */
static inline int max(int a, int b)
{
    return (a > b) ? a : b;
}

static inline int min(int a, int b)
{
    return (a < b) ? a : b;
}

/* Use for small, frequently called functions */
/* Prefer inline functions over function-like macros — type-safe */
```

---

## 7. Static Functions

```c
/* static limits visibility to the current translation unit (.c file) */
/* Use for internal/helper functions not exposed in headers */

/* In module.c */
static bool validate_input(const char *input)
{
    return input != NULL && input[0] != '\0';
}

/* Public function that uses the static helper */
int process_input(const char *input)
{
    if (!validate_input(input)) {
        return -1;
    }
    /* ... */
    return 0;
}
```

---

## 8. Recursion

```c
/* Always have a base case and ensure progress toward it */
uint64_t factorial(unsigned int n)
{
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

/* Prefer iteration for deep recursion — C has no tail-call optimization guarantee */
uint64_t factorial_iter(unsigned int n)
{
    uint64_t result = 1;
    for (unsigned int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

/* If recursion is necessary, consider an explicit stack */
```
