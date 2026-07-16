# OxRSE core training slides

This repo conains [sli.dev](https://sli.dev/) slideshows for our training material.
The meat of each slideshow is in `common`, and thin wrappers defining the presentation structure are in `presentations`.

## Slidev build

First, install dependencies:

```console
npm install
```

To preview / live edit a presentation:

```console
npx slidev --open --entry presentations/functional/slides.md
```

### Build with a specific training event

You may set up a YAML fle for a training event that contains all the dates of
different sessions, and by using the theme `theme-oxrse` with the `orientation`
layout, it will include the 'Orientation' slide in the PowerPoint presentation
using the dates in the YAML file. The YAML file provides a single source of
truth for all the dates of a training event and highlight the current session.

For example, if you have a YAML file `events/hilary-2026.yaml` with the
following content:

```yaml
year: 2026
sessions:
  - date: "22 Jan"
    slot: morning
    topic: Object-Oriented Programming
  - date: "22 Jan"
    slot: afternoon
    topic: Functional Programming
  - date: "29 Jan"
    slot: morning
    topic: Version control with Git
  - date: "29 Jan"
    slot: afternoon
    topic: Collaborative Code Development
  - date: "05 Feb"
    slot: morning
    topic: Software Testing
  - date: "05 Feb"
    slot: afternoon
    topic: Continuous Integration
  - date: "12 Feb"
    slot: morning
    topic: Packaging and Dependency Management
  - date: "12 Feb"
    slot: afternoon
    topic: Containerisation with Docker
  - date: "19 Feb"
    slot: morning
    topic: Introduction to HPC
  - date: "19 Feb"
    slot: afternoon
    topic: Workflows with Snakemake
```

You can build with:

```console
TRAINING_EVENT='hilary-2026' npx slidev --open --entry presentations/functional/slides.md
```

Note: this is an initial implementation and there is no rigorous error checking
at the moment, e.g. you can put anything in the 'date' field.

### Build Error

If you encounter an error similar to this:

```text
var shouldDebug = hasLocalStorage && /*#__PURE__*/localStorage.getItem("DEBUG") || hasProcess && process.env.DEBUG;
                                                               ^

TypeError: localStorage.getItem is not a function
    at Object.<anonymous> (node_modules/@typescript/vfs/dist/vfs.cjs.development.js:25:64)
    at Module._compile (node:internal/modules/cjs/loader:1809:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1940:10)
    at Module.load (node:internal/modules/cjs/loader:1530:32)
    at Module._load (node:internal/modules/cjs/loader:1332:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1553:12)
    at require (node:internal/modules/helpers:152:16)
    at Object.<anonymous> (node_modules/@typescript/vfs/dist/index.js:7:20)
    at Module._compile (node:internal/modules/cjs/loader:1809:14)
```

You may need to set `NODE_OPTIONS='--no-webstorage'` during the build. This is
because of an incompatability with Node >=25. See this [Vue Devtools issue comment](https://github.com/vuejs/devtools/issues/977#issuecomment-3411051527) and the [TypeScript Website pull request](https://github.com/microsoft/TypeScript-Website/pull/3450).

## Typography

Slide sources should be plain ASCII. Slidev enables markdown-it's `typographer`,
so ASCII already renders as proper typography and there is no need to paste the
real character:

| Type this            | Renders as                       |
| -------------------- | -------------------------------- |
| `---`                | em dash                          |
| `--`                 | en dash                          |
| `...`                | ellipsis                         |
| `+-`                 | plus-minus sign                  |
| `(c)`, `(tm)`, `(r)` | copyright, trademark, registered |

Slidev also overrides markdown-it's `quotes` so that quotes stay straight. A
pasted curly apostrophe therefore renders *differently* from every ASCII
apostrophe around it.

These characters almost always arrive by copy-paste from a PDF, Word or a
browser. Avoid the following, and type the ASCII equivalent instead.

### Quotes

| Avoid                       | Codepoint | Type instead |
| --------------------------- | --------- | ------------ |
| Left single quotation mark  | U+2018    | `'`          |
| Right single quotation mark | U+2019    | `'`          |
| Left double quotation mark  | U+201C    | `"`          |
| Right double quotation mark | U+201D    | `"`          |
| Prime                       | U+2032    | `'`          |
| Double prime                | U+2033    | `"`          |

### Dashes and punctuation

| Avoid                             | Codepoint | Type instead |
| --------------------------------- | --------- | ------------ |
| En dash                           | U+2013    | `--`         |
| Em dash                           | U+2014    | `---`        |
| Horizontal ellipsis               | U+2026    | `...`        |
| Minus sign                        | U+2212    | `-`          |
| Hyphen                            | U+2010    | `-`          |
| Non-breaking hyphen               | U+2011    | `-`          |
| Modifier letter circumflex accent | U+02C6    | `^`          |

Note that the minus sign and the two hyphens map to a single `-`, not to `--`.
They are not dashes, and `--` would render as an en dash.

### Invisible characters

| Avoid                 | Codepoint | Type instead   |
| --------------------- | --------- | -------------- |
| No-break space        | U+00A0    | a normal space |
| Zero width space      | U+200B    | delete it      |
| Zero width non-joiner | U+200C    | delete it      |
| Soft hyphen           | U+00AD    | delete it      |
| Byte order mark       | U+FEFF    | delete it      |

### What is not flagged

Characters that carry meaning are deliberately left alone: accented letters in
names, Greek letters, maths symbols, box-drawing characters in `tree` output,
and currency symbols. Only look-alike punctuation with an unambiguous ASCII
equivalent is listed above.

Take particular care inside code spans and fenced blocks. The typographer skips
them, so a pasted en dash in a command such as `snakemake --dag` stays exactly
as pasted and will fail for anyone who copies it.

### Checking

CI checks every pull request, but only the lines that the pull request adds, so
existing text never fails the build. To check locally:

```console
python3 scripts/check-typography.py --all          # every tracked Markdown file
python3 scripts/check-typography.py FILE [FILE...] # specific files
```

A repo-wide scan can also be run on demand from the Actions tab via the
`typography` workflow.

The check only ever reports; it never rewrites files, because several of these
characters are legitimate elsewhere and each replacement wants a human eye.

> This section names characters rather than showing them, so that it passes its
> own check. Please keep it that way.

## Deployment

When the repository is updated, a Github action will use `./build_all.sh` to build all presentations into a `dist/` folder and deploy to github pages.

The generated course landing page at `dist/index.html` now uses a custom template
that pulls presentation titles from each `slides.md`, reuses the OxRSE logo, and
can optionally surface the current training schedule when `TRAINING_EVENT` is set.

### Optional analytics

The landing page includes optional Plausible boilerplate. To enable it during the
build, set:

- `PLAUSIBLE_DOMAIN` to your deployed site domain
- `PLAUSIBLE_SRC` if you need a non-default Plausible script URL
- `PLAUSIBLE_API` if you are proxying or self-hosting the events endpoint
