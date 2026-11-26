# LegalAdvisor AI: Technical Design Document (TDD / RFC)
**Document Standard:** RFC / Production Architecture Specification  
**Version:** 1.0 (Approved — Architectural Grilling Complete)  
**Author:** LegalAdvisor AI Core Engineering Team  
**Reviewer:** Principal Architect & Viva Examination Benchmark  
**Status:** Approved v1.0 (Ready for Formal DFD & Prototype Implementation)  

---

## 1. Executive Summary & Scope

### 1.1 Problem Statement (The Real Enterprise Need)
Enterprises, consumer brands, and public organizations face asymmetric reputational attacks across social platforms (Reddit, Twitter/X, forums). Coordinated smear campaigns, malicious fabrications, and baseless allegations of corporate illegality cause severe enterprise valuation loss and customer churn. 

Manually monitoring and verifying thousands of daily public mentions requires extensive paralegal hours. Traditional NLP solutions (sentiment analysis, keyword matching) fail completely because they cannot distinguish between:
1. **Legally Protected Free Speech / Fair Consumer Criticism** (e.g., product defects, delivery delays, subjective anger), and
2. **Actionable Defamatory Imputation / Malicious Falsehoods** (e.g., false accusations of regulatory fraud, data theft, moral turpitude).

### 1.2 System Purpose
LegalAdvisor AI is an autonomous multi-agent framework designed to:
- Ingest public discourse streams at scale.
- Filter out non-justiciable noise and ordinary service rants using strict linguistic and legal doctrines (*The Ollman Test* & *The Doctrine of De Minimis*).
- Route verified operational grievances to customer support/PR callback pipelines.
- Isolate severe, unsubstantiated factual imputations and escalate them through a verified statutory analysis engine.
- Generate legally grounded, citation-backed Cease & Desist notices, platform intermediary takedown requests (Rule 3(1)(b) IT Rules 2021), and executive counsel dossiers.

---

## 2. Pillar 1: Problem & Domain Boundary (Legal Triage Architecture)

### 2.1 The Jurisprudential Foundation
Under Indian Law (**Section 356 of Bharatiya Nyaya Sanhita, 2023 / Section 499 IPC**) and common law defamation jurisprudence:
- **Truth** and **Good Faith Fair Criticism** are absolute defenses.
- An actionable claim requires:
  1. *Falsifiable assertion of objective fact* (not subjective opinion or hyperbole).
  2. *Imputation of criminality, fraud, or moral turpitude* causing material reputational harm.
  3. *Absence of substantiated evidentiary proof*.

### 2.2 The Two-Gate Triage Architecture (Agent 1)
To eliminate token waste and guarantee zero false-positive legal escalations, Agent 1 executes a sequential two-gate triage funnel:

```
[ Incoming Public Mentions / Posts ]
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│ Stage 1A: Deterministic Regex & Entity Pre-Filter      │
│ - Exact & fuzzy brand entity match                     │
│ - Length heuristics (< 20 chars discarded)             │
│ - Zero-compute local pruning (cuts ~70% noise)         │
└────────────────────────┬───────────────────────────────┘
                         │ Surviving Posts
                         ▼
┌────────────────────────────────────────────────────────┐
│ Stage 1B: Semantic Factuality Parsing (Ollman Test)    │
│ - Evaluates Linguistic Modality via Gemini 1.5 Flash   │
│ - Drops Subjective Opinions ("worst app ever")         │
│ - Drops Rhetorical Hyperbole ("starving to death")     │
│ - Isolates Falsifiable Factual Assertions              │
└────────────────────────┬───────────────────────────────┘
                         │ Falsifiable Claims Only
                         ▼
┌────────────────────────────────────────────────────────┐
│ Gate 2: Statutory Severity Check (De Minimis Filter)   │
│ - Evaluates: Does claim allege crime, fraud, or harm? │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       [ Fails Severity ]       [ Passes Severity ]
                │                        │
                ▼                        ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│ Route: PR & Support Pipeline │ │ Route: Agent 2 (Legal Agent) │
│ - Customer callback request  │ │ - Statutory breach mapping   │
│ - Service issue resolution   │ │ - Takedown / C&D generation  │
│ - Account warning if fraud   │ │ - Legal counsel dossier      │
└──────────────────────────────┘ └──────────────────────────────┘
```

