# OxRSE core training slides

This repo conains [sli.dev](https://sli.dev/) slideshows for our training material.
Each course is a single slideshow, `presentations/<name>/slides.md`, with its images alongside it. Shared pieces live at the top level: `addon/` (a local Slidev addon that every slideshow loads, with shared components, layouts and styles), `epilogue/` (slides appended to every slideshow in an event build) and `events/` (one YAML file per training event).

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
    slot: "09:30"
    topic: Object-Oriented Programming
  - date: "22 Jan"
    slot: "14:00"
    topic: Functional Programming
  - date: "29 Jan"
    slot: "09:30"
    topic: Version control with Git
  - date: "29 Jan"
    slot: "14:00"
    topic: Collaborative Code Development
  - date: "05 Feb"
    slot: "09:30"
    topic: Software Testing
  - date: "05 Feb"
    slot: "14:00"
    topic: Continuous Integration
  - date: "12 Feb"
    slot: "09:30"
    topic: Packaging and Dependency Management
  - date: "12 Feb"
    slot: "14:00"
    topic: Containerisation with Docker
  - date: "19 Feb"
    slot: "09:30"
    topic: Introduction to HPC
  - date: "19 Feb"
    slot: "14:00"
    topic: Workflows with Snakemake
```

You can build with:

```console
TRAINING_EVENT='hilary-2026' npx slidev --open --entry presentations/functional/slides.md
```

The deploy workflow reads `TRAINING_EVENT` from the repository variable of the
same name (Settings > Secrets and variables > Actions > Variables). The two
repositories that deploy these slides differ only in that variable:

- [OxfordRSE/training-slides-core](https://github.com/OxfordRSE/training-slides-core)
  does not set it, so it deploys the generic build.
- [OxfordRSE/training-slides-event](https://github.com/OxfordRSE/training-slides-event)
  is a fork of training-slides-core, with the same files, including this README
  and the workflow. It sets the variable to the current event, e.g. `hds-2026`,
  so it deploys the event build.

Forks do not inherit repository variables, so each repository keeps its own
setting when the fork is synced. Moving to a new event is a change to the fork's
variable, not a commit.

Write each `date` as a day and a three-letter month (`"29 Sep"`), and each
`slot` as the session's start time (`"09:30"`). Quote both, so YAML reads them
as text. There is no rigorous error checking, but the epilogue walkthroughs fall
back to showing the date as written if either is in another format.

The event YAML file may also set `feedback_form` to use a different feedback
form for that event:

```yaml
year: 2026
feedback_form: jmJq6KWfMA
sessions:
  ...
```

This is either a Microsoft Forms ID, for a form at
`https://forms.cloud.microsoft/e/<ID>`, or a full URL starting with `http://` or
`https://` for a form hosted anywhere else. The feedback slide in the epilogue
draws a QR code for it using the `FeedbackQr` component. Without
`feedback_form`, it shows our normal feedback form.

The event YAML file may also set the event's `name` and `enrolment_key` on
train.rse.ox.ac.uk:

```yaml
year: 2026
name: "[TT26] Fundamentals of Software Engineering for Research"
enrolment_key: example-key
sessions:
  ...
```

These appear in the epilogue's animated walkthroughs of train.rse.ox.ac.uk
(`LoginDemo`, `EnrolDemo`, `MaterialDemo`, `ExerciseDemo` and `CommentDemo`,
played by `SiteDemo` in `addon/components/`), which show students how to
sign in, enrol on the event and use the course material. Without them, the
walkthroughs show "Your event" and `enrolment-key`. The enrolment key is shown
on the published slides of an event build.

Each session may also set a `background` colour for its row on the orientation
slide, for example to shade alternate days:

```yaml
  - date: "29 Sep"
    slot: "09:30"
    topic: Object-Oriented Programming
    background: "#eef2f6"
```

Quote the colour, since `#` starts a YAML comment. The orientation slide uses
the `orientation` layout from `addon/layouts/`, which replaces the
theme's layout of the same name and also shows each session's weekday and start
time.

A deck that is not a timetabled session, such as the course introduction, can
set `date: first-session` in its headmatter, so that its cover shows the event's
first date in an event build rather than the date it was built.

Decks in an event end with an event-only questions slide, using the `questions`
layout from `addon/layouts/`.

The landing page, built by `scripts/build-index.mjs`, lists every course with a
deck in `presentations/`. In an event build it lists only the courses in that
event, in timetable order: a deck belongs to the event when the `highlight:` of
its orientation slide matches a session `topic`. A deck with `date:
first-session` (the course introduction) is listed first. Each card then shows its
session's date and start time, and a short script highlights the session in
progress (in Oxford time, from an hour before it starts) and scrolls it into
view. To preview another moment, append `?now=` to the address, e.g.
`?now=2026-09-29T13:30`.

### Fonts

The decks use Noto Sans and JetBrains Mono, bundled from the
`@fontsource-variable` packages and imported in `addon/styles/index.css`.
Each deck's headmatter selects them and sets `provider: none`, so no fonts are
loaded from Google Fonts:

```yaml
fonts:
  sans: Noto Sans Variable
  mono: JetBrains Mono Variable
  provider: none
```

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

The deploy workflow uses the Node version in `.nvmrc` (currently 24), which
avoids this. Use the same version locally, e.g. with `nvm use`.

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
