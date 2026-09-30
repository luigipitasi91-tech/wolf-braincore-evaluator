---
doc: spec
status: approved
---
# WOLF BrainCore Evaluator — Technical Spec

## How This Works, In Plain Language
The project is a zero-dependency browser application plus a tiny Node static server. A planner creates baseline and BrainCore interpretations from the same request. A deterministic evaluator scores both with fixed rules, applies critical blockers, and produces finality. The browser hashes the evidence payload into a SHA-256 receipt.

A fixed benchmark invokes exactly the same planner and evaluator across four cases.

## The Core Journey Through the System
User request → `app.js` validation → `braincore.mjs` baseline + candidate → `evaluator.mjs` five metrics + critical-gap guards → `PROMOTE/HOLD/REJECT` → receipt hash.

Optional benchmark:
`benchmark.mjs` fixed cases → same planner/evaluator → aggregate finalities.

## Stack
- **Node.js 20+** — static server and tests.
- **Modern browser JavaScript / ES modules** — no framework or build step.
- **Web Crypto API** — SHA-256 receipt hashing.
- **Node test runner** — deterministic regression tests.
- **Render static hosting** — public judge-accessible demo.

No API key is required.

## Where It Runs
Public demo: https://wolf-braincore-evaluator.onrender.com

Canonical preloaded demo:
https://wolf-braincore-evaluator.onrender.com/?demo=1

Local:
```bash
npm start
npm test
```

## Look and Feel
The landing state is deliberately extreme-minimal: wolf emblem + request bar + W submit control. Results use compact evidence panels and restrained status color.

## Components

### Minimal Landing
`index.html` contains the WOLF emblem, request form and W submit button. The emblem is embedded as an optimized WebP data URI to keep the PoC self-contained.

### BrainCore Planner
`src/braincore.mjs` extracts visible constraints and creates baseline/candidate plan objects.

### WOLF Evaluator
`src/evaluator.mjs` calculates five deterministic metrics, total score, critical blockers, and finality.

A request under six words receives `CRITICAL_INPUT_UNDERSPECIFIED`, preventing automatic promotion even if structural scores look strong.

### Fixed Benchmark
`src/benchmark.mjs` defines four cases and runs all of them through the exact same planner/evaluator.

### UI / Receipt
`src/app.js` controls landing-to-results transition, renders evidence, invokes benchmark, and generates SHA-256 receipts.

## Data Model
```text
EvaluationRun
  request
  baseline: Plan
  candidate: Plan
  baselineEvaluation
  candidateEvaluation
  finality: PROMOTE | HOLD | REJECT
  reasons[]
  receiptHash

BenchmarkCase
  id
  title
  request
  baselineScore
  candidateScore
  delta
  finality
  blockers[]
```

## File Structure
```text
wolf-braincore-evaluator/
├── index.html
├── package.json
├── server.mjs
├── src/
│   ├── app.js
│   ├── benchmark.mjs
│   ├── braincore.mjs
│   ├── evaluator.mjs
│   └── styles.css
├── tests/
│   ├── benchmark.test.mjs
│   ├── evaluator.test.mjs
│   └── planner.test.mjs
├── devpost/
│   ├── scope.md
│   ├── prd.md
│   ├── spec.md
│   ├── checklist.md
│   ├── demo-plan.md
│   └── app-map.html
├── README.md
└── LICENSE
```

## External Evaluation Principles Applied
The architecture intentionally follows public eval guidance:
- task-specific evaluation instead of generic “vibe” scoring;
- fixed tasks/success criteria;
- automated deterministic scoring where possible;
- pass/fail gates alongside numeric scores;
- multiple cases to expose regressions.

References:
- https://developers.openai.com/api/docs/guides/evaluation-best-practices
- https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents

These references informed design choices; they do not imply endorsement.

## Important Failure Modes
- Empty input → no evaluation.
- Severely under-specified input → critical blocker / no auto-promotion.
- Longer text without better evidence → no automatic score advantage.
- Missing constraint/verification evidence → critical gaps.
- Benchmark regression → automated test failure.

## Simplifications
- Deterministic heuristics instead of real LLM calls.
- Four fixed benchmark cases rather than a large dataset.
- Single in-memory run rather than persistence.
- Three finality states rather than a broad taxonomy.

## Decision
WOLF remains independent from BrainCore so the component being changed does not grade itself.

No unresolved issue blocks shipment.
