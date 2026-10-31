# Software Requirements Specification (SRS)
## For
## **LegalAdvisor AI**
### *An Autonomous Multi-Agent Framework for Public Discourse Triage and Statutory Risk Consultation*

---

**Prepared by:** [Student Name(s) / Team ID - Fill In]  
**Roll Number(s):** [Roll Numbers - Fill In]  
**Academic Year:** 2026–2027  
**Department:** Computer Science & Engineering / Information Technology  
**Institution:** [College / University Name - Fill In]  
**Supervisor / Guide:** [Project Guide / Professor Name - Fill In]  
**Document Status:** Working Draft (Phase 2 Deliverable)  
**Date:** November 1, 2026  

---

## 📑 Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 [Purpose](#11-purpose)
   - 1.2 [Document Conventions](#12-document-conventions)
   - 1.3 [Intended Audience](#13-intended-audience)
   - 1.4 [Project Scope](#14-project-scope)
   - 1.5 [References](#15-references)
2. [Overall Description](#2-overall-description)
   - 2.1 [Product Perspective](#21-product-perspective)
   - 2.2 [Product Functions Summary](#22-product-functions-summary)
   - 2.3 [User Classes and Characteristics (Actors)](#23-user-classes-and-characteristics-actors)
   - 2.4 [Operating Environment & Tech Stack](#24-operating-environment--tech-stack)
   - 2.5 [Design and Implementation Constraints](#25-design-and-implementation-constraints)
   - 2.6 [Assumptions and Dependencies](#26-assumptions-and-dependencies)
3. [Specific Functional Requirements](#3-specific-functional-requirements)
   - 3.1 [Module 1: Ingestion & Normalization Engine (Agent 1)](#31-module-1-ingestion--normalization-engine-agent-1)
   - 3.2 [Module 2: Sentiment, Authenticity & Validity Triage (Agent 2)](#32-module-2-sentiment-authenticity--validity-triage-agent-2)
   - 3.3 [Module 3: Statutory Legal Consultation via RAG (Agent 3)](#33-module-3-statutory-legal-consultation-via-rag-agent-3)
   - 3.4 [Module 4: Executive Dossier PDF Generation](#34-module-4-executive-dossier-pdf-generation)
   - 3.5 [Module 5: System Administration & Vector Knowledge Base Management](#35-module-5-system-administration--vector-knowledge-base-management)
4. [External Interface Requirements](#4-external-interface-requirements)
   - 4.1 [User Interfaces](#41-user-interfaces)
   - 4.2 [Software Interfaces](#42-software-interfaces)
   - 4.3 [Hardware Interfaces](#43-hardware-interfaces)
5. [Non-Functional Requirements (NFRs)](#5-non-functional-requirements-nfrs)
   - 5.1 [Performance Requirements](#51-performance-requirements)
   - 5.2 [Accuracy & Hallucination Mitigation](#52-accuracy--hallucination-mitigation)
   - 5.3 [Security & Confidentiality](#53-security--confidentiality)
   - 5.4 [Maintainability & Modularity](#54-maintainability--modularity)
6. [Appendices](#6-appendices)
   - 6.1 [Appendix A: Acronyms & Glossary](#61-appendix-a-acronyms--glossary)
   - 6.2 [Appendix B: Legal Disclaimer](#62-appendix-b-legal-disclaimer)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document defines the complete functional, behavioural, and non-functional specifications for **LegalAdvisor AI (Version 1.0)**. It serves as the primary technical blueprint for system development, college project evaluation, and verification testing.

### 1.2 Document Conventions
- This document conforms to the **IEEE Std 830-1998** standard.
- Requirement Identifiers:
  - `FR-x.x`: Functional Requirements (mandatory system actions).
  - `NFR-x.x`: Non-Functional Requirements (performance, security, accuracy limits).
- The keyword **"shall"** indicates a mandatory system capability; **"should"** indicates a desirable feature; **"may"** denotes optional scope.

### 1.3 Intended Audience
- **Project Evaluation Committee / Viva Examiners:** To verify academic requirements, system design rigor, and implementation feasibility.
- **Project Guide / Supervisor:** To track milestone completion against college curriculum deadlines.
- **Development Team:** To guide implementation, data schemas, and integration testing.

### 1.4 Project Scope
**LegalAdvisor AI** is an autonomous multi-agent software framework designed to bridge the operational gap between unstructured public web discourse and corporate statutory compliance. The system:
- Automates the monitoring and ingestion of online consumer comments referencing enterprise products and services.
- Employs an intelligent triage agent to filter genuine factual consumer grievances and corporate defamation from emotional hyperbole and spam.
- Utilizes Retrieval-Augmented Generation (RAG) over a dedicated Indian statutory law database to cite exact legislative sections, quantify corporate legal exposure, and compile an official, downloadable **Executive Legal Risk Advisory Dossier (PDF)**.

**Out-of-Scope (Non-Goals):**
- The system **shall not** replace certified legal practitioners.
- The system **shall not** automatically publish public responses or initiate legal litigation.

### 1.5 References
- IEEE Std 830-1998: *IEEE Recommended Practice for Software Requirements Specifications*.
- *The Consumer Protection Act, 2019* (Ministry of Consumer Affairs, Food and Public Distribution, Government of India).
- *The Information Technology Act, 2000* (Ministry of Electronics and Information Technology, Government of India).
- *Bharatiya Nyaya Sanhita (BNS), 2023 / Indian Penal Code (IPC)* (Defamation provisions).
- LangGraph & LangChain Documentation (Multi-Agent State Orchestration).

---

## 2. Overall Description

### 2.1 Product Perspective
LegalAdvisor AI is a standalone decision-support application integrating social listening with AI-driven legal statutory analysis. The architecture coordinates three autonomous agents orchestrated via a directed state graph.

```
+--------------------------------------------------------------------------+
|                            LEGALADVISOR AI                               |
|                                                                          |
|  [Reddit API / CSV Data]                                                 |
|            |                                                             |
|            v                                                             |
|  +--------------------+      +--------------------+                      |
|  | Agent 1: Harvester | ---> | Agent 2: Triage    |                      |
|  +--------------------+      +--------------------+                      |
|                                        | (Actionable Dispute)            |
|                                        v                                 |
|                              +--------------------+                      |
|                              | Agent 3: Legal RAG | <-> [ChromaDB: Acts] |
|                              +--------------------+                      |
|                                        |                                 |
|                                        v                                 |
|                          +----------------------------+                  |
|                          | Executive PDF Dossier Gen  |                  |
|                          +----------------------------+                  |
|                                        |                                 |
|                                        v                                 |
|                         [Corporate Legal Counsel]                        |
+--------------------------------------------------------------------------+
```

### 2.2 Product Functions Summary
1. **Multi-Source Ingestion:** Continuous polling of public platforms (Reddit API) paired with batch file upload (CSV/JSON) for offline testing.
2. **Two-Stage Discourse Triage:** Sentiment analysis coupled with a validity rubric (filtering out spam and hyperbole; prioritizing actionable grievances).
3. **Statutory Clause Retrieval:** Section-aware semantic vector search across Indian statutory codes.
4. **Autonomous Risk Grading:** Classification of corporate liability into `Low`, `Medium`, `High`, and `Critical` tiers.
5. **Executive Dossier Export:** Programmatic compilation of detailed legal advisory reports into styled PDF artifacts.

### 2.3 User Classes and Characteristics (Actors)
The system recognizes exactly two user roles:

1. **Corporate Legal Counsel / Compliance Officer (Primary Actor):**
   - *Profile:* Corporate advocate, compliance lead, or risk officer.
   - *Interactions:* Inspects high-risk incidents, verifies cited statutory sections, reviews recommended remediation actions, and downloads PDF advisory dossiers.
2. **System Administrator / Knowledge Base Admin (Secondary Actor):**
   - *Profile:* Technical operator or developer.
   - *Interactions:* Uploads and updates statutory law books, monitors vector database embeddings in ChromaDB, configures API keys, and runs offline batch test pipelines.

### 2.4 Operating Environment & Tech Stack
- **Programming Language:** Python 3.10+
- **Agent Orchestration Framework:** LangGraph / LangChain
- **LLM Inference Engine:** Google Gemini (1.5 / 2.0 Flash)
- **Vector Database:** ChromaDB (Local persistent embedded store)
- **Document Export Engine:** ReportLab
- **Data Ingestion Interface:** PRAW (Python Reddit API Wrapper) + Python CSV/JSON parser
- **Host OS:** Windows 10/11, Linux (Ubuntu 22.04+), or macOS

### 2.5 Design and Implementation Constraints
- **Statutory Boundary:** Initial knowledge base is strictly bounded to Indian statutory law (Consumer Protection Act 2019, IT Act 2000, and BNS/IPC Defamation clauses).
- **Offline Defense Constraint:** System must operate cleanly during college evaluation using local mock CSV files without requiring live social media connectivity.
- **Legal Compliance:** Every generated report must carry an uneditable Non-Attorney Legal Disclaimer.

### 2.6 Assumptions and Dependencies
- Valid Google Gemini API key with sufficient rate limits.
- Public forum comments are accessible in plain English (or Romanized Hindi).
- Official legislative PDFs from `indiacode.nic.in` are parsed and pre-indexed prior to query execution.

---

## 3. Specific Functional Requirements

### 3.1 Module 1: Ingestion & Normalization Engine (Agent 1)
- **FR-1.1:** The system shall support ingesting comments from the Reddit API using specified keywords or subreddit targets.
- **FR-1.2:** The system shall support offline batch ingestion via uploaded CSV and JSON files containing public post records.
- **FR-1.3:** The system shall normalize each ingested record into a standardized JSON schema containing:
  - `post_id` (String, Unique)
  - `timestamp` (ISO 8601 Format)
  - `platform` (String: e.g., "Reddit", "Mock_Dataset")
  - `author_id` (String)
  - `raw_text` (String)
- **FR-1.4:** The system shall sanitize `raw_text` by removing HTML markup, non-printable characters, and malformed script payloads.

### 3.2 Module 2: Sentiment, Authenticity & Validity Triage (Agent 2)
- **FR-2.1:** The system shall analyze `raw_text` and assign a primary sentiment tag: `Positive`, `Neutral`, or `Negative`.
- **FR-2.2:** For all `Negative` records, the system shall apply a validity verification rubric to categorize the post into one of four classes:
  1. `Spam_Noise`: Bot-generated spam, irrelevant ads, or gibberish.
  2. `Subjective_Hyperbole`: Non-actionable emotional complaints without factual claims (e.g., *"this product is trash"*).
  3. `Factual_Grievance`: Actionable assertions of service failure, monetary loss, or product malfunction.
  4. `Defamation_Risk`: Actionable false factual claims damaging the brand's standing.
- **FR-2.3:** The system shall archive `Positive`, `Neutral`, `Spam_Noise`, and `Subjective_Hyperbole` records to the audit log.
- **FR-2.4:** The system shall route only records tagged `Factual_Grievance` and `Defamation_Risk` to Agent 3 with an assigned urgency score (1 to 10).

### 3.3 Module 3: Statutory Legal Consultation via RAG (Agent 3)
- **FR-3.1:** The system shall extract core allegations from the grievance (e.g., deficiency in service, misleading advertisement, illegal data retention, public defamation).
- **FR-3.2:** The system shall query the local ChromaDB vector store using dense semantic retrieval to locate matching statutory sections.
- **FR-3.3:** The system shall extract the specific:
  - `Act Name` and `Year`
  - `Chapter` and `Section Number`
  - `Statutory Provision Title`
  - `Applicable Corporate Liability or Statutory Penalty`
- **FR-3.4:** The system shall compute an exposure severity rating:
  - `Low`: Minor customer dispute with negligible statutory exposure.
  - `Medium`: Statutory deficiency of service covered under Consumer Protection Act mediation.
  - `High`: Severe consumer safety hazard, significant financial fraud claim, or IT Act non-compliance.
  - `Critical`: Serious criminal allegation or large-scale class-action vulnerability.
- **FR-3.5:** The system shall formulate practical legal remediation steps (e.g., immediate customer outreach, evidence preservation, public clarification notice, cease-and-desist).

### 3.4 Module 4: Executive Dossier PDF Generation
- **FR-4.1:** The system shall programmatically compile the output of Agent 1, 2, and 3 into a standardized Executive Dossier.
- **FR-4.2:** The dossier shall contain the following standard sections:
  1. Incident Summary & Source Metadata
  2. Grievance Analysis & Validity Classification
  3. Statutory Citations & Legal Mapping Table
  4. Corporate Exposure Assessment & Severity Score
  5. Recommended Action Items
  6. Non-Attorney Disclaimer
- **FR-4.3:** The system shall export the generated dossier as a formatted PDF file using ReportLab.

### 3.5 Module 5: System Administration & Vector Knowledge Base Management
- **FR-5.1:** The system shall provide an administrative script to ingest statutory PDF documents from the Indian Code repository.
- **FR-5.2:** The ingestion script shall perform section-aware chunking preserving Section numbers and titles as vector metadata.
- **FR-5.3:** The system shall persist embeddings to local disk storage (`./chroma_data`) to prevent redundant re-indexing costs.

---

## 4. External Interface Requirements

### 4.1 User Interfaces
- **Command Line / Script Interface:** For Phase 1 prototype execution and batch runs.
- **Interactive UI (Planned Phase 5):** A local web dashboard [e.g., Streamlit / React] to review incident dossiers and download PDFs.

### 4.2 Software Interfaces
- **Google Gemini API:** Utilized via `@google/genai` or `langchain-google-genai` for reasoning, triage, and statutory synthesis.
- **PRAW (Python Reddit API Wrapper):** Communicates with Reddit OAuth2 endpoints for forum post retrieval.
- **ChromaDB Client:** Interfaces with local embedded vector database storage.
- **ReportLab:** Python library for programmatic PDF construction.

### 4.3 Hardware Interfaces
- **Processor:** Minimum Dual-Core x86/ARM Processor (Intel i5/AMD Ryzen 5 or Apple Silicon).
- **RAM:** Minimum 8 GB (16 GB recommended for local vector query buffering).
- **Storage:** Minimum 2 GB free disk space for Python virtual environment, dependencies, and vector database.

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Performance Requirements
- **NFR-1.1 (Triage Latency):** Agent 1 and Agent 2 shall complete normalization and validity triage within $\le 3.0$ seconds per post record.
- **NFR-1.2 (RAG & Dossier Generation Latency):** Agent 3 statutory query and PDF dossier generation shall complete within $\le 8.0$ seconds per actionable post.

### 5.2 Accuracy & Hallucination Mitigation
- **NFR-2.1 (Citation Grounding):** 100% of statutory sections cited by Agent 3 must exist within the retrieved ChromaDB context. Any citation not present in retrieved context shall be flagged as an ungrounded inference.
- **NFR-2.2 (Reproducibility):** Running the offline evaluation batch on identical inputs shall yield consistent validity classifications.

### 5.3 Security & Confidentiality
- **NFR-3.1 (Credential Protection):** API keys (Gemini API, Reddit Client Secret) shall be loaded strictly from local `.env` environment variables and never hardcoded in source files.
- **NFR-3.2 (Data Sanitization):** Usernames and personal email addresses detected in raw post text shall be masked prior to vector search processing.

### 5.4 Maintainability & Modularity
- **NFR-4.1 (State Graph Decoupling):** The agents shall be defined as independent nodes in a LangGraph state graph so that Agent 2 or Agent 3 logic can be updated without refactoring the entire pipeline.

---

## 6. Appendices

### 6.1 Appendix A: Acronyms & Glossary
| Term | Expansion & Definition |
| :--- | :--- |
| **SRS** | Software Requirements Specification |
| **RAG** | Retrieval-Augmented Generation |
| **LLM** | Large Language Model |
| **CPA 2019** | The Consumer Protection Act, 2019 (India) |
| **IT Act 2000** | The Information Technology Act, 2000 (India) |
| **BNS** | Bharatiya Nyaya Sanhita, 2023 (Replaced Indian Penal Code) |
| **PRAW** | Python Reddit API Wrapper |

### 6.2 Appendix B: Legal Disclaimer
Every generated output, screen, and dossier produced by this software must state:
> *"LEGAL DISCLAIMER: LegalAdvisor AI is an academic research prototype developed strictly for educational, informational, and corporate triage decision-support. It does not provide formal legal advice, legal representation, or establish an attorney-client relationship. All statutory interpretations and exposure ratings must be verified by licensed corporate legal counsel."*

---
*Created: November 1, 2026 | LegalAdvisor AI Project Engineering Space*
