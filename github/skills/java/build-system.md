---
name: java-build-system
description: "Java build system — Maven and Gradle setup, dependency management, project structure, build lifecycle, plugins, multi-module projects, and packaging. Use when: setting up Maven or Gradle; managing dependencies; configuring build plugins; structuring multi-module projects. DO NOT USE FOR: IDE configuration; testing code (use java-testing)."
---

# Java Build System

## 1. Maven

### Project Structure

```
my-app/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/myapp/
│   │   │       └── Application.java
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       ├── java/
│       │   └── com/example/myapp/
│       │       └── ApplicationTest.java
│       └── resources/
└── target/                    # build output (gitignored)
```

### pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <properties>
        <java.version>21</java.version>
        <maven.compiler.source>${java.version}</maven.compiler.source>
        <maven.compiler.target>${java.version}</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- Runtime dependency -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.17.0</version>
        </dependency>

        <!-- Test dependency -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.12.1</version>
                <configuration>
                    <release>${java.version}</release>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.2.5</version>
            </plugin>
        </plugins>
    </build>
</project>
```

### Maven Commands

```bash
mvn clean                    # delete target/
mvn compile                  # compile main sources
mvn test                     # run tests
mvn package                  # compile + test + build jar
mvn install                  # package + install to local repo
mvn verify                   # run integration tests
mvn dependency:tree          # show dependency tree
mvn versions:display-dependency-updates  # check for updates

# Skip tests
mvn package -DskipTests

# Run specific test
mvn test -Dtest=UserServiceTest

# Profiles
mvn package -P production
```

### Maven Build Lifecycle

```
validate → compile → test → package → verify → install → deploy
```

---

## 2. Gradle (Kotlin DSL)

### Project Structure

```
my-app/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle/
│   └── wrapper/
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradlew
├── gradlew.bat
├── src/
│   ├── main/
│   │   ├── java/
│   │   └── resources/
│   └── test/
│       ├── java/
│       └── resources/
└── build/                     # build output (gitignored)
```

### build.gradle.kts

```kotlin
plugins {
    java
    application
}

group = "com.example"
version = "1.0.0-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("com.fasterxml.jackson.core:jackson-databind:2.17.0")
    implementation("org.slf4j:slf4j-api:2.0.12")

    testImplementation("org.junit.jupiter:junit-jupiter:5.10.2")
    testImplementation("org.mockito:mockito-core:5.11.0")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
}

application {
    mainClass = "com.example.myapp.Application"
}
```

### settings.gradle.kts

```kotlin
rootProject.name = "my-app"
```

### Gradle Commands

```bash
./gradlew build              # compile + test + build
./gradlew clean              # delete build/
./gradlew test               # run tests
./gradlew run                # run application
./gradlew dependencies       # show dependency tree
./gradlew tasks              # list available tasks

# Skip tests
./gradlew build -x test

# Run specific test
./gradlew test --tests "com.example.UserServiceTest"
```

---

## 3. Dependency Scopes

### Maven

| Scope      | Compile | Test | Runtime | Package |
| ---------- | ------- | ---- | ------- | ------- |
| `compile`  | ✓       | ✓    | ✓       | ✓       |
| `provided` | ✓       | ✓    |         |         |
| `runtime`  |         | ✓    | ✓       | ✓       |
| `test`     |         | ✓    |         |         |

### Gradle

| Configuration        | Equivalent Maven       |
| -------------------- | ---------------------- |
| `implementation`     | `compile`              |
| `compileOnly`        | `provided`             |
| `runtimeOnly`        | `runtime`              |
| `testImplementation` | `test`                 |
| `api`                | `compile` (transitive) |

---

## 4. Multi-Module Project

### Maven

```xml
<!-- parent pom.xml -->
<project>
    <groupId>com.example</groupId>
    <artifactId>parent</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <modules>
        <module>common</module>
        <module>api</module>
        <module>service</module>
    </modules>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>com.example</groupId>
                <artifactId>common</artifactId>
                <version>${project.version}</version>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

### Gradle

```kotlin
// settings.gradle.kts
rootProject.name = "my-app"
include("common", "api", "service")

// api/build.gradle.kts
dependencies {
    implementation(project(":common"))
}
```

---

## 5. Useful Plugins

### Maven

```xml
<!-- Fat JAR (Spring Boot) -->
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
</plugin>

<!-- Fat JAR (shade) -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-shade-plugin</artifactId>
    <version>3.5.2</version>
</plugin>

<!-- Code coverage -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.12</version>
</plugin>
```

### Gradle

```kotlin
plugins {
    id("org.springframework.boot") version "3.2.4"
    id("io.spring.dependency-management") version "1.1.4"
    jacoco
}
```

---

## 6. Anti-Patterns

```xml
<!-- ✗ No version pinning -->
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <!-- missing version — relies on transitive -->
</dependency>

<!-- ✓ Pin versions explicitly or use BOM -->
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>33.1.0-jre</version>
</dependency>

<!-- ✗ Storing jars in the repo -->
<!-- Never commit .jar files — use dependency management -->

<!-- ✗ Using SNAPSHOT versions in production -->
<version>1.0.0-SNAPSHOT</version>

<!-- ✓ Use release versions for production -->
<version>1.0.0</version>
```
