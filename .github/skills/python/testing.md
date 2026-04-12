---
name: python-testing
description: "Python testing — pytest, fixtures, mocking, parametrize, coverage, test organization, markers, conftest, and testing best practices. Use when: writing tests with pytest; fixtures; mocking; parametrize; coverage; test organization; choosing test strategies. DO NOT USE FOR: debugging runtime errors (use debugger); type checking (use python-type-hints)."
---

# Python Testing

## 1. pytest Basics

### Test Structure

```python
# tests/test_user_service.py
from myapp.services import UserService

def test_create_user():
    """Test names should describe the expected behavior."""
    service = UserService()
    user = service.create("Alice", "alice@example.com")

    assert user.name == "Alice"
    assert user.email == "alice@example.com"
    assert user.is_active is True

def test_create_user_raises_on_duplicate_email():
    service = UserService()
    service.create("Alice", "alice@example.com")

    with pytest.raises(ValueError, match="already registered"):
        service.create("Bob", "alice@example.com")
```

### Assertions

```python
import pytest

# Value assertions
assert result == expected
assert result != unexpected
assert result is None
assert result is not None
assert result is True

# Collection assertions
assert item in collection
assert len(items) == 3
assert set(result) == {1, 2, 3}

# Approximate comparison (floats)
assert result == pytest.approx(3.14, abs=0.01)
assert result == pytest.approx(expected, rel=1e-3)

# Exception assertions
with pytest.raises(ValueError) as exc_info:
    dangerous_operation()
assert "invalid" in str(exc_info.value)

# Warning assertions
with pytest.warns(DeprecationWarning):
    deprecated_function()
```

### Running Tests

```bash
# Run all tests
pytest

# Verbose output
pytest -v

# Run specific file
pytest tests/test_user.py

# Run specific test
pytest tests/test_user.py::test_create_user

# Run by keyword
pytest -k "create and not delete"

# Run by marker
pytest -m "slow"

# Stop on first failure
pytest -x

# Show print output
pytest -s

# Parallel execution (pytest-xdist)
pytest -n auto
```

---

## 2. Fixtures

### Basic Fixtures

```python
import pytest

@pytest.fixture
def user_service():
    """Create a UserService instance for testing."""
    return UserService()

@pytest.fixture
def sample_user(user_service):
    """Create a sample user (depends on user_service fixture)."""
    return user_service.create("Alice", "alice@example.com")

def test_user_login(user_service, sample_user):
    result = user_service.login(sample_user.email, "password")
    assert result.is_authenticated
```

### Fixture Scopes

```python
@pytest.fixture(scope="function")   # default — per test
def db_session():
    session = create_session()
    yield session
    session.rollback()

@pytest.fixture(scope="class")      # per test class
def api_client():
    return TestClient(app)

@pytest.fixture(scope="module")     # per test module
def database():
    db = setup_test_database()
    yield db
    db.drop_all()

@pytest.fixture(scope="session")    # entire test session
def docker_services():
    start_containers()
    yield
    stop_containers()
```

### Fixture with Teardown

```python
@pytest.fixture
def temp_directory():
    """Create and clean up a temporary directory."""
    path = Path(tempfile.mkdtemp())
    yield path
    shutil.rmtree(path)

@pytest.fixture
def database_transaction(db_session):
    """Wrap test in a transaction and rollback after."""
    db_session.begin()
    yield db_session
    db_session.rollback()
```

### conftest.py

```python
# tests/conftest.py — shared fixtures available to all tests in directory

import pytest

@pytest.fixture
def app():
    """Create application instance."""
    app = create_app(testing=True)
    yield app

@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()

@pytest.fixture(autouse=True)
def reset_database(db):
    """Automatically reset database before each test."""
    db.reset()
    yield
    db.cleanup()
```

---

## 3. Parametrize

```python
import pytest

@pytest.mark.parametrize("input_val,expected", [
    ("hello", "HELLO"),
    ("world", "WORLD"),
    ("", ""),
    ("Hello World", "HELLO WORLD"),
])
def test_uppercase(input_val, expected):
    assert input_val.upper() == expected

# Multiple parameters
@pytest.mark.parametrize("a,b,expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
    (100, 200, 300),
])
def test_add(a, b, expected):
    assert add(a, b) == expected

# Parametrize with IDs
@pytest.mark.parametrize("status_code,expected_error", [
    pytest.param(404, NotFoundError, id="not-found"),
    pytest.param(401, AuthError, id="unauthorized"),
    pytest.param(500, ServerError, id="server-error"),
])
def test_error_handling(status_code, expected_error):
    with pytest.raises(expected_error):
        handle_response(status_code)

# Parametrize fixtures
@pytest.fixture(params=["sqlite", "postgres"])
def database(request):
    db = create_database(request.param)
    yield db
    db.cleanup()
```

---

## 4. Mocking

