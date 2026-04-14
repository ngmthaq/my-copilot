---
name: c-concurrency
description: "C concurrency — POSIX threads (pthreads), mutexes, condition variables, read-write locks, atomic operations (C11), thread-local storage, thread safety patterns, race conditions, and deadlock prevention. Use when: writing multi-threaded code with pthreads; mutexes; condition variables; atomic operations; thread safety; race conditions. DO NOT USE FOR: file I/O (use c-file-io); process management (fork/exec); general error handling (use c-error-handling)."
---

# C Concurrency

## 1. POSIX Threads (pthreads)

### Creating and Joining Threads

```c
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int id;
    int start;
    int end;
    long result;
} thread_arg_t;

void *worker(void *arg)
{
    thread_arg_t *data = (thread_arg_t *)arg;
    data->result = 0;

    for (int i = data->start; i < data->end; i++) {
        data->result += i;
    }

    return NULL;  /* or return a pointer to a result */
}

int main(void)
{
    const int num_threads = 4;
    pthread_t threads[num_threads];
    thread_arg_t args[num_threads];

    /* Create threads */
    for (int i = 0; i < num_threads; i++) {
        args[i] = (thread_arg_t){
            .id = i,
            .start = i * 250,
            .end = (i + 1) * 250,
        };
        int rc = pthread_create(&threads[i], NULL, worker, &args[i]);
        if (rc != 0) {
            fprintf(stderr, "pthread_create failed: %s\n", strerror(rc));
            return 1;
        }
    }

    /* Join threads — wait for all to finish */
    long total = 0;
    for (int i = 0; i < num_threads; i++) {
        int rc = pthread_join(threads[i], NULL);
        if (rc != 0) {
            fprintf(stderr, "pthread_join failed: %s\n", strerror(rc));
        }
        total += args[i].result;
    }

    printf("Total: %ld\n", total);
    return 0;
}
```

### Compile with pthreads

```bash
gcc -pthread -o app main.c
# or
gcc main.c -lpthread -o app
```

---

## 2. Mutexes

### Basic Mutex

```c
#include <pthread.h>

typedef struct {
    int value;
    pthread_mutex_t lock;
} counter_t;

int counter_init(counter_t *c)
{
    c->value = 0;
    return pthread_mutex_init(&c->lock, NULL);
}

void counter_destroy(counter_t *c)
{
    pthread_mutex_destroy(&c->lock);
}

void counter_increment(counter_t *c)
{
    pthread_mutex_lock(&c->lock);
    c->value++;
    pthread_mutex_unlock(&c->lock);
}

int counter_get(counter_t *c)
{
    pthread_mutex_lock(&c->lock);
    int val = c->value;
    pthread_mutex_unlock(&c->lock);
    return val;
}
```

### Static Initialization

```c
/* For global/static mutexes */
static pthread_mutex_t global_lock = PTHREAD_MUTEX_INITIALIZER;

void safe_operation(void)
{
    pthread_mutex_lock(&global_lock);
    /* critical section */
    pthread_mutex_unlock(&global_lock);
}
```

### Mutex Anti-Patterns

```c
/* ✗ Forgetting to unlock on error paths */
void bad_function(resource_t *r)
{
    pthread_mutex_lock(&r->lock);
    if (r->data == NULL) {
        return;  /* ✗ DEADLOCK — mutex never unlocked */
    }
    process(r->data);
    pthread_mutex_unlock(&r->lock);
}

/* ✓ Always unlock, even on error */
void good_function(resource_t *r)
{
    pthread_mutex_lock(&r->lock);
    if (r->data != NULL) {
        process(r->data);
    }
    pthread_mutex_unlock(&r->lock);
}
```

---

## 3. Condition Variables

```c
#include <pthread.h>
#include <stdbool.h>

typedef struct {
    int *buffer;
    size_t capacity;
    size_t count;
    size_t head;
    size_t tail;
    pthread_mutex_t lock;
    pthread_cond_t not_empty;
    pthread_cond_t not_full;
} queue_t;

int queue_init(queue_t *q, size_t capacity)
{
    q->buffer = calloc(capacity, sizeof(int));
    if (q->buffer == NULL) {
        return -1;
    }
    q->capacity = capacity;
    q->count = 0;
    q->head = 0;
    q->tail = 0;
    pthread_mutex_init(&q->lock, NULL);
    pthread_cond_init(&q->not_empty, NULL);
    pthread_cond_init(&q->not_full, NULL);
    return 0;
}

void queue_destroy(queue_t *q)
{
    free(q->buffer);
    pthread_mutex_destroy(&q->lock);
    pthread_cond_destroy(&q->not_empty);
    pthread_cond_destroy(&q->not_full);
}

/* Blocking push */
void queue_push(queue_t *q, int value)
{
    pthread_mutex_lock(&q->lock);

    /* Wait while full — MUST use while loop (spurious wakeups) */
    while (q->count == q->capacity) {
        pthread_cond_wait(&q->not_full, &q->lock);
    }

    q->buffer[q->tail] = value;
    q->tail = (q->tail + 1) % q->capacity;
    q->count++;

    pthread_cond_signal(&q->not_empty);
    pthread_mutex_unlock(&q->lock);
}

/* Blocking pop */
int queue_pop(queue_t *q)
{
    pthread_mutex_lock(&q->lock);

    while (q->count == 0) {
        pthread_cond_wait(&q->not_empty, &q->lock);
    }

    int value = q->buffer[q->head];
    q->head = (q->head + 1) % q->capacity;
    q->count--;

    pthread_cond_signal(&q->not_full);
    pthread_mutex_unlock(&q->lock);
    return value;
}
```

