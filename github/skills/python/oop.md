---
name: python-oop
description: "Python object-oriented programming — classes, inheritance, dataclasses, abstract base classes, dunder methods, descriptors, metaclasses, mixins, and composition. Use when: designing classes; inheritance; dataclasses; abstract base classes; dunder methods; descriptors; metaclasses. DO NOT USE FOR: functions/decorators (use python-functions); type annotations (use python-type-hints)."
---

# Python Object-Oriented Programming

## 1. Classes

### Basic Class

```python
class User:
    """Represents an application user."""

    def __init__(self, name: str, email: str) -> None:
        self.name = name
        self.email = email
        self._login_count = 0  # private by convention

    def login(self) -> None:
        self._login_count += 1

    def __repr__(self) -> str:
        return f"User(name={self.name!r}, email={self.email!r})"

    def __str__(self) -> str:
        return f"{self.name} <{self.email}>"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, User):
            return NotImplemented
        return self.email == other.email

    def __hash__(self) -> int:
        return hash(self.email)
```

### Class and Static Methods

```python
class Temperature:
    def __init__(self, celsius: float) -> None:
        self.celsius = celsius

    @classmethod
    def from_fahrenheit(cls, f: float) -> "Temperature":
        """Alternate constructor from Fahrenheit."""
        return cls((f - 32) * 5 / 9)

    @staticmethod
    def is_boiling(celsius: float) -> bool:
        """Pure utility — no access to instance or class."""
        return celsius >= 100
```

### Properties

```python
class Circle:
    def __init__(self, radius: float) -> None:
        self._radius = radius

    @property
    def radius(self) -> float:
        return self._radius

    @radius.setter
    def radius(self, value: float) -> None:
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value

    @property
    def area(self) -> float:
        """Computed property — read-only."""
        return 3.14159 * self._radius ** 2
```

---

## 2. Inheritance

```python
class Animal:
    def __init__(self, name: str) -> None:
        self.name = name

    def speak(self) -> str:
        raise NotImplementedError

class Dog(Animal):
    def speak(self) -> str:
        return f"{self.name} says Woof!"

class Cat(Animal):
    def speak(self) -> str:
        return f"{self.name} says Meow!"
```

### Multiple Inheritance and MRO

```python
class A:
    def method(self) -> str:
        return "A"

class B(A):
    def method(self) -> str:
        return "B"

class C(A):
    def method(self) -> str:
        return "C"

class D(B, C):
    pass

D().method()   # "B" — follows MRO: D → B → C → A
D.__mro__      # (D, B, C, A, object)

# Use super() to cooperate with MRO
class B(A):
    def method(self) -> str:
        result = super().method()  # calls C.method, not A.method
        return f"B + {result}"
```

### Mixins

```python
class JsonMixin:
    """Mixin that adds JSON serialization."""

    def to_json(self) -> str:
        import json
        return json.dumps(self.__dict__)

class TimestampMixin:
    """Mixin that adds created_at timestamp."""

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.created_at = datetime.now()

class User(TimestampMixin, JsonMixin):
    def __init__(self, name: str) -> None:
        super().__init__()
        self.name = name
```

---

## 3. Abstract Base Classes

```python
from abc import ABC, abstractmethod

class Repository(ABC):
    """Interface for data repositories."""

    @abstractmethod
    def get(self, id: int) -> dict:
        ...

    @abstractmethod
    def save(self, entity: dict) -> None:
        ...

    def get_or_none(self, id: int) -> dict | None:
        """Concrete method with default implementation."""
        try:
            return self.get(id)
        except KeyError:
            return None

class PostgresRepository(Repository):
    def get(self, id: int) -> dict:
        return self.db.query(id)

    def save(self, entity: dict) -> None:
        self.db.insert(entity)

# Cannot instantiate ABC directly
Repository()  # TypeError: Can't instantiate abstract class
```

---

## 4. Dataclasses

```python
from dataclasses import dataclass, field

@dataclass
class Point:
    x: float
    y: float

# Automatic __init__, __repr__, __eq__
p = Point(1.0, 2.0)
print(p)  # Point(x=1.0, y=2.0)

@dataclass
class User:
    name: str
    email: str
    role: str = "viewer"
    tags: list[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        """Runs after __init__ for validation."""
        self.email = self.email.lower()

# Frozen (immutable) dataclass
@dataclass(frozen=True)
class Config:
    host: str
    port: int = 8080

# Can be used as dict key / set member
config = Config("localhost", 3000)

# Slots for memory efficiency (3.10+)
@dataclass(slots=True)
class Coordinate:
    x: float
    y: float
    z: float

# Ordering
@dataclass(order=True)
class Priority:
    level: int
    name: str = field(compare=False)  # excluded from comparison
```

