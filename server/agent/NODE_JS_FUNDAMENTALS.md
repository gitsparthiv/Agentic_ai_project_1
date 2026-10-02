# Node.js & JavaScript Fundamentals Reference 📘

This document serves as a dedicated handbook for core Node.js, JavaScript, runtime behavior, CLI tooling, and package management concepts learned while building this project.

---

## 📑 Table of Contents
1. [Node.js Execution & Package Scripts](#1-nodejs-execution--package-scripts)
   - [`node <file>.js` vs `npm run dev`](#node-filejs-vs-npm-run-dev)
   - [Configuring `package.json` Scripts (`--watch` mode)](#configuring-packagejson-scripts---watch-mode)
2. [Runtime Environment & ES Modules](#2-runtime-environment--es-modules)
   - [Module Types: CommonJS (`require`) vs ES Modules (`import`)](#module-types-commonjs-require-vs-es-modules-import)
   - [Top-level Await & Hoisting with `dotenv/config`](#top-level-await--hoisting-with-dotenvconfig)
3. [JavaScript Core Primitives & Dynamic Evaluation](#3-javascript-core-primitives--dynamic-evaluation)
   - [Understanding `eval()` in JavaScript](#understanding-eval-in-javascript)
   - [Why `eval()` is Powerful yet Dangerous](#why-eval-is-powerful-yet-dangerous)
   - [Function Return Values & The Default `undefined`](#function-return-values--the-default-undefined)
4. [Schema Validation & Type Guards (Zod)](#4-schema-validation--type-guards-zod)
   - [What is `z` (Zod)?](#what-is-z-zod)
   - [How `z.object()`, `z.string()`, and `.describe()` Work](#how-zobject-zstring-and-describe-work)
   - [How LLMs Read JSON Schema Metadata](#how-llms-read-json-schema-metadata)
5. [Console Methods & Logging Levels](#5-console-methods--logging-levels)
   - [`console.log` vs `console.info` vs `console.error`](#consolelog-vs-consoleinfo-vs-consoleerror)
6. [Terminal & CLI Fundamentals](#6-terminal--cli-fundamentals)
   - [Understanding Command Working Directories (`MODULE_NOT_FOUND`)](#understanding-command-working-directories-module_not_found)
   - [PowerShell Quirk: `curl` Alias & Script Execution Warning](#powershell-quirk-curl-alias--script-execution-warning)
   - [PowerShell Continuation Prompt (`>>` Unclosed Quotes Trap)](#powershell-continuation-prompt--unclosed-quotes-trap)

---

## 1. Node.js Execution & Package Scripts

### `node <file>.js` vs `npm run dev`

| Aspect | `node <file>.js` | `npm run dev` |
| :--- | :--- | :--- |
| **How it works** | Directly invokes the Node.js runtime on a target script file. | Executes the custom script mapped under `"scripts": { "dev": "..." }` in `package.json`. |
| **Lifecycle** | Runs the file once; exits immediately if no server/loop is active. | Runs the project development command (e.g. server with watcher). |
| **File Watching** | ❌ No auto-reload on file edits (must restart manually with `Ctrl + C`). | ✅ Auto-restarts server on code edits (via `node --watch` or `nodemon`). |
| **Best For** | Quick one-off scripts, testing, standalone executions. | Active application and server development. |

### Configuring `package.json` Scripts (`--watch` mode)
Inside `package.json`:
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  }
}
```
* **`npm start`**: Runs `node index.js` (standard production entry point).
* **`npm run dev`**: Uses Node's built-in `--watch` flag (Node 18+) to restart `index.js` automatically when any project file is saved.

---

## 2. Runtime Environment & ES Modules

### Module Types: CommonJS (`require`) vs ES Modules (`import`)
* Adding `"type": "module"` in `package.json` enables modern ES Modules (`import`/`export`).
* Without `"type": "module"`, Node defaults to CommonJS (`require()`/`module.exports`).

### Top-level Await & Hoisting with `dotenv/config`
* In ES Modules, `import` statements are hoisted and executed **before** the rest of the script.
* Placing `import 'dotenv/config';` as the very first line guarantees `process.env` is populated before other modules or SDKs attempt to read API keys.

---

## 3. JavaScript Core Primitives & Dynamic Evaluation

### Understanding `eval()` in JavaScript
* **`eval()`** is a built-in global function that executes a string of JavaScript code dynamically at runtime:
  ```javascript
  const expression = "10 * 5 + 2";
  console.log(eval(expression)); // 52
  ```
* **Use in Agentic AI:** Allows models like Gemini to write dynamic code snippets on the fly that Node executes and returns results for.

### Why `eval()` is Powerful yet Dangerous
* **Security Risk (Remote Code Execution):** Any code passed to `eval()` executes with the full privileges of the Node.js process. In production, code sandboxes (like Docker or Node's `vm` module) are used instead.
* **Performance:** V8 engines cannot optimize dynamic code in advance.

### Function Return Values & The Default `undefined`
* If a JavaScript function ends without an explicit `return <value>`, it implicitly returns `undefined`.
* In tool integration, returning `undefined` prevents LangGraph from receiving tool outputs, breaking the AI agent's feedback loop.

---

## 4. Schema Validation & Type Guards (Zod)

### What is `z` (Zod)?
* **`z`** is the namespace exported by the `zod` library used to define runtime schemas and type contracts in TypeScript & JavaScript.

### How `z.object()`, `z.string()`, and `.describe()` Work
```javascript
schema: z.object({
  query: z.string().describe("The search keyword"),
})
```
* **`z.object({...})`**: Defines an object parameter structure.
* **`z.string()`**: Enforces that the property must be text (throws an error if a number/object is supplied).
* **`.describe('...')`**: Provides descriptive metadata that LangChain converts to JSON Schema parameter descriptions for the LLM.

### How LLMs Read JSON Schema Metadata
The LLM does not execute Zod code. Instead, LangChain serializes Zod into JSON Schema sent over the API:
```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "The search keyword"
    }
  },
  "required": ["query"]
}
```
The LLM reads `"description"` as instructions for what data to extract and place in that parameter.

---

## 5. Console Methods & Logging Levels

### `console.log` vs `console.info` vs `console.error`
* **In Node.js (Backend):**
  * `console.log()` and `console.info()` both output identically to standard output (`stdout`).
  * `console.error()` and `console.warn()` write to standard error (`stderr`).
* **In Browsers (DevTools):**
  * `console.info()` categorizes output under the "Info" log level filter (often showing an `ℹ️` icon).
  * `console.log()` is categorized as general debug output.

---

## 6. Terminal & CLI Fundamentals

### Understanding Command Working Directories (`MODULE_NOT_FOUND`)
* **Error:** `Error: Cannot find module 'D:\agentic_ai_project_1\index.js'`
* **Root Cause:** Running `node index.js` from the workspace root when `index.js` resides inside `server/agent/`.
* **Rule:** Node resolves relative paths starting from the **current directory of the terminal**, not where the repository is centered.
* **Fix:** Either `cd server/agent` first, or specify the relative path `node server/agent/index.js`.

### PowerShell Quirk: `curl` Alias & Script Execution Warning
* In Windows PowerShell 5.1, `curl` is aliased to `Invoke-WebRequest`.
* Running `curl http://...` triggers an Internet Explorer parsing security warning.
* **Fix:** Explicitly use the native binary `curl.exe` or use `-UseBasicParsing`:
  ```powershell
  curl.exe http://localhost:3001
  ```

### PowerShell Continuation Prompt (`>>` Unclosed Quotes Trap)
* **Symptom:** Terminal gets stuck displaying `>>` on every line.
* **Cause:** PowerShell detected an unclosed quote, backtick, or an apostrophe in a double-quoted string (e.g., `"What's the weather"`).
* **Escape:** Press **`Ctrl + C`** to cancel and return to standard prompt.
* **Safe JSON Posting:**
  ```powershell
  curl.exe -X POST http://localhost:3001/generate -H "Content-Type: application/json" -d '{\"prompt\": \"What is the weather?\", \"thread_id\": \"42\"}'
  ```

---
*Maintained continuously as the project ground truth.*
