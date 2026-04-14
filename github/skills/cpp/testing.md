---
name: cpp-testing
description: "C++ testing — Google Test (GTest) framework, Catch2 framework, Google Mock (GMock), test organization, assertions, test fixtures, parameterized tests, death tests, code coverage with gcov/lcov, and test-driven development. Use when: writing unit tests with Google Test or Catch2; mocking with GMock; test organization; parameterized tests; code coverage; TDD in C++. DO NOT USE FOR: build system config (use cpp-build-system); C testing frameworks (use c-testing)."
---

# C++ Testing

## 1. Google Test (GTest)

### Setup with CMake

```cmake
# Option 1: FetchContent
include(FetchContent)
FetchContent_Declare(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG v1.14.0
)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

enable_testing()

add_executable(tests
    test/test_calculator.cpp
    test/test_user_service.cpp
)
target_link_libraries(tests PRIVATE
    mylib
    GTest::gtest_main
    GTest::gmock
)

include(GoogleTest)
gtest_discover_tests(tests)
```

### Basic Test

```cpp
// test/test_calculator.cpp
#include <gtest/gtest.h>
#include "calculator.h"

TEST(CalculatorTest, AddPositiveNumbers) {
    Calculator calc;
    EXPECT_EQ(calc.add(2, 3), 5);
}

TEST(CalculatorTest, AddNegativeNumbers) {
    Calculator calc;
    EXPECT_EQ(calc.add(-2, -3), -5);
}

TEST(CalculatorTest, DivideByZeroThrows) {
    Calculator calc;
    EXPECT_THROW(calc.divide(10, 0), std::invalid_argument);
}
```

### GTest Assertions

```cpp
// EXPECT_* — continues on failure | ASSERT_* — stops test on failure

// Equality
EXPECT_EQ(actual, expected);      // ==
EXPECT_NE(actual, expected);      // !=
EXPECT_LT(a, b);                  // <
EXPECT_LE(a, b);                  // <=
EXPECT_GT(a, b);                  // >
EXPECT_GE(a, b);                  // >=

// Boolean
EXPECT_TRUE(condition);
EXPECT_FALSE(condition);

// String
EXPECT_STREQ(str1, str2);        // C-string equality
EXPECT_STRNE(str1, str2);        // C-string inequality
EXPECT_STRCASEEQ(str1, str2);    // case-insensitive

// Floating point (with tolerance)
EXPECT_FLOAT_EQ(a, b);           // almost equal (4 ULP)
EXPECT_DOUBLE_EQ(a, b);          // almost equal (4 ULP)
EXPECT_NEAR(a, b, tolerance);    // within absolute tolerance

// Exceptions
EXPECT_THROW(expr, ExceptionType);
EXPECT_ANY_THROW(expr);
EXPECT_NO_THROW(expr);

// Death tests (process termination)
EXPECT_DEATH(crashingFunction(), "error message regex");
EXPECT_EXIT(exitFunction(), testing::ExitedWithCode(0), "");

// Custom failure message
EXPECT_EQ(a, b) << "Details: a=" << a << ", b=" << b;
```

### Test Fixtures

```cpp
class UserServiceTest : public ::testing::Test {
protected:
    void SetUp() override {
        db_ = std::make_unique<MockDatabase>();
        service_ = std::make_unique<UserService>(db_.get());
        service_->addUser(User{"Alice", 30});
        service_->addUser(User{"Bob", 25});
    }

    void TearDown() override {
        // cleanup if needed
    }

    std::unique_ptr<MockDatabase> db_;
    std::unique_ptr<UserService> service_;
};

TEST_F(UserServiceTest, FindUserByName) {
    auto user = service_->findByName("Alice");
    ASSERT_TRUE(user.has_value());
    EXPECT_EQ(user->age, 30);
}

TEST_F(UserServiceTest, FindNonexistentUser) {
    auto user = service_->findByName("Charlie");
    EXPECT_FALSE(user.has_value());
}
```

### Parameterized Tests

