---
layout: two-cols-header
---

# What is a coding agent

::left::

<div class="pt-4">

> A coding agent is a piece of software that acts as a **harness** for an LLM,
> extending that LLM with additional capabilities that are powered by invisible
> prompts and implemented as callable tools.

</div>

<div class="text-sm text-right pt-2">Simon Willison, <a href="https://simonwillison.net/guides/agentic-engineering-patterns/how-coding-agents-work/">"How coding agents work"</a></div>

<div class="text-2xl font-bold text-center pt-20">agent = model + harness</div>

::right::

<div class="pl-4 pt-4">

- **Model**: the underlying LLM
- **Harness**: everything around the model:
  - **loop**: run a tool, feed the result back, and repeat
  - **tools**: read and edit files, inspect commit history, run your tests
    etc.
  - **context management**: compact, handle caches
  - **guardrails**: what it can and cannot do

</div>

::bottom::

<div class="text-sm opacity-60">
Harness components after Anthropic, <a href="https://claude.com/blog/harnessing-claudes-intelligence">"Agent harness design"</a>, 2 April 2026.
</div>

---
layout: two-cols-header
---

# Modern coding agents

::left::

<div class="pr-4 h-full flex flex-col justify-between">

- **Copilot** (2021): inline suggestions
- **Aider** (2023), **Cursor** (2024): instruction files, slash commands
- **Claude Code** (2025): subagents, hooks, skills
- Later coding agents such as **Codex CLI**, **OpenCode**, **Copilot CLI**,
  **Antigravity** etc. are heavily influenced by Claude Code.

<div class="text-sm opacity-60">
JetBrains, <a href="https://blog.jetbrains.com/research/2026/08/ai-coding-agent-adoption-2026/">AI coding agent adoption</a>, August 2026 (15,509 developers surveyed May-July 2026).
</div>

</div>

::right::

<div class="pl-4 h-full flex flex-col justify-center gap-3">
<img src="./imgs/jetbrains_survey_26.png" alt="AI tool use at work" class="w-full" />
<div class="w-3/5 self-center">
<img src="./imgs/cc_research_preview.png" alt="Claude Code research preview" class="w-full rounded" />
</div>
</div>

---

# Obstacles to using coding agents

- It does not do what you intended.
- It goes further than you asked.
- It claims everything is working but they aren't!
- It produces more code than you can meaningfully read and review.
- It deviates from its initial goal.

<div class="pt-10 grid grid-cols-[auto_320px_auto] justify-start gap-x-3 gap-y-1 items-center text-sm">
  <div>Violates an explicit developer constraint</div>
  <div><div class="h-3 rounded-sm" style="width: 38.3%; background: var(--oxrse-bg-colour)"></div></div>
  <div class="opacity-60 text-right">38.3%</div>
  <div>Acts on a wrong interpretation of what was requested</div>
  <div><div class="h-3 rounded-sm" style="width: 27.0%; background: var(--oxrse-bg-colour)"></div></div>
  <div class="opacity-60 text-right">27.0%</div>
  <div>Misreports the status (e.g. success) of its own work</div>
  <div><div class="h-3 rounded-sm" style="width: 22.6%; background: var(--oxrse-bg-colour)"></div></div>
  <div class="opacity-60 text-right">22.6%</div>
  <div>Produces code that is logically or syntactically incorrect</div>
  <div><div class="h-3 rounded-sm" style="width: 17.8%; background: var(--oxrse-bg-colour)"></div></div>
  <div class="opacity-60 text-right">17.8%</div>
  <div>Misreads the codebase, system state or technical behaviour</div>
  <div><div class="h-3 rounded-sm" style="width: 11.6%; background: var(--oxrse-bg-colour)"></div></div>
  <div class="opacity-60 text-right">11.6%</div>
  <div>Takes actions beyond the stated scope</div>
  <div><div class="h-3 rounded-sm" style="width: 10.2%; background: var(--oxrse-bg-colour)"></div></div>
  <div class="opacity-60 text-right">10.2%</div>
  <div>Commands or tool calls are operationally malformed</div>
  <div><div class="h-3 rounded-sm" style="width: 2.9%; background: var(--oxrse-bg-colour)"></div></div>
  <div class="opacity-60 text-right">2.9%</div>
</div>

<div class="text-sm opacity-60 pt-3">
N. Tang et al., "How coding agents fail their users", <a href="https://arxiv.org/abs/2605.29442">arXiv:2605.29442</a> (2026), <a href="https://arxiv.org/html/2605.29442v2#S4.T3">Table 3</a>.
</div>

---

# Learning objectives

The practical session has four modules:

1. Know how to prompt an agent the context, the boundaries and the success
   conditions it needs.
2. Judge whether a bug report is written well enough for an agent to act on at
   all.
3. Decide whether a feature should exist at all, then say what must exist, what
   must not change, and what counts as done.
4. Familiarise yourself with code you did not write (or written by yourself
   5 years ago).
