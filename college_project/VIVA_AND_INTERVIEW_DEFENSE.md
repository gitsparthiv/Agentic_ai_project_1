# LegalAdvisor AI: Viva & Technical Interview Defense Bank

This document captures battle-tested answers, architectural rationales, and examiner traps uncovered during the RFC Architectural Grilling Sessions. Review this before college viva evaluations and engineering portfolio interviews.

---

## 1. Core Problem & Triage Defense

### Q1: "Why didn't you just use Sentiment Analysis (VADER / RoBERTa) to flag negative posts?"
> **Winning Answer:**  
> *"Sentiment analysis measures emotional polarity, not legal liability. A customer saying 'Worst delivery ever, total scam!' has high negative sentiment, yet it is legally protected fair criticism or hyperbole. Conversely, a calm, zero-profanity post claiming 'Company X’s audited balance sheet hides ₹40 Cr of undisclosed debt' has neutral sentiment but constitutes catastrophic corporate defamation. Therefore, we replaced sentiment scoring with a Two-Gate Triage Pipeline grounded in the legal Ollman Test (separating subjective opinion from falsifiable empirical assertions)."*

### Q2: "What if a customer falsely lies that their order was delayed? That IS empirically falsifiable against your delivery database—will your AI threaten to sue them?"
> **Winning Answer:**  
> *"No. Falsifiability alone is insufficient for legal action. Our pipeline enforces the legal Doctrine of De Minimis (Section 25 of Bharatiya Nyaya Sanhita / old IPC Section 95) through a second-stage Statutory Severity Gate. While an exaggerated delivery delay is empirically falsifiable against warehouse timestamps, it does not impute criminality, regulatory fraud, or moral turpitude. Instead of escalating to legal counsel, our router diverts it to a PR / Customer Support Callback pipeline to resolve the operational complaint or flag abusive platform accounts—preventing PR disasters like the Streisand Effect."*

---

## 2. Multi-Agent & Uncertainty Defense

### Q3: "How does your AI know a severe accusation (e.g., 'data breach') is actually a baseless lie and not a true whistleblower exposing an undetected breach?"
> **Winning Answer:**  
> *"An LLM reading public forums cannot verify physical truth on its own, and blindly relying on internet search can be gamed by coordinated SEO smear campaigns. To solve this, we implemented a **Dual-Hypothesis Adversarial Verification Engine** inside LangGraph. Agent 2A (Corporate Defense Inquirer) queries internal compliance/architecture RAG records to check if the claim is technically refuted, while Agent 2B (Devil's Advocate Red-Team) simultaneously inspects the post for high technical epistemic specificity (e.g., exact internal API endpoints, port numbers, or schema clues). Agent 2C synthesizes both into a Tri-State output: genuine-looking technical leaks are classified as 'Zero-Day Ambiguity'—freezing all legal notices and alerting the internal CISO instead. Furthermore, the system operates strictly as Human-in-the-Loop (HITL) decision support; it never autonomously files litigation."*

---

## 3. Statutory RAG & Zero-Hallucination Defense

### Q4: "How did you chunk Indian legal statutes for RAG, and why not use standard 500-token chunks?"
> **Winning Answer:**  
> *"Fixed-token chunking destroys statutory integrity. For instance, Section 356 of BNS 2023 contains the defamation definition, Explanation 2 (which covers companies), and 10 critical Exceptions (such as Truth and Good Faith). A sliding 500-token window separates the offense from its legal exceptions, causing dangerous legal hallucinations. We solved this using a **Hybrid Hierarchical Parent-Child + Contextual Trigger Architecture**: at ingestion time, small Child Clauses are enriched with verified plain-English contextual triggers (bridging the gap between social media language and colonial-era statutory phrasing) and indexed in the Vector DB. At runtime, Agent 3 searches using rewritten legal claims, matches a Child Clause, and resolves `parent_section_id` to inject the **100% unbroken Parent Section**—all Explanations and Exceptions intact."*

### Q5: "Why doesn't your v1 RAG include Supreme Court / High Court judgment PDFs?"
> **Winning Answer:**  
> *"For v1, we strictly scoped the statutory corpus to curated Bare Statutes and IT Rules (~25–40 core sections across BNS 2023, IT Act 2000, IT Rules 2021, and Consumer Protection Act 2019). Ingesting raw 80-page judicial opinions into a naive vector store introduces severe noise and a critical legal hazard: **temporal precedent validity** (an older Supreme Court paragraph may be overruled by a later Constitutional Bench or statutory amendment like IPC $\rightarrow$ BNS). Supporting case law safely requires a dedicated citation-precedent graph, which is explicitly scoped out of v1 as a deliberate engineering boundary."*

