---
name: c-file-io
description: "C file I/O — stdio functions (fopen, fread, fwrite, fprintf, fscanf), binary I/O, buffered vs unbuffered I/O, file positioning (fseek, ftell), temporary files, directory operations, and safe I/O patterns. Use when: reading/writing files; binary I/O; buffered vs unbuffered I/O; stdio functions; file positioning. DO NOT USE FOR: socket I/O (use c-concurrency or network-specific skills); error handling patterns (use c-error-handling)."
---

# C File I/O

## 1. Opening and Closing Files

```c
#include <stdio.h>

/* fopen — returns NULL on failure */
FILE *fp = fopen("data.txt", "r");
if (fp == NULL) {
    perror("fopen");  /* prints: fopen: No such file or directory */
    return -1;
}

/* Always close when done */
fclose(fp);
fp = NULL;
```

### File Modes

| Mode   | Description                     | File must exist? | Creates file? |
| ------ | ------------------------------- | ---------------- | ------------- |
| `"r"`  | Read text                       | Yes              | No            |
| `"w"`  | Write text (truncates)          | No               | Yes           |
| `"a"`  | Append text                     | No               | Yes           |
| `"r+"` | Read and write text             | Yes              | No            |
| `"w+"` | Read and write text (truncates) | No               | Yes           |
| `"a+"` | Read and append text            | No               | Yes           |
| `"rb"` | Read binary                     | Yes              | No            |
| `"wb"` | Write binary (truncates)        | No               | Yes           |
| `"ab"` | Append binary                   | No               | Yes           |

---

## 2. Text I/O

### Reading

```c
/* Read a line — includes newline, null-terminates */
char line[256];
while (fgets(line, sizeof(line), fp) != NULL) {
    /* Remove trailing newline */
    line[strcspn(line, "\n")] = '\0';
    process_line(line);
}

/* Read formatted data */
int id;
char name[64];
double score;
while (fscanf(fp, "%d %63s %lf", &id, name, &score) == 3) {
    process_record(id, name, score);
}

/* Read single character */
int ch;
while ((ch = fgetc(fp)) != EOF) {
    putchar(ch);
}

/* NEVER use gets() — no bounds checking, removed in C11 */
```

### Writing

```c
/* Write formatted text */
fprintf(fp, "Name: %s, Age: %d\n", name, age);

/* Write a string */
fputs("Hello, World!\n", fp);

/* Write a single character */
fputc('A', fp);

/* Write to stdout/stderr */
printf("To stdout\n");
fprintf(stderr, "To stderr\n");
```

---

## 3. Binary I/O

```c
typedef struct {
    int32_t id;
    char name[32];
    double value;
} record_t;

/* Write binary data */
record_t rec = {.id = 1, .name = "test", .value = 3.14};
FILE *fp = fopen("data.bin", "wb");
if (fp == NULL) {
    perror("fopen");
    return -1;
}
size_t written = fwrite(&rec, sizeof(rec), 1, fp);
if (written != 1) {
    fprintf(stderr, "fwrite failed\n");
}
fclose(fp);

/* Read binary data */
record_t loaded;
fp = fopen("data.bin", "rb");
if (fp == NULL) {
    perror("fopen");
    return -1;
}
size_t read_count = fread(&loaded, sizeof(loaded), 1, fp);
if (read_count != 1) {
    if (feof(fp)) {
        fprintf(stderr, "Unexpected end of file\n");
    } else {
        fprintf(stderr, "fread error\n");
    }
}
fclose(fp);

/* Read/write arrays */
int32_t values[100];
fwrite(values, sizeof(int32_t), 100, fp);
fread(values, sizeof(int32_t), 100, fp);

/* WARNING: binary files are NOT portable across architectures
   (endianness, struct padding, type sizes may differ) */
```

---

## 4. File Positioning

