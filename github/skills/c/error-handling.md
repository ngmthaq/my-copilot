---
name: c-error-handling
description: "C error handling — return code patterns, errno, perror, strerror, goto cleanup, custom error types, setjmp/longjmp, assert, defensive programming, and error propagation. Use when: implementing error handling patterns; return codes; errno; perror; custom error types; cleanup with goto; setjmp/longjmp. DO NOT USE FOR: file I/O specifics (use c-file-io); memory debugging tools (use c-pointers-memory)."
---

# C Error Handling

## 1. Return Code Convention

```c
/* Convention: 0 = success, negative = error code */
#define SUCCESS          0
#define ERR_NULL_PTR    -1
#define ERR_OUT_OF_MEM  -2
#define ERR_INVALID_ARG -3
#define ERR_IO          -4

int process_data(const char *input, char *output, size_t output_size)
{
    if (input == NULL || output == NULL) {
        return ERR_NULL_PTR;
    }
    if (output_size == 0) {
        return ERR_INVALID_ARG;
    }
    /* ... */
    return SUCCESS;
}

/* Caller checks return value */
int result = process_data(input, output, sizeof(output));
if (result != SUCCESS) {
    fprintf(stderr, "process_data failed: %d\n", result);
    return result;  /* propagate error */
}
```

### Enum-Based Error Codes

```c
typedef enum {
    STATUS_OK = 0,
    STATUS_ERR_NULL = -1,
    STATUS_ERR_NOMEM = -2,
    STATUS_ERR_INVALID = -3,
    STATUS_ERR_IO = -4,
    STATUS_ERR_TIMEOUT = -5,
    STATUS_ERR_OVERFLOW = -6
} status_t;

const char *status_to_string(status_t status)
{
    switch (status) {
    case STATUS_OK:           return "Success";
    case STATUS_ERR_NULL:     return "Null pointer";
    case STATUS_ERR_NOMEM:    return "Out of memory";
    case STATUS_ERR_INVALID:  return "Invalid argument";
    case STATUS_ERR_IO:       return "I/O error";
    case STATUS_ERR_TIMEOUT:  return "Timeout";
    case STATUS_ERR_OVERFLOW: return "Overflow";
    default:                  return "Unknown error";
    }
}
```

---

## 2. errno

```c
#include <errno.h>
#include <string.h>

/* errno is set by many standard library functions on failure */
FILE *fp = fopen("missing.txt", "r");
if (fp == NULL) {
    /* errno is set to ENOENT (No such file or directory) */
    int saved_errno = errno;  /* save immediately — next call may overwrite */

    /* perror — prints description to stderr */
    perror("fopen");
    /* Output: fopen: No such file or directory */

    /* strerror — returns error string */
    fprintf(stderr, "Error: %s (errno=%d)\n", strerror(saved_errno), saved_errno);

    return -1;
}

/* Common errno values */
/* ENOENT  — No such file or directory */
/* EACCES  — Permission denied */
/* ENOMEM  — Out of memory */
/* EINVAL  — Invalid argument */
/* EEXIST  — File exists */
/* EAGAIN  — Resource temporarily unavailable */
/* EINTR   — Interrupted system call */
/* ERANGE  — Result too large */
```

### errno Best Practices

```c
/* ✓ Set errno to 0 before the call if you need to distinguish error from valid return */
errno = 0;
long val = strtol(str, &endptr, 10);
if (errno == ERANGE) {
    fprintf(stderr, "Value out of range\n");
}

/* ✓ Save errno immediately after the failing call */
if (write(fd, buf, len) < 0) {
    int saved = errno;
    log_error("write failed");  /* log_error might change errno */
    errno = saved;
    return -1;
}

/* ✗ Don't check errno without checking the return value first */
/* errno may be non-zero even on success */
```

---

## 3. goto Cleanup Pattern

```c
/* The idiomatic C pattern for resource cleanup */
int initialize_system(const char *config_path)
{
    int result = -1;
    FILE *fp = NULL;
    char *buffer = NULL;
    database_t *db = NULL;

    fp = fopen(config_path, "r");
    if (fp == NULL) {
        perror("fopen");
        goto cleanup;
    }

    buffer = malloc(BUFFER_SIZE);
    if (buffer == NULL) {
        perror("malloc");
        goto cleanup;
    }

    db = database_open("app.db");
    if (db == NULL) {
        fprintf(stderr, "Failed to open database\n");
        goto cleanup;
    }

    /* All resources acquired — do work */
    if (load_config(fp, buffer, BUFFER_SIZE) != 0) {
        goto cleanup;
    }

    result = 0;  /* success */

cleanup:
    /* Free in reverse order of acquisition */
    if (db != NULL) {
        database_close(db);
    }
    free(buffer);
    if (fp != NULL) {
        fclose(fp);
    }
    return result;
}
```

### Why goto for Cleanup?

