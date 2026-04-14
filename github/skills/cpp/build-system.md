---
name: cpp-build-system
description: "C++ build system — CMake configuration, GCC/Clang compiler flags, Conan and vcpkg package management, static and shared libraries, linking, cross-compilation, sanitizers, and project structure. Use when: writing CMakeLists.txt; compiler flags; Conan/vcpkg dependency management; static and shared libraries; cross-compilation; sanitizer setup. DO NOT USE FOR: code conventions (use cpp-convention); testing configuration (use cpp-testing)."
---

# C++ Build System

## 1. GCC/Clang Compiler Flags

### Essential Flags

```bash
# Compilation
g++ -c main.cpp -o main.o           # compile to object file
g++ main.o utils.o -o app           # link object files
g++ main.cpp utils.cpp -o app       # compile and link in one step

# Standard version
g++ -std=c++17 main.cpp             # C++17
g++ -std=c++20 main.cpp             # C++20
g++ -std=c++23 main.cpp             # C++23
```

### Warning Flags

```bash
# Recommended minimum
g++ -Wall -Wextra -Wpedantic -Werror main.cpp

# Comprehensive warnings
g++ -Wall -Wextra -Wpedantic -Werror \
    -Wshadow -Wnon-virtual-dtor -Wold-style-cast \
    -Wcast-align -Wunused -Woverloaded-virtual \
    -Wconversion -Wsign-conversion \
    -Wnull-dereference -Wformat=2 \
    -Wimplicit-fallthrough \
    main.cpp
```

| Flag                     | Purpose                            |
| ------------------------ | ---------------------------------- |
| `-Wall`                  | Enable common warnings             |
| `-Wextra`                | Enable extra warnings              |
| `-Wpedantic`             | Enforce strict ISO C++             |
| `-Werror`                | Treat warnings as errors           |
| `-Wshadow`               | Warn on variable shadowing         |
| `-Wnon-virtual-dtor`     | Warn on missing virtual destructor |
| `-Wold-style-cast`       | Warn on C-style casts              |
| `-Woverloaded-virtual`   | Warn on hidden virtual overloads   |
| `-Wconversion`           | Warn on implicit type conversions  |
| `-Wimplicit-fallthrough` | Warn on switch fallthrough         |

### Optimization and Debug Flags

```bash
# Optimization
g++ -O0 main.cpp    # no optimization (debug builds)
g++ -O2 main.cpp    # recommended for release
g++ -O3 main.cpp    # aggressive optimization
g++ -Os main.cpp    # optimize for size
g++ -Og main.cpp    # optimize for debugging

# Debug
g++ -g main.cpp                         # debug symbols
g++ -g -fsanitize=address main.cpp      # AddressSanitizer (ASan)
g++ -g -fsanitize=undefined main.cpp    # UndefinedBehaviorSanitizer (UBSan)
g++ -g -fsanitize=thread main.cpp       # ThreadSanitizer (TSan)
g++ -g -fsanitize=memory main.cpp       # MemorySanitizer (MSan, clang only)
```

---

## 2. CMake

### Basic CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.20)
project(my_app VERSION 1.0.0 LANGUAGES CXX)

# C++ standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Compiler warnings
add_compile_options(
    -Wall -Wextra -Wpedantic -Werror
    -Wshadow -Wnon-virtual-dtor -Wconversion
)