```cpp
// Value-parameterized tests
class AddTest : public ::testing::TestWithParam<std::tuple<int, int, int>> {};

TEST_P(AddTest, ReturnsCorrectSum) {
    auto [a, b, expected] = GetParam();
    EXPECT_EQ(add(a, b), expected);
}

INSTANTIATE_TEST_SUITE_P(
    Calculator,
    AddTest,
    ::testing::Values(
        std::make_tuple(1, 2, 3),
        std::make_tuple(-1, -2, -3),
        std::make_tuple(0, 0, 0),
        std::make_tuple(INT_MAX, 0, INT_MAX)
    )
);

// Type-parameterized tests
template <typename T>
class ContainerTest : public ::testing::Test {
protected:
    T container_;
};

using ContainerTypes = ::testing::Types<std::vector<int>, std::deque<int>, std::list<int>>;
TYPED_TEST_SUITE(ContainerTest, ContainerTypes);

TYPED_TEST(ContainerTest, EmptyOnInit) {
    EXPECT_TRUE(this->container_.empty());
}
```

---

## 2. Google Mock (GMock)

### Creating Mocks

```cpp
#include <gmock/gmock.h>

// Interface
class Database {
public:
    virtual ~Database() = default;
    virtual bool connect(const std::string& url) = 0;
    virtual std::optional<User> findUser(int id) = 0;
    virtual bool saveUser(const User& user) = 0;
};

// Mock class
class MockDatabase : public Database {
public:
    MOCK_METHOD(bool, connect, (const std::string& url), (override));
    MOCK_METHOD(std::optional<User>, findUser, (int id), (override));
    MOCK_METHOD(bool, saveUser, (const User& user), (override));
};
```

### Setting Expectations

```cpp
TEST_F(ServiceTest, CreatesUserSuccessfully) {
    MockDatabase mock_db;

    // Set expectations
    EXPECT_CALL(mock_db, connect("localhost"))
        .Times(1)
        .WillOnce(::testing::Return(true));

    EXPECT_CALL(mock_db, saveUser(::testing::_))
        .Times(1)
        .WillOnce(::testing::Return(true));

    UserService service(&mock_db);
    service.connect("localhost");
    EXPECT_TRUE(service.createUser("Alice", 30));
}
```

### GMock Matchers

```cpp
using namespace ::testing;

// Value matchers
EXPECT_CALL(mock, method(Eq(5)));        // ==
EXPECT_CALL(mock, method(Ne(5)));        // !=
EXPECT_CALL(mock, method(Lt(5)));        // <
EXPECT_CALL(mock, method(Gt(5)));        // >
EXPECT_CALL(mock, method(_));            // any value

// String matchers
EXPECT_CALL(mock, method(HasSubstr("hello")));
EXPECT_CALL(mock, method(StartsWith("pre")));
EXPECT_CALL(mock, method(MatchesRegex("\\d+")));

// Composite matchers
EXPECT_CALL(mock, method(AllOf(Gt(0), Lt(100))));
EXPECT_CALL(mock, method(AnyOf(1, 2, 3)));
EXPECT_CALL(mock, method(Not(0)));

// Container matchers
EXPECT_THAT(vec, Contains(42));
EXPECT_THAT(vec, ElementsAre(1, 2, 3));
EXPECT_THAT(vec, UnorderedElementsAre(3, 1, 2));
EXPECT_THAT(vec, IsEmpty());
EXPECT_THAT(vec, SizeIs(5));
```

### GMock Actions

```cpp
EXPECT_CALL(mock, method(_))
    .WillOnce(Return(42))
    .WillOnce(Return(43))
    .WillRepeatedly(Return(0));

EXPECT_CALL(mock, method(_))
    .WillOnce(Throw(std::runtime_error("fail")));

EXPECT_CALL(mock, method(_))
    .WillOnce(DoAll(
        SetArgReferee<1>(result_value),
        Return(true)
    ));

// Invoke real implementation or lambda
EXPECT_CALL(mock, method(_))
    .WillOnce(Invoke([](int x) { return x * 2; }));
```

---

## 3. Catch2 Framework

### Setup with CMake

