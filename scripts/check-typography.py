#!/usr/bin/env python3
"""Flag Unicode characters that have a plain-ASCII equivalent.

Slidev turns on markdown-it's `typographer`, so ASCII source already renders as
proper typography: `---` becomes an em dash, `--` an en dash, `...` an ellipsis.
Typing these characters literally is therefore never necessary, and they only
ever arrive by pasting from a PDF, Word or a browser.

Only look-alike punctuation is listed below. Characters that carry meaning --
accented letters in names, Greek, maths symbols, box-drawing in `tree` output,
currency -- are deliberately absent and must never be rewritten.

Usage:
    check-typography.py --diff <base>   # only lines added since <base> (CI)
    check-typography.py --all           # every tracked file (local audit)
    check-typography.py FILE [FILE...]  # specific files
"""

from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
import unicodedata

# char -> what to type instead
DENYLIST = {
    "‘": "'",           # LEFT SINGLE QUOTATION MARK
    "’": "'",           # RIGHT SINGLE QUOTATION MARK
    "“": '"',           # LEFT DOUBLE QUOTATION MARK
    "”": '"',           # RIGHT DOUBLE QUOTATION MARK
    "–": "--",          # EN DASH   -- typographer renders `--` back into an en dash
    "—": "---",         # EM DASH   -- typographer renders `---` back into an em dash
    "…": "...",         # HORIZONTAL ELLIPSIS
    "−": "-",           # MINUS SIGN
    "ˆ": "^",           # MODIFIER LETTER CIRCUMFLEX ACCENT
    "′": "'",           # PRIME
    "″": '"',           # DOUBLE PRIME
    "‐": "-",           # HYPHEN
    "‑": "-",           # NON-BREAKING HYPHEN
    " ": " ",           # NO-BREAK SPACE          (invisible)
    "​": "",            # ZERO WIDTH SPACE        (invisible; delete)
    "‌": "",            # ZERO WIDTH NON-JOINER   (invisible; delete)
    "­": "",            # SOFT HYPHEN             (invisible; delete)
    "﻿": "",            # BOM / ZERO WIDTH NO-BREAK SPACE (invisible; delete)
}

DEFAULT_PATHSPEC = ["*.md"]


def describe(ch: str) -> str:
    try:
        name = unicodedata.name(ch)
    except ValueError:
        name = "<unnamed>"
    return f"U+{ord(ch):04X} {name}"


def suggestion(ch: str) -> str:
    want = DENYLIST[ch]
    if want == "":
        return "delete it (zero-width/invisible)"
    if want == " ":
        return "use a normal space"
    return f"use {want!r}"


def report(path: str, lineno: int, col: int, ch: str, text: str) -> None:
    msg = f"{describe(ch)} -- {suggestion(ch)}"
    # GitHub Actions annotation; also readable in a plain terminal.
    if os.environ.get("GITHUB_ACTIONS") == "true":
        print(f"::error file={path},line={lineno},col={col}::{msg}")
    print(f"{path}:{lineno}:{col}: {msg}")
    print(f"    {text.rstrip()}")
    print(f"    {' ' * (col - 1)}^")


def scan_line(path: str, lineno: int, line: str) -> int:
    found = 0
    for idx, ch in enumerate(line):
        if ch in DENYLIST:
            report(path, lineno, idx + 1, ch, line)
            found += 1
    return found


def scan_files(paths: list[str]) -> int:
    found = 0
    for path in paths:
        if not os.path.isfile(path):
            continue
        try:
            with open(path, encoding="utf-8") as fh:
                lines = fh.read().split("\n")
        except (UnicodeDecodeError, OSError):
            continue  # binary or unreadable: not our problem
        for lineno, line in enumerate(lines, 1):
            found += scan_line(path, lineno, line)
    return found


def scan_diff(base: str, pathspec: list[str]) -> int:
    """Only flag characters on lines *added* relative to `base`.

    Pre-existing violations in untouched lines are left alone, so the check
    never fails a PR for something it did not introduce.
    """
    cmd = ["git", "diff", "-U0", f"{base}...HEAD", "--", *pathspec]
    diff = subprocess.check_output(cmd, text=True, errors="replace")

    found = 0
    path = None
    lineno = 0
    hunk_re = re.compile(r"^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@")

    for line in diff.split("\n"):
        if line.startswith("+++ b/"):
            path = line[6:]
        elif line.startswith("+++ "):
            path = None
        elif line.startswith("@@"):
            m = hunk_re.match(line)
            lineno = int(m.group(1)) if m else 0
        elif line.startswith("+") and not line.startswith("+++"):
            if path:
                found += scan_line(path, lineno, line[1:])
            lineno += 1
    return found


def tracked_files(pathspec: list[str]) -> list[str]:
    cmd = ["git", "ls-files", "--", *pathspec]
    return subprocess.check_output(cmd, text=True).splitlines()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("files", nargs="*", help="specific files to scan")
    ap.add_argument("--diff", metavar="BASE",
                    help="only scan lines added since BASE (used by CI)")
    ap.add_argument("--all", action="store_true",
                    help="scan every tracked file matching --pathspec")
    ap.add_argument("--pathspec", nargs="*", default=DEFAULT_PATHSPEC,
                    help="git pathspec limiting --all/--diff "
                         f"(default: {' '.join(DEFAULT_PATHSPEC)})")
    args = ap.parse_args()

    if args.diff:
        found = scan_diff(args.diff, args.pathspec)
        scope = f"lines added since {args.diff}"
    elif args.all:
        found = scan_files(tracked_files(args.pathspec))
        scope = "all tracked files"
    elif args.files:
        found = scan_files(args.files)
        scope = f"{len(args.files)} file(s)"
    else:
        ap.error("give --diff BASE, --all, or a list of files")

    print()
    if found:
        print(f"Found {found} non-ASCII character(s) with an ASCII equivalent "
              f"({scope}).")
        print("Slidev's typographer renders ASCII correctly: --- is an em dash, "
              "-- an en dash, ... an ellipsis.")
        print("Fix these by hand -- do not bulk-replace, as some look-alikes are "
              "legitimate content elsewhere.")
        return 1

    print(f"No look-alike Unicode found ({scope}).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
