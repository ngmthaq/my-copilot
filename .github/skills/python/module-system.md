---
name: python-module-system
description: "Python module system — imports, packages, virtual environments, dependency management, pyproject.toml, publishing packages, and project structure. Use when: structuring packages; import system; virtual environments; dependency management with pip/uv/poetry; publishing packages. DO NOT USE FOR: code organization patterns (use python-convention); specific library usage."
---

# Python Module System

## 1. Imports

### Import Styles

```python
# Import module
import os
import json

# Import specific names
from pathlib import Path
from datetime import datetime, timedelta

# Import with alias
import numpy as np
import pandas as pd
from collections import defaultdict as dd

# Relative imports (within a package)
from . import utils              # same package
from .models import User         # same package
from ..config import settings    # parent package
```

### Import Order (PEP 8)

```python
# 1. Standard library
import os
import sys
from pathlib import Path

# 2. Third-party
import httpx
from pydantic import BaseModel

# 3. Local/project
from myapp.models import User
from myapp.services import UserService
```

### Conditional and Lazy Imports

```python
# Conditional import
try:
    import ujson as json
except ImportError:
    import json

# Type-checking only imports (avoid circular imports)
from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from myapp.models import User

# Lazy import for expensive modules
def process_image(path: str):
    from PIL import Image  # imported only when function is called
    return Image.open(path)
```

---

## 2. Packages

### Package Structure

```
my_package/
├── __init__.py          # makes it a package
├── core.py
├── utils.py
├── models/
│   ├── __init__.py
│   ├── user.py
│   └── product.py
└── services/
    ├── __init__.py
    ├── auth.py
    └── payment.py
```

### `__init__.py`

```python
# my_package/__init__.py

# Re-export public API
from mypackage.core import App
from mypackage.models.user import User
from mypackage.models.product import Product

__all__ = ["App", "User", "Product"]

# Version
__version__ = "1.0.0"
```

### `__all__` — Control `from package import *`

```python
# Only these names are exported with wildcard import
__all__ = ["User", "create_user", "UserRole"]
```

### `__main__.py` — Runnable Package

```python
# my_package/__main__.py
"""Allow running with: python -m my_package"""

from mypackage.cli import main

if __name__ == "__main__":
    main()
```

---

## 3. Virtual Environments

### Creating and Using

```bash
# Create with venv (standard library)
python -m venv .venv

# Activate
source .venv/bin/activate        # macOS/Linux
.venv\Scripts\activate           # Windows

# Deactivate
deactivate

# Create with uv (fast alternative)
uv venv
source .venv/bin/activate
```

### Best Practices

- Always use a virtual environment per project
- Add `.venv/` to `.gitignore`
- Use `python -m pip` instead of bare `pip` to ensure correct environment
- Pin dependency versions for reproducibility

---

## 4. Dependency Management

### pyproject.toml (Modern Standard)

```toml
[project]
name = "my-package"
version = "1.0.0"
description = "My awesome package"
requires-python = ">=3.12"
dependencies = [
    "httpx>=0.27",
    "pydantic>=2.0,<3.0",
    "sqlalchemy>=2.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "ruff>=0.5",
    "mypy>=1.10",
]
docs = [
    "mkdocs>=1.6",
    "mkdocs-material>=9.5",
]

[project.scripts]
my-cli = "my_package.cli:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

### pip

```bash
# Install from pyproject.toml
pip install .
pip install ".[dev]"          # with dev extras
pip install -e ".[dev]"       # editable install

# Requirements file
pip install -r requirements.txt
pip freeze > requirements.txt

# Specific version constraints
pip install "package>=1.0,<2.0"
```

### uv (Fast Modern Tool)

```bash
# Install dependencies
uv pip install .
uv pip install ".[dev]"

# Lock dependencies
uv pip compile pyproject.toml -o requirements.lock
uv pip sync requirements.lock

# Run scripts
uv run python -m my_package
uv run pytest
```

### Poetry

```bash
# Initialize
poetry init

# Add dependencies
poetry add httpx
poetry add --group dev pytest ruff

# Install
poetry install

# Lock
poetry lock

# Run
poetry run python -m my_package
```

---

## 5. Module Resolution

Python searches for modules in this order:

1. `sys.modules` cache
2. Built-in modules
3. `sys.path` entries:
   - Script directory (or current directory)
   - `PYTHONPATH` environment variable
   - Site-packages (installed packages)

```python
import sys

# View search path
print(sys.path)

# Add to search path (rarely needed)
sys.path.insert(0, "/path/to/my/modules")
```

---

## 6. Namespace Packages (PEP 420)

```python
# No __init__.py needed — implicit namespace package
# Useful for splitting a package across multiple directories

# Directory A:
#   my_namespace/
#     module_a.py

# Directory B:
#   my_namespace/
#     module_b.py

# Both contribute to my_namespace
import my_namespace.module_a
import my_namespace.module_b
```

---

## 7. Publishing Packages

### Build and Publish

```bash
# Build
python -m build

# Upload to PyPI
python -m twine upload dist/*

# Upload to TestPyPI first
python -m twine upload --repository testpypi dist/*
```

### Package Checklist

- [ ] `pyproject.toml` with metadata
- [ ] `README.md` with description and usage
- [ ] `LICENSE` file
- [ ] `src/` layout for clean imports
- [ ] Tests passing
- [ ] Type hints (py.typed marker)
- [ ] Changelog

---

## 8. Anti-Patterns

```python
# ✗ Wildcard imports
from os import *           # pollutes namespace
from mypackage.utils import *

# ✓ Explicit imports
from os import path, getcwd
from mypackage.utils import slugify, truncate

# ✗ Circular imports at module level
# a.py
from b import func_b  # fails if b imports from a

# ✓ Move import inside function or use TYPE_CHECKING
def my_func():
    from b import func_b
    return func_b()

# ✗ Modifying sys.path in application code
sys.path.append("../other_project")  # fragile, not portable

# ✓ Use proper packaging (pip install -e .)

# ✗ Hardcoded paths for package resources
data_file = "/home/user/mypackage/data/config.json"

# ✓ Use importlib.resources
from importlib.resources import files
data_file = files("mypackage.data").joinpath("config.json")
```
