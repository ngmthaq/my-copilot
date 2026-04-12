---
name: python-type-hints
description: "Python type hints — type annotations, mypy, Protocol, TypeVar, generics, Union, Optional, TypeAlias, runtime type checking, and typing best practices. Use when: adding type annotations; using mypy; Protocol; TypeVar; generics; runtime type checking; configuring mypy. DO NOT USE FOR: dataclass design (use python-oop); general Python syntax (use python-core-fundamentals)."
---

# Python Type Hints

## 1. Basic Annotations

```python
from __future__ import annotations

# Variables
name: str = "Alice"
age: int = 30
active: bool = True
score: float = 95.5

# Function signatures
def greet(name: str, times: int = 1) -> str:
    return f"Hello, {name}! " * times

# None return
def log(message: str) -> None:
    print(message)
```

---

## 2. Collection Types

```python
# Modern syntax (Python 3.9+)
names: list[str] = ["Alice", "Bob"]
scores: dict[str, int] = {"Alice": 95, "Bob": 87}
unique: set[str] = {"a", "b", "c"}
pair: tuple[int, str] = (1, "hello")
coords: tuple[float, ...] = (1.0, 2.0, 3.0)  # variable-length

# Nested collections
matrix: list[list[int]] = [[1, 2], [3, 4]]
registry: dict[str, list[tuple[int, str]]] = {}
```

---

## 3. Union, Optional, and None

```python
# Union (Python 3.10+ syntax)
def parse(value: str | int) -> str:
    return str(value)

# Optional (shorthand for X | None)
def find_user(user_id: int) -> User | None:
    ...

# Older syntax (still valid)
from typing import Union, Optional

value: Union[str, int] = "hello"
result: Optional[str] = None  # same as str | None
```

---

## 4. TypeAlias

```python
from typing import TypeAlias

# Simple alias
UserId: TypeAlias = int
Headers: TypeAlias = dict[str, str]
Callback: TypeAlias = Callable[[str, int], bool]

# Complex alias
JsonValue: TypeAlias = str | int | float | bool | None | list["JsonValue"] | dict[str, "JsonValue"]

def parse_json(raw: str) -> JsonValue:
    ...
```

---

## 5. Callable

```python
from collections.abc import Callable

# Function that takes (str, int) and returns bool
validator: Callable[[str, int], bool]

# Function with no arguments returning None
callback: Callable[[], None]

# Any callable signature
handler: Callable[..., str]

# Usage in function signatures
def apply(func: Callable[[int], int], values: list[int]) -> list[int]:
    return [func(v) for v in values]
```

---

## 6. Generics

### TypeVar

```python
from typing import TypeVar

T = TypeVar("T")

def first(items: list[T]) -> T:
    return items[0]

# Bounded TypeVar
Numeric = TypeVar("Numeric", int, float)

def add(a: Numeric, b: Numeric) -> Numeric:
    return a + b

# Bound TypeVar
from typing import TypeVar

T = TypeVar("T", bound="Comparable")

def max_item(items: list[T]) -> T:
    return max(items)
```

### Generic Classes (Python 3.12+)

```python
# Python 3.12+ syntax
class Stack[T]:
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

# Pre-3.12 syntax
from typing import Generic, TypeVar

T = TypeVar("T")

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

# Usage
stack: Stack[int] = Stack()
stack.push(1)
```

### Generic Functions (Python 3.12+)

```python
# Python 3.12+ syntax
def first[T](items: list[T]) -> T:
    return items[0]

def pair[K, V](key: K, value: V) -> dict[K, V]:
    return {key: value}
```

---

## 7. Protocol (Structural Subtyping)

```python
from typing import Protocol

class Drawable(Protocol):
    def draw(self, x: int, y: int) -> None:
        ...

class Circle:
    def draw(self, x: int, y: int) -> None:
        print(f"Drawing circle at ({x}, {y})")

class Square:
    def draw(self, x: int, y: int) -> None:
        print(f"Drawing square at ({x}, {y})")

def render(shape: Drawable) -> None:
    shape.draw(0, 0)

# Circle and Square satisfy Drawable without inheriting from it
render(Circle())  # ✓
render(Square())  # ✓

# Runtime checking
class SupportsLen(Protocol):
    def __len__(self) -> int: ...

def print_length(obj: SupportsLen) -> None:
    print(len(obj))
```

---

## 8. Special Types

```python
from typing import (
    Any,
    ClassVar,
    Final,
    Literal,
    Never,
    Self,
    TypeGuard,
    Annotated,
)

# Any — opt out of type checking
def process(data: Any) -> Any: ...

# Literal — specific values only
def set_mode(mode: Literal["read", "write", "append"]) -> None: ...

# Final — cannot be reassigned
MAX_RETRIES: Final = 3

# ClassVar — class-level, not instance
class User:
    table_name: ClassVar[str] = "users"
    name: str

# Self (Python 3.11+) — return type matching the class
class Builder:
    def set_name(self, name: str) -> Self:
        self.name = name
        return self

# Never — function never returns
def fatal_error(msg: str) -> Never:
    raise SystemExit(msg)

# TypeGuard — narrow types in if blocks
def is_string_list(val: list[object]) -> TypeGuard[list[str]]:
    return all(isinstance(x, str) for x in val)

# Annotated — attach metadata
from annotated_types import Gt
UserId = Annotated[int, Gt(0)]
```

---

## 9. mypy Configuration

```toml
# pyproject.toml
[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_any_generics = true
check_untyped_defs = true
no_implicit_reexport = true

# Per-module overrides
[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false

[[tool.mypy.overrides]]
module = "third_party_lib.*"
ignore_missing_imports = true
```

### Running mypy

```bash
mypy src/
mypy src/ --strict
mypy src/ --show-error-codes
```

---

## 10. Anti-Patterns

```python
# ✗ Using Any everywhere
def process(data: Any) -> Any:  # defeats the purpose

# ✓ Use proper types
def process(data: UserInput) -> ProcessedResult:

# ✗ Optional without handling None
def get_name(user: User | None) -> str:
    return user.name  # mypy error: user could be None

# ✓ Handle the None case
def get_name(user: User | None) -> str:
    if user is None:
        return "Anonymous"
    return user.name

# ✗ Ignoring mypy errors without justification
result = some_call()  # type: ignore

# ✓ Specific ignore with explanation
result = some_call()  # type: ignore[no-untyped-call]  # third-party lib

# ✗ Using old-style typing when Python 3.9+ is available
from typing import List, Dict, Tuple, Optional

# ✓ Use built-in generics
items: list[str]
mapping: dict[str, int]
pair: tuple[int, str]
maybe: str | None
```
