---
doc: spec
status: approved
---
# WOLF BrainCore Evaluator — Technical Spec

## How This Works, In Plain Language
The project is a static browser application plus a tiny local Node server. A planner module creates two structured interpretations from the same request. An evaluator module measures both plans with fixed rules. A finality function compares the scores and guards against critical gaps. The browser renders the comparison and uses the Web Crypto API to create a SHA-256 receipt.

This shape is deliberately small: the competition needs a reliable proof of concept, not a production AI platform.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

The user enters a request → `app.js` validates it → `braincore.mjs` creates the baseline and candidate plans → `evaluator.mjs` scores both → finality logic returns `PROMOTE`, `HOLD`, or `REJECT` → `app.js` renders plans, metric deltas, reasons, and a SHA-256 receipt → the user can change the request and run again.

## Stack
- **Node.js 20+** — local static server and automated tests. https://nodejs.org/
- **Modern browser JavaScript (ES modules)** — no framework or build step; simplest reliable path for a small PoC.
- **Web Crypto API** — browser-native SHA-256 receipt hashing. https://developer.mozilla.org/docs/Web/API/SubtleCrypto/digest
- **Node test runner** — zero-dependency automated tests. https://nodejs.org/api/test.html

Tradeoff accepted: deterministic heuristics are less flexible than an LLM, but they make the core evaluator reproducible, free, secretless, and judge-friendly.

## Where It Runs and How Someone Tries It
Runtime: desktop/mobile browser with Node.js used only to serve local files.

```bash
npm start
```

Then open `http://localhost:4173`.

Tests:

```bash
npm test
```

No API keys are required. A public repository and a <3 minute public YouTube/Vimeo demo are still required by the hackathon; deployment is optional.

## Look and Feel
PRD ref: `prd.md > Look and Feel`.

Dark neutral background, bordered panels, crisp monospace accents for hashes/finality, compact sans-serif body text, moderate information density. Status colors are restricted to positive/hold/reject indicators. Motion is minimal and functional.

## Components

### Request Workbench
Textarea, sample reset, Run Evaluation action, and validation message.
PRD ref: `prd.md > Request workbench`.

### BrainCore Planner
`src/braincore.mjs` extracts visible constraints and produces baseline/candidate structured plans. Unknown values remain explicit unknowns.
PRD ref: `prd.md > Baseline planner`, `prd.md > BrainCore planner`.

### WOLF Evaluator
`src/evaluator.mjs` scores both plans using the same rubric and returns metric evidence plus finality.
PRD ref: `prd.md > WOLF evaluator`.

### Receipt Renderer
`src/app.js` serializes the evaluated request + evidence, hashes it using SHA-256, and displays the receipt.
PRD ref: `prd.md > Finality and receipt`.

## Data Model
All state lives in browser memory.

```text
EvaluationRun
  request: string
  baseline: Plan
  candidate: Plan
  baselineEvaluation: Evaluation
  candidateEvaluation: Evaluation
  finality: PROMOTE | HOLD | REJECT
  reasons: string[]
  receiptHash: string

Plan
  goal: string
  constraints: string[]
  assumptions: string[]
  unknowns: string[]
  definitionOfDone: string[]
  steps: string[]
  verification: string[]
```

Reloading intentionally clears the run.

## File Structure
```text
wolf-braincore-evaluator/
├── index.html
├── package.json
├── server.mjs
├── src/
│   ├── app.js
│   ├── braincore.mjs
│   ├── evaluator.mjs
│   └── styles.css
├── tests/
│   └── evaluator.test.mjs
├── devpost/
│   ├── scope.md
│   ├── prd.md
│   ├── spec.md
│   ├── checklist.md
│   └── app-map.html
├── README.md
├── LICENSE
└── .gitignore
```

## External Services and Dependencies
None at runtime. No API calls, no database, no third-party SDK, no credentials, and no usage cost.

Devpost Learn Skill Pack is the planning workflow source: https://github.com/challengepost/learn-ai-basics . Its files are not redistributed in this repository.

## Important Failure Modes
- **Empty request** → evaluation is blocked with an inline message rather than fabricating a plan.
- **Overly generic request** → BrainCore records unknowns; WOLF may return `HOLD` instead of pretending the plan is promotion-ready.
- **A candidate gets longer without becoming safer/testable** → rubric scores explicit fields/evidence, not word count.

## What Was Simplified and Why
- **Deterministic planning heuristics** instead of real LLM calls — proves the evaluation loop without keys or non-reproducible responses.
- **Single run in memory** instead of a benchmark database — enough to demonstrate the kernel.
- **Three finality states** instead of a large taxonomy — immediately understandable in a short demo.

## Decisions and Open Issues
The key uncertainty was whether WOLF should be the BrainCore itself or the evaluator. It is the evaluator, because an independent scorer makes regressions visible and avoids the system grading its own cognitive change.

The exact rubric is intentionally transparent and inspectable; a future version should calibrate weights against human-labelled examples rather than treating current weights as scientifically validated.

No unresolved issue blocks the build.
