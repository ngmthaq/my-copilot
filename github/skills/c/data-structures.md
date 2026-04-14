---
name: c-data-structures
description: "C data structures — arrays, strings, structs, unions, enums, bitfields, linked lists, stacks, queues, hash tables, and opaque types. Use when: working with arrays, strings, structs, unions, enums; implementing linked lists, stacks, queues, hash tables; designing opaque data types. DO NOT USE FOR: pointer fundamentals (use c-pointers-memory); file operations (use c-file-io)."
---

# C Data Structures

## 1. Arrays

```c
/* Stack-allocated arrays */
int nums[5] = {1, 2, 3, 4, 5};
int zeros[100] = {0};                 /* all elements zero */
int partial[5] = {1, 2};             /* remaining elements are 0 */
char greeting[] = "hello";            /* size inferred: 6 (including '\0') */

/* Array size macro — ONLY works on stack arrays, not pointers */
#define ARRAY_SIZE(arr) (sizeof(arr) / sizeof((arr)[0]))

size_t count = ARRAY_SIZE(nums);  /* 5 */

/* Variable-length arrays (C99, optional in C11) — avoid in production */
void func(size_t n)
{
    int vla[n];  /* stack-allocated, risky for large n */
}

/* Prefer dynamic allocation for variable sizes */
int *arr = calloc(n, sizeof(*arr));
```

---

## 2. Strings

```c
/* C strings are null-terminated char arrays */
char name[] = "Alice";          /* stack array, mutable, size 6 */
const char *greeting = "Hello"; /* pointer to string literal, immutable */

/* String operations (string.h) */
#include <string.h>

size_t len = strlen(name);                         /* 5 (excludes '\0') */
strcmp(a, b);                                       /* 0 if equal, <0 or >0 otherwise */
strncmp(a, b, n);                                   /* compare at most n chars */

/* Safe copy — always use size-bounded variants */
char dest[32];
strncpy(dest, src, sizeof(dest) - 1);
dest[sizeof(dest) - 1] = '\0';                     /* ensure null-termination */

/* BETTER — snprintf for safe formatting/copying */
snprintf(dest, sizeof(dest), "%s", src);

/* Concatenation */
char buf[64] = "";
strncat(buf, "hello ", sizeof(buf) - strlen(buf) - 1);
strncat(buf, "world", sizeof(buf) - strlen(buf) - 1);

/* String search */
char *pos = strstr(haystack, "needle");             /* find substring */
char *chr = strchr(name, 'l');                      /* find character */
char *rchr = strrchr(name, 'l');                    /* find last occurrence */

/* Tokenization */
char input[] = "one,two,three";
char *token = strtok(input, ",");
while (token != NULL) {
    printf("%s\n", token);
    token = strtok(NULL, ",");
}
/* WARNING: strtok modifies the input string and uses global state */
```

### String Anti-Patterns

```c
/* ✗ NEVER use gets() — removed in C11, no bounds checking */
gets(buffer);

/* ✗ NEVER use strcpy/strcat without size checking */
strcpy(dest, untrusted_input);

/* ✓ Use fgets for input */
fgets(buffer, sizeof(buffer), stdin);

/* ✓ Use snprintf for formatting */
snprintf(dest, sizeof(dest), "%s", src);
```

---

## 3. Structs

```c
/* Definition */
typedef struct {
    int id;
    char name[64];
    double balance;
} account_t;

/* Initialization */
account_t acc = {.id = 1, .name = "Alice", .balance = 100.0};  /* designated init (C99) */
account_t empty = {0};  /* zero-initialize all fields */

/* Access */
acc.balance += 50.0;
printf("Name: %s\n", acc.name);

/* Pointer access */
account_t *p = &acc;
p->balance -= 25.0;   /* same as (*p).balance */

/* Nested structs */
typedef struct {
    char street[128];
    char city[64];
    char zip[16];
} address_t;

typedef struct {
    char name[64];
    address_t address;
} person_t;

person_t p = {
    .name = "Bob",
    .address = {.street = "123 Main St", .city = "NYC", .zip = "10001"}
};
```

### Struct Memory Layout

```c
/* Structs may have padding for alignment */
typedef struct {
    char a;      /* 1 byte + 3 padding */
    int b;       /* 4 bytes */
    char c;      /* 1 byte + 3 padding */
} padded_t;      /* total: 12 bytes (not 6) */

/* Reorder fields to minimize padding */
typedef struct {
    int b;       /* 4 bytes */
    char a;      /* 1 byte */
    char c;      /* 1 byte + 2 padding */
} compact_t;     /* total: 8 bytes */

/* Check with sizeof and offsetof */
#include <stddef.h>
printf("Size: %zu\n", sizeof(padded_t));
printf("Offset of b: %zu\n", offsetof(padded_t, b));
```

