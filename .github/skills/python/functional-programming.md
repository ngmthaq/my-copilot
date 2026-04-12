---
name: python-functional-programming
description: "Python functional programming — map, filter, reduce, itertools, functools, comprehensions, immutable patterns, higher-order functions, partial application, and composition. Use when: using map/filter/reduce; itertools; functools; comprehensions as functional patterns; immutable patterns; higher-order functions. DO NOT USE FOR: generator details (use python-functions); data structure selection (use python-data-structures)."
---

# Python Functional Programming

## 1. Higher-Order Functions

```python
# Functions that take or return functions
def apply(func, value):
    return func(value)

apply(str.upper, "hello")  # "HELLO"
apply(len, [1, 2, 3])      # 3

# Returning functions
def multiplier(factor):
    def multiply(x):
        return x * factor
    return multiply

double = multiplier(2)
double(5)  # 10
```

---

## 2. map, filter, reduce

### map

```python
# Transform each element
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))  # [1, 4, 9, 16, 25]

# Multiple iterables
sums = list(map(lambda a, b: a + b, [1, 2, 3], [10, 20, 30]))  # [11, 22, 33]

# Prefer comprehension for readability
squared = [x**2 for x in numbers]
```

### filter

```python
# Keep elements that satisfy predicate
evens = list(filter(lambda x: x % 2 == 0, numbers))  # [2, 4]

# Prefer comprehension
evens = [x for x in numbers if x % 2 == 0]
```

### reduce

```python
from functools import reduce

# Accumulate values
total = reduce(lambda acc, x: acc + x, numbers)  # 15
product = reduce(lambda acc, x: acc * x, numbers, 1)

# With initial value
result = reduce(lambda acc, x: acc + [x * 2], numbers, [])

# Prefer built-ins when available
total = sum(numbers)
maximum = max(numbers)
```

---

## 3. functools

### partial — Fix Arguments

```python
from functools import partial

def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)
cube = partial(power, exponent=3)

square(5)  # 25
cube(3)    # 27

# Practical example
import json
pretty_json = partial(json.dumps, indent=2, ensure_ascii=False)
print(pretty_json({"name": "Alice"}))
```

### lru_cache — Memoization

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n: int) -> int:
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

fibonacci(100)  # instant after first computation
fibonacci.cache_info()  # CacheInfo(hits=98, misses=101, ...)
fibonacci.cache_clear()
```

### cached_property

```python
from functools import cached_property

class DataAnalyzer:
    def __init__(self, data: list[float]) -> None:
        self._data = data

    @cached_property
    def mean(self) -> float:
        """Computed once, then cached."""
        return sum(self._data) / len(self._data)

    @cached_property
    def std_dev(self) -> float:
        avg = self.mean
        return (sum((x - avg) ** 2 for x in self._data) / len(self._data)) ** 0.5
```

### singledispatch — Function Overloading

```python
from functools import singledispatch

@singledispatch
def serialize(value) -> str:
    raise TypeError(f"Cannot serialize {type(value)}")

@serialize.register
def _(value: str) -> str:
    return f'"{value}"'

@serialize.register
def _(value: int) -> str:
    return str(value)

@serialize.register
def _(value: list) -> str:
    items = ", ".join(serialize(item) for item in value)
    return f"[{items}]"

serialize("hello")    # '"hello"'
serialize(42)         # '42'
serialize([1, "a"])   # '[1, "a"]'
```

### reduce — Complex Accumulation

```python
from functools import reduce

# Flatten nested lists
nested = [[1, 2], [3, 4], [5, 6]]
flat = reduce(lambda acc, x: acc + x, nested)  # [1, 2, 3, 4, 5, 6]

# Better: use itertools.chain
from itertools import chain
flat = list(chain.from_iterable(nested))
```

---

## 4. itertools

### Infinite Iterators

```python
from itertools import count, cycle, repeat

# count — infinite sequence
for i in count(start=10, step=2):
    if i > 20:
        break
    print(i)  # 10, 12, 14, 16, 18, 20

# cycle — repeat an iterable forever
colors = cycle(["red", "green", "blue"])
[next(colors) for _ in range(5)]  # ["red", "green", "blue", "red", "green"]

# repeat — same value n times
list(repeat("hello", 3))  # ["hello", "hello", "hello"]
```

### Combinatoric Iterators

```python
from itertools import product, permutations, combinations, combinations_with_replacement

# product — cartesian product
list(product("AB", "12"))
# [('A','1'), ('A','2'), ('B','1'), ('B','2')]

