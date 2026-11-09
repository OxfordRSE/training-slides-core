---
theme: oxrse
title: "Introduction to Python 1: The Core Language"
addons:
  - ../addon
layout: cover
highlighter: shiki
drawings:
  persist: false
transition: slide-left
mdc: true
fonts:
  sans: Noto Sans Variable
  mono: JetBrains Mono Variable
  provider: none
---

---

# Overview

1. Getting started: running Python, variables and types
2. Control flow: lists, loops and conditionals
3. When things go wrong: reading errors

<div class="pt-8">

- Full notes, exercises and solutions are in the **Intro to Python** course on train.rse
- These slides summarise the main ideas
- Part 2 covers functions, containers and data

</div>

---
layout: two-cols
---

# Why Python?

- **Readable**: the syntax is close to pseudocode
- **Interpreted**: run code without a separate compilation step
- **Dynamically typed**: no need to declare types
- **Multi-paradigm**: procedural, object-oriented, functional
- **Libraries for research**: NumPy, pandas, Matplotlib, PyTorch
- Widely used in research groups

::right::

<div class="pt-12">

```console
$ python -c "import this"
The Zen of Python, by Tim Peters

Beautiful is better than ugly.
Explicit is better than implicit.
Simple is better than complex.
...
Readability counts.
...
```

<span class="font-semibold text-lg text-red-700">Write code that someone else can follow.</span>

</div>

---
layout: section
title: " "
---

## Part 1: Getting started

---
layout: two-cols
---

# Running Python

::left::

- Type `python` (or `python3`) in a terminal
- This opens the **REPL**: read-eval-print loop
  - Reads your input, evaluates it and displays any result
  - Useful for trying short pieces of code
- `>>>` is the prompt; `...` means more input is expected
- Use `quit()` to leave

<div class="mt-10 border border-stone-500 rounded p-2 text-stone-700">
We'll cover the syntax in this example during the session.
</div>

::right::

<div class="code-sm">

```python
>>> 1 + 6
7
>>> a = 2
>>> b = 3
>>> a + b
5
>>> word = "Hello"
>>> len(word)
5
>>> for word in ["Leeds", "Munich", "Marseille"]:
...     print("City name has", len(word), "letters in it.")
...
City name has 5 letters in it.
City name has 6 letters in it.
City name has 9 letters in it.
>>> quit()
```

</div>

---
layout: two-cols
---

# Writing scripts in an IDE

::left::

