---
name: c-testing
description: "C testing — Unity framework, CMocka framework, test organization, mocking, assertions, test fixtures, code coverage with gcov/lcov, test-driven development, and integration with CMake/Make. Use when: writing unit tests with Unity or CMocka; test organization; mocking; code coverage; test-driven development in C. DO NOT USE FOR: build system basics (use c-build-system); debugging tools (use c-pointers-memory)."
---

# C Testing

## 1. Unity Framework

### Setup

```bash
# Clone Unity (lightweight, single-file test framework)
git clone https://github.com/ThrowTheSwitch/Unity.git vendor/unity

# Minimal integration — only need 3 files:
# vendor/unity/src/unity.h
# vendor/unity/src/unity.c
# vendor/unity/src/unity_internals.h
```

### Basic Test File

```c
/* test_calculator.c */
#include "unity.h"
#include "calculator.h"

void setUp(void)
{
    /* Called before each test — initialize resources */
}

void tearDown(void)
{
    /* Called after each test — clean up resources */
}

void test_add_positive_numbers(void)
{
    TEST_ASSERT_EQUAL_INT(5, add(2, 3));
}

void test_add_negative_numbers(void)
{
    TEST_ASSERT_EQUAL_INT(-5, add(-2, -3));
}

void test_add_zero(void)
{
    TEST_ASSERT_EQUAL_INT(3, add(3, 0));
    TEST_ASSERT_EQUAL_INT(3, add(0, 3));
}

void test_add_overflow(void)
{
    /* Document expected behavior for edge cases */
    TEST_ASSERT_EQUAL_INT(INT_MAX, add(INT_MAX, 0));
}

int main(void)
{
    UNITY_BEGIN();
    RUN_TEST(test_add_positive_numbers);
    RUN_TEST(test_add_negative_numbers);
    RUN_TEST(test_add_zero);
    RUN_TEST(test_add_overflow);
    return UNITY_END();
}
```

### Unity Assertions

```c
/* Integer comparisons */
TEST_ASSERT_EQUAL_INT(expected, actual);
TEST_ASSERT_EQUAL_UINT(expected, actual);
TEST_ASSERT_EQUAL_INT32(expected, actual);
TEST_ASSERT_EQUAL_UINT8(expected, actual);

/* Boolean */
TEST_ASSERT_TRUE(condition);
TEST_ASSERT_FALSE(condition);

/* Pointer */
TEST_ASSERT_NULL(pointer);
TEST_ASSERT_NOT_NULL(pointer);
TEST_ASSERT_EQUAL_PTR(expected, actual);

/* String */
TEST_ASSERT_EQUAL_STRING("expected", actual_str);
TEST_ASSERT_EQUAL_STRING_LEN("exp", actual_str, 3);

/* Float/Double (with epsilon) */
TEST_ASSERT_FLOAT_WITHIN(0.001f, expected, actual);
TEST_ASSERT_DOUBLE_WITHIN(0.0001, expected, actual);

/* Array */
TEST_ASSERT_EQUAL_INT_ARRAY(expected_arr, actual_arr, num_elements);
TEST_ASSERT_EQUAL_STRING_ARRAY(expected_arr, actual_arr, num_elements);

/* Memory */
TEST_ASSERT_EQUAL_MEMORY(expected_ptr, actual_ptr, num_bytes);

/* Failure */
TEST_FAIL_MESSAGE("Explain why this should not happen");
TEST_IGNORE_MESSAGE("Not implemented yet");
```

---

## 2. CMocka Framework

### Setup

```bash
# Install CMocka
# macOS
brew install cmocka

# Ubuntu/Debian
sudo apt install libcmocka-dev

# Compile
gcc -o test_app test_app.c -lcmocka
```

### Basic Test File

```c
/* test_user_service.c */
#include <stdarg.h>
#include <stddef.h>
#include <setjmp.h>
#include <cmocka.h>

#include "user_service.h"

/* Setup and teardown */
static int setup(void **state)
{
    user_service_t *svc = user_service_create();
    assert_non_null(svc);
    *state = svc;
    return 0;
}

static int teardown(void **state)
{
    user_service_destroy(*state);
    return 0;
}

/* Test cases */
static void test_create_user(void **state)
{
    user_service_t *svc = *state;
    user_t *user = user_service_add(svc, "Alice", "alice@example.com");

    assert_non_null(user);
    assert_string_equal(user->name, "Alice");
    assert_string_equal(user->email, "alice@example.com");
}

static void test_create_user_null_name(void **state)
{
    user_service_t *svc = *state;
    user_t *user = user_service_add(svc, NULL, "test@example.com");

    assert_null(user);
}

/* Run tests */
int main(void)
{
    const struct CMUnitTest tests[] = {
        cmocka_unit_test_setup_teardown(test_create_user, setup, teardown),
        cmocka_unit_test_setup_teardown(test_create_user_null_name, setup, teardown),
    };
    return cmocka_run_group_tests(tests, NULL, NULL);
}
```

### CMocka Mocking

```c
/* Mock an external function — wrap it at link time */

/* In production code: database.h */
int db_query(const char *sql, result_t *result);

/* In test file: mock the function */
int __wrap_db_query(const char *sql, result_t *result)
{
    check_expected(sql);
    result->count = mock_type(int);
    return mock_type(int);
}

/* In test case */
static void test_get_user_count(void **state)
{
    /* Set expectations */
    expect_string(__wrap_db_query, sql, "SELECT COUNT(*) FROM users");
    will_return(__wrap_db_query, 42);   /* result->count */
    will_return(__wrap_db_query, 0);    /* return value */

    int count = get_user_count();
    assert_int_equal(count, 42);
}

/* Compile with linker wrapping */
/* gcc -Wl,--wrap=db_query test_user.c user.c -lcmocka -o test_user */
```

