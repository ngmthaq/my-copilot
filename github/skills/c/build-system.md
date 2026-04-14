---
name: c-build-system
description: "C build system — Makefiles, CMake configuration, GCC/Clang compiler flags, linking, static and shared libraries, cross-compilation, pkg-config, and project structure. Use when: writing Makefiles; CMake configuration; compilation flags; linking; static and shared libraries; cross-compilation. DO NOT USE FOR: code conventions (use c-convention); testing setup (use c-testing)."
---

# C Build System

## 1. GCC/Clang Compiler Flags

### Essential Flags

```bash
# Compilation
gcc -c main.c -o main.o          # compile to object file
gcc main.o utils.o -o app         # link object files into executable
gcc main.c utils.c -o app         # compile and link in one step

# Standard version
gcc -std=c11 main.c               # C11 standard
gcc -std=c17 main.c               # C17 standard (latest stable)
gcc -std=gnu11 main.c             # C11 with GNU extensions
```

### Warning Flags

```bash
# Recommended minimum
gcc -Wall -Wextra -Wpedantic -Werror main.c

# Comprehensive warnings
gcc -Wall -Wextra -Wpedantic -Werror \
    -Wshadow -Wdouble-promotion -Wformat=2 \
    -Wconversion -Wsign-conversion \
    -Wnull-dereference -Wuninitialized \
    -Wstrict-prototypes -Wmissing-prototypes \
    main.c
```

| Flag           | Purpose                           |
| -------------- | --------------------------------- |
| `-Wall`        | Enable common warnings            |
| `-Wextra`      | Enable extra warnings             |
| `-Wpedantic`   | Enforce strict ISO C              |
| `-Werror`      | Treat warnings as errors          |
| `-Wshadow`     | Warn on variable shadowing        |
| `-Wconversion` | Warn on implicit type conversions |
| `-Wformat=2`   | Strict format string checking     |

### Optimization Flags

```bash
gcc -O0 main.c    # no optimization (debug builds)
gcc -O1 main.c    # basic optimization
gcc -O2 main.c    # recommended for release
gcc -O3 main.c    # aggressive optimization
gcc -Os main.c    # optimize for size
gcc -Og main.c    # optimize for debugging experience
```

### Debug Flags

```bash
gcc -g main.c                         # debug symbols
gcc -g3 main.c                        # maximum debug info
gcc -g -fsanitize=address main.c      # AddressSanitizer
gcc -g -fsanitize=undefined main.c    # UndefinedBehaviorSanitizer
gcc -g -fsanitize=thread main.c       # ThreadSanitizer
```

---

## 2. Makefile

### Basic Makefile

```makefile
CC      = gcc
CFLAGS  = -std=c17 -Wall -Wextra -Wpedantic -Werror
LDFLAGS =
LDLIBS  = -lm

# Directories
SRC_DIR = src
OBJ_DIR = build
BIN_DIR = bin

# Source and object files
SRCS = $(wildcard $(SRC_DIR)/*.c)
OBJS = $(SRCS:$(SRC_DIR)/%.c=$(OBJ_DIR)/%.o)
TARGET = $(BIN_DIR)/app

# Default target
all: $(TARGET)

# Link
$(TARGET): $(OBJS) | $(BIN_DIR)
	$(CC) $(LDFLAGS) $^ $(LDLIBS) -o $@

# Compile
$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c | $(OBJ_DIR)
	$(CC) $(CFLAGS) -c $< -o $@

# Create directories
$(BIN_DIR) $(OBJ_DIR):
	mkdir -p $@

# Clean
clean:
	rm -rf $(OBJ_DIR) $(BIN_DIR)

# Debug build
debug: CFLAGS += -g -O0 -DDEBUG -fsanitize=address
debug: LDFLAGS += -fsanitize=address
debug: $(TARGET)

# Release build
release: CFLAGS += -O2 -DNDEBUG
release: $(TARGET)

# Phony targets
.PHONY: all clean debug release
```

### Automatic Dependency Generation

```makefile
# Generate .d dependency files alongside .o files
CFLAGS += -MMD -MP
DEPS = $(OBJS:.o=.d)

-include $(DEPS)
```

---

## 3. CMake

