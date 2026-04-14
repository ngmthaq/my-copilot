---
name: cpp-concurrency
description: "C++ concurrency — std::thread, std::jthread (C++20), std::mutex, std::lock_guard, std::unique_lock, std::shared_mutex, condition variables, std::async, futures and promises, std::atomic, thread-local storage, thread safety patterns, and coroutines overview. Use when: writing multi-threaded code; mutexes; condition variables; async operations; futures; atomics; thread safety; parallel algorithms. DO NOT USE FOR: STL algorithm parallelism only (use cpp-stl-algorithms); process-level concurrency; C-style pthreads (use c-concurrency)."
---

# C++ Concurrency

## 1. std::thread

### Creating and Joining Threads

```cpp
#include <thread>
#include <iostream>

void worker(int id, const std::string& task) {
    std::cout << "Thread " << id << " doing: " << task << '\n';
}

int main() {
    std::thread t1(worker, 1, "compute");
    std::thread t2(worker, 2, "render");

    t1.join();  // wait for t1 to finish
    t2.join();  // wait for t2 to finish
    return 0;
}
```

### Thread with Lambda

```cpp
int result = 0;
std::thread t([&result] {
    result = expensiveComputation();
});
t.join();
std::cout << "Result: " << result << '\n';
```

### Detached Threads

```cpp
std::thread t(backgroundTask);
t.detach();  // thread runs independently
// ⚠ WARNING: detached threads can outlive main() — use with caution
// Prefer jthread or join pattern over detach
```

### std::jthread (C++20)

```cpp
#include <thread>
#include <stop_token>

// jthread automatically joins on destruction
void worker(std::stop_token stoken) {
    while (!stoken.stop_requested()) {
        doWork();
    }
}

{
    std::jthread t(worker);  // starts thread
    // ... do other work ...
}  // jthread destructor calls request_stop() then join()
```

---

## 2. Mutexes

### std::mutex and std::lock_guard

```cpp
#include <mutex>

class Counter {
public:
    void increment() {
        std::lock_guard<std::mutex> lock(mutex_);  // auto-unlock on scope exit
        ++count_;
    }

    int get() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return count_;
    }

private:
    mutable std::mutex mutex_;
    int count_ = 0;
};
```

### std::unique_lock (More Flexible)

```cpp
std::mutex mtx;

void flexibleLocking() {
    std::unique_lock<std::mutex> lock(mtx);
    // ... critical section ...

    lock.unlock();   // manually unlock
    doNonCriticalWork();
    lock.lock();     // re-lock

    // Can also defer locking
    std::unique_lock<std::mutex> lock2(mtx, std::defer_lock);
    // ... decide whether to lock ...
    lock2.lock();
}
```

### std::scoped_lock (C++17 — Multiple Mutexes)

```cpp
// Lock multiple mutexes without deadlock
void transfer(Account& from, Account& to, double amount) {
    std::scoped_lock lock(from.mutex_, to.mutex_);  // deadlock-free
    from.balance_ -= amount;
    to.balance_ += amount;
}
```

### std::shared_mutex (Reader-Writer Lock)

```cpp
#include <shared_mutex>

class ThreadSafeCache {
public:
    std::string read(const std::string& key) const {
        std::shared_lock lock(mutex_);   // multiple readers OK
        auto it = data_.find(key);
        return (it != data_.end()) ? it->second : "";
    }

    void write(const std::string& key, std::string value) {
        std::unique_lock lock(mutex_);   // exclusive access
        data_[key] = std::move(value);
    }

private:
    mutable std::shared_mutex mutex_;
    std::unordered_map<std::string, std::string> data_;
};
```

---

## 3. Condition Variables

```cpp
#include <condition_variable>
#include <queue>

template <typename T>
class ThreadSafeQueue {
public:
    void push(T value) {
        {
            std::lock_guard<std::mutex> lock(mutex_);
            queue_.push(std::move(value));
        }
        cv_.notify_one();  // wake one waiting thread
    }

    T pop() {
        std::unique_lock<std::mutex> lock(mutex_);
        cv_.wait(lock, [this] { return !queue_.empty(); });
        // ↑ atomically: unlock, sleep until predicate true, re-lock
        T value = std::move(queue_.front());
        queue_.pop();
        return value;
    }

    bool tryPop(T& value, std::chrono::milliseconds timeout) {
        std::unique_lock<std::mutex> lock(mutex_);
        if (!cv_.wait_for(lock, timeout, [this] { return !queue_.empty(); })) {
            return false;  // timed out
        }
        value = std::move(queue_.front());
        queue_.pop();
        return true;
    }

private:
    std::mutex mutex_;
    std::condition_variable cv_;
    std::queue<T> queue_;
};
```

---

## 4. std::async, Futures, and Promises

### std::async

```cpp
#include <future>

// Launch async task — returns future
auto future = std::async(std::launch::async, [] {
    return expensiveComputation();
});

// Do other work while computation runs...

int result = future.get();  // blocks until ready

// Launch policies
auto f1 = std::async(std::launch::async, task);    // new thread guaranteed
auto f2 = std::async(std::launch::deferred, task);  // lazy, runs on get()
auto f3 = std::async(task);                          // implementation decides
```

