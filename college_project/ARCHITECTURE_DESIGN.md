# System Architecture & Technical Design 🏛️

This document stores technical designs, architecture diagrams, data models, agent loops, and integration schemas for **LegalAdvisor AI**.

---

## 🎯 Executive Summary & Project Goal
**System Title:** LegalAdvisor AI (Multi-Agent Legal Consultation & Risk Intelligence System)  
**Core Mission:** Automate the continuous monitoring, sentiment/validity classification, and statutory legal risk assessment of public user comments/posts targeting a company, generating actionable legal advisory dossiers for corporate legal counsel.

---

## 🏗️ 1. High-Level Component & LangGraph State Architecture

The system is built as a deterministic, state-driven multi-agent pipeline orchestrated via **LangGraph**. Agents operate as specialized graph nodes that read from and update a central shared state dictionary (`LegalAdvisorState`).

```mermaid
flowchart TD
    subgraph INGESTION["1. Data Ingestion Layer"]
        A1["Reddit API (PRAW)<br><i>Live Forum Stream</i>"] --> HARVESTER["Node 1: Harvester Agent<br>(Agent 1)"]
        A2["Mock CSV / JSON Uploader<br><i>Offline Viva Evaluation</i>"] --> HARVESTER
        HARVESTER --> SANITIZE["Text Sanitization & PII Masking"]
    end

    subgraph STATE["Central LangGraph State: LegalAdvisorState"]
        CLIPBOARD["Shared State Dictionary<br>• raw_post<br>• triage_result<br>• retrieved_statutes<br>• legal_assessment<br>• is_grounded<br>• pdf_path"]
    end

    SANITIZE -->|Populates raw_post| CLIPBOARD
    CLIPBOARD --> TRIAGE["Node 2: Triage & Validity Agent<br>(Agent 2)"]

    subgraph TRIAGE_DECISION["2. Discourse Triage & Validation"]
        TRIAGE --> ROUTER{"Is Grievance Actionable?<br>(Factual Claim / Defamation)"}
        ROUTER -->|No: Spam / Emotional Hyperbole| ARCHIVE["Audit Log & Product Archive<br><i>(Non-Legal State End)</i>"]
    end

    subgraph RAG_LAYER["3. Statutory Consultation & Knowledge Base"]
        ROUTER -->|Yes: Legal Exposure| LEGAL["Node 3: Statutory Legal Consultant<br>(Agent 3)"]
        CHROMA[("ChromaDB Vector Store<br><i>Local Persistent Embeddings</i><br>• Consumer Protection Act 2019<br>• IT Act 2000<br>• BNS / IPC Defamation")] <-->|Semantic Section Retrieval| LEGAL
        LEGAL --> GUARDRAIL["Node 4: Citation Grounding Guardrail<br><i>(Anti-Hallucination Reflection Check)</i>"]
        GUARDRAIL -->|Citation Verified| DOSSIER_NODE["Node 5: Dossier Generator<br><i>(ReportLab PDF Engine)</i>"]
        GUARDRAIL -->|Ungrounded Section| LEGAL
    end

    subgraph OUTPUT_LAYER["4. Output & Human-in-the-Loop"]
        DOSSIER_NODE --> PDF["Executive Legal Risk Dossier (PDF)<br><i>Metadata • Citations • Penalties • Disclaimer</i>"]
        PDF --> COUNSEL["Corporate Legal Counsel / Compliance Officer<br><i>(Human Review & Executive Action)</i>"]
    end

    classDef primary fill:#1B365D,stroke:#333,stroke-width:2px,color:#fff;
    classDef nodeBox fill:#EBF3FA,stroke:#2E5B88,stroke-width:2px,color:#000;
    classDef storage fill:#FFF2CC,stroke:#D6B656,stroke-width:2px,color:#000;
    classDef decision fill:#FCE5CD,stroke:#E69138,stroke-width:2px,color:#000;
    classDef output fill:#D9EAD3,stroke:#6AA84F,stroke-width:2px,color:#000;

    class HARVESTER,TRIAGE,LEGAL,GUARDRAIL,DOSSIER_NODE nodeBox;
    class CHROMA storage;
    class ROUTER decision;
    class PDF,COUNSEL output;
```

---

## 📋 2. The Shared State Schema (`LegalAdvisorState`)

In LangGraph, agents do not make unstructured, tangled calls to each other. Instead, each node receives the shared state object, executes its task, and returns updated keys.

```python
from typing import TypedDict, Optional, List, Dict, Any

class LegalAdvisorState(TypedDict):
    # Node 1: Ingestion & Normalization Output
    post_id: str
    source_platform: str          # "reddit" | "mock_csv"
    raw_text: str
    cleaned_text: str
    timestamp: str

    # Node 2: Triage & Classification Output
    sentiment: str                # "Positive" | "Neutral" | "Negative"
    validity_class: str           # "Spam_Noise" | "Subjective_Hyperbole" | "Factual_Grievance" | "Defamation_Risk"
    is_actionable: bool           # True routes to Legal Consultant; False terminates to Archive
    urgency_score: int            # 1 to 10 scale

    # Node 3: Statutory RAG & Consultation Output
    allegation_summary: str
    retrieved_sections: List[Dict[str, Any]]  # Exact chunks fetched from ChromaDB
    cited_act: str                # e.g., "The Consumer Protection Act, 2019"
    cited_section: str            # e.g., "Section 86 (Product Liability)"
    exposure_level: str           # "Low" | "Medium" | "High" | "Critical"
    recommended_actions: List[str]

    # Node 4: Reflection Guardrail Verification
    is_citation_grounded: bool    # True if cited section exactly matches ChromaDB metadata

    # Node 5: Final Deliverable
    dossier_pdf_path: Optional[str]
```