- Variables from a REPL session are lost when you quit
- A **script** is a plain text file of Python code, saved as `.py`
- Write it in an IDE (integrated development environment):
  - [VS Code](https://code.visualstudio.com/): what we'll use
  - [PyCharm](https://www.jetbrains.com/pycharm/)
  - [Spyder](https://www.spyder-ide.org/): MATLAB-like
- IDEs help you write, run and debug code
- Jupyter notebooks are also an option
  - Combine code, results and notes in one document

::right::

Save as `hello.py`:

```python
name = "world"
print("Hello", name)
```

Run it from the terminal:

```console
$ python hello.py
Hello world
```

<div class="mt-10 border border-stone-500 rounded p-2 text-stone-700">
Or use the Run Python File button in VS Code.
</div>

---
layout: two-cols
---

# Variables

::left::

- `name = value` assigns a value to a variable
- `print()` displays values
- Variables must be **created before they are used**
- Assignments do not update automatically when other variables change
- Python is **case-sensitive**: `age` and `Age` are different
- Use **meaningful names**
  - `age = 42` tells the reader what the value represents

::right::

```python
>>> age = 42
>>> first_name = "Ahmed"
>>> print(first_name, "is", age, "years old")
Ahmed is 42 years old

>>> print(last_name)
NameError: name 'last_name' is not defined

>>> age = age + 3
>>> print("Age in three years:", age)
Age in three years: 45

>>> first = 1
>>> second = 5 * first
>>> first = 2
>>> print(second)   # still 5
5
```

---
layout: two-cols
---

# Every value has a type

::left::

- `int`: whole numbers, e.g. `42`
- `float`: floating-point numbers, e.g. `3.14`
- `str`: text, e.g. `"Hello"`
- `bool`: `True` or `False`
- `type()` tells you the type of a value
- The type controls which operations make sense
  - `+` adds numbers, but joins strings
- Convert with `int()`, `float()`, `str()`
- Arithmetic with an `int` and a `float` usually gives a `float`

::right::

```python
>>> type(52)
<class 'int'>
>>> type("some text")
<class 'str'>

>>> "Ada" + " " + "Lovelace"
'Ada Lovelace'
>>> "=" * 10
'=========='

>>> 1 + "2"
TypeError: unsupported operand type(s)
for +: 'int' and 'str'
>>> 1 + int("2")
3
>>> str(1) + "2"
'12'

>>> 1 + 2.5
3.5
```

---
layout: two-cols
---

# Indexing and slicing strings

::left::

- Use an index in `[]` to get a single character
- Python counts from **zero**
- A slice `[start:stop]` gets a substring
  - Includes `start`, but **stops before** `stop`
- Negative indices count from the end
- `len()` gives the length


::right::

```python
>>> atom_name = "sodium"
>>> atom_name[0]
's'
>>> atom_name[2]
'd'
>>> atom_name[-1]
'm'
>>> atom_name[0:3]
'sod'
>>> atom_name[3:]
'ium'
>>> len(atom_name)
6
>>> atom_name[6]
IndexError: string index out of range
```

<div class="mt-6 border border-stone-500 rounded p-2 text-stone-700">
The first character is at index 0; use index -1 for the last character.
</div>

---
layout: two-cols
---

# Built-in functions and help

::left::

- A function takes **arguments** and may **return** a value
  - `max(1, 2, 3)`, `round(3.712, 1)`, `len("abc")`
- Some parameters have **default values**
- **Methods** are functions attached to a value
  - `"hello".upper()`
- `#` starts a comment: ignored by Python, read by humans
- `help(round)` shows the documentation
- Find the Python reference at [docs.python.org](https://docs.python.org/3/)

::right::

```python
>>> max(1, 2, 3)
3
>>> min("a", "A", "0")
'0'
>>> round(3.712)
4
>>> round(3.712, 1)   # ndigits defaults to None
3.7

>>> my_string = "Hello world!"
>>> my_string.upper()
'HELLO WORLD!'
>>> my_string.isupper()
False

>>> help(round)
Help on built-in function round in module builtins:

round(number, ndigits=None)
    Round a number to a given precision in decimal digits.
    ...
```

---
layout: section
title: " "
---

## Part 2: Control flow

---
layout: two-cols
---

# Lists

::left::

- A list stores many values in **one** variable
  - `[value1, value2, ...]`
- Indexing and slicing work as they do for strings
- Lists are **mutable**: you can change them in place
  - `append`, `extend`, `del`, `pop`
- Strings are **immutable**: you cannot change them in place
- Lists can hold anything, including other lists

::right::

```python
>>> pressures = [0.273, 0.275, 0.277, 0.275, 0.276]
>>> pressures[0]
0.273
>>> len(pressures)
5

>>> pressures[0] = 0.265
>>> pressures.append(0.280)
>>> del pressures[1]
>>> pressures
[0.265, 0.277, 0.275, 0.276, 0.28]

>>> element = "carbon"
>>> element[0] = "C"
TypeError: 'str' object does not support item assignment

>>> nested = [["pepper", "paprika"], ["salt"]]
>>> nested[0][1]
'paprika'
```

---
layout: two-cols
---

# For loops

::left::

- Run the same code **once for each value** in a collection
- A loop has:
  - a **collection**: `[2, 3, 5]`
  - a **loop variable**: `number`
  - a **body**: the indented code
- The first line **must end with a colon**
- The body **must be indented**
  - Indentation marks which statements belong to the loop
- `range(n)` gives the numbers `0` to `n - 1`

::right::

```python
for number in [2, 3, 5]:
    print(number)
```

```text
2
3
5
```

```python
for i in range(3):
    print(i, "squared is", i * i)
```

```text
0 squared is 0
1 squared is 1
2 squared is 4
```

```python
for number in [2, 3, 5]:
print(number)
```

```text
IndentationError: expected an indented block
```

---
layout: two-cols
---

# The accumulator pattern

::left::

- Build a result by updating it on each iteration:
  1. Initialise an accumulator **before** the loop
  2. Update it **inside** the loop
  3. Use it **after** the loop
- Use it for sums, counts, lists or strings

<div class="pt-6">
<span class="font-semibold text-lg text-red-700">Initialise the accumulator before the loop so it is not reset each time.</span>
</div>

::right::

Sum the integers from 1 to 10:

```python
total = 0
for number in range(10):
    total = total + (number + 1)
print(total)
```

```text
55
```

<br/>

Build a list of word lengths:

```python
lengths = []
for word in ["red", "green", "blue"]:
    lengths.append(len(word))
print(lengths)
```

```text
[3, 5, 4]
```

---
layout: two-cols
---

# Conditionals

::left::

- `if` runs a block only when a condition is `True`
- `elif` adds another condition; `else` handles the remaining cases
- Conditions are tested **in order**
  - Run the first matching branch and skip the rest
- Comparisons: `==`, `!=`, `<`, `<=`, `>`, `>=`
- Combine with `and`, `or` and `not`
  - Use parentheses when mixing them
- Same colon and indentation rules as loops

::right::

```python
masses = [3.54, 2.07, 9.22, 1.86, 1.71]
for m in masses:
    if m > 9.0:
        print(m, "is HUGE")
    elif m > 3.0:
        print(m, "is large")
    else:
        print(m, "is small")
```

```text
3.54 is large
2.07 is small
9.22 is HUGE
1.86 is small
1.71 is small
```

```python
grade = 85
if grade >= 70:
    print("grade is C")
elif grade >= 80:
    print("grade is B")   # skipped
```

---
layout: section
title: " "
---

## Part 3: When things go wrong

---
layout: two-cols
---

# Reading a traceback

::left::

- An unhandled exception prints a **traceback**
- It shows where the error occurred
- Read them **from the bottom up**:
  1. The **error type** and message
  2. The line where it happened
  3. The calls that got you there
- Search for the error type and message if you need help
  - Check how the explanation applies to your code

::right::

```python
def favourite_ice_cream():
    ice_creams = [
        "chocolate",
        "vanilla",
        "strawberry",
    ]
    print(ice_creams[3])

favourite_ice_cream()
```

```text
Traceback (most recent call last):
  File "ice_cream.py", line 9, in <module>
    favourite_ice_cream()
  File "ice_cream.py", line 7, in favourite_ice_cream
    print(ice_creams[3])
          ~~~~~~~~~~^^^
IndexError: list index out of range
```

---
layout: two-cols
---

# Common errors

::left::

- `SyntaxError`: Python can't parse your code
  - Missing colons, brackets or quotes
- `IndentationError`: missing or incorrect indentation
  - Don't mix tabs and spaces
- `NameError`: a name is not defined in the current scope
  - Usually a typo or a missing assignment
- `IndexError`: an index is outside the sequence
- `FileNotFoundError`: a file or directory cannot be found
- `TypeError`: wrong type for the operation

::right::

```python
>>> def some_function()
SyntaxError: expected ':'

>>> print(a_variable)
NameError: name 'a_variable' is not defined

>>> letters = ["a", "b", "c"]
>>> letters[4]
IndexError: list index out of range

>>> open("myfile.txt", "r")
FileNotFoundError: [Errno 2] No such file or directory:
'myfile.txt'
```

<div class="mt-6 border border-stone-500 rounded p-2 text-stone-700">
Read the error message and check the indicated line before changing your code.
</div>

---

# Next time

Part 2 builds on these topics:

- **Functions**: writing your own, scope and raising exceptions
- **More containers**: tuples, dictionaries and copying lists
- **Libraries and data**: NumPy, Matplotlib and pandas
  - Get the example data ready: download `uniqplus_python_data.zip` from the course

<div class="pt-8">
<span class="font-semibold text-lg text-red-700">Before then: work through the exercises up to "Looping Over Data Sets".</span>
</div>

---
layout: center
---

# Exercises on train.rse

<div style="text-align: center; font-size: 1.5em; line-height: 1.6; color: #9ca3af;">
Practise what you've covered<br />
with the <span v-mark.underline.orange="1">course exercises</span>
</div>

<br />

<div style="text-align: center;">
Try changing the examples and checking what happens.
</div>

<div style="text-align: right; font-size: 0.85em; color: #6b7280; margin-top: 3em;">
Adapted from <a href="https://swcarpentry.github.io/python-novice-inflammation/">"Programming with Python" by The Carpentries</a> (CC-BY-4.0)
</div>