# permutations
list(permutations("ABC", 2))
# [('A','B'), ('A','C'), ('B','A'), ('B','C'), ('C','A'), ('C','B')]

# combinations
list(combinations("ABC", 2))
# [('A','B'), ('A','C'), ('B','C')]

# combinations_with_replacement
list(combinations_with_replacement("AB", 2))
# [('A','A'), ('A','B'), ('B','B')]
```

### Transforming Iterators

```python
from itertools import chain, islice, starmap, takewhile, dropwhile, groupby, accumulate, batched

# chain — flatten one level
list(chain([1, 2], [3, 4], [5]))  # [1, 2, 3, 4, 5]
list(chain.from_iterable([[1, 2], [3, 4]]))  # [1, 2, 3, 4]

# islice — slice an iterator
list(islice(count(), 5, 10))  # [5, 6, 7, 8, 9]

# starmap — apply function with unpacked arguments
list(starmap(pow, [(2, 3), (3, 2), (10, 3)]))  # [8, 9, 1000]

# takewhile / dropwhile
list(takewhile(lambda x: x < 5, [1, 3, 5, 2, 1]))  # [1, 3]
list(dropwhile(lambda x: x < 5, [1, 3, 5, 2, 1]))  # [5, 2, 1]

# groupby (requires sorted input for contiguous groups)
data = sorted(users, key=lambda u: u["role"])
for role, group in groupby(data, key=lambda u: u["role"]):
    print(f"{role}: {list(group)}")

# accumulate — running totals
list(accumulate([1, 2, 3, 4]))  # [1, 3, 6, 10]
list(accumulate([1, 2, 3, 4], lambda a, b: a * b))  # [1, 2, 6, 24]

# batched (Python 3.12+)
list(batched(range(10), 3))  # [(0,1,2), (3,4,5), (6,7,8), (9,)]
```

---

## 5. Comprehension Patterns

```python
# Filtering + transforming
results = [process(x) for x in items if x.is_valid()]

# Flattening
flat = [item for sublist in nested for item in sublist]

# Dict inversion
inverted = {v: k for k, v in original.items()}

# Conditional expression in comprehension
labels = ["even" if x % 2 == 0 else "odd" for x in range(10)]

# Nested with guard
valid_pairs = [
    (x, y)
    for x in range(10)
    for y in range(10)
    if x + y == 10
]
```

---

## 6. Immutable Patterns

```python
# Frozen dataclass
from dataclasses import dataclass

@dataclass(frozen=True)
class Point:
    x: float
    y: float

    def moved(self, dx: float, dy: float) -> "Point":
        """Return new point instead of modifying."""
        return Point(self.x + dx, self.y + dy)

# Named tuples (inherently immutable)
from typing import NamedTuple

class Config(NamedTuple):
    host: str
    port: int
    debug: bool = False

# frozenset
allowed_roles = frozenset({"admin", "editor", "viewer"})

# Tuple instead of list for fixed collections
DIRECTIONS = ("north", "south", "east", "west")
```

---

## 7. Function Composition

```python
from functools import reduce

def compose(*functions):
    """Compose functions right to left: compose(f, g)(x) = f(g(x))."""
    def inner(arg):
        return reduce(lambda acc, fn: fn(acc), reversed(functions), arg)
    return inner

def pipe(*functions):
    """Pipe functions left to right: pipe(f, g)(x) = g(f(x))."""
    def inner(arg):
        return reduce(lambda acc, fn: fn(acc), functions, arg)
    return inner

# Usage
process = pipe(
    str.strip,
    str.lower,
    lambda s: s.replace(" ", "_"),
)

process("  Hello World  ")  # "hello_world"
```

---

## 8. Anti-Patterns

```python
# ✗ Complex lambda — use a named function
transform = lambda x: x.strip().lower().replace(" ", "_") if x else ""

# ✓ Named function
def normalize(value: str) -> str:
    if not value:
        return ""
    return value.strip().lower().replace(" ", "_")

# ✗ Overusing map/filter when comprehension is clearer
result = list(map(lambda x: x * 2, filter(lambda x: x > 0, numbers)))

# ✓ Comprehension
result = [x * 2 for x in numbers if x > 0]

# ✗ reduce for simple operations
total = reduce(lambda a, b: a + b, numbers)

# ✓ Use built-in
total = sum(numbers)

# ✗ Nested comprehension that's hard to read
result = [f(x, y, z) for x in a for y in b if p(x, y) for z in c if q(y, z)]

# ✓ Use explicit loops for complex logic
result = []
for x in a:
    for y in b:
        if p(x, y):
            for z in c:
                if q(y, z):
                    result.append(f(x, y, z))
```
