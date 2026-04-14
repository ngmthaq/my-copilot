---
name: java-testing
description: "Java testing — JUnit 5, Mockito, assertions, parameterized tests, test lifecycle, test organization, integration testing, and coverage. Use when: writing unit tests; using JUnit 5; mocking with Mockito; parameterized tests; test organization; coverage configuration. DO NOT USE FOR: build system configuration (use java-build-system)."
---

# Java Testing

## 1. JUnit 5 Basics

```java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class UserServiceTest {

    private UserService userService;
    private UserRepository mockRepo;

    @BeforeEach
    void setUp() {
        mockRepo = Mockito.mock(UserRepository.class);
        userService = new UserService(mockRepo);
    }

    @Test
    @DisplayName("should find user by ID")
    void findById_existingUser_returnsUser() {
        // Arrange
        var expected = new User(1L, "Alice", "alice@example.com");
        when(mockRepo.findById(1L)).thenReturn(Optional.of(expected));

        // Act
        User result = userService.findById(1L);

        // Assert
        assertEquals(expected, result);
        verify(mockRepo).findById(1L);
    }

    @Test
    @DisplayName("should throw when user not found")
    void findById_nonExistingUser_throwsException() {
        when(mockRepo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
            () -> userService.findById(99L));
    }

    @AfterEach
    void tearDown() {
        // cleanup if needed
    }
}
```

---

## 2. Assertions

```java
// Basic assertions
assertEquals(expected, actual);
assertEquals(expected, actual, "Custom failure message");
assertNotEquals(unexpected, actual);
assertTrue(condition);
assertFalse(condition);
assertNull(value);
assertNotNull(value);
assertSame(expected, actual);          // reference equality

// Exception assertions
Exception ex = assertThrows(IllegalArgumentException.class,
    () -> service.validate(null));
assertEquals("Input required", ex.getMessage());

// Does not throw
assertDoesNotThrow(() -> service.validate("valid"));

// Timeout
assertTimeout(Duration.ofSeconds(2), () -> service.slowOperation());

// Grouped assertions (all run even if earlier ones fail)
assertAll("user properties",
    () -> assertEquals("Alice", user.getName()),
    () -> assertEquals("alice@example.com", user.getEmail()),
    () -> assertTrue(user.isActive())
);

// Collection assertions
assertIterableEquals(expected, actual);
assertLinesMatch(expectedLines, actualLines);

// AssertJ (more fluent — recommended)
import static org.assertj.core.api.Assertions.*;

assertThat(user.getName()).isEqualTo("Alice");
assertThat(users).hasSize(3)
    .extracting(User::getName)
    .containsExactlyInAnyOrder("Alice", "Bob", "Charlie");
assertThat(user.getAge()).isBetween(18, 65);
assertThatThrownBy(() -> service.findById(99L))
    .isInstanceOf(EntityNotFoundException.class)
    .hasMessageContaining("not found");
```

---

## 3. Mockito

```java
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

// Create mocks
UserRepository mockRepo = mock(UserRepository.class);

// Or with annotations
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock UserRepository mockRepo;
    @Mock EmailService mockEmail;
    @InjectMocks UserService userService;  // auto-inject mocks

    @Test
    void createUser_sendsWelcomeEmail() {
        // Stubbing
        when(mockRepo.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });

        // Act
        userService.createUser("Alice", "alice@example.com");

        // Verification
        verify(mockRepo).save(any(User.class));
        verify(mockEmail).sendWelcome(eq("alice@example.com"), anyString());
        verify(mockRepo, times(1)).save(any());
        verify(mockRepo, never()).deleteById(anyLong());
        verifyNoMoreInteractions(mockRepo);
    }
}
```

### Argument Matchers

```java
when(repo.findByName(anyString())).thenReturn(Optional.of(user));
when(repo.findById(eq(1L))).thenReturn(Optional.of(user));
when(repo.findAll(argThat(spec -> spec.isActive()))).thenReturn(List.of(user));

// Argument captor
ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
verify(repo).save(captor.capture());
User savedUser = captor.getValue();
assertEquals("Alice", savedUser.getName());
```

### Stubbing Patterns

```java
// Return value
when(mock.method()).thenReturn(value);

// Throw exception
when(mock.method()).thenThrow(new RuntimeException("error"));

// Multiple calls
when(mock.method())
    .thenReturn(first)
    .thenReturn(second)
    .thenThrow(new RuntimeException("third call"));

// Void methods
doNothing().when(mock).voidMethod();
doThrow(new RuntimeException()).when(mock).voidMethod();

// Spy (partial mock)
List<String> spy = spy(new ArrayList<>());
spy.add("real");         // real method called
when(spy.size()).thenReturn(100);  // stubbed
```