```c
/* Get current position */
long pos = ftell(fp);
if (pos == -1L) {
    perror("ftell");
}

/* Seek to position */
fseek(fp, 0, SEEK_SET);    /* beginning of file */
fseek(fp, 0, SEEK_END);    /* end of file */
fseek(fp, -10, SEEK_CUR);  /* 10 bytes back from current */
fseek(fp, 100, SEEK_SET);  /* absolute position 100 */

/* Rewind — equivalent to fseek(fp, 0, SEEK_SET) + clearerr */
rewind(fp);

/* Get file size */
long get_file_size(FILE *fp)
{
    long current = ftell(fp);
    fseek(fp, 0, SEEK_END);
    long size = ftell(fp);
    fseek(fp, current, SEEK_SET);  /* restore position */
    return size;
}

/* For large files (>2GB), use fgetpos/fsetpos */
fpos_t pos;
fgetpos(fp, &pos);
/* ... read/write ... */
fsetpos(fp, &pos);  /* restore position */
```

---

## 5. Buffering

```c
/* Set buffer mode BEFORE any I/O operations */
setvbuf(fp, NULL, _IOFBF, 8192);  /* fully buffered, 8KB */
setvbuf(fp, NULL, _IOLBF, 0);     /* line buffered */
setvbuf(fp, NULL, _IONBF, 0);     /* unbuffered */

/* Flush buffer manually */
fflush(fp);       /* flush a specific stream */
fflush(stdout);   /* common: flush stdout before reading stdin */

/* Default buffering:
   - stdout: line-buffered (when terminal) or fully-buffered (when piped)
   - stderr: unbuffered
   - files: fully-buffered
*/
```

---

## 6. Error Handling in I/O

```c
/* Check for errors after I/O operations */
if (ferror(fp)) {
    fprintf(stderr, "I/O error occurred\n");
    clearerr(fp);  /* reset error indicator */
}

/* Check for end-of-file */
if (feof(fp)) {
    printf("Reached end of file\n");
}

/* Pattern: read entire file into buffer */
char *read_entire_file(const char *path, size_t *out_size)
{
    FILE *fp = fopen(path, "rb");
    if (fp == NULL) {
        return NULL;
    }

    fseek(fp, 0, SEEK_END);
    long size = ftell(fp);
    if (size < 0) {
        fclose(fp);
        return NULL;
    }
    rewind(fp);

    char *buffer = malloc((size_t)size + 1);
    if (buffer == NULL) {
        fclose(fp);
        return NULL;
    }

    size_t read_count = fread(buffer, 1, (size_t)size, fp);
    fclose(fp);

    if ((long)read_count != size) {
        free(buffer);
        return NULL;
    }

    buffer[size] = '\0';
    if (out_size != NULL) {
        *out_size = (size_t)size;
    }
    return buffer;
}
```

---

## 7. Temporary Files

```c
/* tmpfile — creates a temporary file that is auto-deleted on close */
FILE *tmp = tmpfile();
if (tmp == NULL) {
    perror("tmpfile");
    return -1;
}
fprintf(tmp, "temporary data\n");
rewind(tmp);
/* ... read back ... */
fclose(tmp);  /* file is automatically deleted */

/* tmpnam — AVOID: race condition between name generation and file creation */
/* Use mkstemp (POSIX) instead */
char template[] = "/tmp/myapp_XXXXXX";
int fd = mkstemp(template);  /* creates and opens atomically */
if (fd == -1) {
    perror("mkstemp");
    return -1;
}
FILE *fp = fdopen(fd, "w+");
/* ... use fp ... */
fclose(fp);
unlink(template);  /* delete when done */
```

---

## 8. Safe I/O Patterns

```c
/* Always check return values */
FILE *fp = fopen(path, "r");
if (fp == NULL) {
    perror("fopen");
    return -1;
}

/* Use goto cleanup for multiple resources */
int process_files(const char *input_path, const char *output_path)
{
    int result = -1;
    FILE *in = NULL;
    FILE *out = NULL;
    char *buffer = NULL;

    in = fopen(input_path, "r");
    if (in == NULL) {
        perror("fopen input");
        goto cleanup;
    }

    out = fopen(output_path, "w");
    if (out == NULL) {
        perror("fopen output");
        goto cleanup;
    }

    buffer = malloc(BUFFER_SIZE);
    if (buffer == NULL) {
        perror("malloc");
        goto cleanup;
    }

    /* ... process ... */
    result = 0;

cleanup:
    free(buffer);
    if (out != NULL) { fclose(out); }
    if (in != NULL) { fclose(in); }
    return result;
}
```
