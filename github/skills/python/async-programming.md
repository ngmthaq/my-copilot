---
name: python-async-programming
description: "Python async programming — asyncio, coroutines, tasks, event loop, async context managers, aiohttp, async generators, and concurrency patterns. Use when: writing asyncio code; coroutines; tasks; event loops; async context managers; aiohttp; concurrent I/O. DO NOT USE FOR: threading/multiprocessing (use standard library docs); synchronous code patterns (use python-core-fundamentals)."
---

# Python Async Programming

## 1. Coroutines and await

```python
import asyncio

async def fetch_data(url: str) -> dict:
    """Basic coroutine."""
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()

# Running coroutines
async def main() -> None:
    data = await fetch_data("https://api.example.com/users")
    print(data)

asyncio.run(main())
```

---

## 2. Tasks and Concurrency

### Creating Tasks

```python
async def main() -> None:
    # Sequential — slow
    result1 = await fetch_data("/api/users")
    result2 = await fetch_data("/api/posts")

    # Concurrent — fast
    task1 = asyncio.create_task(fetch_data("/api/users"))
    task2 = asyncio.create_task(fetch_data("/api/posts"))
    result1, result2 = await task1, await task2
```

### gather — Run Multiple Coroutines

```python
async def main() -> None:
    urls = ["/api/users", "/api/posts", "/api/comments"]

    # All succeed or first exception propagates
    results = await asyncio.gather(
        *[fetch_data(url) for url in urls],
    )

    # return_exceptions=True to collect errors instead of raising
    results = await asyncio.gather(
        *[fetch_data(url) for url in urls],
        return_exceptions=True,
    )
    for result in results:
        if isinstance(result, Exception):
            print(f"Error: {result}")
        else:
            process(result)
```

### TaskGroup (Python 3.11+)

```python
async def main() -> None:
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(fetch_data("/api/users"))
        task2 = tg.create_task(fetch_data("/api/posts"))

    # All tasks completed (or ExceptionGroup raised)
    users = task1.result()
    posts = task2.result()
```

### Timeouts

```python
# asyncio.timeout (Python 3.11+)
async def main() -> None:
    async with asyncio.timeout(5.0):
        data = await fetch_data("/api/slow-endpoint")

# wait_for (older approach)
try:
    data = await asyncio.wait_for(fetch_data(url), timeout=5.0)
except asyncio.TimeoutError:
    print("Request timed out")
```

---

## 3. Async Iteration

### Async Generators

```python
async def paginated_fetch(url: str, page_size: int = 100):
    """Async generator for paginated API responses."""
    page = 1
    while True:
        data = await fetch_data(f"{url}?page={page}&size={page_size}")
        if not data["items"]:
            break
        for item in data["items"]:
            yield item
        page += 1

# Usage
async for user in paginated_fetch("/api/users"):
    process(user)
```

### Async Comprehensions

```python
# Async list comprehension
results = [item async for item in paginated_fetch("/api/users")]

# Async generator expression
active_users = (
    user async for user in paginated_fetch("/api/users")
    if user["is_active"]
)
```

---

## 4. Async Context Managers

```python
import contextlib

class AsyncDatabaseConnection:
    async def __aenter__(self):
        self.conn = await create_connection()
        return self.conn

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.conn.close()
        return False

# Using asynccontextmanager decorator
@contextlib.asynccontextmanager
async def get_db_session():
    session = await create_session()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()

# Usage
async with get_db_session() as session:
    user = await session.get(User, user_id)
```

---

## 5. Synchronization Primitives

### Lock

```python
lock = asyncio.Lock()

async def safe_increment(counter: dict) -> None:
    async with lock:
        current = counter["value"]
        await asyncio.sleep(0.01)  # simulate I/O
        counter["value"] = current + 1
```

### Semaphore

```python
# Limit concurrent operations
semaphore = asyncio.Semaphore(10)  # max 10 concurrent

async def rate_limited_fetch(url: str) -> dict:
    async with semaphore:
        return await fetch_data(url)

async def main() -> None:
    urls = [f"/api/item/{i}" for i in range(1000)]
    results = await asyncio.gather(
        *[rate_limited_fetch(url) for url in urls],
    )
```

### Event

```python
event = asyncio.Event()

async def waiter() -> None:
    print("Waiting for signal...")
    await event.wait()
    print("Got signal!")

async def setter() -> None:
    await asyncio.sleep(2)
    event.set()
```

### Queue

```python
async def producer(queue: asyncio.Queue) -> None:
    for i in range(100):
        await queue.put(i)
    await queue.put(None)  # sentinel

async def consumer(queue: asyncio.Queue) -> None:
    while True:
        item = await queue.get()
        if item is None:
            break
        await process(item)
        queue.task_done()

async def main() -> None:
    queue: asyncio.Queue = asyncio.Queue(maxsize=10)
    await asyncio.gather(
        producer(queue),
        consumer(queue),
    )
```

---

## 6. Running Sync Code in Async Context

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Run blocking I/O in a thread pool
async def read_file_async(path: str) -> str:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, Path(path).read_text)

# Custom executor
executor = ThreadPoolExecutor(max_workers=4)

async def cpu_bound_async(data: bytes) -> bytes:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(executor, compress, data)

# asyncio.to_thread (Python 3.9+)
async def main() -> None:
    content = await asyncio.to_thread(Path("file.txt").read_text)
```

---

## 7. Common Patterns

### Graceful Shutdown

```python
async def main() -> None:
    tasks = set()

    async def spawn(coro):
        task = asyncio.create_task(coro)
        tasks.add(task)
        task.add_done_callback(tasks.discard)
        return task

    try:
        await spawn(server_loop())
        await spawn(worker_loop())
        await asyncio.gather(*tasks)
    except asyncio.CancelledError:
        for task in tasks:
            task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)
```

### Retry with Backoff

```python
async def retry_async(
    coro_factory,
    max_attempts: int = 3,
    base_delay: float = 1.0,
):
    """Retry an async operation with exponential backoff."""
    for attempt in range(max_attempts):
        try:
            return await coro_factory()
        except Exception as exc:
            if attempt == max_attempts - 1:
                raise
            delay = base_delay * (2 ** attempt)
            await asyncio.sleep(delay)
```

---

## 8. Anti-Patterns

```python
# ✗ Blocking the event loop
async def bad_handler():
    time.sleep(5)            # blocks entire loop!
    data = requests.get(url)  # blocking HTTP call!

# ✓ Use async alternatives
async def good_handler():
    await asyncio.sleep(5)
    async with httpx.AsyncClient() as client:
        data = await client.get(url)

# ✗ Creating tasks without awaiting them
async def fire_and_forget():
    asyncio.create_task(do_something())  # may be garbage collected!

# ✓ Keep a reference to the task
async def tracked():
    task = asyncio.create_task(do_something())
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)

# ✗ Using asyncio.run() inside an already-running loop
async def handler():
    asyncio.run(other_coro())  # RuntimeError!

# ✓ Just await it
async def handler():
    await other_coro()

# ✗ Sequential awaits when concurrency is possible
result1 = await fetch("/api/a")  # waits 1s
result2 = await fetch("/api/b")  # waits 1s, total 2s

# ✓ Concurrent execution
result1, result2 = await asyncio.gather(
    fetch("/api/a"),
    fetch("/api/b"),
)  # total ~1s
```