### Basic CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.16)
project(my_app VERSION 1.0.0 LANGUAGES C)

# C standard
set(CMAKE_C_STANDARD 17)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS OFF)

# Compiler warnings
add_compile_options(
    -Wall -Wextra -Wpedantic -Werror
    -Wshadow -Wconversion -Wsign-conversion
)

# Source files
file(GLOB_RECURSE SOURCES src/*.c)

# Executable
add_executable(${PROJECT_NAME} ${SOURCES})

# Include directories
target_include_directories(${PROJECT_NAME} PRIVATE include)

# Link libraries
target_link_libraries(${PROJECT_NAME} PRIVATE m pthread)
```

### CMake Build Types

```cmake
# Set default build type
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release CACHE STRING "Build type" FORCE)
endif()

# Build type specific flags
set(CMAKE_C_FLAGS_DEBUG   "-g -O0 -DDEBUG -fsanitize=address")
set(CMAKE_C_FLAGS_RELEASE "-O2 -DNDEBUG")
```

### CMake with Libraries

```cmake
# Static library
add_library(mylib STATIC
    src/mylib/module_a.c
    src/mylib/module_b.c
)
target_include_directories(mylib PUBLIC include)

# Shared library
add_library(mylib_shared SHARED
    src/mylib/module_a.c
    src/mylib/module_b.c
)
target_include_directories(mylib_shared PUBLIC include)
set_target_properties(mylib_shared PROPERTIES
    VERSION ${PROJECT_VERSION}
    SOVERSION 1
)

# Executable that uses the library
add_executable(app src/main.c)
target_link_libraries(app PRIVATE mylib)
```

### CMake Build Commands

```bash
# Configure
cmake -B build -DCMAKE_BUILD_TYPE=Release

# Build
cmake --build build

# Build with parallel jobs
cmake --build build -j$(nproc)

# Install
cmake --install build --prefix /usr/local
```

---

## 4. Static and Shared Libraries

### Static Library (.a)

```bash
# Compile object files
gcc -c -o module_a.o module_a.c
gcc -c -o module_b.o module_b.c

# Create static library
ar rcs libmylib.a module_a.o module_b.o

# Link against static library
gcc main.c -L. -lmylib -o app
# or explicitly:
gcc main.c libmylib.a -o app
```

### Shared Library (.so / .dylib)

```bash
# Compile with position-independent code
gcc -fPIC -c module_a.c
gcc -fPIC -c module_b.c

# Create shared library
gcc -shared -o libmylib.so module_a.o module_b.o  # Linux
gcc -shared -o libmylib.dylib module_a.o module_b.o  # macOS

# Link against shared library
gcc main.c -L. -lmylib -o app

# Run (set library path)
LD_LIBRARY_PATH=. ./app                   # Linux
DYLD_LIBRARY_PATH=. ./app                 # macOS
```

---

## 5. pkg-config

```bash
# Find compiler flags for a library
pkg-config --cflags libssl    # -I/usr/include/openssl
pkg-config --libs libssl      # -lssl -lcrypto

# Use in compilation
gcc $(pkg-config --cflags --libs libssl) main.c -o app
```

### In Makefile

```makefile
SSL_CFLAGS = $(shell pkg-config --cflags libssl)
SSL_LIBS   = $(shell pkg-config --libs libssl)

CFLAGS += $(SSL_CFLAGS)
LDLIBS += $(SSL_LIBS)
```

### In CMake

```cmake
find_package(PkgConfig REQUIRED)
pkg_check_modules(SSL REQUIRED libssl)

target_include_directories(app PRIVATE ${SSL_INCLUDE_DIRS})
target_link_libraries(app PRIVATE ${SSL_LIBRARIES})
```

---

## 6. Cross-Compilation

```bash
# Cross-compile for ARM
arm-linux-gnueabihf-gcc -o app main.c

# CMake toolchain file (arm-toolchain.cmake)
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR arm)
set(CMAKE_C_COMPILER arm-linux-gnueabihf-gcc)
set(CMAKE_FIND_ROOT_PATH /usr/arm-linux-gnueabihf)

# Use toolchain
cmake -B build -DCMAKE_TOOLCHAIN_FILE=arm-toolchain.cmake
```