### 2.3 Legal Doctrine Grounding Table

| Category | Real-World Example | Falsifiable? | Statutory Severity? | Action Taken |
| :--- | :--- | :---: | :---: | :--- |
| **Protected Opinion** | *"Their support is pathetic and rude."* | ❌ No | ❌ No | Discard / Archive |
| **Rhetorical Hyperbole** | *"This ₹500 fee is daylight robbery!"* | ❌ No | ❌ No | Discard / Archive |
| **Ordinary Service Grievance** | *"My order was delayed by 2 hours!"* | ✅ Yes | ❌ No (*De Minimis*) | **Route to PR / Support Callback** |
| **Actionable Malicious Falsehood** | *"Company X is secretly selling credit card data on Telegram."* | ✅ Yes | ✅ Yes (Crime/Fraud) | **Escalate to Legal Agent 2** |

---

## 3. Pillar 2: Agentic Decomposition & Orchestration (LangGraph)

### 3.1 Architectural Philosophy: Why Multi-Agent State Machines?
A single monolithic prompt fails catastrophically at legal verification because it lacks self-critique, cannot cross-examine conflicting evidence, and suffers from prompt bias (agreeing with whatever tone the user or prompt sets). 

LegalAdvisor AI utilizes **LangGraph** to model an asynchronous, cyclical state machine that separates concerns across discrete, specialized autonomous actors.

### 3.2 The Dual-Hypothesis Adversarial Verification Engine (Agent 2)
When an allegation clears Gate 1 (Falsifiable) and Gate 2 (Statutory Severity), LangGraph initiates a parallel fan-out into an **Adversarial Verification Pattern**:

```
                 [ Severe Factual Allegation ]
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│ Agent 2A: Defense Inquirer  │ │ Agent 2B: Devil's Advocate  │
│ - Internal RAG Vector Store │ │ - Red-Team Audit            │
│ - Validates against SOC2,   │ │ - Parses Technical Epistemic│
│   Architecture, Policies    │ │   Specificity (APIs, ports) │
│ - Builds Defense Hypothesis │ │ - Identifies Whistleblower  │
│   ("Technically impossible")│ │   or Zero-Day Breach Signals│
└──────────────┬──────────────┘ └──────────────┬──────────────┘
               │                               │
               └───────────────┬───────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Agent 2C: Legal Risk Arbiter (Synthesis & State Aggregator) │
│ - Evaluates RAG Contradiction vs Technical Specificity      │
│ - Resolves Evidentiary Confidence Matrix                    │
└──────────────────────────────┬──────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│     CLASS A      │  │     CLASS B      │  │     CLASS C      │
│ Malicious Smear  │  │ Zero-Day Ambiguity│  │Substantiated Hit │
│ (Baseless Hit)   │  │ (Whistleblower)  │  │ (Evidence Found) │
│ ──────────────── │  │ ──────────────── │  │ ──────────────── │
│ • Contradicts RAG│  │ • High tech info │  │ • Proof attached │
│ • Zero proof     │  │ • RAG unconfirmed│  │ • Verified leak  │
│ • Low specificity│  │                  │  │                  │
│ ► Action: Route  │  │ ► Action: Freeze │  │ ► Action: Senior │
│   to Agent 3     │  │   legal notices; │  │   Crisis PR /    │
│   (Draft Notice) │  │   alert CISO/SOC │  │   Incident Team  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### 3.3 State Schema (`LegalAdvisorState`)
```python
class LegalAdvisorState(TypedDict):
    raw_post_id: str
    platform: str
    author_handle: str
    raw_text: str
    timestamp: str
    
    # Pillar 1 Triage Outputs
    is_falsifiable: bool
    falsifiable_claim: Optional[str]
    severity_category: Literal["DE_MINIMIS", "SERVICE_GRIEVANCE", "STATUTORY_CRIME", "MALICIOUS_FRAUD"]
    triage_route: Literal["DISCARD", "PR_SUPPORT_CALLBACK", "LEGAL_INVESTIGATION"]
    
    # Pillar 2 Adversarial Verification Outputs
    defense_hypothesis: str
    defense_rag_citations: List[str]
    redteam_technical_specificity_score: float # 0.0 to 1.0
    redteam_zero_day_markers: List[str]
    evidentiary_classification: Literal["CLASS_A_BASELESS_SMEAR", "CLASS_B_ZERO_DAY_AMBIGUITY", "CLASS_C_SUBSTANTIATED_CRISIS"]
    
    # Pillar 3 Legal Output Artifacts
    statutory_breaches: List[Dict[str, str]] # e.g. [{"act": "BNS 2023", "section": "356", "relevance": "..."}]
    takedown_notice_draft: Optional[str]
    cease_and_desist_draft: Optional[str]
    executive_dossier_markdown: Optional[str]
    human_counsel_approval_status: Literal["PENDING", "APPROVED", "REJECTED"]
