---
doc: spec
status: approved
---
# WOLF BrainCore Evaluator — Technical Spec

## Architecture
The project is a zero-dependency browser application plus a tiny Node static server.

```text
Request
  → Request Integrity Gate
  → Domain Pack detection
  → Baseline + BrainCore candidate
  → Same deterministic WOLF rubric
  → Critical blockers
  → PROMOTE / HOLD / REJECT
  → SHA-256 receipt
```

Optional paths:
- fixed 8-case core benchmark;
- 10-case finance transfer benchmark;
- 6-case browser-agent transfer benchmark;
- external structured candidate normalization.

## Stack
- Node.js 20+ for local serving/tests.
- Browser ES modules.
- Web Crypto SHA-256.
- Node test runner.
- Render static hosting.
- No runtime API key.

Public demo:
https://wolf-braincore-evaluator.onrender.com

Judge-ready:
https://wolf-braincore-evaluator.onrender.com/?demo=1

## Components

### `src/request-integrity.mjs`
Independent semantic gate. Detects:
- underspecification using action/artifact/condition signals rather than raw length;
- action contradiction;
- interaction contradiction;
- budget contradiction;
- explicit constraint override;
- evaluator-gaming language.

Produces status, specificity score, contradictions, blockers and promotability.

### `src/domain-packs.mjs`
Provider-neutral domain contracts:
- Finance Evidence Pack;
- Browser Runtime Contract.

It adds constraints, unknowns and verification requirements to the candidate plan when the request matches a domain.

### `src/braincore.mjs`
Creates baseline and BrainCore candidate. BrainCore combines:
- literal request signals;
- Request Integrity evidence;
- relevant Domain Packs;
- definition of done;
- execution/verification steps.

### `src/evaluator.mjs`
Calculates the five common metrics and merges independent Request Integrity blockers into finality.

A candidate can score above the promotion threshold and still be held when a critical blocker remains.

### `src/benchmark.mjs`
Runs 8 balanced/adversarial fixed cases with explicit expected finalities.

### `src/domain-benchmarks.mjs`
Runs:
- 10 finance transfer cases;
- 6 browser-agent transfer cases.

The transfer benchmarks check evidence-contract coverage rather than financial performance or browser task success.

### `src/external-candidate.mjs`
Normalizes structured external candidate plans into the WOLF schema and evaluates them against the same baseline/rubric/blockers.

### `src/app.js`
Controls minimal landing, results rendering, Request Integrity evidence, benchmark view and SHA-256 receipt.

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
  domainPacks?

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

ExternalCandidateEvaluation
  source
  request
  candidate: Plan
  comparison
  contractVersion
```

## File Structure
```text
src/
  app.js
  benchmark.mjs
  braincore.mjs
  domain-benchmarks.mjs
  domain-packs.mjs
  evaluator.mjs
  external-candidate.mjs
  request-integrity.mjs
  styles.css

tests/
  benchmark.test.mjs
  domain-packs.test.mjs
  evaluator.test.mjs
  external-candidate.test.mjs
  planner.test.mjs
  request-integrity.test.mjs

research/
  global-browser-agent-research.md
  cross-system-audit.md
```

## Regression Evidence
Current suite target: **52 passing tests**.

Important known failures converted into tests:
- short specific request falsely held;
- long vague request falsely promoted;
- contradictory action request falsely promoted;
- budget override / evaluator-gaming request falsely promoted.

## Research Basis
Public evaluation guidance:
- OpenAI evaluation best practices;
- Anthropic agent eval guidance.

Global browser-agent scan:
- Canada: Browse AI;
- Australia: Relevance AI;
- Europe: Browser Use / Notte;
- Asia: Tencent BrowserSkill / NEC cotomi Agent / ego;
- infrastructure cross-check: TinyFish / Browserbase / Steel.

These sources inform architecture only; WOLF has no runtime dependency on them.

## Important Failure Modes
- empty input → no evaluation;
- semantic vagueness → HOLD;
- explicit contradiction → HOLD;
- evaluator gaming → HOLD;
- missing verification/constraint evidence → critical gap;
- benchmark expectation regression → test failure;
- external plan missing required goal → fail closed.

## Simplifications
- deterministic heuristics instead of live LLM calls;
- fixed small benchmark suites rather than large datasets;
- no persistence;\n- extra WOLF research/market experiments are intentionally excluded from the competition judge path;
- no calibrated scientific claim for metric weights.

## Decision
WOLF remains independent from the candidate generator. The external-candidate contract makes that separation explicit.

No unresolved issue blocks shipment.
