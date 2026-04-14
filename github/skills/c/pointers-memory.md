---
name: c-pointers-memory
description: "C pointers and memory management — pointer fundamentals, pointer arithmetic, dynamic allocation (malloc/calloc/realloc/free), memory leaks, dangling pointers, double free, arrays and pointers, void pointers, memory safety patterns. Use when: working with pointers; dynamic memory allocation; debugging memory leaks or segfaults; pointer arithmetic; memory safety. DO NOT USE FOR: data structures implementation (use c-data-structures); file I/O (use c-file-io)."
---

# C Pointers & Memory Management

## 1. Pointer Fundamentals

### Declaration and Initialization

```c
int x = 42;
int *p = &x;       /* p points to x */
int value = *p;     /* dereference — value is 42 */

/* Always initialize pointers */
int *ptr = NULL;    /* ✓ NULL if not pointing to anything yet */
int *bad;           /* ✗ Uninitialized — undefined behavior if used */

/* Multiple pointer declarations — ★ on each variable */
int *a, *b;         /* ✓ both are pointers */
int* a, b;          /* ✗ MISLEADING — only a is a pointer, b is int */
```

### Pointer and const

```c
const int *p1 = &x;         /* pointer to const int — can't modify *p1 */
int *const p2 = &x;         /* const pointer to int — can't reassign p2 */
const int *const p3 = &x;   /* const pointer to const int — neither */

/* Read right-to-left:
   const int *p    → p is a pointer to int that is const
   int *const p    → p is a const pointer to int
*/
```

### NULL Pointer Safety

```c
/* Always check before dereferencing */
if (ptr != NULL) {
    process(*ptr);
}

/* Guard clause pattern */
int get_value(const int *ptr)
{
    if (ptr == NULL) {
        return -1;  /* or handle error */
    }
    return *ptr;
}

/* After free, set to NULL */
free(ptr);
ptr = NULL;
```

---

## 2. Pointer Arithmetic

```c
int arr[5] = {10, 20, 30, 40, 50};
int *p = arr;       /* p points to arr[0] */

p + 1               /* address of arr[1] (moves by sizeof(int) bytes) */
*(p + 2)            /* value of arr[2] → 30 */
p[3]                /* same as *(p + 3) → 40 */

/* Pointer difference */
int *start = &arr[0];
int *end = &arr[4];
ptrdiff_t count = end - start;  /* 4 (number of elements, not bytes) */

/* Iteration */
for (int *it = arr; it < arr + 5; it++) {
    printf("%d ", *it);
}

/* WARNING: pointer arithmetic beyond array bounds is UB */
int *bad = arr + 6;  /* UNDEFINED BEHAVIOR */
```

---

## 3. Dynamic Memory Allocation

### malloc

```c
#include <stdlib.h>

/* Allocate uninitialized memory */
int *nums = malloc(10 * sizeof(int));
if (nums == NULL) {
    perror("malloc failed");
    return -1;
}

/* PREFERRED: use sizeof on the variable, not the type */
int *nums = malloc(10 * sizeof(*nums));  /* ✓ resilient to type changes */
int *nums = malloc(10 * sizeof(int));    /* ✗ must update if type changes */
```

### calloc

```c
/* Allocate zero-initialized memory */
int *nums = calloc(10, sizeof(*nums));  /* 10 ints, all zeroed */
if (nums == NULL) {
    perror("calloc failed");
    return -1;
}
```

### realloc

```c
/* Resize an allocation */
int *tmp = realloc(nums, 20 * sizeof(*nums));
if (tmp == NULL) {
    /* realloc failed — original nums is still valid */
    perror("realloc failed");
    free(nums);
    return -1;
}
nums = tmp;

/* NEVER do this — leaks on failure */
nums = realloc(nums, 20 * sizeof(*nums));  /* ✗ if NULL, old memory is leaked */
```

### free

```c
free(nums);
nums = NULL;  /* Always nullify after free */

/* free(NULL) is safe — it does nothing */
free(NULL);   /* ✓ no-op */
```

---

## 4. Common Memory Bugs

### Memory Leak

```c
/* BAD — allocated memory never freed */
void leaky_function(void)
{
    char *buffer = malloc(1024);
    if (some_condition) {
        return;  /* ✗ buffer leaked on early return */
    }
    /* ... */
    free(buffer);
}

/* GOOD — single exit point or goto cleanup */
void safe_function(void)
{
    char *buffer = malloc(1024);
    if (buffer == NULL) {
        return;
    }
    if (some_condition) {
        goto cleanup;
    }
    /* ... */

cleanup:
    free(buffer);
}
```

### Dangling Pointer

```c
/* BAD — using pointer after free */
int *p = malloc(sizeof(int));
*p = 42;
free(p);
printf("%d\n", *p);  /* ✗ UNDEFINED BEHAVIOR — dangling pointer */

/* GOOD — nullify after free */
free(p);
p = NULL;
/* any dereference of NULL will crash predictably (not silently corrupt) */
```

