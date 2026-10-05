---
doc: spec
status: approved
---
# WOLF — AI Change Gate — Technical Spec

## Architecture
The competition judge path remains a deterministic browser application. A separate optional discovery service improves clarification UX for vague queries without becoming evaluator evidence.

```text
Request
  → Request Integrity Gate
      ├─ NEEDS_CLARIFICATION → optional Discovery UI → user rewrites request
      └─ evaluable
          → shared explicit constraints
          → Baseline + BrainCore candidate
          → Same deterministic WOLF rubric
          → Critical blockers
          → PROMOTE / HOLD / REJECT
          → SHA-256 receipt
```

Optional competition path:
- fixed eight-case core benchmark.

## Stack
- Node.js 20+ for local serving/tests.
- Browser ES modules.
- Web Crypto SHA-256.
- Node test runner.
- Render static hosting for the public judge UI.
- Optional Render Node service for discovery.
- No runtime API key required by the evaluator.
- Optional `BRAVE_API_KEY` exists server-side only for Brave web discovery.

Public demo:
https://wolf-braincore-evaluator.onrender.com

Judge-ready:
https://wolf-braincore-evaluator.onrender.com/?demo=1

## Judge-Path Components

### `src/request-integrity.mjs`
Independent semantic gate. Detects:
- underspecification using action/artifact/condition signals rather than raw length;
- action contradiction;
- interaction contradiction;
- budget contradiction;
- explicit constraint override;
- evaluator-gaming language.

Produces status, specificity score, contradictions, blockers and promotability.

### `src/braincore.mjs`
Creates baseline and BrainCore candidate.

The candidate combines:
- literal request signals;
- Request Integrity evidence;
- preserved constraints;
- explicit unknowns;
- definition of done;
- execution and verification steps.

### `src/evaluator.mjs`
Calculates the five common metrics and merges independent Request Integrity blockers into finality.

A candidate can score above the promotion threshold and still be held when a critical blocker remains.

### `src/benchmark.mjs`
Runs eight balanced/adversarial fixed cases with explicit expected finalities.

### `src/app.js`
Controls the minimal landing, human-first results, Request Integrity routing, evidence disclosure, benchmark view and SHA-256 receipt.

### `src/discovery.mjs`
Optional browser client for vague-input clarification. It talks only to the WOLF discovery service and contains no provider secret.

### `server.mjs`
Serves the app locally and provides the optional `/api/discover` boundary when deployed as the discovery service. Brave credentials are read only from `process.env.BRAVE_API_KEY`. Openverse results include source and license metadata.

Discovery outputs are not passed into `src/evaluator.mjs`.

## Non-Judge Extensions
The repository may also contain domain research, transfer-pack code or external-candidate experiments.

Those modules are deliberately excluded from the competition UI and are not part of the competition acceptance criteria.

## Data Objects
```text
Plan
  label
  goal
  constraints[]
  assumptions[]
  unknowns[]
  definitionOfDone[]
  steps[]
  verification[]
  requestIntegrity?

RequestIntegrity
  status
  specificity
  features
  contradictions[]
  gamingSignals[]
  blockers[]
  promotable

Evaluation
  metrics
  total
  gaps[]
  requestIntegrity
  finality
```

## Core File Structure
```text
src/
  app.js
  discovery.mjs
  benchmark.mjs
  braincore.mjs
  evaluator.mjs
  request-integrity.mjs
  styles.css

server.mjs

tests/
  benchmark.test.mjs
  discovery.test.mjs
  evaluator.test.mjs
  planner.test.mjs
  request-integrity.test.mjs
```

Additional non-judge files may exist outside this core list.

## Regression Evidence
Current suite target: **59 passing tests**.

Important known failures converted into tests:
- short specific request falsely held;
- long vague request falsely promoted;
- contradictory action request falsely promoted;
- budget override / evaluator-gaming request falsely promoted;
- competition judge path accidentally reintroducing unrelated WOLF experiences.

## Important Failure Modes
- empty input → no evaluation;
- semantic vagueness → deterministic HOLD internally, presented to the user as a clarification/discovery state before technical evidence;
- explicit contradiction → HOLD;
- evaluator gaming → HOLD;
- missing verification/constraint evidence → critical gap;
- benchmark expectation regression → test failure.

## Simplifications
- deterministic heuristics instead of live LLM calls;
- fixed small benchmark rather than a large dataset;
- no persistence;
- optional discovery network calls are isolated from evaluation;
- no external model dependency in the judge path;
- no calibrated scientific claim for metric weights.

## Decision
WOLF remains a standalone competition project.

Na0mi is not a runtime dependency, judge-path dependency, or required component of this submission.

No unresolved issue blocks shipment.
