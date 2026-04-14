---
name: c-core-fundamentals
description: "C core fundamentals — data types, variables, operators, control flow, scope, storage classes, type qualifiers, integer promotion, and undefined behavior. Use when: explaining C type system; debugging variable scope; understanding integer promotion and overflow; working with operators and control flow. DO NOT USE FOR: pointers and memory (use c-pointers-memory); data structures (use c-data-structures); functions in depth (use c-functions)."
---

# C Core Fundamentals

## 1. Data Types

### Basic Types

```c
#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

/* Integer types — size is platform-dependent */
char c = 'A';            /* at least 8 bits, may be signed or unsigned */
short s = 32000;          /* at least 16 bits */
int i = 42;               /* at least 16 bits, typically 32 */
long l = 100000L;         /* at least 32 bits */
long long ll = 100000LL;  /* at least 64 bits (C99) */

/* Unsigned variants */
unsigned char uc = 255;
unsigned int ui = 42u;
unsigned long ul = 100000UL;

/* Fixed-width integers (stdint.h, C99) — PREFERRED */
int8_t   i8  = -128;
uint8_t  u8  = 255;
int16_t  i16 = -32768;
uint16_t u16 = 65535;
int32_t  i32 = -2147483648;
uint32_t u32 = 4294967295U;
int64_t  i64 = -9223372036854775807LL;
uint64_t u64 = 18446744073709551615ULL;

/* Floating point */
float f = 3.14f;          /* single precision (typically 32-bit IEEE 754) */
double d = 3.14159265;    /* double precision (typically 64-bit IEEE 754) */
long double ld = 3.14L;   /* extended precision */

/* Boolean (stdbool.h, C99) */
bool is_active = true;
bool is_done = false;

/* Size type */
size_t length = 100;      /* unsigned, for sizes and indices */
ptrdiff_t diff;            /* signed, for pointer differences */
```

### Type Sizes

```c
#include <limits.h>
#include <float.h>

/* Check sizes at compile time or runtime */
printf("char:      %zu bytes\n", sizeof(char));       /* always 1 */
printf("short:     %zu bytes\n", sizeof(short));      /* >= 2 */
printf("int:       %zu bytes\n", sizeof(int));        /* >= 2, typically 4 */
printf("long:      %zu bytes\n", sizeof(long));       /* >= 4 */
printf("long long: %zu bytes\n", sizeof(long long));  /* >= 8 */
printf("float:     %zu bytes\n", sizeof(float));      /* typically 4 */
printf("double:    %zu bytes\n", sizeof(double));     /* typically 8 */
printf("pointer:   %zu bytes\n", sizeof(void *));     /* 4 or 8 */

/* Limits */
printf("INT_MIN:  %d\n", INT_MIN);
printf("INT_MAX:  %d\n", INT_MAX);
printf("UINT_MAX: %u\n", UINT_MAX);
```

---

## 2. Variables and Storage Classes

### Variable Declaration

```c
/* Always initialize at declaration */
int count = 0;
char *name = NULL;
double values[10] = {0};

/* Multiple declarations — one per line */
int width = 0;
int height = 0;

/* BAD — multiple on one line */
int x, y, z;  /* Avoid this */
```

### Storage Classes

```c
/* auto — default for local variables (rarely written explicitly) */
auto int x = 10;  /* same as: int x = 10; */

/* static — persists across function calls / limits scope to file */
void counter(void)
{
    static int count = 0;  /* initialized once, persists */
    count++;
    printf("Called %d times\n", count);
}

static int module_state = 0;  /* file-scoped — not visible outside this .c file */

static void helper(void)      /* file-scoped function */
{
    /* only callable within this translation unit */
}

/* extern — declaration, defined elsewhere */
extern int g_config_value;     /* declared here, defined in another .c file */
extern void init_system(void); /* function declared in another module */

/* register — hint to compiler (largely ignored by modern compilers) */
register int i;  /* avoid — compiler optimizes better without hints */
```

### Type Qualifiers

```c
/* const — value cannot be modified after initialization */
const int max_size = 100;
const char *message = "hello";       /* pointer to const char */
char *const fixed_ptr = buffer;      /* const pointer to char */
const char *const immutable = "hi";  /* const pointer to const char */

/* volatile — may change outside program control */
volatile int hardware_register;      /* memory-mapped I/O */
volatile sig_atomic_t signal_flag;   /* signal handler flag */

/* restrict — pointer is the only way to access the object (C99) */
void copy(char *restrict dest, const char *restrict src, size_t n);
```

---

## 3. Operators

### Arithmetic

```c
int a = 10, b = 3;

a + b    /* 13 — addition */
a - b    /* 7  — subtraction */
a * b    /* 30 — multiplication */
a / b    /* 3  — integer division (truncates) */
a % b    /* 1  — modulo (remainder) */
```

### Relational and Logical