### Double Free

```c
/* BAD — freeing the same pointer twice */
free(p);
free(p);  /* ✗ UNDEFINED BEHAVIOR */

/* GOOD — nullify after free, free(NULL) is safe */
free(p);
p = NULL;
free(p);  /* ✓ safe no-op */
```

### Buffer Overflow

```c
/* BAD — writing past buffer bounds */
char buf[10];
strcpy(buf, "this string is too long");  /* ✗ overflow */

/* GOOD — use size-bounded functions */
char buf[10];
strncpy(buf, source, sizeof(buf) - 1);
buf[sizeof(buf) - 1] = '\0';  /* ensure null-termination */

/* BETTER — use snprintf */
snprintf(buf, sizeof(buf), "%s", source);
```

---

## 5. Arrays and Pointers

```c
int arr[5] = {1, 2, 3, 4, 5};

/* Arrays decay to pointers in most expressions */
int *p = arr;          /* arr decays to &arr[0] */
sizeof(arr)            /* 20 (5 * 4) — array knows its size */
sizeof(p)              /* 8 — pointer size, NOT array size */

/* Function parameters — arrays always decay to pointers */
void process(int arr[], size_t size);    /* arr is actually int * */
void process(int *arr, size_t size);     /* identical to above */

/* ALWAYS pass array size as a separate parameter */
void print_array(const int *arr, size_t size)
{
    for (size_t i = 0; i < size; i++) {
        printf("%d ", arr[i]);
    }
}
```

### Multi-dimensional Arrays

```c
int matrix[3][4];                /* contiguous 3x4 array */
int (*row_ptr)[4] = matrix;     /* pointer to array of 4 ints */

/* Dynamic 2D array — contiguous allocation (preferred) */
int *flat = malloc(rows * cols * sizeof(*flat));
#define MAT(r, c) flat[(r) * cols + (c)]
MAT(1, 2) = 42;
free(flat);

/* Dynamic 2D array — array of pointers (flexible but fragmented) */
int **mat = malloc(rows * sizeof(*mat));
for (size_t i = 0; i < rows; i++) {
    mat[i] = malloc(cols * sizeof(**mat));
}
/* Free in reverse order */
for (size_t i = 0; i < rows; i++) {
    free(mat[i]);
}
free(mat);
```

---

## 6. void Pointers

```c
/* void * — generic pointer, can point to any type */
void *generic = malloc(100);

/* Must cast before dereferencing */
int *ip = (int *)generic;
char *cp = (char *)generic;

/* Common use: generic function parameters */
void sort(void *base, size_t count, size_t size,
          int (*compare)(const void *, const void *));

/* Comparison function example */
int compare_ints(const void *a, const void *b)
{
    int ia = *(const int *)a;
    int ib = *(const int *)b;
    return (ia > ib) - (ia < ib);  /* safe subtraction-free comparison */
}

qsort(arr, count, sizeof(int), compare_ints);
```

---

## 7. Memory Safety Patterns

### Ownership Convention

```c
/**
 * @brief Create a new user. Caller owns the returned pointer.
 * @return Pointer to user, or NULL on failure. Must be freed with user_destroy().
 */
user_t *user_create(const char *name);

/**
 * @brief Destroy a user and free all resources.
 * @param user Pointer to user (NULL is safe).
 */
void user_destroy(user_t *user);
```

### Defensive Allocation Wrapper

```c
void *safe_malloc(size_t size)
{
    void *ptr = malloc(size);
    if (ptr == NULL) {
        fprintf(stderr, "Fatal: malloc(%zu) failed\n", size);
        abort();
    }
    return ptr;
}
```

### Resource Cleanup with goto

```c
int process_file(const char *path)
{
    int result = -1;
    FILE *fp = NULL;
    char *buffer = NULL;

    fp = fopen(path, "r");
    if (fp == NULL) {
        goto cleanup;
    }

    buffer = malloc(BUFFER_SIZE);
    if (buffer == NULL) {
        goto cleanup;
    }

    /* ... process ... */
    result = 0;

cleanup:
    free(buffer);
    if (fp != NULL) {
        fclose(fp);
    }
    return result;
}
```

---

## 8. Tools for Memory Debugging

| Tool             | Purpose                                            | Usage                              |
| ---------------- | -------------------------------------------------- | ---------------------------------- |
| Valgrind         | Detect leaks, invalid reads/writes, use-after-free | `valgrind --leak-check=full ./app` |
| AddressSanitizer | Compile-time instrumentation for memory errors     | `-fsanitize=address`               |
| LeakSanitizer    | Detect memory leaks at exit                        | `-fsanitize=leak`                  |
| MemorySanitizer  | Detect uninitialized memory reads                  | `-fsanitize=memory`                |

```bash
# Compile with AddressSanitizer
gcc -g -fsanitize=address -fno-omit-frame-pointer -o app main.c

# Run with Valgrind
valgrind --leak-check=full --show-leak-kinds=all ./app
```
