---
name: java-concurrency
description: "Java concurrency — threads, Runnable, ExecutorService, CompletableFuture, synchronization, concurrent collections, locks, atomic variables, and virtual threads. Use when: multi-threading; thread pools; async computations; synchronization; concurrent data structures; virtual threads. DO NOT USE FOR: Stream API parallelism (use java-streams-lambdas); basic control flow (use java-core-fundamentals)."
---

# Java Concurrency

## 1. Threads

```java
// Runnable (preferred)
Runnable task = () -> System.out.println("Running in " + Thread.currentThread().getName());
Thread thread = new Thread(task);
thread.start();

// Callable (returns a value)
Callable<String> callable = () -> {
    Thread.sleep(1000);
    return "Result";
};

// Thread lifecycle
thread.start();          // start execution
thread.join();           // wait for completion
thread.join(5000);       // wait with timeout (ms)
thread.isAlive();        // check if running
Thread.currentThread();  // get current thread
Thread.sleep(1000);      // pause (not for production use — prefer ScheduledExecutor)
```

---

## 2. ExecutorService

```java
// Fixed thread pool
ExecutorService executor = Executors.newFixedThreadPool(4);

// Submit tasks
Future<String> future = executor.submit(() -> {
    Thread.sleep(1000);
    return "Done";
});

// Get result (blocks)
String result = future.get();                    // blocks until complete
String result2 = future.get(5, TimeUnit.SECONDS); // with timeout

// Submit multiple
List<Callable<String>> tasks = List.of(
    () -> fetchFromApi("url1"),
    () -> fetchFromApi("url2"),
    () -> fetchFromApi("url3")
);
List<Future<String>> futures = executor.invokeAll(tasks);
String fastest = executor.invokeAny(tasks);      // first to complete

// Shutdown
executor.shutdown();                              // graceful — finish running tasks
executor.shutdownNow();                           // interrupt all
executor.awaitTermination(30, TimeUnit.SECONDS);  // wait for shutdown

// Try-with-resources (Java 19+)
try (var exec = Executors.newFixedThreadPool(4)) {
    exec.submit(() -> process("task"));
}
```

### Thread Pool Types

```java
Executors.newFixedThreadPool(n);      // fixed number of threads
Executors.newCachedThreadPool();      // grows/shrinks dynamically
Executors.newSingleThreadExecutor();  // single thread, ordered execution
Executors.newScheduledThreadPool(n);  // for delayed/periodic tasks

// Custom thread pool (production use)
ExecutorService executor = new ThreadPoolExecutor(
    4,                                // core pool size
    8,                                // max pool size
    60L, TimeUnit.SECONDS,           // keep-alive for idle threads
    new LinkedBlockingQueue<>(100),   // work queue
    new ThreadPoolExecutor.CallerRunsPolicy()  // rejection policy
);
```

---

## 3. CompletableFuture

```java
// Create
CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> fetchData());
CompletableFuture<Void> runCf = CompletableFuture.runAsync(() -> fireAndForget());

// Chaining (non-blocking)
CompletableFuture<Integer> pipeline = CompletableFuture
    .supplyAsync(() -> fetchUser(userId))
    .thenApply(User::getName)                    // transform
    .thenApply(String::length);                  // transform again

// Async chaining (runs in separate thread)
CompletableFuture<String> async = CompletableFuture
    .supplyAsync(() -> fetchUser(userId))
    .thenApplyAsync(user -> enrichUser(user));   // runs in ForkJoinPool

// Side effects
cf.thenAccept(System.out::println);              // consume result
cf.thenRun(() -> System.out.println("Done"));    // run after

// Combining
CompletableFuture<String> combined = userCf
    .thenCombine(orderCf, (user, order) ->
        user.getName() + " ordered " + order.getItem());

CompletableFuture<String> composed = userCf
    .thenCompose(user -> fetchOrders(user.getId())); // flatMap equivalent

// All/Any
CompletableFuture<Void> all = CompletableFuture.allOf(cf1, cf2, cf3);
CompletableFuture<Object> any = CompletableFuture.anyOf(cf1, cf2, cf3);

// Error handling
CompletableFuture<String> safe = cf
    .exceptionally(ex -> "Fallback: " + ex.getMessage())
    .handle((result, ex) -> {
        if (ex != null) return "Error: " + ex.getMessage();
        return "Success: " + result;
    });

// Timeout (Java 9+)
cf.orTimeout(5, TimeUnit.SECONDS);               // completes exceptionally on timeout
cf.completeOnTimeout("default", 5, TimeUnit.SECONDS); // use default on timeout
```

---

## 4. Synchronization

### synchronized

```java
public class Counter {
    private int count = 0;

    // Synchronized method — locks on 'this'
    public synchronized void increment() {
        count++;
    }

    // Synchronized block — finer granularity
    public void incrementFine() {
        synchronized (this) {
            count++;
        }
    }

    public synchronized int getCount() {
        return count;
    }
}
```

### ReentrantLock