```python
from unittest.mock import Mock, MagicMock, patch, AsyncMock

# Basic Mock
mock_service = Mock()
mock_service.get_user.return_value = User(name="Alice")
result = mock_service.get_user(1)
mock_service.get_user.assert_called_once_with(1)

# Side effects
mock_service.process.side_effect = ValueError("invalid")
mock_service.get.side_effect = [result1, result2, result3]  # sequential

# patch — replace objects during test
@patch("myapp.services.user_service.send_email")
def test_registration(mock_send_email):
    register_user("alice@example.com")
    mock_send_email.assert_called_once_with(
        to="alice@example.com",
        subject="Welcome!",
    )

# patch as context manager
def test_api_call():
    with patch("myapp.client.httpx.get") as mock_get:
        mock_get.return_value.json.return_value = {"name": "Alice"}
        result = fetch_user(1)
        assert result["name"] == "Alice"

# patch.object
def test_method():
    with patch.object(UserService, "validate", return_value=True):
        service = UserService()
        assert service.validate("test@example.com")

# AsyncMock
@patch("myapp.services.fetch_data", new_callable=AsyncMock)
async def test_async_service(mock_fetch):
    mock_fetch.return_value = {"status": "ok"}
    result = await process_data()
    assert result["status"] == "ok"

# spec — restrict mock to real interface
mock_user = Mock(spec=User)
mock_user.name = "Alice"
mock_user.nonexistent_attr  # AttributeError
```

---

## 5. Markers

```python
import pytest

# Built-in markers
@pytest.mark.skip(reason="Not implemented yet")
def test_future_feature(): ...

@pytest.mark.skipif(sys.platform == "win32", reason="Unix only")
def test_unix_feature(): ...

@pytest.mark.xfail(reason="Known bug #123")
def test_known_bug(): ...

# Custom markers (register in pyproject.toml)
@pytest.mark.slow
def test_large_dataset(): ...

@pytest.mark.integration
def test_database_connection(): ...
```

```toml
# pyproject.toml
[tool.pytest.ini_options]
markers = [
    "slow: marks tests as slow",
    "integration: marks integration tests",
]
```

---

## 6. Test Organization

### Directory Structure

```
tests/
├── conftest.py              # shared fixtures
├── unit/
│   ├── conftest.py          # unit test fixtures
│   ├── test_models.py
│   └── test_services.py
├── integration/
│   ├── conftest.py          # integration fixtures (DB, etc.)
│   ├── test_api.py
│   └── test_repositories.py
└── e2e/
    ├── conftest.py
    └── test_workflows.py
```

### Naming Conventions

```python
# File: test_<module>.py
# Class: Test<Feature> (optional grouping)
# Function: test_<what>_<condition>_<expected>

class TestUserCreation:
    def test_create_user_with_valid_data_succeeds(self): ...
    def test_create_user_with_duplicate_email_raises_error(self): ...
    def test_create_user_without_name_raises_validation_error(self): ...
```

---

## 7. Coverage

```bash
# Run with coverage
pytest --cov=src --cov-report=term-missing

# HTML report
pytest --cov=src --cov-report=html

# Minimum coverage threshold
pytest --cov=src --cov-fail-under=80
```

```toml
# pyproject.toml
[tool.coverage.run]
source = ["src"]
omit = ["*/tests/*", "*/migrations/*"]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "if TYPE_CHECKING:",
    "if __name__ == .__main__.",
]
```

---

## 8. pytest Configuration

```toml
# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]
addopts = "-v --strict-markers --tb=short"
filterwarnings = [
    "error",
    "ignore::DeprecationWarning:third_party_lib",
]
```

---

## 9. Anti-Patterns

```python
# ✗ Testing implementation details
def test_user_service():
    service = UserService()
    assert service._internal_cache == {}  # testing private state

# ✓ Test behavior and outcomes
def test_user_service():
    service = UserService()
    user = service.create("Alice", "alice@example.com")
    assert service.get(user.id) == user

# ✗ Tests that depend on execution order
class TestOrdered:
    shared_state = []
    def test_first(self):
        self.shared_state.append(1)
    def test_second(self):
        assert self.shared_state == [1]  # fragile!

# ✓ Independent tests with fixtures

# ✗ Over-mocking (testing mock behavior, not real behavior)
def test_over_mocked():
    mock_db = Mock()
    mock_db.query.return_value = [{"id": 1}]
    service = UserService(db=mock_db)
    result = service.list_users()
    assert result == [{"id": 1}]  # just testing the mock!

# ✓ Test meaningful behavior
def test_list_users(db_session):
    db_session.add(User(name="Alice"))
    service = UserService(db=db_session)
    result = service.list_users()
    assert len(result) == 1
    assert result[0].name == "Alice"

# ✗ Giant test functions
def test_everything():
    # 100 lines of setup, action, and assertion

# ✓ Focused tests with clear arrange-act-assert
def test_create_user_sets_default_role():
    service = UserService()
    user = service.create("Alice", "alice@example.com")
    assert user.role == "viewer"
```