```c
a == b   /* equality */
a != b   /* inequality */
a < b    /* less than */
a > b    /* greater than */
a <= b   /* less than or equal */
a >= b   /* greater than or equal */

!flag        /* logical NOT */
a && b       /* logical AND (short-circuit) */
a || b       /* logical OR (short-circuit) */
```

### Bitwise

```c
a & b    /* AND */
a | b    /* OR */
a ^ b    /* XOR */
~a       /* NOT (complement) */
a << 2   /* left shift */
a >> 2   /* right shift */

/* Common bit manipulation patterns */
flags |= FLAG_ENABLED;     /* set a flag */
flags &= ~FLAG_ENABLED;    /* clear a flag */
flags ^= FLAG_ENABLED;     /* toggle a flag */
if (flags & FLAG_ENABLED)  /* test a flag */
```

### Ternary and Comma

```c
int max = (a > b) ? a : b;

/* Comma operator — evaluates both, returns right */
for (int i = 0, j = 10; i < j; i++, j--) { ... }
```

---

## 4. Control Flow

### Conditional Statements

```c
/* if / else if / else */
if (status == STATUS_OK) {
    process_result();
} else if (status == STATUS_RETRY) {
    retry_operation();
} else {
    handle_error(status);
}

/* switch — always use break, always have default */
switch (command) {
case CMD_START:
    start_engine();
    break;
case CMD_STOP:
    stop_engine();
    break;
case CMD_PAUSE:
    /* FALLTHROUGH */  /* explicit comment for intentional fallthrough */
case CMD_IDLE:
    set_idle();
    break;
default:
    log_error("Unknown command: %d", command);
    break;
}
```

### Loops

```c
/* for loop */
for (size_t i = 0; i < count; i++) {
    process(items[i]);
}

/* while loop */
while (is_running) {
    event_t event = poll_event();
    handle_event(&event);
}

/* do-while loop — guarantees at least one iteration */
do {
    result = read_input(buffer, sizeof(buffer));
} while (result == EAGAIN);

/* Loop control */
for (size_t i = 0; i < count; i++) {
    if (items[i] == NULL) {
        continue;  /* skip this iteration */
    }
    if (items[i]->type == TYPE_END) {
        break;     /* exit loop */
    }
    process(items[i]);
}
```

---

## 5. Integer Promotion and Implicit Conversions

### Integer Promotion Rules

```c
/* Types smaller than int are promoted to int in expressions */
char a = 100;
char b = 100;
int result = a + b;  /* a and b promoted to int before addition */

/* Unsigned/signed mixing — DANGEROUS */
unsigned int u = 1;
int s = -1;
if (s < u) {
    /* This is FALSE — s is converted to unsigned, becoming a large number */
    printf("This will NOT print!\n");
}

/* Safe comparison pattern */
if (s < 0 || (unsigned int)s < u) {
    printf("This is correct\n");
}
```

### Common Pitfalls

```c
/* Overflow — undefined behavior for signed integers */
int x = INT_MAX;
x + 1;  /* UNDEFINED BEHAVIOR */

/* Unsigned wraparound — defined behavior but surprising */
unsigned int y = 0;
y - 1;  /* wraps to UINT_MAX (4294967295 on 32-bit) */

/* Division by zero — undefined behavior */
int result = a / 0;  /* UNDEFINED BEHAVIOR */

/* Implicit truncation */
int big = 100000;
short small = big;  /* silent truncation if big > SHORT_MAX */
```

---

## 6. Scope Rules

```c
int global_var = 0;  /* file scope — visible everywhere in this file */

static int file_var = 0;  /* file scope — visible only in this file */

void function(int param)   /* param has function scope */
{
    int local = 10;        /* block scope — visible in this function */

    {
        int inner = 20;    /* block scope — visible only in this block */
        local = inner;     /* outer variables accessible */
    }
    /* inner is not accessible here */

    for (int i = 0; i < 10; i++) {
        /* i is scoped to this for loop (C99) */
    }
    /* i is not accessible here */
}
```

---

## 7. Undefined Behavior (UB) — Know and Avoid

| Category            | Example                          | What to do instead                     |
| ------------------- | -------------------------------- | -------------------------------------- |
| Signed overflow     | `INT_MAX + 1`                    | Check before operation                 |
| Null dereference    | `*NULL`                          | Always check pointers before use       |
| Array out of bounds | `arr[size]`                      | Validate index < size                  |
| Uninitialized read  | Using `int x;` without assigning | Initialize all variables               |
| Double free         | `free(p); free(p);`              | Set pointer to NULL after free         |
| Use after free      | Accessing freed memory           | Nullify pointer, restructure ownership |
| Division by zero    | `x / 0`                          | Check divisor != 0                     |
| Format mismatch     | `printf("%d", a_long)`           | Match format specifiers to types       |
| Shift overflow      | `1 << 33` (on 32-bit int)        | Ensure shift < type width              |
