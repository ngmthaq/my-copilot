---
name: python-convention
description: "Python coding convention — covers PEP 8 formatting rules, Black/Ruff configuration, naming conventions, import organization, docstring conventions, type annotation style, and project layout. Use when: formatting or refactoring Python code; reviewing for PEP 8 consistency; setting up Black/Ruff/isort; applying naming conventions; organizing imports. DO NOT USE FOR: type system details (use python-type-hints); testing conventions (use python-testing)."
---

# Python Convention

This is the **base convention** for all Python projects. Follow PEP 8 as the foundation with modern tooling (Black, Ruff) for enforcement.

## When to Use

- Formatting or refactoring Python code
- Reviewing a PR or file for style consistency
- Setting up Black, Ruff, or isort configuration
- Applying naming conventions to variables, functions, classes, or files
- Organizing and sorting import statements
- Deciding on project structure and layout

---

## 1. General Formatting Rules

| Rule                 | Value                                               |
| -------------------- | --------------------------------------------------- |
| Indentation          | 4 spaces (no tabs)                                  |
| Max line length      | 88 characters (Black default) or 120 (configurable) |
| Quotes               | Double quotes (`"`) preferred (Black default)       |
| Trailing commas      | Always in multi-line structures                     |
| Blank lines          | 2 between top-level definitions, 1 between methods  |
| End of file          | Single newline                                      |
| Line endings         | LF (`\n`)                                           |
| String concatenation | f-strings preferred over `%` or `.format()`         |

---

## 2. Black Configuration

Use `pyproject.toml` at the project root:

```toml
[tool.black]
line-length = 88
target-version = ["py312"]
```

---

## 3. Ruff Configuration

```toml
[tool.ruff]
line-length = 88
target-version = "py312"

[tool.ruff.lint]
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "N",   # pep8-naming
    "UP",  # pyupgrade
    "B",   # flake8-bugbear
    "SIM", # flake8-simplify
    "C4",  # flake8-comprehensions
    "RUF", # ruff-specific rules
]
ignore = ["E501"]  # line length handled by Black

[tool.ruff.lint.isort]
known-first-party = ["mypackage"]
```

---

## 4. Naming Conventions

| Element              | Convention            | Example                           |
| -------------------- | --------------------- | --------------------------------- |
| Variables            | `snake_case`          | `user_count`, `is_active`         |
| Functions            | `snake_case`          | `get_user()`, `calculate_total()` |
| Classes              | `PascalCase`          | `UserService`, `HttpClient`       |
| Constants            | `UPPER_SNAKE_CASE`    | `MAX_RETRIES`, `BASE_URL`         |
| Modules/Files        | `snake_case`          | `user_service.py`, `utils.py`     |
| Packages/Directories | `snake_case`          | `my_package/`, `data_models/`     |
| Private              | `_leading_underscore` | `_internal_cache`, `_helper()`    |
| Name-mangled         | `__double_leading`    | `__secret` (use sparingly)        |
| Dunder/Magic         | `__double_both__`     | `__init__`, `__repr__`            |
| Type variables       | `PascalCase`          | `T`, `KeyType`, `ResponseT`       |

### Naming Anti-Patterns

```python
# BAD — single letter or ambiguous names
d = get_data()
temp = process(d)
x = temp.result

# GOOD — descriptive names
user_response = fetch_user_profile()
validated_data = validate_response(user_response)
profile_name = validated_data.name
```

---

## 5. Import Organization

Imports follow this order with blank lines between groups:

```python
# 1. Standard library
import os
import sys
from datetime import datetime
from pathlib import Path

# 2. Third-party packages
import httpx
from fastapi import FastAPI, Depends
from pydantic import BaseModel

# 3. Local/project imports
from mypackage.models import User
from mypackage.services import UserService
```

### Import Rules

- One import per line for `import x` style
- Group `from x import y, z` is allowed
- Absolute imports preferred over relative
- Use `from __future__ import annotations` for deferred type evaluation
- Never use `from module import *` (wildcard imports)
- isort or Ruff handles sorting automatically

---

## 6. Docstring Conventions (PEP 257 + Google Style)

### Module Docstring

```python
"""User authentication and session management.

Provides token-based authentication with JWT, session
management, and role-based access control.
"""
```

### Function/Method Docstring

```python
def create_user(name: str, email: str, role: str = "viewer") -> User:
    """Create a new user with the given details.

    Args:
        name: Full name of the user.
        email: Email address (must be unique).
        role: User role. Defaults to "viewer".

    Returns:
        The newly created User object.

    Raises:
        ValueError: If email is already registered.
        ValidationError: If name or email format is invalid.
    """
```

### Class Docstring

```python
class UserService:
    """Manages user CRUD operations and authentication.

    Attributes:
        db: Database session for queries.
        cache: Optional Redis cache for session data.
    """
```

### When to Write Docstrings

- **Always**: Public modules, classes, functions, methods
- **Skip**: Private helpers where the name + type hints are self-explanatory
- **Skip**: Simple `__init__` if class docstring covers attributes

---

## 7. Code Style Patterns

### Conditional Expressions

```python
# Ternary — use for simple conditions
status = "active" if user.is_verified else "pending"

# Guard clauses — prefer early returns over deep nesting
def process_order(order: Order) -> Receipt:
    if not order.items:
        raise ValueError("Order has no items")
    if order.is_cancelled:
        raise OrderCancelledError(order.id)
    # Main logic at base indentation
    return calculate_receipt(order)
```

### String Formatting

```python
# PREFERRED — f-strings (Python 3.6+)
message = f"Hello, {user.name}! You have {count} notifications."

# OK for complex expressions — .format()
template = "Error {code}: {message}".format(code=err.code, message=err.msg)

# AVOID — % formatting
message = "Hello, %s" % name  # legacy style
```

### Comparisons

```python
# Identity checks
if value is None:       # ✓  use `is` for None
if value is not None:   # ✓

# Boolean checks
if is_active:           # ✓  don't compare to True/False
if not is_deleted:      # ✓

# Empty collection checks
if not items:           # ✓  pythonic emptiness check
if len(items) == 0:     # ✗  verbose

# Type checks
if isinstance(value, str):          # ✓
if type(value) is str:              # ✗  doesn't support inheritance
```

---

## 8. Project Layout

### Single Package

```
my-project/
├── pyproject.toml
├── README.md
├── src/
│   └── my_package/
│       ├── __init__.py
│       ├── main.py
│       ├── models.py
│       ├── services.py
│       └── utils.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_models.py
│   └── test_services.py
└── .venv/
```

### Application (FastAPI/Django)

```
my-app/
├── pyproject.toml
├── src/
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       ├── config.py
│       ├── api/
│       │   ├── __init__.py
│       │   ├── routes/
│       │   └── dependencies.py
│       ├── models/
│       ├── services/
│       ├── schemas/
│       └── utils/
├── tests/
├── migrations/
└── docker/
```

---

## 9. Anti-Patterns

```python
# ✗ Mutable default arguments
def add_item(item, items=[]):  # shared across all calls!
    items.append(item)
    return items

# ✓ Use None sentinel
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

# ✗ Bare except
try:
    risky_operation()
except:  # catches SystemExit, KeyboardInterrupt, etc.
    pass

# ✓ Specific exceptions
try:
    risky_operation()
except (ValueError, KeyError) as exc:
    logger.error("Operation failed: %s", exc)

# ✗ Using type() for comparison
if type(x) == int:
    pass

# ✓ Using isinstance
if isinstance(x, int):
    pass
```
