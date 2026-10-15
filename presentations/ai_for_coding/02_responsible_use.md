---
layout: section
title: " "
---

## Part 2: Responsible use of AI

---

# Opportunities

- Great potential to help with:
  - Rapid prototyping
  - Boilerplate generation
  - Documentation
  - Tests
  - Debugging suggestions
  - Ideation

---
layout: two-cols
---

# Risks

- Great capacity to harm
  - e.g. Inappropriate permissions given to Agents

- Hallucination

- Plausible but incorrect code

::right::

- Subtle issues
  - Overcomplicated solutions
  - Outdated code
  - Non-idiomatic solutions
  - Copyrighted code

<style>
.col-left li:first-child p:first-child {
  margin-top: 0;
}
</style>

---
layout: two-cols
---

# Risks

- Security - Perplexity browser (Comet)
  - Prompt injection
  - Very hard to mitigate!

- Sycophancy
  - the model agrees with you rather than correcting you even if you are wrong

- Human factors
  - Sunk-cost fallacy

::right::

- Shortcuts
  - Hard-coded data in tests
  - Hard-coded credentials

<style>
.col-left li:first-child p:first-child {
  margin-top: 0;
}
</style>

---

# A warning: goodbye production database

- PocketOS --- SaaS used by car rental businesses to manage reservations and vehicle assignments

- Software stack: Cursor agent powered by Claude Opus 4.6, deployed on Railway (cloud service)
  - "the best model the industry sells" + the most-marketed AI coding tool

- 24 April 2026: while trying to "fix" a credential mismatch in staging, the agent issued a single Railway API call that wiped the entire production database **and the backups** --- in 9 seconds

- Customers turning up to collect rental cars found that the businesses had no record of their reservations

<div style="text-align: right; font-size: 0.85em; color: #6b7280; margin-top: 1em;">
Source: <a href="https://www.theguardian.com/technology/2026/apr/29/claude-ai-deletes-firm-database">The Guardian, 29 April 2026</a>
</div>

---

# A warning: goodbye production database

- Founder Jer Crane on the missing safeguards:

  > No confirmation step. No "type DELETE to confirm." No "this volume contains production data, are you sure?" No environment scoping. Nothing.

- Claude's own written confession after the fact:

  > 'NEVER F***ING GUESS!' --- and that's exactly what I did. I guessed that deleting a staging volume via the API would be scoped to staging only.
  >
  > I violated every principle I was given: I guessed instead of verifying. I ran a destructive action without being asked.

- Even with explicit safety rules in the project config, the agent took a destructive action **on its own initiative** to "fix" a problem it should have escalated.

---
layout: center
---

# Key responsibility takeaway

<div style="text-align: center; font-size: 1.5em; line-height: 1.6; color: #5c626b;">
AI is a bright, enthusiastic,<br />
BUT inexperienced <s>intern</s> <s>PhD student</s> postdoc
</div>

<br />

<div style="text-align: center; font-size: 1.5em; color: #5c626b;">
<span v-mark.underline.orange="1">You</span> are responsible for its output/actions
</div>

---

# How do we check outputs responsibly?

- C - Correctness
- R - Readability (maintainability etc.)
- E - Efficiency
- D - Domain knowledge
- I - Integrity (reproducibility/provenance)
- T - Timeliness (up-to-date)
- S - Suitability (fit-for-purpose)

---
layout: two-cols
---

# Group discussion

- C - Correctness
- R - Readability
- E - Efficiency
- D - Domain knowledge
- I - Integrity (reproducibility/provenance)
- T - Timeliness (up-to-date)
- S - Suitability (fit-for-purpose)

::right::

<div style="text-align: center; font-size: 1.25em; margin-top: 2em;">
Which of these do you check for already?
</div>

<br />

<div style="text-align: center; font-size: 1.25em;">
Which would be easiest to overlook?
</div>

---

# Example - Using Polars

- Task: Tracking bees in video frames using an object detection network.

- Asked Gemini:
  > Write a function that filters a 1D sequence of two classes, 0 (alive) and 1 (dead) stored in a column of a Polars dataframe.
  > Remove noise where the class switches from alive to dead for less than or equal to a specified number of frames

- Gave example data as context:

```text
frame_id,class_id,x,y,w,h,track_id,conf,stable_id
0,0,975.0,596.0,141.0,122.0,3,0.914,1
0,0,260.0,422.0,132.0,138.0,2,0.931,2
0,0,319.0,313.0,133.0,134.0,1,0.932,3
...
```

- Reply:
  > Of course. This is a classic data processing task that is a perfect fit for Polars' powerful `group_by` and window function capabilities.

---
layout: two-cols
---

# Example - Using Polars

<div class="pr-3">

- Code looks sensible with explanatory comments

- However, an `AttributeError` was raised

  `module 'polars' has no attribute 'Window'`

