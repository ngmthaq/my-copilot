---
name: python-file-io
description: "Python file I/O — reading/writing files, pathlib, CSV/JSON/YAML handling, context managers, temporary files, binary I/O, and encoding. Use when: reading/writing files; pathlib; CSV/JSON/YAML handling; context managers; temporary files; binary I/O. DO NOT USE FOR: async file operations (use python-async-programming); database I/O (use appropriate database skill)."
---

# Python File I/O

## 1. pathlib (Modern Path Handling)

```python
from pathlib import Path

# Creating paths
p = Path("src/models/user.py")
p = Path.home() / "projects" / "myapp"
p = Path.cwd() / "data"

# Path parts
p.name          # "user.py"
p.stem          # "user"
p.suffix        # ".py"
p.parent        # Path("src/models")
p.parents[1]    # Path("src")
p.parts         # ("src", "models", "user.py")

# Checking
p.exists()
p.is_file()
p.is_dir()
p.is_symlink()

# Globbing
list(Path("src").glob("*.py"))          # files in src/
list(Path("src").rglob("*.py"))         # recursive
list(Path(".").glob("**/*.test.py"))    # all test files

# Creating
p.mkdir(parents=True, exist_ok=True)    # create directories
p.touch()                                # create empty file

# Resolving
p.resolve()            # absolute path
p.relative_to(base)    # relative path
```

---

## 2. Reading Files

### Text Files

```python
# Read entire file
content = Path("data.txt").read_text(encoding="utf-8")

# Read with open()
with open("data.txt", encoding="utf-8") as f:
    content = f.read()

# Read lines
lines = Path("data.txt").read_text().splitlines()

# Read line by line (memory efficient)
with open("large_file.txt", encoding="utf-8") as f:
    for line in f:
        process(line.strip())

# Read specific number of lines
with open("data.txt", encoding="utf-8") as f:
    first_10 = [next(f) for _ in range(10)]
```

### Binary Files

```python
data = Path("image.png").read_bytes()

with open("image.png", "rb") as f:
    header = f.read(8)
    f.seek(0)
    all_data = f.read()
```

---

## 3. Writing Files

### Text Files

```python
# Write entire content
Path("output.txt").write_text("Hello, World!\n", encoding="utf-8")

# Write with open()
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("line 1\n")
    f.write("line 2\n")

# Append
with open("log.txt", "a", encoding="utf-8") as f:
    f.write(f"[{datetime.now()}] Event occurred\n")

# Write lines
lines = ["line 1", "line 2", "line 3"]
Path("output.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")

# Atomic write (write to temp, then rename)
from tempfile import NamedTemporaryFile

def atomic_write(path: Path, content: str) -> None:
    with NamedTemporaryFile(
        mode="w",
        dir=path.parent,
        delete=False,
        suffix=".tmp",
    ) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)
    tmp_path.rename(path)
```

---

## 4. JSON

```python
import json
from pathlib import Path

# Read JSON
data = json.loads(Path("config.json").read_text())

with open("config.json", encoding="utf-8") as f:
    data = json.load(f)

# Write JSON
Path("output.json").write_text(
    json.dumps(data, indent=2, ensure_ascii=False) + "\n",
    encoding="utf-8",
)

with open("output.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# Custom serialization
class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

json.dumps(data, cls=DateTimeEncoder)
```

---

## 5. CSV

```python
import csv
from pathlib import Path

# Read CSV
with open("data.csv", encoding="utf-8", newline="") as f:
    reader = csv.reader(f)
    header = next(reader)
    rows = list(reader)

# Read CSV as dicts
with open("data.csv", encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["name"], row["email"])

# Write CSV
with open("output.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["name", "email", "role"])
    writer.writerows(data)

# Write CSV from dicts
with open("output.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "email", "role"])
    writer.writeheader()
    writer.writerows(users)
```

---

## 6. YAML

```python
import yaml
from pathlib import Path

# Read YAML
data = yaml.safe_load(Path("config.yaml").read_text())

# Write YAML
Path("output.yaml").write_text(
    yaml.dump(data, default_flow_style=False, allow_unicode=True),
    encoding="utf-8",
)

# Read multiple documents
with open("multi.yaml", encoding="utf-8") as f:
    docs = list(yaml.safe_load_all(f))

# IMPORTANT: Always use safe_load, never yaml.load (security risk)
```

---

## 7. TOML

```python
# Python 3.11+ has built-in tomllib
import tomllib

with open("pyproject.toml", "rb") as f:
    config = tomllib.load(f)

# For writing TOML, use tomli-w
import tomli_w

with open("config.toml", "wb") as f:
    tomli_w.dump(config, f)
```

---

## 8. Temporary Files

```python
import tempfile
from pathlib import Path

# Temporary file (auto-deleted)
with tempfile.NamedTemporaryFile(
    mode="w",
    suffix=".json",
    delete=True,
) as tmp:
    tmp.write('{"key": "value"}')
    tmp.flush()
    process(tmp.name)
# File deleted after with block

# Temporary directory
with tempfile.TemporaryDirectory() as tmpdir:
    tmp_path = Path(tmpdir)
    (tmp_path / "data.txt").write_text("temp data")
    process(tmp_path)
# Directory and contents deleted after with block

# Get temp directory path
tempfile.gettempdir()  # "/tmp" or system equivalent
```

---

## 9. Working with Large Files

```python
# Stream processing (line by line)
def process_large_file(path: str) -> int:
    count = 0
    with open(path, encoding="utf-8") as f:
        for line in f:  # does NOT load entire file
            if "ERROR" in line:
                count += 1
    return count

# Chunked reading (binary)
def copy_file(src: Path, dst: Path, chunk_size: int = 8192) -> None:
    with open(src, "rb") as fin, open(dst, "wb") as fout:
        while chunk := fin.read(chunk_size):
            fout.write(chunk)

# Memory-mapped files (for random access)
import mmap

with open("large_file.bin", "r+b") as f:
    with mmap.mmap(f.fileno(), 0) as mm:
        # Access like a bytearray
        header = mm[:100]
        mm.seek(0)
        idx = mm.find(b"MARKER")
```

---

## 10. Anti-Patterns

```python
# ✗ Not specifying encoding
open("file.txt")  # uses system default, not portable

# ✓ Always specify encoding
open("file.txt", encoding="utf-8")

# ✗ Not using context manager
f = open("file.txt")
data = f.read()
f.close()  # not called if exception occurs!

# ✓ Use with statement
with open("file.txt", encoding="utf-8") as f:
    data = f.read()

# ✗ String path manipulation
path = "src" + "/" + "models" + "/" + "user.py"

# ✓ Use pathlib
path = Path("src") / "models" / "user.py"

# ✗ Using yaml.load (unsafe — allows arbitrary code execution)
data = yaml.load(content)

# ✓ Use yaml.safe_load
data = yaml.safe_load(content)

# ✗ Reading entire large file into memory
data = Path("10gb_file.csv").read_text()

# ✓ Process line by line or in chunks
with open("10gb_file.csv", encoding="utf-8") as f:
    for line in f:
        process(line)
```