---

## 4. Parameterized Tests

```java
@ParameterizedTest
@ValueSource(strings = {"hello", "world", "java"})
void isNotBlank_withNonBlankStrings(String input) {
    assertFalse(input.isBlank());
}

@ParameterizedTest
@NullAndEmptySource
@ValueSource(strings = {"  ", "\t", "\n"})
void isBlank_withBlankStrings(String input) {
    assertTrue(input == null || input.isBlank());
}

@ParameterizedTest
@CsvSource({
    "1, 1, 2",
    "2, 3, 5",
    "10, -5, 5",
    "0, 0, 0"
})
void add_returnsSum(int a, int b, int expected) {
    assertEquals(expected, calculator.add(a, b));
}

@ParameterizedTest
@MethodSource("provideUsersForValidation")
void validate_withInvalidUsers_throwsException(User user, String expectedMsg) {
    var exception = assertThrows(ValidationException.class,
        () -> validator.validate(user));
    assertEquals(expectedMsg, exception.getMessage());
}

static Stream<Arguments> provideUsersForValidation() {
    return Stream.of(
        Arguments.of(new User(null, "email"), "Name required"),
        Arguments.of(new User("name", null), "Email required"),
        Arguments.of(new User("", "email"), "Name must not be blank")
    );
}

@ParameterizedTest
@EnumSource(value = OrderStatus.class, names = {"PENDING", "CONFIRMED"})
void canCancel_withCancellableStatuses(OrderStatus status) {
    assertTrue(orderService.canCancel(status));
}
```

---

## 5. Test Lifecycle

```java
@TestInstance(TestInstance.Lifecycle.PER_CLASS) // share state across tests
class IntegrationTest {

    @BeforeAll
    static void beforeAll() {
        // once before all tests (static unless PER_CLASS)
    }

    @BeforeEach
    void beforeEach() {
        // before each test
    }

    @Test
    @Tag("fast")
    void fastTest() { }

    @Test
    @Tag("slow")
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void slowTest() { }

    @Test
    @Disabled("Waiting for API fix — JIRA-123")
    void pendingTest() { }

    @RepeatedTest(5)
    void flakyTest(RepetitionInfo info) {
        // runs 5 times
    }

    @Nested
    @DisplayName("when user is admin")
    class WhenAdmin {
        @Test
        void canDeleteOtherUsers() { }

        @Test
        void canViewAuditLog() { }
    }

    @AfterEach
    void afterEach() { }

    @AfterAll
    static void afterAll() { }
}
```

---

## 6. Test Naming Convention

```
methodName_scenario_expectedBehavior

findById_existingUser_returnsUser
findById_nonExistingUser_throwsNotFoundException
createUser_duplicateEmail_throwsConflictException
transfer_insufficientFunds_throwsInsufficientFundsException
```

---

## 7. Test Organization

```
src/test/java/com/example/myapp/
├── unit/
│   ├── service/
│   │   ├── UserServiceTest.java
│   │   └── OrderServiceTest.java
│   └── util/
│       └── DateUtilsTest.java
├── integration/
│   ├── repository/
│   │   └── UserRepositoryIntegrationTest.java
│   └── controller/
│       └── UserControllerIntegrationTest.java
└── fixtures/
    └── TestDataFactory.java
```

---

## 8. Anti-Patterns

```java
// ✗ Testing implementation details
verify(repo, times(3)).findById(anyLong());  // brittle — cares about HOW, not WHAT

// ✓ Test behavior and outcomes
assertEquals(expected, service.findById(id));

// ✗ No assertions
@Test
void test() {
    service.process(input);   // no assertion — always passes
}

// ✗ Multiple concerns in one test
@Test
void testUserCrud() {
    // create, read, update, delete in one test — unclear what failed
}

// ✓ One concept per test
@Test void createUser_savesSuccessfully() { }
@Test void findById_returnsCorrectUser() { }
@Test void updateUser_updatesFields() { }

// ✗ Shared mutable state between tests
static List<User> testUsers = new ArrayList<>();

// ✓ Fresh setup per test via @BeforeEach

// ✗ Testing getters/setters — no business logic
@Test
void getName_returnsName() {
    user.setName("Alice");
    assertEquals("Alice", user.getName());  // trivial — no value
}

// ✓ Test meaningful business logic
```
