# Project Operational Rules & Documentation Guidelines 📋

This document defines the strict operating standards, documentation rules, file locations, and structural requirements for assisting with this project. Refer to this document at every step to ensure complete alignment.

---

## 🎯 Primary Documentation System

We maintain **three dedicated markdown documents** in `server/agent/`:

```
d:\agentic_ai_project_1\server\agent\
├── README.md                  # 1. Agentic AI & Project Architecture Journey
├── NODE_JS_FUNDAMENTALS.md    # 2. Node.js, JavaScript, Runtime & Tooling Handbook
└── PROJECT_REQUIREMENTS.md    # 3. (This file) Rules, Guidelines & Requirements Register
```

---

## 📌 Master Requirements & Standards Checklist

### 1. Chronological Project Order Tracking (`server/agent/README.md`)
* Must document **not only what is built**, but the **exact chronological step-by-step order** of how the project evolved from scratch:
  1. Setting up empty repository & workspace.
  2. Initializing LangGraph & Gemini models.
  3. Building the single-turn ReAct agent.
  4. Adding custom tools with strict Zod validation schemas.
  5. Introducing multi-turn memory & session state via `MemorySaver` + `thread_id`.
  6. Wrapping the agent in an Express web server with `/generate` REST API.
  7. Multi-tool expansion (e.g. weather + crypto tools) and external testing workflows.
* Every new step or milestone must be logged in its sequential order under **Section 4: Step-by-Step Code Evolution**.

### 2. Basic JavaScript & Node.js Concepts (`server/agent/NODE_JS_FUNDAMENTALS.md`)
* Whenever any question touches on:
  * JavaScript language fundamentals (hoisting, modules, promises, event loop, data types, scoping).
  * Node.js runtime mechanics (`node <file>` vs `npm run dev`, `--watch`, commonjs vs esm, process.env).
  * Terminal quirks (PowerShell escaping, continuation traps, `curl` aliases, path resolution).
* **Action:** Check if it is already covered in `NODE_JS_FUNDAMENTALS.md`. If not, immediately add it with clear explanations and code examples.

### 3. Visuals First: Diagrams & Tree Representations
* Every major architecture flow, agent loop, API communication pattern, or state graph **MUST** include visual aids:
  * **Mermaid Sequence Diagrams:** For client-server-agent-tool communication lifecycles.
  * **Mermaid Flowcharts / State Graphs:** For ReAct loops, checkpointer state transitions, and error-handling branches.
  * **Directory Trees:** For project structural clarity.

### 4. Code Blocks & Detailed Explanations
* Every concept must be paired with complete, syntactically correct, and commented code blocks.
* Clarify the "Why", "What", and "How" (not just raw code).

### 5. Automated Requirement Ingestion
* Whenever a new rule, preference, or workflow requirement is requested by the user, **immediately append it to this document (`PROJECT_REQUIREMENTS.md`)** so it is permanently remembered and referenced.

### 6. File Persistence & Verification Rule
* Always verify file updates on disk (using `view_file` or filesystem check) to prevent editor buffer desynchronization.

---
*Created: October 2, 2026 | Maintained continuously as the project ground truth.*