```cmake
FetchContent_Declare(
    Catch2
    GIT_REPOSITORY https://github.com/catchorg/Catch2.git
    GIT_TAG v3.5.2
)
FetchContent_MakeAvailable(Catch2)

add_executable(tests test/test_main.cpp)
target_link_libraries(tests PRIVATE Catch2::Catch2WithMain mylib)

include(Catch)
catch_discover_tests(tests)
```

### Basic Test

```cpp
#include <catch2/catch_test_macros.hpp>
#include <catch2/matchers/catch_matchers_string.hpp>

TEST_CASE("Calculator addition", "[calculator]") {
    Calculator calc;

    SECTION("positive numbers") {
        REQUIRE(calc.add(2, 3) == 5);
    }

    SECTION("negative numbers") {
        REQUIRE(calc.add(-2, -3) == -5);
    }

    SECTION("zero") {
        REQUIRE(calc.add(0, 0) == 0);
    }
}

TEST_CASE("Division by zero throws", "[calculator]") {
    Calculator calc;
    REQUIRE_THROWS_AS(calc.divide(10, 0), std::invalid_argument);
    REQUIRE_THROWS_WITH(calc.divide(10, 0), Catch::Matchers::ContainsSubstring("zero"));
}
```

### Catch2 Assertions

```cpp
// REQUIRE — stops test | CHECK — continues on failure
REQUIRE(expr);
CHECK(expr);

REQUIRE(a == b);
REQUIRE(a != b);
REQUIRE_FALSE(expr);

REQUIRE_THROWS(expr);
REQUIRE_THROWS_AS(expr, ExceptionType);
REQUIRE_NOTHROW(expr);

// Matchers
using namespace Catch::Matchers;
REQUIRE_THAT(str, ContainsSubstring("hello"));
REQUIRE_THAT(str, StartsWith("he") && EndsWith("lo"));
REQUIRE_THAT(vec, Contains(42));
REQUIRE_THAT(value, WithinAbs(3.14, 0.01));
```

### BDD Style

```cpp
SCENARIO("User registration", "[user]") {
    GIVEN("a user service") {
        UserService service;

        WHEN("a new user registers") {
            auto result = service.registerUser("Alice", "alice@test.com");

            THEN("registration succeeds") {
                REQUIRE(result.success);
            }

            THEN("user can be found") {
                auto user = service.findByEmail("alice@test.com");
                REQUIRE(user.has_value());
                REQUIRE(user->name == "Alice");
            }
        }
    }
}
```

---

## 4. Code Coverage

```bash
# Compile with coverage flags
g++ --coverage -O0 -g test_main.cpp -o tests

# Run tests
./tests

# Generate coverage report
gcov test_main.cpp

# With lcov for HTML report
lcov --capture --directory . --output-file coverage.info
lcov --remove coverage.info '/usr/*' --output-file coverage.info
genhtml coverage.info --output-directory coverage_report
```

### CMake Coverage Target

```cmake
option(ENABLE_COVERAGE "Enable code coverage" OFF)

if(ENABLE_COVERAGE)
    add_compile_options(--coverage -O0 -g)
    add_link_options(--coverage)
endif()

# Usage: cmake -B build -DENABLE_COVERAGE=ON
```

---

## 5. Test Organization

```
test/
├── unit/                     # Unit tests (isolated, fast)
│   ├── test_calculator.cpp
│   ├── test_user_service.cpp
│   └── test_parser.cpp
├── integration/              # Integration tests (with real deps)
│   ├── test_database.cpp
│   └── test_api.cpp
├── fixtures/                 # Shared test data
│   └── sample_data.json
├── mocks/                    # Mock classes
│   ├── mock_database.h
│   └── mock_http_client.h
└── CMakeLists.txt
```

### Test Naming Convention

```cpp
// Pattern: TEST(ClassOrModule, MethodOrScenario_ExpectedBehavior)
TEST(Calculator, Add_PositiveNumbers_ReturnsSum)
TEST(Calculator, Divide_ByZero_ThrowsInvalidArgument)
TEST(UserService, FindByName_ExistingUser_ReturnsUser)
TEST(UserService, FindByName_NonexistentUser_ReturnsNullopt)
TEST(Parser, Parse_EmptyInput_ReturnsError)
TEST(Parser, Parse_ValidJson_ReturnsObject)
```