### CMocka Assertions

```c
/* Integer */
assert_int_equal(expected, actual);
assert_int_not_equal(a, b);

/* Boolean */
assert_true(condition);
assert_false(condition);

/* Pointer */
assert_null(ptr);
assert_non_null(ptr);
assert_ptr_equal(expected, actual);

/* String */
assert_string_equal(expected, actual);
assert_string_not_equal(a, b);

/* Memory */
assert_memory_equal(expected, actual, size);
assert_memory_not_equal(a, b, size);

/* Range */
assert_in_range(value, min, max);
assert_not_in_range(value, min, max);
```

---

## 3. Test Organization

### Project Structure

```
project/
├── include/
│   └── project/
│       ├── calculator.h
│       └── user_service.h
├── src/
│   ├── calculator.c
│   └── user_service.c
├── test/
│   ├── test_calculator.c
│   ├── test_user_service.c
│   └── test_main.c          # optional: unified test runner
├── vendor/
│   └── unity/
│       └── src/
├── CMakeLists.txt
└── Makefile
```

### Test Naming Convention

```c
/* Pattern: test_<module>_<function>_<scenario> */
void test_calculator_add_positive_numbers(void) { /* ... */ }
void test_calculator_add_overflow(void) { /* ... */ }
void test_calculator_divide_by_zero(void) { /* ... */ }
void test_user_service_create_valid_input(void) { /* ... */ }
void test_user_service_create_null_name_returns_null(void) { /* ... */ }
```

### Makefile for Tests

```makefile
TEST_SRCS = $(wildcard test/*.c)
TEST_OBJS = $(TEST_SRCS:test/%.c=build/test/%.o)
UNITY_SRC = vendor/unity/src/unity.c

# Build and run all tests
test: $(TEST_OBJS)
	$(CC) $(CFLAGS) $^ $(UNITY_SRC) $(SRC_OBJS) -o build/test_runner
	./build/test_runner

build/test/%.o: test/%.c | build/test
	$(CC) $(CFLAGS) -Ivendor/unity/src -Iinclude -c $< -o $@

build/test:
	mkdir -p $@

.PHONY: test
```

### CMake for Tests

```cmake
# Enable testing
enable_testing()

# Add test executable
add_executable(test_calculator
    test/test_calculator.c
    vendor/unity/src/unity.c
)

target_include_directories(test_calculator PRIVATE
    include
    vendor/unity/src
)

target_link_libraries(test_calculator PRIVATE mylib)

# Register with CTest
add_test(NAME calculator_tests COMMAND test_calculator)

# Run: cmake --build build && ctest --test-dir build --output-on-failure
```

---

## 4. Code Coverage

### gcov + lcov

```bash
# Compile with coverage flags
gcc -g --coverage -fprofile-arcs -ftest-coverage \
    src/calculator.c test/test_calculator.c vendor/unity/src/unity.c \
    -Iinclude -Ivendor/unity/src -o test_runner

# Run tests
./test_runner

# Generate coverage report
gcov src/calculator.c

# HTML report with lcov
lcov --capture --directory . --output-file coverage.info
lcov --remove coverage.info '/usr/*' 'vendor/*' 'test/*' --output-file coverage.info
genhtml coverage.info --output-directory coverage_html
open coverage_html/index.html
```

### CMake Coverage

```cmake
# Add coverage flags for debug builds
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_compile_options(test_calculator PRIVATE --coverage)
    target_link_options(test_calculator PRIVATE --coverage)
endif()
```

---

## 5. Test Patterns

### Test Setup/Teardown

```c
/* Allocate shared resources before each test */
static database_t *test_db;

void setUp(void)
{
    test_db = database_create(":memory:");
    database_migrate(test_db);
}

void tearDown(void)
{
    database_destroy(test_db);
    test_db = NULL;
}
```

### Testing Error Paths

```c
void test_open_nonexistent_file_returns_null(void)
{
    FILE *fp = open_config("/nonexistent/path.conf");
    TEST_ASSERT_NULL(fp);
}

void test_malloc_failure_handled(void)
{
    /* If using a custom allocator, inject failure */
    set_test_allocator(failing_allocator);
    user_t *user = user_create("test");
    TEST_ASSERT_NULL(user);
    set_test_allocator(default_allocator);
}
```

### Parameterized-Style Tests (Unity)

```c
/* Unity doesn't have built-in parameterized tests — use a helper */
typedef struct {
    int a;
    int b;
    int expected;
} add_test_case_t;

static const add_test_case_t add_cases[] = {
    {1, 2, 3},
    {-1, 1, 0},
    {0, 0, 0},
    {INT_MAX, 0, INT_MAX},
};

void test_add_parameterized(void)
{
    for (size_t i = 0; i < sizeof(add_cases) / sizeof(add_cases[0]); i++) {
        char msg[64];
        snprintf(msg, sizeof(msg), "Case %zu: add(%d, %d)",
                 i, add_cases[i].a, add_cases[i].b);
        TEST_ASSERT_EQUAL_INT_MESSAGE(
            add_cases[i].expected,
            add(add_cases[i].a, add_cases[i].b),
            msg
        );
    }
}
```
