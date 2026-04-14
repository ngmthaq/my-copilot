---
name: java-convention
description: "Java coding convention — covers general formatting rules, naming conventions, import organization, Javadoc, Google Java Format / Checkstyle configuration, project structure, and EditorConfig. This is the base convention for all Java projects. Use when: formatting or refactoring Java code; reviewing for style consistency; setting up Checkstyle or Google Java Format; applying naming conventions; organizing imports. DO NOT USE FOR: build system configuration (use java-build-system); testing conventions (use java-testing)."
---

# Java Convention

This is the **base convention** for all Java projects. Framework-specific conventions (Spring Boot, Quarkus, etc.) extend this base.

## When to Use

- Formatting or refactoring code to match project style
- Reviewing a PR or file for style consistency
- Setting up Checkstyle or Google Java Format
- Applying naming conventions to variables, methods, classes, or packages
- Organizing and sorting import statements

---

## 1. General Formatting Rules

| Rule            | Value                        |
| --------------- | ---------------------------- |
| Indentation     | 4 spaces (no tabs)           |
| Max line length | 120 characters               |
| Brace style     | Same line (K&R / 1TBS)       |
| Blank lines     | 1 blank line between methods |
| End of file     | Single newline (`\n`)        |
| Line endings    | LF (`\n`)                    |

```java
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
    }
}
```

---

## 2. Naming Conventions

### Packages

- All lowercase, no underscores
- Reverse domain notation

```java
package com.example.myapp.service;
package com.example.myapp.repository;
```

### Classes & Interfaces

- `PascalCase` for all classes, interfaces, enums, and annotations
- Nouns for classes, adjectives or capabilities for interfaces
- Do NOT prefix interfaces with `I`

```java
public class UserService { }
public interface Serializable { }
public interface UserRepository { }
public enum OrderStatus { PENDING, CONFIRMED, SHIPPED }
public @interface Cacheable { }
```

### Methods & Variables

- `camelCase` for all methods, variables, and parameters
- Methods should start with a verb
- Boolean variables use `is`, `has`, `can`, `should` prefixes

```java
public User findById(Long id) { }
public boolean isActive() { }
private int retryCount;
private boolean hasPermission;
```

### Constants

- `UPPER_SNAKE_CASE` for `static final` fields

```java
public static final int MAX_RETRY_COUNT = 3;
public static final String DEFAULT_CHARSET = "UTF-8";
private static final Logger LOG = LoggerFactory.getLogger(UserService.class);
```

### Files & Folders

| Context     | Convention              | Example                     |
| ----------- | ----------------------- | --------------------------- |
| Source file | `PascalCase.java`       | `UserService.java`          |
| Test file   | Same name + `Test.java` | `UserServiceTest.java`      |
| Package     | `lowercase`             | `com.example.myapp.service` |

---

## 3. Import Organization

Order imports in this sequence, separated by blank lines:

1. `java.*` — standard library
2. `javax.*` — Java extensions
3. Third-party libraries (e.g., `org.springframework`, `com.google`)
4. Project-internal imports

```java
import java.util.List;
import java.util.Optional;

import javax.persistence.Entity;

import org.springframework.stereotype.Service;
import com.google.common.collect.ImmutableList;

import com.example.myapp.model.User;
import com.example.myapp.repository.UserRepository;
```

- **Never** use wildcard imports (`import java.util.*`)
- Remove unused imports

---

## 4. Javadoc

- Use Javadoc `/** ... */` for all public classes, interfaces, and methods
- Use `//` for implementation comments explaining _why_, not _what_
- Do NOT leave commented-out dead code

```java
/**
 * Service for managing user accounts.
 *
 * <p>Handles user creation, retrieval, and deactivation.
 *
 * @since 1.0
 */
public class UserService {

    /**
     * Finds a user by their unique identifier.
     *
     * @param id the user's unique ID
     * @return the user entity
     * @throws NotFoundException if no user exists with the given ID
     */
    public User findById(Long id) {
        // Use orElseThrow for cleaner null handling than if-null check
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
    }
}
```

---

## 5. Project Structure (Maven)

```
src/
├── main/
│   ├── java/
│   │   └── com/example/myapp/
│   │       ├── config/          # Configuration classes
│   │       ├── controller/      # REST controllers
│   │       ├── dto/             # Data Transfer Objects
│   │       ├── exception/       # Custom exceptions
│   │       ├── model/           # Domain entities
│   │       ├── repository/      # Data access layer
│   │       ├── service/         # Business logic
│   │       └── util/            # Utility classes
│   └── resources/
│       ├── application.yml
│       └── db/migration/
└── test/
    └── java/
        └── com/example/myapp/
            ├── controller/
            ├── service/
            └── repository/
```

---

## 6. Google Java Format / Checkstyle

### Google Java Format (auto-formatter)

```xml
<!-- Maven plugin -->
<plugin>
    <groupId>com.spotify.fmt</groupId>
    <artifactId>fmt-maven-plugin</artifactId>
    <version>2.23</version>
    <executions>
        <execution>
            <goals><goal>format</goal></goals>
        </execution>
    </executions>
</plugin>
```

### Checkstyle

```xml
<!-- Maven plugin -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-checkstyle-plugin</artifactId>
    <version>3.3.1</version>
    <configuration>
        <configLocation>google_checks.xml</configLocation>
        <violationSeverity>warning</violationSeverity>
    </configuration>
</plugin>
```

---

## 7. EditorConfig

```ini
root = true

[*]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[*.xml]
indent_size = 4

[*.yml]
indent_size = 2
```

---

## 8. Best Practices

- **Prefer composition over inheritance** — use interfaces and delegation
- **Favor immutability** — make fields `final` when possible
- **Use `Optional` for return types** — never for parameters or fields
- **Minimize visibility** — default to `private`, widen only as needed
- **One class per file** — except for small static inner classes
- **Limit method length** — aim for under 30 lines; extract when larger
- **Avoid `null` returns** — use `Optional`, empty collections, or throw exceptions
- **Use try-with-resources** — for all `AutoCloseable` resources

---

## Quick Checklist

Before committing, verify:

- [ ] Indentation is 4 spaces, no tabs
- [ ] Lines do not exceed 120 characters
- [ ] Naming follows `camelCase` / `PascalCase` / `UPPER_SNAKE_CASE` rules
- [ ] Imports are organized and no wildcards
- [ ] Javadoc on all public APIs
- [ ] No leftover `System.out.println` or commented-out code
- [ ] All fields that can be `final` are `final`
- [ ] No `null` returns where `Optional` or empty collection fits