---

## 5. Dunder (Magic) Methods

### Essential Dunders

```python
class Vector:
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

    # String representation
    def __repr__(self) -> str:         # for developers / debugging
        return f"Vector({self.x}, {self.y})"

    def __str__(self) -> str:          # for end users
        return f"({self.x}, {self.y})"

    # Comparison
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Vector):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __lt__(self, other: "Vector") -> bool:
        return abs(self) < abs(other)

    # Arithmetic
    def __add__(self, other: "Vector") -> "Vector":
        return Vector(self.x + other.x, self.y + other.y)

    def __mul__(self, scalar: float) -> "Vector":
        return Vector(self.x * scalar, self.y * scalar)

    def __rmul__(self, scalar: float) -> "Vector":
        return self.__mul__(scalar)

    def __abs__(self) -> float:
        return (self.x**2 + self.y**2) ** 0.5

    # Container protocol
    def __len__(self) -> int:
        return 2

    def __getitem__(self, index: int) -> float:
        return (self.x, self.y)[index]

    def __iter__(self):
        yield self.x
        yield self.y

    # Boolean
    def __bool__(self) -> bool:
        return abs(self) > 0

    # Context manager protocol
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.cleanup()
        return False  # don't suppress exceptions
```

### Callable Objects

```python
class Validator:
    """Callable that validates input against rules."""

    def __init__(self, min_val: float, max_val: float) -> None:
        self.min_val = min_val
        self.max_val = max_val

    def __call__(self, value: float) -> bool:
        return self.min_val <= value <= self.max_val

validate_score = Validator(0, 100)
validate_score(85)   # True
validate_score(150)  # False
```

---

## 6. Slots

```python
class Point:
    __slots__ = ("x", "y")

    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

# Benefits:
# - ~30% less memory per instance
# - Slightly faster attribute access
# - Prevents accidental attribute creation

p = Point(1, 2)
p.z = 3  # AttributeError — not in __slots__
```

---

## 7. Descriptors

```python
class Positive:
    """Descriptor that enforces positive values."""

    def __set_name__(self, owner, name):
        self.name = name
        self.storage_name = f"_{name}"

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.storage_name, None)

    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError(f"{self.name} must be positive, got {value}")
        setattr(obj, self.storage_name, value)

class Product:
    price = Positive()
    quantity = Positive()

    def __init__(self, name: str, price: float, quantity: int) -> None:
        self.name = name
        self.price = price         # uses Positive.__set__
        self.quantity = quantity   # uses Positive.__set__
```

---

## 8. Composition over Inheritance

```python
# ✗ Deep inheritance — fragile, hard to change
class Animal:
    ...
class Mammal(Animal):
    ...
class DomesticMammal(Mammal):
    ...
class Dog(DomesticMammal):
    ...

# ✓ Composition — flexible, testable
class Engine:
    def start(self) -> None: ...

class GPS:
    def navigate(self, destination: str) -> None: ...

class Car:
    def __init__(self, engine: Engine, gps: GPS) -> None:
        self.engine = engine
        self.gps = gps

    def drive(self, destination: str) -> None:
        self.engine.start()
        self.gps.navigate(destination)
```

---

## 9. Anti-Patterns

```python
# ✗ Deep inheritance hierarchies (> 3 levels)
# Use composition or mixins instead

# ✗ Overusing properties for complex logic
@property
def data(self):
    return self.db.query(...)  # surprising side effect

# ✓ Use a method when there are side effects
def fetch_data(self):
    return self.db.query(...)

# ✗ Forgetting NotImplemented in __eq__
def __eq__(self, other):
    return self.x == other.x  # crashes if other is wrong type

# ✓ Return NotImplemented for type mismatches
def __eq__(self, other):
    if not isinstance(other, MyClass):
        return NotImplemented
    return self.x == other.x

# ✗ God class — one class does everything
class Application:
    def handle_request(self): ...
    def connect_db(self): ...
    def send_email(self): ...
    def generate_report(self): ...

# ✓ Single responsibility — split into focused classes
class RequestHandler: ...
class DatabaseConnection: ...
class EmailService: ...
class ReportGenerator: ...
```
