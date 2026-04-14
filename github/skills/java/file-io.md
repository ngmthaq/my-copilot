---
name: java-file-io
description: "Java file I/O — NIO.2 Path and Files API, reading/writing files, streams-based I/O, serialization, JSON handling with Jackson/Gson, buffered I/O, and resource management. Use when: reading/writing files; using NIO.2 Path and Files; serialization; JSON handling; buffered I/O. DO NOT USE FOR: error handling basics (use java-error-handling); basic types (use java-core-fundamentals)."
---

# Java File I/O

## 1. Path (NIO.2, Java 7+)

```java
import java.nio.file.Path;
import java.nio.file.Paths;

// Creating paths
Path path = Path.of("src", "main", "resources", "config.json");
Path path2 = Path.of("/Users/app/config.json");

// Path operations
path.getFileName();          // config.json
path.getParent();            // src/main/resources
path.getRoot();              // null (relative) or / (absolute)
path.toAbsolutePath();       // full absolute path
path.normalize();            // resolve . and ..
path.resolve("backup");     // append: src/main/resources/config.json/backup
path.resolveSibling("app.json");  // replace last: src/main/resources/app.json
path.relativize(otherPath); // compute relative path

// Convert
path.toFile();               // Path → File
file.toPath();               // File → Path
path.toString();             // string representation
path.toUri();                // file:///...
```

---

## 2. Files Utility (NIO.2)

### Reading

```java
import java.nio.file.Files;

// Read entire file as string (Java 11+)
String content = Files.readString(Path.of("config.json"));

// Read all lines
List<String> lines = Files.readAllLines(Path.of("data.txt"));

// Read all bytes
byte[] bytes = Files.readAllBytes(Path.of("image.png"));

// Stream lines (lazy — for large files)
try (Stream<String> stream = Files.lines(Path.of("large-file.log"))) {
    long errorCount = stream
        .filter(line -> line.contains("ERROR"))
        .count();
}

// Buffered reader
try (BufferedReader reader = Files.newBufferedReader(Path.of("data.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        process(line);
    }
}
```

### Writing

```java
// Write string (Java 11+)
Files.writeString(Path.of("output.txt"), content);
Files.writeString(Path.of("output.txt"), content,
    StandardOpenOption.CREATE, StandardOpenOption.APPEND);

// Write lines
Files.write(Path.of("output.txt"), lines);

// Write bytes
Files.write(Path.of("output.bin"), bytes);

// Buffered writer
try (BufferedWriter writer = Files.newBufferedWriter(Path.of("output.txt"))) {
    writer.write("Line 1");
    writer.newLine();
    writer.write("Line 2");
}
```

### File Operations

```java
// Check
Files.exists(path);
Files.notExists(path);
Files.isRegularFile(path);
Files.isDirectory(path);
Files.isReadable(path);
Files.size(path);                        // bytes

// Create
Files.createFile(path);
Files.createDirectory(path);
Files.createDirectories(path);            // recursive
Files.createTempFile("prefix", ".tmp");
Files.createTempDirectory("prefix");

// Copy / Move / Delete
Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);
Files.move(source, target, StandardCopyOption.ATOMIC_MOVE);
Files.delete(path);                       // throws if not exists
Files.deleteIfExists(path);

// Walk directory tree
try (Stream<Path> walk = Files.walk(Path.of("src"), 5)) {
    List<Path> javaFiles = walk
        .filter(p -> p.toString().endsWith(".java"))
        .toList();
}

// List directory
try (Stream<Path> entries = Files.list(Path.of("."))) {
    entries.forEach(System.out::println);
}

// Find files
try (Stream<Path> found = Files.find(Path.of("src"), 10,
        (path, attrs) -> attrs.isRegularFile() && path.toString().endsWith(".java"))) {
    found.forEach(System.out::println);
}
```

---

## 3. InputStream / OutputStream

```java
// Copy between streams
try (InputStream in = new FileInputStream("input.bin");
     OutputStream out = new FileOutputStream("output.bin")) {
    in.transferTo(out);     // Java 9+
}

// Buffered streams (always buffer for performance)
try (var bis = new BufferedInputStream(new FileInputStream("data.bin"));
     var bos = new BufferedOutputStream(new FileOutputStream("out.bin"))) {
    byte[] buffer = new byte[8192];
    int bytesRead;
    while ((bytesRead = bis.read(buffer)) != -1) {
        bos.write(buffer, 0, bytesRead);
    }
}

// Read from classpath resource
try (InputStream is = getClass().getResourceAsStream("/config.json")) {
    if (is == null) throw new FileNotFoundException("Resource not found");
    String content = new String(is.readAllBytes(), StandardCharsets.UTF_8);
}
```

---

## 4. Properties Files

```java
// Read properties
Properties props = new Properties();
try (InputStream is = Files.newInputStream(Path.of("app.properties"))) {
    props.load(is);
}
String value = props.getProperty("db.url", "jdbc:h2:mem:test");

// Write properties
props.setProperty("app.version", "1.0");
try (OutputStream os = Files.newOutputStream(Path.of("app.properties"))) {
    props.store(os, "Application Configuration");
}
```

---

## 5. JSON with Jackson

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

// Setup (reuse ObjectMapper — it's thread-safe)
ObjectMapper mapper = new ObjectMapper()
    .registerModule(new JavaTimeModule())
    .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

// Serialize (Object → JSON)
String json = mapper.writeValueAsString(user);
mapper.writeValue(new File("user.json"), user);

// Deserialize (JSON → Object)
User user = mapper.readValue(json, User.class);
User user2 = mapper.readValue(new File("user.json"), User.class);

// Generic types (TypeReference)
List<User> users = mapper.readValue(json, new TypeReference<List<User>>() {});
Map<String, Object> map = mapper.readValue(json, new TypeReference<>() {});

// Pretty print
String pretty = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(user);
```

---

## 6. Serialization (Java built-in)

```java
// ⚠️ Java serialization has security risks — prefer JSON/protobuf for new code

// Implement Serializable
public class User implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private String name;
    private transient String password;  // excluded from serialization
}

// Write
try (var oos = new ObjectOutputStream(new FileOutputStream("user.ser"))) {
    oos.writeObject(user);
}

// Read
try (var ois = new ObjectInputStream(new FileInputStream("user.ser"))) {
    User user = (User) ois.readObject();
}
```

---

## 7. Anti-Patterns

```java
// ✗ Using java.io.File for new code
File file = new File("config.json");

// ✓ Use NIO.2 Path and Files
Path path = Path.of("config.json");

// ✗ Not using buffered streams
InputStream is = new FileInputStream("data.bin");

// ✓ Always buffer
InputStream is = new BufferedInputStream(new FileInputStream("data.bin"));

// ✗ Not closing resources
BufferedReader reader = new BufferedReader(new FileReader("data.txt"));
String line = reader.readLine();
// reader is never closed — resource leak

// ✓ Use try-with-resources
try (var reader = Files.newBufferedReader(Path.of("data.txt"))) {
    String line = reader.readLine();
}

// ✗ Loading entire large file into memory
String content = Files.readString(Path.of("10gb-file.log"));

// ✓ Stream line by line
try (Stream<String> lines = Files.lines(Path.of("10gb-file.log"))) {
    lines.filter(l -> l.contains("ERROR")).forEach(this::handleError);
}

// ✗ Hardcoded file separators
String path = "src\\main\\resources\\config.json";

// ✓ Use Path.of (handles separators)
Path path = Path.of("src", "main", "resources", "config.json");
```