---

## 🤖 3. The Runtime Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor Web as Public Web / Reddit / CSV
    participant Agent1 as Node 1: Harvester Agent
    participant Agent2 as Node 2: Triage & Validity Filter
    participant Agent3 as Node 3: Statutory Legal Consultant
    participant DB as Knowledge Base (ChromaDB / Indian Acts)
    participant Guard as Node 4: Citation Grounding Guardrail
    actor Company as Corporate Legal Counsel

    Web->>Agent1: Ingest public comment referencing company features
    Note over Agent1: Cleans text, masks PII, creates normalized JSON
    Agent1->>Agent2: Passes state payload with cleaned_text
    Note over Agent2: Classifies sentiment and evaluates 4-tier validity rubric
    alt Non-Actionable (Spam / Emotional Hyperbole)
        Agent2->>Agent2: Archives to audit log (terminates pipeline)
    else Actionable (Factual Grievance / Defamation Risk)
        Agent2->>Agent3: Routes actionable state payload
        Agent3->>DB: Dense semantic search on Indian Acts (CPA 2019 / IT Act 2000)
        DB-->>Agent3: Top-3 relevant statutory sections with metadata
        Note over Agent3: Maps grievance to violation & assigns exposure level
        Agent3->>Guard: Passes drafted citation for validation
        Note over Guard: Verifies cited section against ChromaDB chunk metadata
        Guard-->>Agent3: Citation Verified (Zero-Hallucination Guarantee)
        Agent3->>Company: Generates Downloadable Executive PDF Legal Dossier
    end
```

---

## 🧩 Architectural Responsibilities

### Agent 1: Data Ingestion & Monitoring Agent
- **Role:** Data Harvester & Normalizer.
- **Responsibilities:**
  - Hybrid ingestion: Live streaming via Reddit API (PRAW) + offline batch evaluation via structured CSV/JSON file uploader.
  - Ingest public comments, product reviews, and forum posts referencing company products/features.
  - Extract critical context: Timestamp, User ID/Handle, Platform, Geolocation/Region tag, and Raw Content.
  - Sanitize text (remove HTML, script injections, formatting noise) and deliver clean JSON payloads to Agent 2.

### Agent 2: Sentiment, Validity & Triage Agent
- **Role:** Content Classifier & Risk Assessor.
- **Responsibilities:**
  - **Sentiment Separation:** Categorize feed into Positive, Neutral, and Negative sentiments.
  - **Validity & Authenticity Rubric:** Distinguish between:
    - *Spam / Bot Noise* (Ignored/Archived)
    - *Subjective Discontent / Hyperbole* (Non-actionable, archived for product feedback)
    - *Factual Grievance* (Actionable: specific claim of financial, physical, or service deficiency)
    - *Defamation / Corporate Slander* (Actionable: targeted false factual claims harming reputation)
  - **Triage & Routing:** Route only *Actionable* grievances to Agent 3 with an assigned urgency flag.

### Agent 3: Statutory Legal Consultation Agent
- **Role:** Autonomous Legal Analyst.
- **Scope (Indian Law Frozen Scope):**
  1. *The Consumer Protection Act, 2019* (Deficiency in service, misleading advertisements, unfair trade practices).
  2. *The Information Technology Act, 2000* (Intermediary liability, digital fraud, data privacy violations).
  3. *Bharatiya Nyaya Sanhita (BNS) / IPC* (Criminal defamation, corporate fraud).
- **Responsibilities:**
  - **Statutory Retrieval-Augmented Generation (RAG):** Query a local persistent ChromaDB vector store containing section-chunked Indian statutes.
  - **Section-Level Citation:** Map the grievance to the exact Act, Chapter, Section, Subsection, and statutory penalties/remedies.
  - **Risk Severity Grading:** Assign exposure rating (`Low`, `Medium`, `High`, `Critical`).
  - **Executive Dossier Generation:** Trigger the PDF generation module (ReportLab) to compile an official executive legal risk advisory dossier for the Corporate Legal Counsel.

---

## 🛠️ Technology Stack

| Layer | Selected Technology | Rationale / Viva Defense |
| :--- | :--- | :--- |
| **Agent Orchestration** | **LangGraph (Python)** | Industry-standard multi-agent state graph with cyclic loops, conditional routing, and state reducers. |
| **LLM Inference Engine** | **Google Gemini (1.5 / 2.0)** | Large context window, strong statutory reasoning, native structured JSON output. |
| **Vector Database** | **ChromaDB (Local / Embedded)** | Zero-cost, runs on local disk (`./chroma_data`), supports metadata filtering, seamlessly integrates with LangChain/LangGraph. |
| **Ingestion Interfaces** | **Reddit API (PRAW) + CSV/JSON Batch Engine** | Guarantees testability during offline viva exams without internet flakiness, while demonstrating real API ingestion. |
| **Document Export Engine** | **ReportLab (Python)** | Programmatic generation of enterprise-grade, styled PDF legal dossiers with embedded disclaimer. |

---
*Maintained as the technical blueprint of the project.*