# Source files
file(GLOB_RECURSE SOURCES src/*.cpp)

# Executable
add_executable(${PROJECT_NAME} ${SOURCES})

# Include directories
target_include_directories(${PROJECT_NAME} PRIVATE include)

# Link libraries
target_link_libraries(${PROJECT_NAME} PRIVATE pthread)
```

### CMake Build Types

```cmake
# Set default build type
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release CACHE STRING "Build type" FORCE)
endif()

# Per-type flags
set(CMAKE_CXX_FLAGS_DEBUG   "-g -O0 -DDEBUG -fsanitize=address,undefined")
set(CMAKE_CXX_FLAGS_RELEASE "-O2 -DNDEBUG")
set(CMAKE_CXX_FLAGS_RELWITHDEBINFO "-O2 -g -DNDEBUG")

# Build commands:
# cmake -B build -DCMAKE_BUILD_TYPE=Debug
# cmake --build build
# cmake --build build --config Release
```

### CMake with Libraries

```cmake
# Static library
add_library(mylib STATIC
    src/mylib/module_a.cpp
    src/mylib/module_b.cpp
)
target_include_directories(mylib PUBLIC include)
target_compile_features(mylib PUBLIC cxx_std_20)

# Shared library
add_library(mylib_shared SHARED
    src/mylib/module_a.cpp
    src/mylib/module_b.cpp
)
target_include_directories(mylib_shared PUBLIC include)
set_target_properties(mylib_shared PROPERTIES
    VERSION ${PROJECT_VERSION}
    SOVERSION 1
)

# Link app to library
target_link_libraries(${PROJECT_NAME} PRIVATE mylib)
```

### CMake with Testing

```cmake
# Enable testing
enable_testing()

# Add test executable
add_executable(tests
    test/test_main.cpp
    test/test_module_a.cpp
)
target_link_libraries(tests PRIVATE mylib GTest::gtest_main)

# Register tests with CTest
include(GoogleTest)
gtest_discover_tests(tests)
```

### CMake FetchContent (Download Dependencies)

```cmake
include(FetchContent)

# Google Test
FetchContent_Declare(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG v1.14.0
)
FetchContent_MakeAvailable(googletest)

# fmt library
FetchContent_Declare(
    fmt
    GIT_REPOSITORY https://github.com/fmtlib/fmt.git
    GIT_TAG 10.2.1
)
FetchContent_MakeAvailable(fmt)

target_link_libraries(${PROJECT_NAME} PRIVATE fmt::fmt)
```

### CMake find_package

```cmake
# Find system/installed packages
find_package(Threads REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(Boost 1.80 REQUIRED COMPONENTS filesystem system)

target_link_libraries(${PROJECT_NAME} PRIVATE
    Threads::Threads
    OpenSSL::SSL
    Boost::filesystem
    Boost::system
)
```

---

## 3. Conan Package Manager

### conanfile.txt

```ini
[requires]
fmt/10.2.1
spdlog/1.13.0
nlohmann_json/3.11.3
boost/1.84.0

[generators]
CMakeDeps
CMakeToolchain

[layout]
cmake_layout
```

### conanfile.py (Advanced)

```python
from conan import ConanFile
from conan.tools.cmake import CMake, cmake_layout

class MyAppConan(ConanFile):
    name = "my_app"
    version = "1.0.0"
    settings = "os", "compiler", "build_type", "arch"
    requires = "fmt/10.2.1", "spdlog/1.13.0"
    generators = "CMakeDeps", "CMakeToolchain"

    def layout(self):
        cmake_layout(self)

    def build(self):
        cmake = CMake(self)
        cmake.configure()
        cmake.build()
```

### Conan Workflow

```bash
# Install dependencies
conan install . --output-folder=build --build=missing

# Configure and build
cmake --preset conan-release
cmake --build --preset conan-release

# Or manually
cd build
cmake .. -DCMAKE_TOOLCHAIN_FILE=conan_toolchain.cmake
cmake --build .
```

---

## 4. vcpkg Package Manager

### Setup

```bash
# Install vcpkg
git clone https://github.com/microsoft/vcpkg.git
cd vcpkg && ./bootstrap-vcpkg.sh

# Install packages
./vcpkg install fmt spdlog nlohmann-json
```

### vcpkg.json (Manifest Mode)

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": [
    "fmt",
    "spdlog",
    "nlohmann-json",
    {
      "name": "boost",
      "features": ["filesystem", "system"]
    }
  ]
}
```

### CMake Integration with vcpkg

```bash
# Configure with vcpkg toolchain
cmake -B build -DCMAKE_TOOLCHAIN_FILE=[vcpkg root]/scripts/buildsystems/vcpkg.cmake

# Or set in CMakePresets.json
```

### CMakePresets.json

```json
{
  "version": 3,
  "configurePresets": [
    {
      "name": "default",
      "binaryDir": "build",
      "cacheVariables": {
        "CMAKE_TOOLCHAIN_FILE": "$env{VCPKG_ROOT}/scripts/buildsystems/vcpkg.cmake",
        "CMAKE_CXX_STANDARD": "20",
        "CMAKE_BUILD_TYPE": "Release"
      }
    },
    {
      "name": "debug",
      "inherits": "default",
      "cacheVariables": {
        "CMAKE_BUILD_TYPE": "Debug"
      }
    }
  ],
  "buildPresets": [
    { "name": "default", "configurePreset": "default" },
    { "name": "debug", "configurePreset": "debug" }
  ]
}
```

---

## 5. Project Structure

```
project/
├── include/                  # Public headers
│   └── project/
│       ├── module_a.h
│       └── module_b.h
├── src/                      # Source files
│   ├── module_a.cpp
│   ├── module_b.cpp
│   └── main.cpp
├── test/                     # Test files
│   ├── test_module_a.cpp
│   └── test_module_b.cpp
├── lib/                      # Third-party libraries
├── cmake/                    # CMake modules
│   └── FindMyLib.cmake
├── .clang-format             # Formatting config
├── .clang-tidy               # Static analysis config
├── CMakeLists.txt            # Root build file
├── CMakePresets.json         # Build presets
├── conanfile.txt             # Conan deps (or vcpkg.json)
└── README.md
```