```c
/* Without goto — deeply nested, error-prone, duplicated cleanup */
int bad_init(void)
{
    FILE *fp = fopen("data.txt", "r");
    if (fp == NULL) {
        return -1;
    }
    char *buf = malloc(1024);
    if (buf == NULL) {
        fclose(fp);        /* must remember to close fp */
        return -1;
    }
    int *data = malloc(100 * sizeof(int));
    if (data == NULL) {
        free(buf);         /* must close fp AND free buf */
        fclose(fp);
        return -1;
    }
    /* Adding a new resource means updating ALL error paths */
    free(data);
    free(buf);
    fclose(fp);
    return 0;
}
```

---

## 4. Custom Error Context

```c
/* Error struct for detailed error information */
typedef struct {
    int code;
    char message[256];
    const char *file;
    int line;
} error_t;

#define ERROR_INIT {0, "", NULL, 0}

#define SET_ERROR(err, code_val, fmt, ...)                          \
    do {                                                            \
        (err)->code = (code_val);                                   \
        snprintf((err)->message, sizeof((err)->message),            \
                 fmt, ##__VA_ARGS__);                               \
        (err)->file = __FILE__;                                     \
        (err)->line = __LINE__;                                     \
    } while (0)

/* Usage */
int parse_config(const char *path, config_t *config, error_t *err)
{
    FILE *fp = fopen(path, "r");
    if (fp == NULL) {
        SET_ERROR(err, ERR_IO, "Cannot open config file: %s", strerror(errno));
        return -1;
    }
    /* ... */
    return 0;
}

/* Caller */
error_t err = ERROR_INIT;
if (parse_config("app.conf", &config, &err) != 0) {
    fprintf(stderr, "Error %d at %s:%d: %s\n",
            err.code, err.file, err.line, err.message);
}
```

---

## 5. assert

```c
#include <assert.h>

/* Use assert for programmer errors — conditions that should NEVER be false */
void list_insert(list_t *list, size_t index, int value)
{
    assert(list != NULL);            /* programming error if NULL */
    assert(index <= list->size);     /* programming error if out of bounds */
    /* ... */
}

/* assert is DISABLED when compiled with -DNDEBUG */
/* Do NOT use for runtime errors (user input, file ops, network) */
/* DO use for invariants, preconditions, postconditions */

/* ✗ BAD — side effect inside assert (removed in release builds) */
assert(initialize_system() == 0);

/* ✓ GOOD — separate the call from the assertion */
int result = initialize_system();
assert(result == 0);
```

### Static Assert (C11)

```c
#include <assert.h>

/* Compile-time assertion — catches errors at build time */
static_assert(sizeof(int) >= 4, "int must be at least 32 bits");
static_assert(sizeof(void *) == 8, "This code requires 64-bit pointers");

/* Useful for struct size validation */
static_assert(sizeof(packet_header_t) == 16, "Packet header must be 16 bytes");
```

---

## 6. setjmp / longjmp (Non-Local Jumps)

```c
#include <setjmp.h>

/* Use SPARINGLY — similar to exceptions but dangerous if misused */
static jmp_buf error_jump;

void risky_operation(void)
{
    /* ... */
    if (critical_failure) {
        longjmp(error_jump, ERR_CRITICAL);  /* jump back to setjmp */
    }
}

int main(void)
{
    int err = setjmp(error_jump);
    if (err != 0) {
        /* Landed here from longjmp */
        fprintf(stderr, "Critical error: %d\n", err);
        return 1;
    }

    risky_operation();  /* may longjmp back */
    return 0;
}

/* WARNING: longjmp does NOT run cleanup code or free resources
   between the setjmp and longjmp points.
   Prefer goto cleanup or explicit error propagation. */
```

---

## 7. Defensive Programming Patterns

```c
/* Validate all inputs at public API boundaries */
int api_set_name(handle_t *handle, const char *name)
{
    if (handle == NULL) {
        return ERR_NULL_PTR;
    }
    if (name == NULL || name[0] == '\0') {
        return ERR_INVALID_ARG;
    }
    if (strlen(name) >= sizeof(handle->name)) {
        return ERR_OVERFLOW;
    }
    strncpy(handle->name, name, sizeof(handle->name) - 1);
    handle->name[sizeof(handle->name) - 1] = '\0';
    return SUCCESS;
}

/* Internal functions can use assert instead of error codes */
static void internal_process(node_t *node)
{
    assert(node != NULL);  /* caller's responsibility */
    /* ... */
}
```

---

## 8. Error Propagation

```c
/* Propagate errors up the call stack */
status_t read_config(const char *path, config_t *cfg)
{
    status_t status;

    status = validate_path(path);
    if (status != STATUS_OK) {
        return status;  /* propagate */
    }

    status = parse_file(path, cfg);
    if (status != STATUS_OK) {
        return status;  /* propagate */
    }

    status = validate_config(cfg);
    return status;  /* propagate success or failure */
}

/* Macro to reduce boilerplate */
#define TRY(expr)                \
    do {                         \
        status_t _s = (expr);    \
        if (_s != STATUS_OK) {   \
            return _s;           \
        }                        \
    } while (0)

status_t read_config(const char *path, config_t *cfg)
{
    TRY(validate_path(path));
    TRY(parse_file(path, cfg));
    TRY(validate_config(cfg));
    return STATUS_OK;
}
```
