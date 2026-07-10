---
layout: default
---

# "It works on my machine"

<v-clicks>

- You have a working C++ program on your laptop.
- Now it needs to build somewhere else:
  - a collaborator's laptop
  - the group workstation
  - an HPC login node
- Different compilers, different library locations, different operating systems.
- Everyone should end up with **the same program**, built the same way, wherever they are.

</v-clicks>

---
layout: two-cols-header
---

# Why not just call the compiler?

::left::

You could compile by hand:

```bash
g++ -std=c++17 main.cpp functionality.cpp \
    -I/usr/local/include/eigen3 \
    -lboost_program_options \
    -o main_executable
```

::right::

<v-clicks>

- Fine for a couple of files on one machine.
- Falls apart as sources and dependencies grow.
- Hard-codes the compiler, the flags, and every library path.
- `Make` helps, but the rules are Make-specific and still not portable.

</v-clicks>

---
layout: two-cols-header
---

# CMake is a build system generator

::left::

<v-clicks>

- You **describe intent** in a `CMakeLists.txt`: targets, sources, dependencies.
- CMake **generates** the actual build files:
  - Makefiles
  - Ninja build files
  - Visual Studio project files
  - Xcode project files
  - ...
- CMake doesn't compile your code; it generates the instructions that do.
- One description, built anywhere, with whatever toolchain is available.

</v-clicks>

::right::

<div class="h-full flex items-center justify-center p-4">
  <img src="./imgs/cmake_logo.svg" alt="CMake" class="max-h-40 max-w-full object-contain" />
</div>

---
layout: two-cols-header
---

# Two steps: configure, then build

::left::

<v-clicks>

- **Configure**: read `CMakeLists.txt`, inspect the system, generate build files.
- **Build**: run the generated build tool to compile and link.
- Build *out of tree*, keeping generated files in a separate `build/` directory.

</v-clicks>

::right::

```bash
# configure
cmake -S . -B build

# build
cmake --build build

# run
./build/main_executable
```

---
layout: default
---

# Everything is a 'target'

<v-clicks>

A **target** is something CMake builds, such as an executable or a library:

```cmake
add_executable(app main.cpp)
add_library(mylib STATIC functionality.cpp)
```

You attach everything a target needs *to the target* (sources, include
directories, compile features, and dependencies):

```cmake
target_link_libraries(app PRIVATE mylib)
```

Modern CMake is **target-based**: prefer this to global settings that leak
everywhere.

This is one of the biggest shifts if you used CMake in the past:

- Stop thinking about global flags and variables.
- Start thinking about what each target needs: everything now hangs off targets.

</v-clicks>

---
layout: two-cols-header
---

# Who needs to know? PRIVATE / PUBLIC / INTERFACE

When `app` links `mylib`, some of `mylib`'s requirements should pass on to `app`, and some shouldn't.

::left::

<v-clicks>

- **PRIVATE**: needed to *build* the target, but not by its users.
- **PUBLIC**: needed by the target *and* by anything that links it.
- **INTERFACE**: not needed to build the target itself, only by its users (e.g. a header-only library).

</v-clicks>

::right::

<v-click>

```cmake
target_link_libraries(mylib
  PUBLIC  Eigen3::Eigen   # used in mylib's headers
  PRIVATE fmt::fmt        # used only in mylib's .cpp
)
```

Get this right and dependencies propagate correctly. This is often the fiddliest
part to get the hang of, and you'll practise it in the material.

</v-click>

---
layout: two-cols-header
---

# Finding dependencies

::left::

<v-clicks>

- `find_package` locates a library without you knowing where it lives.
- **Config mode**: the library ships a `…Config.cmake`, the modern norm (e.g. Eigen, Boost ≥ 1.70).
- **Module mode**: CMake, or you, provide a `Find<package>.cmake`.
- Then you link a **namespaced target**, with no manual `-I` / `-l`.

</v-clicks>

::right::

```cmake
find_package(Eigen3 CONFIG REQUIRED)
find_package(Boost  CONFIG REQUIRED
             COMPONENTS program_options)

target_link_libraries(app
  PRIVATE Eigen3::Eigen
          Boost::program_options)
```

---
layout: default
---

# CMake is a language

<v-clicks>

- It has variables, lists, conditionals, loops and functions.
- User-facing **options** (`option(...)`) and cached settings you pass with `-D...`.
- Handy for compiler warnings, feature flags and portability checks.

</v-clicks>

---
layout: two-cols-header
---

# What you'll do next (on your own)

::left::

A series of **checkpoints**, each building on the last:

<v-clicks>

- **0**: build a "hello, world"
- **1**: split code across subdirectories
- **2**: extract a library
- **3**: add a dependency (Eigen)
- **4**: add another (Boost)
- **5**: turn on compiler warnings

</v-clicks>

::right::

<v-click>

Work at your own pace. Each checkpoint is a small, self-contained project with a
`CMakeLists.txt` to complete.

The written material walks through every step.

</v-click>

---
layout: default
---

# Getting started

Clone the exercises and open the course material:

```bash
git clone https://github.com/OxfordRSE/IntroCMakeCourse
```

<v-clicks>

- Start at **Checkpoint 0** and work through in order.
- Remember the loop: **configure → build → run**.
- The written material covers every step in detail.
- Ask questions, especially about visibility and dependencies, which often take a bit of getting used to.

</v-clicks>

---
layout: two-cols-header
---

# Further materials

::left::

If you want to go deeper, the standard modern-CMake reference is:

**Professional CMake: A Practical Guide**

Craig Scott, Crascit

A regularly updated, practical guide to modern CMake: from your first project
through to installing, packaging, and cross-compilation.

[crascit.com/professional-cmake](https://crascit.com/professional-cmake/)

Cover image © Craig Scott / Crascit, shown here for reference.{class="text-sm opacity-60"}

::right::

<div class="h-full flex items-center justify-center p-4">
  <img src="./imgs/professional_cmake.png" alt="Professional CMake: A Practical Guide, by Craig Scott" class="max-h-80 max-w-full object-contain" />
</div>