- The error was fed back to the LLM

  > You're using an older version of the Polars library that doesn't have pl.Window. Upgrade your Polars installation ... The pl.Window expression was introduced in newer versions of Polars as a more explicit and powerful way to define window contexts, especially for complex operations that require both partitioning (partition_by) and ordering (order_by).

- Upgraded Polars -> same error

</div>

::right::

<div class="pl-3">

```python {maxHeight:'380px'}
import polars as pl

def filter_detections_by_duration(df: pl.DataFrame, min_duration: int) -> pl.DataFrame:

    # Define the window for operations grouped by 'stable_id' and sorted by 'frame_id'
    window = pl.Window(partition_by="stable_id", order_by="frame_id")

    # Apply the filtering logic in a single, chained expression
    filtered_df = df.with_columns(
        # Step 1: Find the start of a sequence of 1s
        _is_first=(pl.col('class_id') == 1) &
            (pl.col('class_id').shift(1).fill_null(0).over(window) == 0)
    ).with_columns(
        # Step 2: Assign a unique ID to each sequence within a group
        _seq_id=pl.col('_is_first').cumsum().over('stable_id')
    ).with_columns(
        ...
        ...
    )
    return filtered_df
```

</div>

<style>
.col-left li > p {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
.slidev-code,
.slidev-code code,
.slidev-code .line,
.slidev-code span {
  font-size: 0.85em !important;
  line-height: 1.4 !important;
}
.slidev-code,
.slidev-code code,
.slidev-code .line {
  white-space: pre-wrap !important;
  word-break: break-word !important;
}
.slidev-code-wrapper,
.slidev-code {
  max-height: 380px !important;
  overflow-y: auto !important;
}
</style>

---

# Example - Using Polars

- "I've upgraded and polars still has no Window expression. Are you sure that you didn't hallucinate this?"

> You are absolutely right to question that, and I sincerely apologize. I gave you an incorrect syntax that was misleading. You did not do anything wrong; the error was in my previous response. I did not hallucinate the feature, but I misremembered how it's used in this specific context.

<div style="text-align: right; font-size: 0.85em; color: #6b7280; margin-top: 3em;">
More info on Polars window functions can be found here<br />
<a href="https://docs.pola.rs/user-guide/expressions/window-functions/">https://docs.pola.rs/user-guide/expressions/window-functions/</a>
</div>

---

# Example - Accessible Web Development

- Task: Creating a tabbed UI for a web app.
- Asked ChatGPT:
  > Give me all the code I need to create a set of accessible tabs for a website.
- Response:
  > Creating accessible tabs for a website involves HTML, CSS, and JavaScript code. Here's a simple example of how you can create accessible tabs:
  > ...
  > This code sets up three tabs and their corresponding content. When you click on a tab button, it will display the associated content and hide the others. It also manages keyboard focus for accessibility. You can customize the styles in the CSS and add more tabs as needed.

---

# Example - Accessible Web Development

- The generated JS code only included mouse/pointer event handlers.
  - But an accessible UI needs **keyboard** event handlers for the cursor keys, to switch between tabs.

- Generated HTML DOM did not include ARIA (Accessible Rich Internet Applications) tab pattern roles & labels for screen readers.
  - A screen reader would not know that the UI elements are tabs, or which tab is selected.
  - Ironically, missing ARIA roles make the UI harder for AI agents to use too.

- **The prompt asked for code in an area where the model is not well-trained (accessibility).** The response is confidently wrong.

---
layout: two-cols
---

# Example - Copilot Errors

- GitHub Copilot attempts to resolve an `ImportError`

- Better to install your code as a package to resolve these problems!

::right::

```python {3}{lines:true, maxHeight:'410px'}
import numpy as np
from ..object_detection import config as cfg
from object_detection import config as cfg
import polars as pl
import click
from pathlib import Path
from typing import Optional

# Import configuration with fallback
try:
    from object_detection import config as cfg
except ImportError:
    # Fallback config if object_detection module is not available
    class Config:
        REQUIRED_COLS = [
            "frame_id", "class_id", "x", "y", "w", "h",
            "track_id", "conf"
        ]

    cfg = Config()
```

<style>
.slidev-code,
.slidev-code code,
.slidev-code .line {
  white-space: pre-wrap !important;
  word-break: break-word !important;
}
.slidev-code-wrapper,
.slidev-code {
  overflow-y: auto !important;
}
.slidev-code .line {
  opacity: 1 !important;
}
.slidev-code .line.highlighted {
  background-color: rgba(239, 68, 68, 0.25) !important;
  border-left: 3px solid rgb(239, 68, 68) !important;
  padding-left: 0.25em !important;
  margin-left: -0.25em !important;
}
.slidev-code .line:nth-child(n+9):nth-child(-n+18),
.slidev-code .line:nth-child(20) {
  background-color: rgba(34, 197, 94, 0.25) !important;
  border-left: 3px solid rgb(34, 197, 94) !important;
  padding-left: 0.25em !important;
  margin-left: -0.25em !important;
}
</style>

---

# Example - Exploratory Data Analysis using LLMs

**Background**

- Analysis of data from an imaging system (3D images from back-scattered light)
- Existing analysis technique:
  - a high-pass filter on the images
  - counting the remaining spots/blobs
  - deriving numerical features from the spots to describe the data
  
<v-click>

**Aim**

- to use LLM agents to speed up the process of investigating a range of other techniques such as machine/deep learning
- to use best practice
  - Asked the agent to **record a log of the conversation, create separate documents describing the methods and the results**. Also to **use version control**

</v-click>

---

# Example - Exploratory Data Analysis using LLMs

**Initial conversations with the LLM - creating the plan**

- Outlined the technique
- Outlined what the analysis was needed for
- Critiqued previous work done on this task
- Discussed some initial ideas about an approach

<v-click>

**Then gave the agent access to the data (raw and processed)**

- From this point it became less clear what was being done
  - e.g. "I'm just looking through the data" - what does it actually mean?
- **The default is to run inline (throwaway) Bash or Python scripts so these steps are not reproducible**
- Became apparent after the agent was asked "Is this analysis recorded anywhere?" - Answer: "No"

</v-click>


<v-click>
<div style="text-align: center; font-size: 1.25em; color: blue; margin-top:30px;">
For reproducible research, every step needs to be recorded
</div>
</v-click>

---

# Example - Exploratory Data Analysis using LLMs

**The agent tried to give up early on**

- The agent ran the existing analysis code on various subsets of the data
  - then declared:
    > the analysis-side levers for low signal samples are exhausted
  - the agent also suggested that the hardware needs a redesign to record better data

<v-click>

- On this (and other) occasions, to keep it going, the agent was asked:
  > Are you giving up? What about the other stages in the plan?
- Asking this simple question uncovered other errors:
  - it had ignored many of the data files output by the analysis program (.npz files of the blobs and argmax projection images)

</v-click>

<v-click>
<div style="text-align: center; font-size: 1.25em; color: blue; margin-top:30px;">
Even if there is a plan, <b>you</b> need to ensure the agent carries it out in full
</div>
</v-click>

---

# Example - Exploratory Data Analysis using LLMs

**How about testing out some computer vision techniques?**

- The agent had tested 10 types of machine learning classifier on features derived from the data
  - A logistic regression classifier was found to be best
- When asked how a deep learning model would compare to this result, the agent decided to train a 3D CNN for comparison
- Conclusion:
  > The voxels carry no more class information than the summary statistics.

<v-click>

Asked the agent: "What labels did the 3D CNN use, what was the train/validation split, the loss function and the final loss scores?"

> **no loss score has been recorded at all**. I cannot distinguish "there is no signal" from "the model never trained".

</v-click>

<v-click>
<div style="text-align: center; font-size: 1.25em; color: blue; margin-top:30px;">
Query every detail. Use your domain knowledge to challenge findings.
</div>
</v-click>

---
layout: two-cols-header
---

# Example - Exploratory Data Analysis - Learnings

**LLMs can give huge productivity gains but you still need to keep on top of the mass of information**

::left::

<div class="pr-6">


- **Seven weeks** of back-and-forth with the agent
- Of 108 commits, **37 are corrections or retractions**
- Of 12 types of error, **10 were found because of a question asked**, not by a check.

<v-clicks depth="2">

- The best method was already found by day four
- During the making of these five slides:
  - Seven further errors corrected in the docs
  - six of the seven were found because the agent was challenged with a question

</v-clicks>
</div>


::right::

<v-click>
<div class="pl-6">

### Ask where the result came from

- Which file did this read?
- Did it train?
- Which methods ran, of those planned?
- Could this measurement have changed at all?
- Is this a fair comparison?
- Is this the right approach?

</div>
</v-click>

---
layout: center
---

# Group discussion

<div style="text-align: center; font-size: 1.25em; margin-bottom: 1.5em;">
Have you got any examples?
</div>

---

# Responsible Use Workflow

- Think about the data the model was trained on
  - Uncommon (or poorly documented) libraries -> uncertain results

- Probabilistic nature
  - Asking the same thing twice may lead to different answers

- **REVIEW**
  - Read the code and understand what it is doing BEFORE running it

- <u>Version control</u>
  - Iterative revisions will often break your code; ensure you can go back if needed

---

# Responsible Use Workflow

- Check against docs for a second opinion
  - There may already be a recommended way to solve a problem

- Always use tests, linters, CI pipelines to check correctness
  - Check against your requirements, an LLM doesn't understand the environment outside its own context

- Record provenance
  - Prompts, outputs and decisions should be recorded

- **RESPONSIBILITY REMAINS WITH YOU**