### std::future and std::promise

```cpp
// Promise-future pair for one-shot communication
std::promise<int> promise;
std::future<int> future = promise.get_future();

std::thread producer([&promise] {
    int result = compute();
    promise.set_value(result);  // fulfills the promise
});

// Consumer side
int value = future.get();  // blocks until value is set
producer.join();

// Exception propagation through promise
std::promise<int> promise;
std::thread t([&promise] {
    try {
        promise.set_value(riskyCompute());
    } catch (...) {
        promise.set_exception(std::current_exception());
    }
});
try {
    int val = promise.get_future().get();  // re-throws exception
} catch (const std::exception& e) {
    std::cerr << e.what() << '\n';
}
t.join();
```

### std::packaged_task

```cpp
// Wraps a callable and provides a future for its result
std::packaged_task<int(int, int)> task([](int a, int b) { return a + b; });
auto future = task.get_future();

std::thread t(std::move(task), 3, 4);
int result = future.get();  // 7
t.join();
```

---

## 5. Atomics

```cpp
#include <atomic>

// Atomic operations — lock-free thread safety for simple types
std::atomic<int> counter{0};
std::atomic<bool> ready{false};

void worker() {
    counter.fetch_add(1, std::memory_order_relaxed);  // atomic increment
    // or simply: counter++;
}

// Atomic flag — guaranteed lock-free
std::atomic_flag lock = ATOMIC_FLAG_INIT;

void spinLock() {
    while (lock.test_and_set(std::memory_order_acquire)) {
        // spin
    }
    // critical section
    lock.clear(std::memory_order_release);
}

// Common atomic operations
counter.store(42);                    // write
int val = counter.load();             // read
int old = counter.exchange(100);      // swap
bool ok = counter.compare_exchange_strong(expected, desired);

// Check if lock-free
static_assert(std::atomic<int>::is_always_lock_free);
```

### Memory Ordering

```cpp
// From weakest to strongest:
// memory_order_relaxed    — no ordering constraints
// memory_order_acquire    — reads after this see writes before release
// memory_order_release    — writes before this visible after acquire
// memory_order_acq_rel    — both acquire and release
// memory_order_seq_cst    — sequential consistency (default, safest)

// Producer-consumer with acquire/release
std::atomic<bool> ready{false};
int data = 0;

// Producer
void produce() {
    data = 42;
    ready.store(true, std::memory_order_release);
}

// Consumer
void consume() {
    while (!ready.load(std::memory_order_acquire)) {}
    assert(data == 42);  // guaranteed to see 42
}
```

---

## 6. Thread-Local Storage

```cpp
// thread_local — each thread has its own copy
thread_local int tls_counter = 0;

void incrementLocal() {
    tls_counter++;  // only modifies this thread's copy
}

std::thread t1([] { incrementLocal(); incrementLocal(); });
std::thread t2([] { incrementLocal(); });
t1.join();
t2.join();
// t1's tls_counter: 2, t2's tls_counter: 1
```

---

## 7. Thread Safety Patterns

### Thread-Safe Singleton (Meyer's Singleton)

```cpp
class Singleton {
public:
    static Singleton& instance() {
        static Singleton inst;  // C++11: thread-safe initialization
        return inst;
    }

    Singleton(const Singleton&) = delete;
    Singleton& operator=(const Singleton&) = delete;

private:
    Singleton() = default;
};
```

### std::call_once

```cpp
std::once_flag init_flag;
std::shared_ptr<Resource> resource;

void ensureInitialized() {
    std::call_once(init_flag, [] {
        resource = std::make_shared<Resource>();
    });
}
```

### Double-Checked Locking (Prefer call_once Instead)

```cpp
// Modern C++ — use atomic with acquire/release
class LazyInit {
public:
    Resource& get() {
        auto* ptr = resource_.load(std::memory_order_acquire);
        if (!ptr) {
            std::lock_guard lock(mutex_);
            ptr = resource_.load(std::memory_order_relaxed);
            if (!ptr) {
                ptr = new Resource();
                resource_.store(ptr, std::memory_order_release);
            }
        }
        return *ptr;
    }

private:
    std::atomic<Resource*> resource_{nullptr};
    std::mutex mutex_;
};
```

---

## 8. Concurrency Anti-Patterns

```cpp
// ✗ Data race — undefined behavior
int shared = 0;
std::thread t1([&] { shared++; });
std::thread t2([&] { shared++; });
// FIX: use std::atomic<int> or std::mutex

// ✗ Forgetting to join or detach
{
    std::thread t(task);
}  // CRASH: std::thread destructor calls std::terminate if joinable
// FIX: use std::jthread (C++20) or always join/detach

// ✗ Holding lock during slow operations
{
    std::lock_guard lock(mtx);
    auto data = downloadFromNetwork();  // ✗ blocks other threads
}
// FIX: download first, then lock to update shared state

// ✗ Lock ordering violation (deadlock)
// Thread 1: lock(A) → lock(B)
// Thread 2: lock(B) → lock(A)
// FIX: use std::scoped_lock(A, B) or always lock in same order
```
