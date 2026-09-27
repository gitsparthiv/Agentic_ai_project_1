# Agentic AI Learning & Project Notes 🚀

This document tracks all the concepts, questions, architecture patterns, debugging lessons, and code implementations learned throughout building this project.

---

## 📑 Table of Contents
1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Environment Setup & Best Practices](#2-environment-setup--best-practices)
3. [Core Concepts](#3-core-concepts)
   - [What is a ReAct Agent?](#what-is-a-react-agent)
   - [LLM Model Selection & API Endpoints](#llm-model-selection--api-endpoints)
   - [Model Configuration (`apiKey` fallback & `temperature: 0`)](#model-configuration-apikey-fallback--temperature-0)
   - [Tool Definition & Validation (Zod)](#tool-definition--validation-zod)
   - [State Management & Checkpointers (`MemorySaver`)](#state-management--checkpointers-memorysaver)
   - [Understanding `thread_id` & Session Tracking](#understanding-thread_id--session-tracking)
   - [Console Methods: `console.log` vs `console.info`](#console-methods-consolelog-vs-consoleinfo)
4. [Step-by-Step Code Evolution](#4-step-by-step-code-evolution)
5. [Common Errors & Debugging Log](#5-common-errors--debugging-log)

---

## 1. Project Overview & Architecture

* **Frameworks & Libraries:**
  * [`@langchain/langgraph`](https://github.com/langchain-ai/langgraphjs): Orchestrates graph workflows, agents, loops, and persistence.
  * [`@langchain/google-genai`](https://github.com/langchain-ai/langchainjs): Connects to Google's Gemini LLMs.
  * [`@langchain/core`](https://github.com/langchain-ai/langchainjs): Core primitives (tools, messages, runnables).
  * [`zod`](https://zod.dev/): Schema definition and runtime type-safety for tool parameters.
  * [`dotenv`](https://github.com/motdotla/dotenv): Environment variable loader.

* **Directory Structure:**
  ```text
  d:\agentic_ai_project_1\
  ├── client/               # Frontend (UI)
  ├── server/               # Backend services
  │   └── agent/            # Agentic AI implementation
  │       ├── .env          # API keys (ignored by git)
  │       ├── .gitignore    # Ignore rules
  │       ├── package.json  # Node dependencies
  │       ├── agent.js      # Agent logic & execution
  │       └── README.md     # (This file) Learning & Reference Log
  └── .gitignore
  ```

---

## 2. Environment Setup & Best Practices

### Installing Dependencies
```powershell
# Inside server/agent:
npm install @langchain/langgraph @langchain/core @langchain/google-genai zod dotenv
```

### Environment Variables (`.env`)
Store sensitive keys securely in `server/agent/.env`:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
# or GEMINI_API_KEY=your_gemini_api_key_here
```

### Why `import 'dotenv/config';` is placed at the top
* In ES Modules (`"type": "module"`), `import` statements are hoisted and run before the rest of the script.
* Putting `import 'dotenv/config';` at the top guarantees `process.env` has your API keys loaded **before** `new ChatGoogleGenerativeAI(...)` tries to access them.

---

## 3. Core Concepts

### What is a ReAct Agent?
**ReAct** stands for **Reason + Act**:
1. **Thought:** The model analyzes the input.
2. **Action:** The model determines if it needs an external tool (e.g., weather lookup, database query, calculator) and issues a tool call.
3. **Observation:** The environment executes the tool and returns output to the model.
4. **Final Answer:** The model synthesizes the observation into a response.

### LLM Model Selection & API Endpoints
* Older models like `gemini-1.5-flash` or `gemini-2.0-flash` were deprecated on the API endpoint.
* Current standard Gemini models:
  * `gemini-2.5-flash` / `gemini-2.5-flash-lite`: Fast, lightweight, cost-effective.
  * `gemini-3.6-flash` / `gemini-3.8-flash`: High-performance flash models for complex agent reasoning.
  * `gemini-2.5-pro`: Deep multi-step reasoning.

### Model Configuration (`apiKey` fallback & `temperature: 0`)
```javascript
const model = new ChatGoogleGenerativeAI({
  model: 'gemini-3.6-flash',
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  temperature: 0,
});
```
* **`apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY`:**
  * Serves as a fallback mechanism. The official Google SDK defaults only to `GOOGLE_API_KEY`. By using the OR (`||`) operator, your application supports both `.env` naming conventions without crashing.
* **`temperature: 0`:**
  * Sets the model to **deterministic/focused** mode (removes randomness).
  * **Critical for AI Agents & Tools:** Ensures strict compliance with tool parameter schemas (Zod), prevents hallucinated arguments, and delivers predictable multi-step graph execution.

### Tool Definition & Validation (Zod)
Tools require a defined schema so the LLM knows what arguments to pass:
```javascript
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const weatherTool = tool(
  async ({ query }) => {
    if (query.toLowerCase().includes('san francisco')) {
      return "It's 60 degrees and foggy.";
    }
    return "It's 90 degrees and sunny.";
  },
  {
    name: 'weather',
    description: 'Get Weather in a specific city',
    schema: z.object({
      query: z.string().describe('The city or search query.'),
    }),
  }
);
```

### State Management & Checkpointers (`MemorySaver`)
* Agents are stateless by default.
* `MemorySaver` provides an in-memory checkpointer that snapshots the conversation state after every graph step.

### Understanding `thread_id` & Session Tracking
* **What is `thread_id`?** It's the unique string identifier of a conversation thread.
* **Does each message get a new `thread_id` in a continuous chat?**
  * ❌ **No:** A continuous conversation uses the **same `thread_id`** across all turns so the agent remembers past context.
  * 🔄 **New `thread_id`** is generated only when creating a new chat session (e.g., clicking "+ New Chat").
* **Data Type Requirement:** `thread_id` **MUST be a string** (e.g., `'42'`, `'session-123'`, UUID). Numbers (like `42`) cause a runtime exception because `MemorySaver` requires string keys to prevent prototype pollution.

### Console Methods: `console.log` vs `console.info`
* **In Node.js:** Both output identically to `stdout`.
* **In Browsers:** `console.info` maps to the "Info" log level filter and may display an info icon, while `console.log` is general debugging.

---

## 4. Step-by-Step Code Evolution

### Latest Implementation (`server/agent/agent.js`)

```javascript
import 'dotenv/config';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { MemorySaver } from '@langchain/langgraph';

// 1. Define Tools
const weatherTool = tool(
  async ({ query }) => {
    if (query.toLowerCase().includes('san francisco')) {
      return "It's 60 degrees and foggy.";
    }
    return "It's 90 degrees and sunny.";
  },
  {
    name: 'weather',
    description: 'Get Weather in a specific city',
    schema: z.object({
      query: z.string().describe('The query to use in your search.'),
    }),
  }
);

// 2. Setup Checkpointer (Memory)
const checkpointSaver = new MemorySaver();

// 3. Initialize Model with API Fallback and Deterministic Temperature
const model = new ChatGoogleGenerativeAI({
  model: 'gemini-3.6-flash',
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  temperature: 0,
});

// 4. Create ReAct Agent with Checkpointer
export const agent = createReactAgent({
  llm: model,
  tools: [weatherTool],
  checkpointSaver,
});

// 5. Turn 1: Invoke Agent
const result = await agent.invoke(
  {
    messages: [
      {
        role: 'user',
        content: 'whats the weather in san francisco?',
      },
    ],  
  },
  { configurable: { thread_id: '42' } } 
);

// 6. Turn 2: Follow-up question using the SAME thread_id (retains context)
const followup = await agent.invoke(
  {
    messages: [
      {
        role: 'user',
        content: 'whats city is that for?',
      },
    ],
  },
  { configurable: { thread_id: '42' } }
);

console.log(result.messages.at(-1)?.content);
console.info(followup.messages.at(-1)?.content);
```

---

## 5. Common Errors & Debugging Log

| Error / Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| `createReactAgent` strikethrough in IDE | Marked `@deprecated` in newer typings in favor of explicit graph APIs. | Harmless editor warning. The function runs without runtime issues. |
| `[404 Not Found] models/gemini-1.5-flash is not found` | The model identifier was deprecated or not supported on that API version. | Update `model` parameter to available versions like `gemini-3.6-flash` or `gemini-3.8-flash`. |
| `SyntaxError: Unexpected token '{'` on `agent.invoke` | `configurable` config was pasted inside the message payload object instead of passing it as the 2nd argument. | Pass input as argument 1 and config as argument 2: `agent.invoke({ messages: [...] }, { configurable: { thread_id: '42' } })`. |
| `Error: Invalid configurable value for key "thread_id": expected a string identifier (got number)` | Passed a numeric value (e.g., `42`) to `thread_id`. `MemorySaver` requires string keys. | Wrap the thread identifier in quotes (e.g. `'42'`). |
| `Error: Please set an API key for Google Generative AI` | Environment variable was named `GEMINI_API_KEY` but SDK searched for `GOOGLE_API_KEY`. | Use `apiKey: process.env.GEMINI_API_KEY \|\| process.env.GOOGLE_API_KEY`. |