---

## 4. Unions

```c
/* All members share the same memory — size equals largest member */
typedef union {
    int32_t i;
    float f;
    uint8_t bytes[4];
} value_u;

value_u v;
v.i = 42;
printf("%d bytes\n", (int)sizeof(v));  /* 4 */

/* Tagged union pattern — type-safe variant */
typedef enum {
    VAL_INT,
    VAL_FLOAT,
    VAL_STRING
} value_type_t;

typedef struct {
    value_type_t type;
    union {
        int64_t int_val;
        double float_val;
        char *string_val;
    } data;
} variant_t;

void print_variant(const variant_t *v)
{
    switch (v->type) {
    case VAL_INT:
        printf("%lld\n", (long long)v->data.int_val);
        break;
    case VAL_FLOAT:
        printf("%f\n", v->data.float_val);
        break;
    case VAL_STRING:
        printf("%s\n", v->data.string_val);
        break;
    }
}
```

---

## 5. Enums

```c
/* Basic enum */
typedef enum {
    STATUS_OK = 0,
    STATUS_ERROR = -1,
    STATUS_NOT_FOUND = -2,
    STATUS_TIMEOUT = -3
} status_t;

/* Flag enum — use powers of 2 for bitwise operations */
typedef enum {
    PERM_NONE    = 0,
    PERM_READ    = 1 << 0,  /* 1 */
    PERM_WRITE   = 1 << 1,  /* 2 */
    PERM_EXECUTE = 1 << 2,  /* 4 */
    PERM_ALL     = PERM_READ | PERM_WRITE | PERM_EXECUTE
} permission_t;

permission_t perms = PERM_READ | PERM_WRITE;
if (perms & PERM_READ) { /* ... */ }

/* Enum to string pattern */
const char *status_to_string(status_t status)
{
    switch (status) {
    case STATUS_OK:        return "OK";
    case STATUS_ERROR:     return "ERROR";
    case STATUS_NOT_FOUND: return "NOT_FOUND";
    case STATUS_TIMEOUT:   return "TIMEOUT";
    default:               return "UNKNOWN";
    }
}
```

---

## 6. Bitfields

```c
typedef struct {
    uint32_t is_active  : 1;  /* 1 bit */
    uint32_t priority   : 3;  /* 3 bits (0-7) */
    uint32_t type       : 4;  /* 4 bits (0-15) */
    uint32_t reserved   : 24; /* remaining bits */
} flags_t;

flags_t f = {.is_active = 1, .priority = 5, .type = 3};

/* WARNING: bit field layout is implementation-defined — avoid in
   cross-platform or serialized data structures */
```

---

## 7. Linked List

```c
/* Node definition */
typedef struct node {
    int data;
    struct node *next;  /* self-referential — must use struct tag */
} node_t;

/* Create a node */
node_t *node_create(int data)
{
    node_t *node = malloc(sizeof(*node));
    if (node == NULL) {
        return NULL;
    }
    node->data = data;
    node->next = NULL;
    return node;
}

/* Prepend to list */
node_t *list_prepend(node_t *head, int data)
{
    node_t *node = node_create(data);
    if (node == NULL) {
        return head;
    }
    node->next = head;
    return node;
}

/* Free entire list */
void list_destroy(node_t *head)
{
    while (head != NULL) {
        node_t *tmp = head;
        head = head->next;
        free(tmp);
    }
}

/* Iterate */
void list_print(const node_t *head)
{
    for (const node_t *cur = head; cur != NULL; cur = cur->next) {
        printf("%d -> ", cur->data);
    }
    printf("NULL\n");
}
```

---

## 8. Opaque Type Pattern (Information Hiding)

```c
/* In header (public API): forward declaration only */
/* my_module.h */
typedef struct my_object my_object_t;

my_object_t *my_object_create(void);
void my_object_destroy(my_object_t *obj);
int my_object_get_value(const my_object_t *obj);

/* In source (private implementation): full definition */
/* my_module.c */
struct my_object {
    int value;
    char internal_buffer[256];
};

my_object_t *my_object_create(void)
{
    my_object_t *obj = calloc(1, sizeof(*obj));
    return obj;
}

void my_object_destroy(my_object_t *obj)
{
    free(obj);
}

int my_object_get_value(const my_object_t *obj)
{
    if (obj == NULL) {
        return -1;
    }
    return obj->value;
}
```
