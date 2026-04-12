---
name: python-functions
description: "Python functions and decorators — function definitions, arguments, decorators, generators, lambda, closures, *args/**kwargs, and functools patterns. Use when: writing functions; using decorators; generators; lambda expressions; closures; *args/**kwargs. DO NOT USE FOR: class methods (use python-oop); async functions (use python-async-programming); functional programming patterns (use python-functional-programming)."
---

# Python Functions & Decorators

## 1. Function Definitions

```python
def greet(name: str) -> str:
    """Return a greeting message."""
    return f"Hello, {name}!"

# Functions are first-class objects
action = greet
action("World")  # "Hello, World!"
```

---

## 2. Arguments

### Positional and Keyword

```python
def create_user(name: str, email: str, role: str = "viewer") -> User:
    ...

# All valid calls
create_user("Alice", "alice@example.com")
create_user("Alice", "alice@example.com", "admin")
create_user("Alice", email="alice@example.com", role="admin")
create_user(name="Alice", email="alice@example.com")
```

### \*args and \*\*kwargs

```python
def log(message: str, *args: object, **kwargs: object) -> None:
    """Log with positional and keyword context."""
    print(message, *args)
    for key, value in kwargs.items():
        print(f"  {key}={value}")

log("Error", 404, "Not Found", url="/api/users", method="GET")
```

### Keyword-Only and Positional-Only

```python
# Keyword-only (after *)
def connect(host: str, *, port: int = 5432, timeout: int = 30) -> Connection:
    ...

connect("localhost", port=3306)   # ✓
connect("localhost", 3306)         # ✗ TypeError

# Positional-only (before /, Python 3.8+)
def pow(base: float, exp: float, /) -> float:
    return base ** exp

pow(2, 10)        # ✓
pow(base=2, exp=10)  # ✗ TypeError

# Combined
def func(pos_only, /, normal, *, kw_only):
    ...
```

### Unpacking Arguments

```python
args = [1, 2, 3]
kwargs = {"sep": ", ", "end": "\n"}

print(*args, **kwargs)  # 1, 2, 3
```

---

## 3. Return Values

```python
# Multiple return values (tuple unpacking)
def divide(a: float, b: float) -> tuple[float, float]:
    return a // b, a % b

quotient, remainder = divide(17, 5)

# Early returns (guard clauses)
def get_discount(user: User) -> float:
    if not user.is_active:
        return 0.0
    if user.is_premium:
        return 0.20
    return 0.05
```

---

## 4. Lambda Expressions

```python
# Simple anonymous functions
square = lambda x: x ** 2
add = lambda x, y: x + y

# Best used inline
items.sort(key=lambda x: x.name)
filtered = filter(lambda x: x > 0, numbers)
mapped = map(lambda x: x.upper(), names)

# When NOT to use lambda
# ✗ Assigned to a variable (just use def)
process = lambda x: complex_transformation(x)

# ✓ Use def instead
def process(x):
    return complex_transformation(x)
```

---

## 5. Closures

```python
def make_multiplier(factor: int):
    """Return a function that multiplies by factor."""
    def multiplier(x: int) -> int:
        return x * factor
    return multiplier

double = make_multiplier(2)
triple = make_multiplier(3)
double(5)   # 10
triple(5)   # 15

# Late binding gotcha
functions = [lambda x: x * i for i in range(3)]
functions[0](10)  # 20, not 0!  (i is 2 when called)

# Fix with default argument
functions = [lambda x, i=i: x * i for i in range(3)]
functions[0](10)  # 0 ✓
```

---

## 6. Decorators

### Basic Decorator

```python
import functools

def log_calls(func):
    """Log function calls with arguments and return value."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}({args}, {kwargs})")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result}")
        return result
    return wrapper

@log_calls
def add(a: int, b: int) -> int:
    return a + b
```

### Decorator with Arguments

```python
def retry(max_attempts: int = 3, delay: float = 1.0):
    """Retry a function on exception."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as exc:
                    last_exception = exc
                    time.sleep(delay * (attempt + 1))
            raise last_exception
        return wrapper
    return decorator

@retry(max_attempts=5, delay=0.5)
def fetch_data(url: str) -> dict:
    ...
```

### Class-Based Decorator

```python
class CacheResult:
    """Cache function results with TTL."""

    def __init__(self, ttl: int = 300):
        self.ttl = ttl
        self.cache = {}

    def __call__(self, func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            key = (args, tuple(sorted(kwargs.items())))
            if key in self.cache:
                value, timestamp = self.cache[key]
                if time.time() - timestamp < self.ttl:
                    return value
            result = func(*args, **kwargs)
            self.cache[key] = (result, time.time())
            return result
        return wrapper

@CacheResult(ttl=60)
def get_user(user_id: int) -> User:
    ...
```

### Stacking Decorators

```python
@app.route("/api/users")
@require_auth
@log_calls
def list_users():
    ...
# Execution order: log_calls → require_auth → app.route
# (innermost decorator wraps first)
```

### Built-in Decorators

```python
class MyClass:
    @staticmethod
    def utility() -> str:
        """No access to instance or class."""
        return "utility"

    @classmethod
    def from_config(cls, config: dict) -> "MyClass":
        """Access to class, not instance."""
        return cls(**config)

    @property
    def full_name(self) -> str:
        """Computed attribute."""
        return f"{self.first} {self.last}"

    @full_name.setter
    def full_name(self, value: str) -> None:
        self.first, self.last = value.split(" ", 1)

# functools decorators
from functools import lru_cache, cached_property

@lru_cache(maxsize=128)
def fibonacci(n: int) -> int:
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
```

---

## 7. Generators

### Generator Functions

```python
def count_up(start: int = 0):
    """Infinite counter."""
    n = start
    while True:
        yield n
        n += 1

def read_chunks(file_path: str, chunk_size: int = 8192):
    """Read file in chunks — memory efficient."""
    with open(file_path, "rb") as f:
        while chunk := f.read(chunk_size):
            yield chunk

# Usage
for chunk in read_chunks("large_file.bin"):
    process(chunk)
```

### Generator Expressions

```python
# Like list comprehension but lazy
squares = (x**2 for x in range(1000000))  # no memory allocation
total = sum(x**2 for x in range(1000000))  # computed on-the-fly
```

### yield from (Delegation)

```python
def flatten(nested):
    """Recursively flatten nested iterables."""
    for item in nested:
        if isinstance(item, (list, tuple)):
            yield from flatten(item)
        else:
            yield item

list(flatten([1, [2, [3, 4]], 5]))  # [1, 2, 3, 4, 5]
```

### Generator as Coroutine (send/throw)

```python
def running_average():
    """Compute running average via send()."""
    total = 0.0
    count = 0
    average = None
    while True:
        value = yield average
        total += value
        count += 1
        average = total / count

avg = running_average()
next(avg)        # prime the generator (returns None)
avg.send(10)     # 10.0
avg.send(20)     # 15.0
avg.send(30)     # 20.0
```

---

## 8. Anti-Patterns

```python
# ✗ Decorator missing functools.wraps
def bad_decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper  # wrapper.__name__ is "wrapper", not func's name

# ✓ Always use @functools.wraps
def good_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

# ✗ Using list() on a generator just to iterate
for item in list(generate_items()):  # defeats the purpose
    process(item)

# ✓ Iterate the generator directly
for item in generate_items():
    process(item)

# ✗ Mutable default argument
def append_to(item, target=[]):
    target.append(item)
    return target

# ✓ Use None sentinel
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target
```