```java
public class SafeCounter {
    private final Lock lock = new ReentrantLock();
    private int count = 0;

    public void increment() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock();      // always unlock in finally
        }
    }

    public boolean tryIncrement() {
        if (lock.tryLock()) {   // non-blocking attempt
            try {
                count++;
                return true;
            } finally {
                lock.unlock();
            }
        }
        return false;
    }
}
```

### ReadWriteLock

```java
public class Cache<K, V> {
    private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final Map<K, V> map = new HashMap<>();

    public V get(K key) {
        rwLock.readLock().lock();       // multiple readers allowed
        try {
            return map.get(key);
        } finally {
            rwLock.readLock().unlock();
        }
    }

    public void put(K key, V value) {
        rwLock.writeLock().lock();      // exclusive access
        try {
            map.put(key, value);
        } finally {
            rwLock.writeLock().unlock();
        }
    }
}
```

---

## 5. Atomic Variables

```java
// Lock-free thread-safe operations
AtomicInteger counter = new AtomicInteger(0);
counter.incrementAndGet();               // ++counter
counter.getAndIncrement();               // counter++
counter.addAndGet(5);                    // counter += 5
counter.compareAndSet(5, 10);            // CAS operation

AtomicReference<String> ref = new AtomicReference<>("initial");
ref.set("updated");
ref.compareAndSet("updated", "final");

AtomicLong timestamp = new AtomicLong(System.currentTimeMillis());
LongAdder adder = new LongAdder();      // better for high contention
adder.increment();
adder.sum();
```

---

## 6. Concurrent Collections

```java
// Thread-safe map (preferred over Collections.synchronizedMap)
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.put("key", 1);
map.compute("key", (k, v) -> v == null ? 1 : v + 1);  // atomic update
map.merge("key", 1, Integer::sum);                      // atomic merge

// Thread-safe queue
BlockingQueue<String> queue = new LinkedBlockingQueue<>(100);
queue.put("item");                // blocks if full
queue.take();                     // blocks if empty
queue.offer("item", 5, TimeUnit.SECONDS);  // timeout
queue.poll(5, TimeUnit.SECONDS);

// Copy-on-write (good for read-heavy, few writes)
CopyOnWriteArrayList<String> cowList = new CopyOnWriteArrayList<>();
CopyOnWriteArraySet<String> cowSet = new CopyOnWriteArraySet<>();

// Skip list (concurrent sorted)
ConcurrentSkipListMap<String, Integer> sortedMap = new ConcurrentSkipListMap<>();
ConcurrentSkipListSet<String> sortedSet = new ConcurrentSkipListSet<>();
```

---

## 7. Virtual Threads (Java 21+)

```java
// Create virtual thread
Thread vt = Thread.ofVirtual().start(() -> {
    System.out.println("Virtual thread: " + Thread.currentThread());
});

// Named virtual thread
Thread named = Thread.ofVirtual().name("worker").start(() -> process());

// Virtual thread executor (preferred for I/O-bound tasks)
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<String>> futures = IntStream.range(0, 10_000)
        .mapToObj(i -> executor.submit(() -> fetchUrl("https://example.com/" + i)))
        .toList();

    for (Future<String> future : futures) {
        System.out.println(future.get());
    }
}

// Structured concurrency (Java 21+ preview)
// try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
//     Subtask<User> userTask = scope.fork(() -> fetchUser(id));
//     Subtask<Order> orderTask = scope.fork(() -> fetchOrder(id));
//     scope.join().throwIfFailed();
//     return new UserOrder(userTask.get(), orderTask.get());
// }
```

### Virtual Threads vs Platform Threads

| Aspect          | Platform Threads | Virtual Threads                      |
| --------------- | ---------------- | ------------------------------------ |
| Backed by       | OS thread        | JVM-managed                          |
| Creation cost   | ~1MB stack       | ~few KB                              |
| Max count       | Thousands        | Millions                             |
| Best for        | CPU-bound work   | I/O-bound work                       |
| Synchronization | Full support     | Avoid `synchronized` on blocking I/O |
| Thread pools    | Use pool sizes   | One-per-task pattern                 |

---

## 8. Anti-Patterns

```java
// ✗ Creating threads manually for each task
new Thread(() -> process(item)).start();  // no bound, no reuse

// ✓ Use ExecutorService
executor.submit(() -> process(item));

// ✗ Calling thread.stop() or thread.suspend()
thread.stop();   // deprecated, can leave objects in inconsistent state

// ✓ Use interrupt mechanism
thread.interrupt();
// In the task: check Thread.interrupted() and exit gracefully

// ✗ Busy waiting
while (!condition) {
    Thread.sleep(100);       // wastes CPU and adds latency
}

// ✓ Use wait/notify or BlockingQueue
queue.take();                // blocks efficiently

// ✗ Double-checked locking without volatile
private static Singleton instance;  // ✗ missing volatile

// ✓ Use volatile or enum singleton
private static volatile Singleton instance;

// ✗ Synchronizing on non-final object
private Object lock = new Object();  // can be reassigned
synchronized (lock) { }

// ✓ Use final lock
private final Object lock = new Object();
```