---

## 4. Read-Write Locks

```c
#include <pthread.h>

typedef struct {
    char data[1024];
    pthread_rwlock_t lock;
} shared_data_t;

int shared_data_init(shared_data_t *sd)
{
    memset(sd->data, 0, sizeof(sd->data));
    return pthread_rwlock_init(&sd->lock, NULL);
}

/* Multiple readers can hold the lock simultaneously */
void read_data(shared_data_t *sd, char *out, size_t size)
{
    pthread_rwlock_rdlock(&sd->lock);
    strncpy(out, sd->data, size - 1);
    out[size - 1] = '\0';
    pthread_rwlock_unlock(&sd->lock);
}

/* Writers get exclusive access */
void write_data(shared_data_t *sd, const char *input)
{
    pthread_rwlock_wrlock(&sd->lock);
    strncpy(sd->data, input, sizeof(sd->data) - 1);
    sd->data[sizeof(sd->data) - 1] = '\0';
    pthread_rwlock_unlock(&sd->lock);
}
```

---

## 5. Atomic Operations (C11)

```c
#include <stdatomic.h>

/* Atomic types */
atomic_int counter = ATOMIC_VAR_INIT(0);
atomic_flag spinlock = ATOMIC_FLAG_INIT;

/* Atomic operations */
void increment(void)
{
    atomic_fetch_add(&counter, 1);
}

int get_count(void)
{
    return atomic_load(&counter);
}

void set_count(int val)
{
    atomic_store(&counter, val);
}

/* Compare and swap */
bool try_update(int expected, int desired)
{
    return atomic_compare_exchange_strong(&counter, &expected, desired);
}

/* Spinlock using atomic_flag */
void spinlock_lock(atomic_flag *lock)
{
    while (atomic_flag_test_and_set(lock)) {
        /* busy wait — use only for very short critical sections */
    }
}

void spinlock_unlock(atomic_flag *lock)
{
    atomic_flag_clear(lock);
}
```

### Memory Ordering

```c
/* Default: memory_order_seq_cst (safest, most expensive) */
atomic_store_explicit(&counter, 42, memory_order_release);
int val = atomic_load_explicit(&counter, memory_order_acquire);

/* Memory orders from weakest to strongest:
   memory_order_relaxed  — no ordering guarantees
   memory_order_acquire  — reads after this see writes before paired release
   memory_order_release  — writes before this are visible after paired acquire
   memory_order_acq_rel  — both acquire and release
   memory_order_seq_cst  — total ordering (default, safest)
*/
```

---

## 6. Thread-Local Storage

```c
/* C11 — _Thread_local or thread_local (with threads.h) */
#include <threads.h>

thread_local int tls_value = 0;  /* each thread gets its own copy */

/* POSIX — pthread_key */
static pthread_key_t tls_key;

void tls_init(void)
{
    pthread_key_create(&tls_key, free);  /* free is the destructor */
}

void tls_set(int value)
{
    int *p = malloc(sizeof(int));
    *p = value;
    pthread_setspecific(tls_key, p);
}

int tls_get(void)
{
    int *p = pthread_getspecific(tls_key);
    return (p != NULL) ? *p : 0;
}
```

---

## 7. Deadlock Prevention

```c
/* Rule 1: Always acquire locks in a consistent global order */
void transfer(account_t *from, account_t *to, double amount)
{
    /* Order by address to ensure consistent lock ordering */
    account_t *first = (from < to) ? from : to;
    account_t *second = (from < to) ? to : from;

    pthread_mutex_lock(&first->lock);
    pthread_mutex_lock(&second->lock);

    from->balance -= amount;
    to->balance += amount;

    pthread_mutex_unlock(&second->lock);
    pthread_mutex_unlock(&first->lock);
}

/* Rule 2: Use trylock to detect potential deadlocks */
bool try_transfer(account_t *from, account_t *to, double amount)
{
    if (pthread_mutex_trylock(&from->lock) != 0) {
        return false;
    }
    if (pthread_mutex_trylock(&to->lock) != 0) {
        pthread_mutex_unlock(&from->lock);
        return false;
    }

    from->balance -= amount;
    to->balance += amount;

    pthread_mutex_unlock(&to->lock);
    pthread_mutex_unlock(&from->lock);
    return true;
}

/* Rule 3: Keep critical sections short
   Rule 4: Never call external/user code while holding a lock
   Rule 5: Prefer higher-level primitives (channels, queues) over raw locks */
```

---

## 8. Thread Safety Checklist

| Check                 | Description                                                     |
| --------------------- | --------------------------------------------------------------- |
| Shared mutable state  | Is every shared variable protected by a mutex or atomic?        |
| Lock ordering         | Are multiple locks always acquired in the same order?           |
| No data races         | Are there no unsynchronized concurrent accesses?                |
| Cleanup               | Are mutexes destroyed and threads joined on shutdown?           |
| Signal safety         | Are only async-signal-safe functions called in signal handlers? |
| Reentrant functions   | Are you avoiding non-reentrant functions (strtok, localtime)?   |
| Thread-safe libraries | Are third-party libraries thread-safe or wrapped with locks?    |
