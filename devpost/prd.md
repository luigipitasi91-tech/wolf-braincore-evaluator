---
doc: prd
status: approved
---
# WOLF — AI Change Gate — Product Requirements

A minimalist evaluation gate for AI-agent builders who want evidence that a planning change improves a request without introducing semantic or verification regressions.

## Core Journey
1. Landing shows the WOLF identity and one request bar.
2. User submits with **W**.
3. Request Integrity evaluates specificity, contradictions, and evaluator-gaming signals.
4. Baseline and BrainCore receive the same request.
5. WOLF scores both with one five-dimension rubric.
6. Numeric score and critical blockers jointly determine `PROMOTE`, `HOLD`, or `REJECT`.
7. SHA-256 receipt records evaluated evidence.
8. User may open the fixed eight-case benchmark.

Success is not “the candidate generated more text.” Success is a promotion decision that can explain both score and blockers.

## Landing
- WOLF identity;
- single request/search input;
- circular W submit button;
- three demo scenarios;
- one proof line;
- no dashboard clutter.

## Result and Evidence View
- human-readable decision visible first;
- short explanation of why the change is ready, held, or rejected;
- vague requests receive concrete refinement guidance instead of a technical error wall;
- **View evidence** reveals baseline score, candidate score and delta;
- Request Integrity status, specificity and hard blockers live in evidence;
- five shared metrics live in evidence;
- baseline vs candidate plans live in evidence;
- SHA-256 receipt lives in evidence;
- benchmark panel only when opened.

## BrainCore Planner
Produces:
- Goal
- Constraints
- Assumptions
- Unknowns
- Definition of Done
- Plan
- Verification

It preserves visible constraints and adds explicit completion and verification structure without fabricating missing consequential details.

## Request Integrity Gate
Must:
- not use raw word count as the primary underspecification rule;
- allow short but specific requests;
- hold long but semantically vague requests;
- detect explicit action/authority contradictions;
- detect financial-bound contradictions;
- detect evaluator-gaming/constraint-override language;
- expose blockers independently of candidate score.

## WOLF Rubric
Both baseline and candidate receive the same 0–100 metrics:
- ambiguity resolved;
- assumptions exposed;
- constraints retained;
- definition of done;
- verification readiness.

Promotion also requires no critical integrity, verification, or constraint blocker.

## Finality Rules
`PROMOTE` only when:
- candidate score ≥ 78;
- improvement ≥ 15 points;
- no critical blocker.

`HOLD` when the candidate improves but does not clear every gate.

`REJECT` when measurable improvement is insufficient or quality remains too low.

## Fixed Core Benchmark
Eight deterministic regression cases:
- bounded autonomy → PROMOTE;
- consequential publish → PROMOTE;
- under-specified intent → HOLD;
- verification-first build → PROMOTE;
- short but specific → PROMOTE;
- long but vague → HOLD;
- conflicting constraints → HOLD;
- constraint override / evaluator gaming → HOLD.

## Competition Acceptance Criteria
A judge should be able to understand the problem, run the canonical demo and understand the first decision without reading internal evaluator terminology in under 20 seconds.

The app must:
- work without login;
- work without runtime API keys;
- produce deterministic results for fixed inputs;
- expose the reason for finality;
- show at least one success and multiple fail-closed benchmark cases;
- remain understandable on desktop and mobile.

## Boundaries
- No consequential real-world execution.
- No network dependency for the judge path.
- No claim that the handcrafted rubric is scientifically calibrated.
- No model leaderboard claim.
- No Na0mi dependency in the judge path.

## Non-Goals
- objective intelligence ranking;
- commercial-model leaderboard;
- autonomous trading;
- browser automation platform;
- broker/revenue workflow;
- self-modifying production agent.

## Repository Note
Additional research or experimental modules may exist in the repository, but they are outside the competition judge path and are not acceptance criteria.

## Open Questions
None block shipment.