### Q6: "If an LLM already saw Indian law during pre-training, what is the point of RAG—and how do you stop it from overriding RAG with outdated training weights?"
> **Winning Answer:**  
> *"You cannot delete an LLM's pre-training weights, and left unchecked, parametric memory causes silent **Context-Memory Conflict** (like citing repealed IPC 499/500 or unconstitutional IT Act Sec 66A instead of BNS Sec 356). We feed RAG so the LLM operates on **verbatim statutory text + private internal company records** rather than blurry probabilistic recall. We then enforce a 3-layer cage: (1) closed-world `temperature=0.0` prompt boundaries, (2) structured `statute_id` binding, and (3) a deterministic Python Regex Citation Validator checking a strict Session RAG Allowlist and Repealed Blocklist inside a LangGraph self-correction retry loop (`max_retries=2`)."*

### Q7: "How can you issue a Cease & Desist notice to an anonymous troll like `u/throwaway_9821` on Reddit?"
> **Winning Answer:**  
> *"You don't—that's a classic flaw in naive prototypes. Agent 3 checks Author Identifiability before selecting legal instruments. For an `IDENTIFIED` actor (named individual or competitor domain), it drafts a direct BNS Sec 356 Cease & Desist alongside a platform complaint. For an `ANONYMOUS` burner account, it skips the unenforceable personal C&D and generates an **Intermediary Grievance Takedown Request under Rule 3(1)(b)(v) & Rule 3(2) of IT Rules 2021** paired with a **John Doe (Ashok Kumar) Evidence Preservation Notice** requesting subscriber/access log retention, plus a SHA-256-hashed Executive Counsel Dossier."*

---

## 4. Reliability, Ingestion & Evaluation Defense

### Q8: "What if 50 coordinated bot accounts spam variations of the same lie—or Reddit's API dies during your live viva demo?"
> **Winning Answer:**  
> *"We engineered two safeguards at the ingestion boundary: (1) a **Dual-Mode Ingestion Adapter** uniting a Live Reddit PRAW poller with a Deterministic Replay Stream (`eval/mock CSV/JSON`) so live evaluations never depend on fragile external network/API quotas; and (2) **Semantic Claim Deduplication** immediately after Stage 1B (`cosine_similarity > 0.85` over a 24h window). Instead of wasting 50× LLM tokens generating duplicate notices, all 50 posts merge into a single `CampaignCluster` with SHA-256 hashes and unique author counts—turning bot spam into stronger legal proof of coordinated malice."*

### Q9: "How do you prove quantitatively that your system works—and protect it from prompt injection hidden inside hostile Reddit posts?"
> **Winning Answer:**  
> *"We evaluate against a **50-case Golden Benchmark (`eval_dataset.json`)** across 5 adversarial categories (rants, false service claims, anonymous/identified smears, zero-day whistleblower leaks, and prompt-injection/repealed-law traps), tracking 4 metrics: 0% false legal escalation on consumer grievances, $\ge$90% zero-day whistleblower recall, 100% deterministic citation pass rate, and token cost reduction ratio. At runtime, untrusted social payloads are isolated inside `<UNTRUSTED_POST_TEXT>` delimiters with explicit instruction-vs-data boundaries, backed by `tenacity` backoff and `SqliteSaver` checkpoints."*

---

## 5. Technical Scope & Guardrails Checklist (For Builders)
* [x] **No blind regex-only triage:** Regex is only for Stage 1A deterministic brand-entity & length pruning; semantic modality requires structured LLM classification.
* [x] **No live internet search dependency for truth verification in v1:** Vulnerable to competitor SEO/PR manipulation and adds latency/cost. Use internal corporate RAG + adversarial specificity check.
* [x] **No raw 80-page Supreme Court judgment PDFs in v1 RAG:** Bare Statutes + IT Rules only (`statutes_corpus.json`).
* [x] **No autonomous lawsuit/notice sending:** Human Counsel HITL sign-off is mandatory.
* [x] **No `MemorySaver` in LegalAdvisor AI:** Use persistent `SqliteSaver` (`D3`) + ChromaDB (`D1`/`D2`) + PDF Artifact store (`D4`) in Python (`server/agent/*.js` is an unrelated practice tutorial).
* [x] **No raw unescaped post concatenation:** Always isolate social posts inside `<UNTRUSTED_POST_TEXT>`.
