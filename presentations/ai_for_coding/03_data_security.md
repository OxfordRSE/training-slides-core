---
layout: section
title: " "
---

## Part 3: Data privacy & security

---

# Data privacy & security: Your data

- Consumer LLM tools often train on your chats by default
  - Opting out may still leave data retained for a period
- Risk of leaking personal or sensitive research data
- UK GDPR and Data Protection Act 2018 (EU GDPR for EU residents' data)
  - Organisations are accountable for how personal data is collected, used and stored
  - Sending data to a provider is processing - servers may be in another jurisdiction
- Data management plans, ethics approvals and data sharing agreements may forbid third-party processing

---

# Data privacy & security: Agents widen the risk

- An agent can read anything it can reach - `.env` files, SSH keys, data folders
  - What it reads is sent to the provider
- Agents can leak secrets into commits, logs and generated code
- Prompt injection --- instructions hidden in web pages, issues or data files
  - "Lethal trifecta": private data + untrusted content + a way to send data out
- Hallucinated package names get registered by attackers ("slopsquatting")
- Third-party MCP servers and skills run with the agent's access

---
layout: two-cols
---

# Data privacy & security: Mitigations

### Keep the data in

- Local LLMs (e.g. Ollama, or vLLM on HPC)
- Enterprise accounts with data processing agreements
  - Use only tools approved for University data
- Don't send data --- send schemas, synthetic or anonymised samples
- Ensure connections are encrypted

::right::

### Lock the agent down

- Grant access only to the data strictly needed
  - Run in a project folder or container, never your home directory
- Deny-list secrets and data files in the agent's permission settings
- Never paste secrets into prompts; enable secret scanning (e.g. GitHub push protection)
- Check a package exists and is reputable before installing
- Only install MCP servers and skills from trusted sources
