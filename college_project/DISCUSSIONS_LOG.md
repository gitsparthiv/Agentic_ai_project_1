# Project Brainstorming, Discussions & Decisions Log 💬

This document records discussions, thoughts, options weighed, and final conclusions reached for our college project.

---

## 📅 Session Log

### Session 1: Project Setup & Initialization (October 31, 2026)
- **Context:** Transitioning from foundational Agentic AI exercises to the main college business project.
- **Action Taken:** Created dedicated project space under `college_project/` with structured tracking files.

### Session 2: Core Project Concept & Architecture Alignment (October 31, 2026)
- **Topic:** AI-Powered Multi-Agent Legal Consultation & Risk Intelligence System.
- **Problem Defined:** Corporate vulnerability to online allegations, product complaints, brand disparagement, and regulatory exposure across multiple legal jurisdictions.
- **Core 3-Agent Structure Agreed:**
  1. **Agent 1 (Harvester):** Scrapes/ingests posts and reviews referencing company features.
  2. **Agent 2 (Triage / Validity Filter):** Filters positive/negative sentiments, audits validity/authenticity, isolates actionable legal threats.
  3. **Agent 3 (Legal Consultant with Law Knowledge Base):** Jurisdictional statutory lookup, maps complaints to legal violations/sections, outputs an executive legal risk advisory dossier.

### Session 3: Project Naming & Brand Identity Brainstorming (October 31, 2026)
- **Objective:** Propose academic, corporate-ready, and memorable project titles tailored for a college capstone presentation.

### Session 4: Mental Model for Project Naming & Clarity Audit (October 31, 2026)
- **User Doubt & Critique:** Plain English + explicit "AI" vs. archaic Latin terminology.
- **Formulation:** 3-Pillar Naming Mental Model ([Domain] + [Problem] + [Technology]).

### Session 5: Official Selection & Problem Statement Formulation (October 31, 2026)
- **Final Decision:** **LegalAdvisor AI** chosen as the official project name.
- **Official Tagline Selected:** *"Transforming Public Feedback into Autonomous Legal Intelligence."*
- **Problem Statement Drafted:** Formulated academic problem statement covering the operational gap between public discourse monitoring and cross-jurisdictional statutory legal consultation.
- **Updated Artifacts:** Logged into `REQUIREMENTS_GUIDELINES.md` and `DISCUSSIONS_LOG.md`.

### Session 6: Critical Feasibility Review & Risk Evaluation (October 31, 2026)
- **Context:** Conducted an unsparing, critical review of the project idea, technical bottlenecks, and prerequisites.
- **Key Challenges Identified:**
  1. *Agent 3 Citation Fidelity & Hallucination:* Risk of generating non-existent sections in legal advice.
  2. *Agent 2 Validity Rubric:* Need for clear definition separating emotional opinions/hyperbole from actionable factual claims.
  3. *Agent 1 Platform Limits:* API costs/restrictions (Twitter, Reddit, app stores) vs. synthetic or mock ingestion streams.
  4. *RAG Section Chunking:* Need for hierarchical chunking of legal statutes rather than naive token splitting.
  5. *Scope Control:* Strongly recommended bounding initial statutory scope to Indian Law (Consumer Protection, IT Act, Defamation).
- **Deliverable Created:** Added [`CHALLENGES_AND_RISKS.md`](file:///d:/agentic_ai_project_1/college_project/CHALLENGES_AND_RISKS.md) as a technical reference for team collaborators.
- **Next Steps:** Clarify cross-questions regarding data sources, jurisdiction scope, and report delivery format.

---
*(New discussion topics, trade-offs, and decisions will be logged here chronologically)*
