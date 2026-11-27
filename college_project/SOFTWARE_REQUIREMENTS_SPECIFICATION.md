# Software Requirements Specification (SRS)
## Project: LegalAdvisor AI — Autonomous Corporate Defamation Defense & Statutory Risk Consultation

**Version:** `2.0` (Synced with `TDD v1.0`, `DFD Spec`, and `D3 ER Schema`)
**Standard:** IEEE Std 830 / Academic Capstone Specification
**Academic Institution:** Netaji Subhash Engineering College (NSEC) — Final-Year Capstone Project
**Team / Roll Numbers / Faculty Guide:** `[Fill In: Team Members, Roll Numbers, Faculty Guide]`
**Aligned Blueprints:** [TECHNICAL_DESIGN_DOCUMENT.md](file:///d:/agentic_ai_project_1/college_project/TECHNICAL_DESIGN_DOCUMENT.md) | [DATA_FLOW_DIAGRAMS.md](file:///d:/agentic_ai_project_1/college_project/DATA_FLOW_DIAGRAMS.md) | [ER_DIAGRAM.md](file:///d:/agentic_ai_project_1/college_project/ER_DIAGRAM.md)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional, external interface, data persistence, security, and evaluation requirements for **LegalAdvisor AI**. The specification provides a verified contract for academic evaluation, viva examination, and Python/React implementation.

### 1.2 Problem Statement & Scope
Modern enterprises face sustained reputational and regulatory exposure from public forum discourse (e.g., Reddit threads, developer forums, social feeds). Existing monitoring tools conflate protected consumer speech with malicious defamatory falsehoods—and fail to catch genuine zero-day security disclosures buried inside hostile complaints.

**LegalAdvisor AI** operates from the **defensive perspective of the target Company/Brand** under **Indian Statutory Law**. It:
1. Ingests live (`PRAW`) and offline replay discourse streams, deduplicating coordinated smear campaigns across a 24-hour semantic window.
2. Applies a Two-Gate Jurisprudence Filter (*Ollman Test* + *De Minimis* rule) so fair criticism is ignored and ordinary service complaints go strictly to PR/Customer Support (`E3`).
3. Executes a parallel **Adversarial Dual-Hypothesis Engine** (`Agent 2A` vs `Agent 2B` $\rightarrow$ `Agent 2C`) to avoid filing catastrophic lawsuits against genuine security whistleblowers (`CLASS_B_ZERO_DAY_AMBIGUITY`).
4. Runs deterministic citation-guarded Statutory RAG (`Agent 3`) over curated Indian Bare Statutes (`D1`) to draft takedown notices, Cease & Desist / *Ashok Kumar* preservation notices, and tamper-evident Executive Dossiers (`D4`), gated strictly behind **Human-in-the-Loop (HITL)** Corporate Legal Counsel sign-off (`E2`).

### 1.3 Definitions, Acronyms & Legal Scope
| Term | Definition |
| :--- | :--- |
| **BNS 2023** | Bharatiya Nyaya Sanhita, 2023 (Section 356 Criminal Defamation; Section 25 *De Minimis* principle) |
| **IT Act 2000** | Information Technology Act, 2000 (Sections 43A, 66C, 66D, 79 Safe Harbor) |
| **IT Rules 2021** | IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 (`Rule 3(1)(b)(v)` & `Rule 3(2)`) |
| **CPA 2019** | Consumer Protection Act, 2019 |
| **Repealed Blocklist** | `IPC 499/500` and struck-down `IT Act 66A` — strictly blocked from citation output |
| **HITL** | Human-in-the-Loop mandatory legal counsel approval (`E2`) |

---

## 2. Overall Description

### 2.1 System Perspective & Multi-Store Boundary
The system is structured as a FastAPI + LangGraph stateful backend backed by four persistent stores (`D1`–`D4`) and a planned React/Next.js HITL Counsel Review UI (`client/`):
- **`D1` (ChromaDB):** Curated Indian Bare Statutes & IT Rules Parent-Child Vector Store.
- **`D2` (ChromaDB):** Corporate Ground-Truth Store (SOC2 controls, architecture specs, privacy policies).
- **`D3` (SQLite + `SqliteSaver`):** 3NF relational operational audit, campaign cluster, breach mapping, and HITL DB (`ER_DIAGRAM.md`), co-hosted with LangGraph workflow checkpoints.
- **`D4` (Local Repository):** Generated PDF/Markdown dossiers & legal notice drafts verified via SHA-256 hashes.

### 2.2 External Entities (`E1`–`E4`)
1. **`E1`: Public Discourse Source** — Live Reddit stream (`PRAW_LIVE`) and deterministic offline replay dataset (`MOCK_REPLAY`).
2. **`E2`: Corporate Legal Counsel (HITL Reviewer)** — Reviews Class A/B/C dossiers, CISO escalation alerts, and approves/rejects draft notices. Zero automated legal transmission occurs without `E2` sign-off.
3. **`E3`: PR & Customer Support Team** — Receives verified `SERVICE_GRIEVANCE` callback tickets isolated during Triage Gate 2.
4. **`E4`: System & Knowledge Base Admin** — Ingests `D1`/`D2` corpora and executes the 50-case `eval_dataset.json` benchmark suite.

---

## 3. Specific Functional Requirements (Aligned to DFD Processes `1.0`–`7.0`)

### 3.1 Module 1: Discourse Ingestion, Hygiene & Campaign Clustering (Processes `1.0` & `3.0`, `ADR-006`/`ADR-008`)
- **FR-1.1:** The system shall support dual-mode ingestion: live subreddit polling via `PRAW` (`PRAW_LIVE`) and deterministic offline JSON replay (`MOCK_REPLAY`) for reproducible demos and evaluations.
- **FR-1.2:** Every incoming post shall undergo HTML/script stripping, duplicate key verification `(platform, platform_post_id)`, SHA-256 content hashing, and extraction of `author_identifiability` (`IDENTIFIED` vs `ANONYMOUS`).
- **FR-1.3:** Untrusted user text passed to any LLM prompt shall be isolated inside `<UNTRUSTED_POST_TEXT>` boundary delimiters to neutralize prompt-injection payloads.
- **FR-1.4:** Escalated factual claims shall undergo 24-hour semantic claim clustering (`cosine_similarity > 0.85`). Repeat allegations from coordinated or duplicate accounts increment `CAMPAIGN_CLUSTERS.mention_count` in `D3` without triggering duplicate Agent 2/3 executions.

### 3.2 Module 2: Two-Gate Jurisprudence Triage (Process `2.0` — Agent 1, `ADR-001`)
- **FR-2.1 (Gate 1A — Deterministic Pre-Filter):** Discard posts under 20 characters or failing brand entity matching locally with zero LLM calls.
- **FR-2.2 (Gate 1B — *Ollman Test* Factuality):** Evaluate remaining text with Gemini Flash to classify `is_falsifiable`. Subjective opinions and rhetorical hyperbole shall be assigned `triage_route = "DISCARD"` and archived in `TRIAGE_AUDITS`.
- **FR-2.3 (Gate 2 — *De Minimis* Severity Routing):** Evaluate falsifiable claims against statutory severity (`DE_MINIMIS`, `SERVICE_GRIEVANCE`, `STATUTORY_CRIME`, `MALICIOUS_FRAUD`).
- **FR-2.4 (PR/Support Isolation):** Claims tagged `SERVICE_GRIEVANCE` shall route strictly to `PR_SUPPORT_CALLBACK`, creating a `SERVICE_GRIEVANCE_TICKETS` record for `E3` and halting legal escalation.
- **FR-2.5 (Legal Escalation):** Only `STATUTORY_CRIME` and `MALICIOUS_FRAUD` claims shall assign `triage_route = "LEGAL_INVESTIGATION"` and advance to Process `3.0` (`CAMPAIGN_CLUSTERS`).

### 3.3 Module 3: Dual-Hypothesis Adversarial Verification (Process `4.0` — Agent 2A/2B/2C, `ADR-002`)
- **FR-3.1 (Parallel LangGraph Fan-Out):** For every unique escalated cluster, LangGraph shall invoke `Agent 2A` and `Agent 2B` in parallel.
- **FR-3.2 (`Agent 2A`: Corporate Defense Inquirer):** Query `D2` to assemble a `defense_hypothesis` and cite internal compliance/architecture documents demonstrating technical impossibility or policy compliance.
- **FR-3.3 (`Agent 2B`: Red-Team Devil's Advocate):** Compute `redteam_specificity_score` (`0.0`–`1.0`) and extract `redteam_zero_day_markers` (e.g., internal endpoints, CVE patterns, schema/port indicators) indicative of genuine leaks or whistleblowers.
- **FR-3.4 (`Agent 2C`: Legal Risk Arbiter):** Synthesize 2A and 2B outputs into an `evidentiary_classification`:
  - `CLASS_A_BASELESS_SMEAR`: Contradicts `D2`, zero proof, low technical specificity $\rightarrow$ Advance to Agent 3 (`5.0`).
  - `CLASS_B_ZERO_DAY_AMBIGUITY`: Unconfirmed by `D2` but high technical specificity $\rightarrow$ **Freeze legal notices**, set `ciso_alert_required = 1`, notify `E2`/CISO (`6.0`).
  - `CLASS_C_SUBSTANTIATED_CRISIS`: Verified evidence/breach attached $\rightarrow$ Escalate directly to Crisis PR & Security Incident Counsel (`6.0`).

### 3.4 Module 4: Statutory RAG, Identifiability Routing & Citation Guardrail (Process `5.0` — Agent 3, `ADR-003`/`ADR-004`/`ADR-005`)
- **FR-4.1 (Bare-Statutes-Only Corpus):** `D1` shall store strictly ~25–40 curated Indian Bare Statutes & IT Rules indexed via Hierarchical Parent-Child chunking (`Child` contextual triggers $\rightarrow$ full `Parent` statutory text). Multi-decade raw court judgments are explicitly excluded in v1.
- **FR-4.2 (Author Identifiability Routing):**
  - Always draft an `INTERMEDIARY_TAKEDOWN` (`IT Rules 2021 Rule 3(1)(b)(v) & 3(2)` / `IT Act Sec 79`) and `EXECUTIVE_DOSSIER`.
  - If `IDENTIFIED`: also draft direct `BNS 2023 Sec 356` `CEASE_AND_DESIST`.
  - If `ANONYMOUS`: suppress personalized C&D and instead draft an *Ashok Kumar* (`John Doe`) `ASHOK_KUMAR_PRESERVATION` log-preservation request.
- **FR-4.3 (Closed-Book Drafting & Deterministic Validator):** Draft legal instruments at `temperature = 0.0`. Every generated citation must pass a deterministic Python Regex Citation Validator verifying membership in the current Session RAG Allowlist and rejection of the Repealed Blocklist (`IPC 499`, `IPC 500`, `IT Act 66A`).
- **FR-4.4 (Bounded Reflection Loop):** On validator failure, Agent 3 may retry up to `max_retries = 2` with explicit validator error feedback. If failure persists, output `guardrail_status = "FAIL_CLOSED_WARNING"` and withhold clean draft generation.

### 3.5 Module 5: Executive Dossier Generation & Mandatory HITL Gate (Process `6.0`, `ADR-002`/`ADR-007`)
- **FR-5.1:** Generate styled PDF (`ReportLab` / `WeasyPrint`) and Markdown dossiers stored in `D4`, recording `storage_uri` and `artifact_sha256` in `D3` alongside verification of the mandatory Non-Attorney Disclaimer.
- **FR-5.2:** Every legal artifact defaults to `PENDING` in `HITL_DECISIONS`. No external notice or takedown workflow may execute unless `E2` explicitly submits `APPROVED`.

### 3.6 Module 6: Admin Ingestion & 50-Case Evaluation Suite (Process `7.0`, `ADR-008`)
- **FR-6.1:** Provide CLI/API scripts for `E4` to re-index `statutes_corpus.json` (`D1`) and corporate policy docs (`D2`).
- **FR-6.2:** Execute an automated 50-case `eval_dataset.json` regression suite (5 adversarial/edge buckets $\times$ 10 cases) persisting metrics to `EVALUATION_RUNS`.

---

## 4. External Interface Requirements

### 4.1 User Interfaces
- **CLI / API Runner:** FastAPI REST endpoints (`/ingest`, `/evaluate`, `/reviews`, `/artifacts/{id}`) plus command-line runner scripts for evaluation and corpus ingestion.
- **HITL Counsel Dashboard (React / Next.js in `client/`):** Displays triaged campaign queues, Class A/B/C risk badges, side-by-side 2A vs 2B evidence, drafted notices, PDF download links, and Approve/Reject/Escalate-CISO controls.

### 4.2 Software Interfaces
- **Google Gemini API (`langchain-google-genai`):** `Gemini Flash` for high-throughput Stage 1B triage; `Gemini Pro` (`temp=0.0`) for Agent 2A/2B/2C & Agent 3 statutory synthesis.
- **Reddit API (`PRAW`):** Authenticated OAuth2 post ingestion (`PRAW_LIVE` mode).
- **ChromaDB (Embedded Local Storage):** Vector persistence for `D1` and `D2`.
- **SQLite (`D3` + `SqliteSaver`):** Transactional state, audit tables, and resumable LangGraph workflow checkpoints.
- **PDF Engine (`ReportLab` / `WeasyPrint`):** Formatted PDF dossier rendering into `D4`.

### 4.3 Hardware Interfaces
- **CPU:** Dual-Core x86_64 or Apple Silicon minimum.
- **RAM:** 8 GB minimum (16 GB recommended for concurrent FastAPI, ChromaDB embeddings, and React dev server).
- **Disk:** 2 GB free local storage for Python dependencies, SQLite DB (`D3`), vector indices (`D1`/`D2`), and PDF artifacts (`D4`).

---

## 5. Non-Functional Requirements (NFRs)

- **NFR-1 (Noise Pruning Efficiency):** Stage 1A + Stage 1B shall prune irrelevant/protected speech so downstream Agent 2/3 tokens are spent solely on escalated unique claim clusters.
- **NFR-2 (KPI Evaluation Targets — `ADR-008`):**
  - False Legal Escalation Rate on fair criticism / ordinary grievances: **`0%`**
  - Class B Zero-Day Ambiguity / Whistleblower Recall: **`>= 90%`**
  - Deterministic Citation Guardrail Pass Rate: **`100%`** (Zero repealed `IPC 499/500` or `IT Act 66A` citations emitted)
- **NFR-3 (Resilience & Checkpointing):** External LLM API calls shall use exponential backoff (`tenacity`), and LangGraph transitions shall checkpoint to `SqliteSaver` so interrupted investigations resume cleanly.
- **NFR-4 (Security & Confidentiality):** API secrets (`GEMINI_API_KEY`, Reddit OAuth keys) shall reside strictly in `.env`; raw untrusted text shall remain wrapped in `<UNTRUSTED_POST_TEXT>` tags; personally identifiable handles shall be anonymized where policy dictates prior to downstream archival.

---

## 6. Legal Disclaimer Requirement
Every exported PDF, Markdown dossier, draft notice, and UI review screen produced by LegalAdvisor AI must prominently include:
> *"LEGAL DISCLAIMER: LegalAdvisor AI is an academic decision-support prototype developed strictly for corporate defamation triage and statutory risk analysis. It does not constitute formal legal advice, establish an attorney-client relationship, or authorize autonomous legal enforcement. All outputs, zero-day holds, and draft notices require mandatory review and sign-off by licensed Corporate Legal Counsel (`E2`)."*