```

---

## 4. Pillar 3: Grounded Statutory RAG & Knowledge Engineering

### 4.1 Part 1: Statutory Corpus Architecture (Hybrid Hierarchical + Contextual Retrieval)
Standard fixed-token RAG (`chunk_size=500, overlap=50`) fails catastrophically on Indian legislative acts because it fragments continuous legal sections—separating main offenses from critical Explanations, Provisos, and statutory Exceptions (e.g., separating **BNS Sec 356(1)** and **Explanation 2** from **Exceptions 1–10**).

To guarantee full legal context and high semantic recall against informal social media claims, LegalAdvisor AI implements a **Hybrid Parent-Child + Contextual Trigger RAG Architecture**:

1. **Clean Curated Bare-Act Ingestion (Build-Time):**
   - Raw government two-column Bare Act PDFs are pre-parsed and curated into a canonical, version-controlled JSON store (`statutes_corpus.json`) structured strictly by legislative hierarchy: `Act -> Chapter -> Section -> Sub-clause/Explanation/Exception`.
2. **Contextual Trigger Enrichment (Solving the Legalese vs. Slang Gap):**
   - Each **Child Clause** is prefixed at ingestion time with verified plain-English legal triggers before embedding (e.g., `[Triggers: corporate defamation, false fraud claim, online smear, brand reputation attack] + Bare Text of BNS Sec 356 Explanation 2`).
   - Triggers are LLM-assisted during preparation and **human-verified/locked** in `statutes_corpus.json` so retrieval cannot be poisoned.
3. **Parent-Child Retrieval Pattern (Runtime):**
   - Agent 3 queries the Vector DB using **Query Rewriting** (the clean `falsifiable_claim` and `severity_category` extracted by Agent 1/2—never raw social media slang).
   - Vector similarity matches the fine-grained **Child Chunk**, resolves its `parent_section_id`, and injects the **entire unbroken Parent Section** (all Explanations, Exceptions, and Punishments) into Agent 3's context.

#### ⚠️ v1 Prototype Scope Guardrail (CRITICAL)
> **STRICT BOUNDARY:** The v1 statutory RAG corpus is scoped exclusively to **curated Indian Bare Statutes & Statutory Rules** (~25–40 core sections across *BNS 2023*, *IT Act 2000*, *IT Intermediary Guidelines Rules 2021*, and *Consumer Protection Act 2019*).
> **PROHIBITION:** Do **NOT** ingest random 80-page Supreme Court or High Court case-law PDFs into the v1 Vector DB. Case law introduces severe ingestion bloat, cross-citation noise, and requires a temporal validity engine (tracking overruled vs. good-law precedents), which belongs to v2+.

### 4.2 Part 2: Deterministic Citation Guardrail (Preventing Parametric Memory Leakage)
LLMs cannot surgically erase outdated pre-training weights (where repealed statutes like **IPC 499/500** and struck-down **IT Act Sec 66A** dominate). Even with RAG context injected, LLMs suffer **Context-Memory Conflict** (3–5% parametric leakage).

LegalAdvisor AI enforces a **3-Layer Zero-Hallucination Cage** around Agent 3:
1. **Closed-World Context Isolation (`temperature = 0.0`):** Retrieved Parent Sections are wrapped in `<VERIFIED_STATUTES_ONLY>` tags with explicit negative constraints forbidding reliance on pre-trained legal memory.
2. **Mandatory `statute_id` Binding:** Agent 3 must emit structured `statutory_breaches` anchored to exact retrieved IDs (e.g., `BNS_2023_SEC_356`, `IT_RULES_2021_R3_1_B`).
3. **Deterministic Python Citation Validator + LangGraph Reflection Loop:**
   - Pure Python Regex extracts every cited section/rule from generated notice drafts before output.
   - **Session Allowlist:** Every extracted citation must exist in `retrieved_parent_ids` for the active LangGraph run.
   - **Repealed/Invalid Blocklist:** Explicitly rejects legacy/struck-down traps (`IPC`, `Section 499`, `Section 500`, `Section 66A`).
   - **Conditional Self-Correction Edge:** On violation, LangGraph loops back to Agent 3 (`max_retries = 2`) with the exact error trace; two consecutive failures fail closed to `HUMAN_REVIEW_REQUIRED` with a warning banner.

### 4.3 Output Legal Artifacts & Identifiability Routing
Upon clearing the Citation Guardrail, Agent 3 routes Class A (`CLASS_A_BASELESS_SMEAR`) cases based on **Author Identifiability**:

1. **Artifact 1 — Platform Intermediary Grievance & Takedown Request (Always Generated):**
   - Addressed to the host platform's Grievance Officer under **Rule 3(1)(b)(v) & Rule 3(2) of the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021**.
   - Works regardless of whether the poster is anonymous.
2. **Artifact 2A (`IDENTIFIED` Author) — Formal Cease & Desist Notice Draft:**
   - Triggered only when the poster has verifiable identity (named individual, verified corporate/competitor account, linked domain). Cites **BNS 2023 Sec 356** (and **IT Act Sec 66D** where impersonation applies), demanding immediate retraction.
3. **Artifact 2B (`ANONYMOUS` Author) — John Doe (*Ashok Kumar*) Evidence Preservation Notice:**
   - Replaces personal C&D for burner/anonymous handles (`u/throwaway_*`). Demands platform preservation of subscriber metadata, timestamps, and access logs pending *Ashok Kumar* civil relief.
4. **Artifact 3 — Executive Counsel Evidence Dossier (Always Generated):**
   - Consolidated HITL brief containing permalink, UTC timestamp, raw text + **SHA-256 cryptographic hash** (tamper-evident snapshot), Agent 2A RAG refutation, Agent 2B technical specificity score, Citation Guardrail audit badge (`PASSED`), and Counsel `[Approve / Dismiss]` controls.

---

## 5. Pillar 4: Reliability, Failure Modes & Viva Defense

### 5.1 Ingestion Architecture & Coordinated Smear Clustering (Question 4.1)
1. **Dual-Mode Ingestion Adapter:**
   - Unifies `Live Reddit Poller (PRAW / JSON feed with cursor + backoff)` and `Deterministic Replay Stream (curated CSV/JSON test dataset)` behind one canonical post schema. Ensures 100% reproducible live viva demonstrations regardless of external API rate limits or network restrictions.
2. **Semantic Claim Deduplication & Campaign Clustering:**
   - Coordinated competitor smear campaigns post N slight rewordings of the same false claim. Running Agent 2 & 3 independently per post wastes N× tokens and floods Human Counsel with duplicate alerts.
   - Immediately after Stage 1B (`falsifiable_claim` extraction), embeddings are compared against active 24-hour claim clusters (`cosine_similarity > 0.85`). Matches append the new post metadata/SHA-256 hash to the existing `CampaignCluster` (`post_count += 1`, `unique_authors` updated) and elevate amplification severity without re-invoking downstream LLM generation.

### 5.2 Tech Stack & Data Stores Reconciliation (Question 4.2)
> **Repository Note:** Legacy `server/agent/*.js` files in the workspace are an unrelated Node.js practice tutorial and are excluded from LegalAdvisor AI.

* **Core AI & Backend Stack (Python):**
  - **API & Orchestration:** FastAPI + **LangGraph (Python)** + Pydantic v2 schemas.
  - **LLM Tiering:** Gemini Flash (Stage 1B fast triage) + Gemini Pro / Flash-Reasoning (Agent 2 Adversarial Debate & Agent 3 Drafting at `temperature=0.0`).
  - **Ingestion & Evidence Output:** `PRAW` (Reddit API) + Deterministic Replay loader + `ReportLab` / `WeasyPrint` (PDF Dossier rendering).
* **Frontend (Planned):** React / Next.js HITL Counsel Dashboard (`client/`).
* **The 4 Persistent Data Stores (DFD `D1`–`D4`):**
  1. **`D1` Statutory Knowledge Store (ChromaDB Collection 1):** Curated Bare Statutes (`BNS 2023`, `IT Act 2000`, `IT Rules 2021`, `CPA 2019`) indexed by Child Contextual Triggers mapped to unbroken Parent Sections.
  2. **`D2` Corporate Ground-Truth Store (ChromaDB Collection 2):** Internal compliance policies, SOC2/security audits, and official disclosures queried by Agent 2A.
  3. **`D3` Operational Incident, Cluster & Audit DB (SQLite / PostgreSQL via `SqliteSaver`):** Replaces ephemeral `MemorySaver`. Persists raw posts + SHA-256 hashes, `CampaignCluster` deduplication records, PR Callback queue, LangGraph checkpoints, and Human Counsel HITL audit logs (`PENDING` / `APPROVED` / `REJECTED` + timestamps).
  4. **`D4` Legal Artifacts Repository (Filesystem / Object Store):** Versioned Markdown and PDF Executive Counsel Dossiers, Rule 3(1)(b) Takedown requests, and C&D / *Ashok Kumar* notices.

### 5.3 Evaluation Benchmark, Security & API Resilience (Question 4.3)
1. **50-Case Golden Evaluation Suite (`eval_dataset.json`):**
   Automated regression runner across 5 adversarial buckets (10 cases each):
   - *Bucket 1:* Pure emotional rants / hyperbole (Expected: `DISCARD`)
   - *Bucket 2:* False or exaggerated service complaints (Expected: `PR_SUPPORT_CALLBACK`, 0% legal escalation)
   - *Bucket 3:* Class A baseless smears — 5 anonymous + 5 identified (Expected: `CLASS_A_BASELESS_SMEAR` + correct `Ashok Kumar` vs `C&D` branch)
   - *Bucket 4:* Class B high-specificity zero-day / whistleblower leaks (Expected: `CLASS_B_ZERO_DAY_AMBIGUITY`, legal notices frozen)
   - *Bucket 5:* Adversarial citation traps & indirect prompt injections (Expected: 0% leaked `IPC 499`/`IT Act 66A` citations, injection ignored)
2. **Hard Portfolio & Viva KPIs:**
   - **False Legal Escalation Rate (Buckets 1 & 2):** `0%` target
   - **Zero-Day Whistleblower Recall (Bucket 4):** `>= 90%` target
   - **Deterministic Citation Grounding Pass Rate:** `100%` target (`0%` repealed law leakage)
   - **Token / Cost Reduction Ratio:** Measured % compute saved by Stage 1A Regex + Semantic Claim Clustering
3. **Runtime Security & Fault Tolerance:**
   - **Indirect Prompt Injection Boundary:** All external social media text is strictly wrapped inside `<UNTRUSTED_POST_TEXT>` data delimiters with explicit instruction-vs-data isolation.
   - **API Resilience:** Exponential backoff retries (`tenacity`) on HTTP `429`/`503` coupled with persistent `SqliteSaver` LangGraph checkpointing so interrupted runs resume at the failed node.

---

## 6. Architecture Decision Records (ADRs)

### ADR-001: Two-Gate Triage Pipeline for Defamation vs. Consumer Grievance
* **Date:** 2026-11-21  
* **Status:** Approved  
* **Context:** Initial designs conflated negative brand sentiment with actionable legal defamation, risking severe over-escalation (The Streisand Effect).
* **Decision:** Decoupled triage into Gate 1 (Linguistic Factuality via Ollman Test) and Gate 2 (Statutory Severity via Section 25 BNS *De Minimis* doctrine). 
* **Consequences:** 
  - Ordinary consumer grievances (even if empirically false) are systematically diverted to PR/Customer Support workflows.
  - Only allegations imputing criminality, fraud, or regulatory non-compliance reach the legal generation agents.

### ADR-002: Dual-Hypothesis Adversarial Verification with Human-in-the-Loop (HITL)
* **Date:** 2026-11-21  
* **Status:** Approved  
* **Context:** Automated legal systems face a lethal liability trap: issuing legal threats against real whistleblowers or customers reporting genuine, undetected security bugs.
* **Decision:** Replaced unilateral decision-making with an Adversarial LangGraph node: Agent 2A (Internal RAG Defense) opposes Agent 2B (Technical Specificity Red-Team), synthesized by Agent 2C into a Tri-State classification (Class A: Smear, Class B: Zero-Day Ambiguity, Class C: Substantiated Crisis). Autonomous litigation filing is prohibited; the system operates strictly as an HITL decision-support dossier generator.
* **Consequences:** 
  - Prevents PR disasters and malicious prosecution claims.
  - Showcases advanced multi-agent coordination, parallel fan-out, and state aggregation in the project portfolio.

### ADR-003: Hybrid Parent-Child + Contextual Trigger Statutory RAG (Bare Statutes Scope)
* **Date:** 2026-11-26  
* **Status:** Approved  
* **Context:** Naive fixed-size RAG splits legal sections away from their statutory Exceptions/Explanations, and bare 19th/20th-century statutory phrasing retrieves poorly against modern social media accusations.
* **Decision:** Adopted a Parent-Child Vector DB pattern over curated JSON Bare Acts (`statutes_corpus.json`) enriched with human-verified plain-English contextual triggers at ingestion time. Queries use Agent 1/2 rewritten claims and resolve matched child clauses back to full unbroken Parent Sections. Scoped v1 strictly to Bare Statutes and IT Rules (excluding multi-page Supreme Court case-law PDFs).
* **Consequences:** 
  - Eliminates truncated legal exceptions in LLM context and bridges the semantic gap between social media text and bare statutes.
  - Prevents v1 scope creep and temporal case-law overruling hazards.

### ADR-004: Closed-World Prompting + Deterministic Python Citation Guardrail
* **Date:** 2026-11-26  
* **Status:** Approved  
* **Context:** LLMs experience parametric memory leakage, accidentally citing repealed laws (IPC 499/500) or unconstitutional provisions (IT Act Sec 66A) despite accurate RAG context. LLM-as-a-judge checks also hallucinate.
* **Decision:** Enforced `temperature=0.0` closed-world prompting combined with a deterministic Python Regex Citation Validator checking a strict Session RAG Allowlist and a Repealed/Invalid Statute Blocklist, wired into a LangGraph conditional retry edge (`max_retries=2`, fail-closed on exhaustion).
* **Consequences:** 
  - Guarantees repealed or unretrieved statutes never silently reach Human Counsel.
  - Demonstrates genuine cyclical LangGraph self-correction rather than a linear prompt chain.

### ADR-005: Identifiability-Gated Legal Artifacts (IT Rules Grievance vs. Personal C&D)
* **Date:** 2026-11-26  
* **Status:** Approved  
* **Context:** Generating personal Cease & Desist notices addressed to anonymous burner handles (`u/throwaway_9821`) is legally unenforceable and exposes naive legal automation.
* **Decision:** Added an Author Identifiability branch in Agent 3. All Class A smears generate an Intermediary Grievance Takedown Request (**IT Rules 2021 Rule 3(1)(b) & 3(2)**) plus a SHA-256-hashed Executive Counsel Dossier. Direct C&D drafts (**BNS Sec 356**) are generated only for `IDENTIFIED` actors; `ANONYMOUS` actors trigger a **John Doe (*Ashok Kumar*) Log Preservation Notice** instead.
* **Consequences:** 
  - Mirrors authentic Indian cyber-litigation procedure for anonymous online defamation.

### ADR-006: Dual-Mode Ingestion & Semantic Claim Clustering for Coordinated Smears
* **Date:** 2026-11-26  
* **Status:** Approved  
* **Context:** External social APIs are rate-limited and unreliable during live academic demos, while coordinated bot smears generate N near-duplicate posts for a single false claim.
* **Decision:** Built a Dual-Mode Ingestion Adapter (Live API + Deterministic Replay Stream) paired with post-Stage-1B embedding clustering (`cosine_similarity > 0.85` over rolling 24h window). Duplicate smear posts aggregate into a single `CampaignCluster` dossier with elevated amplification weight.
* **Consequences:** 
  - Guarantees viva demo resilience and prevents N× token waste during coordinated attacks while surfacing stronger multi-author malice evidence.

### ADR-007: Python LangGraph Stack & Persistent 4-Store Architecture (`D1`–`D4`)
* **Date:** 2026-11-26  
* **Status:** Approved  
* **Context:** Workspace contains an unrelated Node.js YouTube practice prototype (`server/agent/*.js`), and in-memory LangGraph checkpoints (`MemorySaver`) lose legal audit state across restarts.
* **Decision:** Standardized LegalAdvisor AI on Python (FastAPI + LangGraph + ChromaDB + SQLite/PostgreSQL + PDF rendering) with four persistent data stores: `D1` Statutory Vector Store, `D2` Corporate Ground-Truth Vector Store, `D3` Operational Incident/HITL Audit SQL DB (`SqliteSaver`), and `D4` Legal Artifacts File Store.
* **Consequences:** 
  - Aligns backend implementation with Python LangGraph, PRAW, and automated RAG evaluation ecosystems while ensuring durable legal auditability across restarts.

### ADR-008: 50-Case Golden Evaluation Suite & Prompt-Injection Resilience
* **Date:** 2026-11-26  
* **Status:** Approved  
* **Context:** Qualitative "vibe-checking" fails external viva scrutiny, and ingesting hostile external social media text introduces indirect prompt-injection risk alongside cloud LLM API `429`/`503` failures.
* **Decision:** Mandated a 50-case labeled `eval_dataset.json` regression benchmark targeting `0%` false legal escalation and `100%` deterministic citation pass rate, paired with `<UNTRUSTED_POST_TEXT>` prompt boundaries, `tenacity` exponential backoff, and `SqliteSaver` node-level resumability.
* **Consequences:** 
  - Delivers quantitative engineering proof for technical interviews/viva and hardens the pipeline against adversarial post payloads.
