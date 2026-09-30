---
doc: prd
status: approved
---
# WOLF BrainCore Evaluator — Product Requirements

A minimalist cognitive evaluation lab for AI-agent builders who want evidence that a planning change improves ambiguous requests.

## The Core Journey
1. The user lands on a screen containing only a centered WOLF emblem and one request bar.
2. They enter a request and submit with the **W** button.
3. The app produces a deliberately thin baseline interpretation and a structured BrainCore interpretation from the same request.
4. WOLF evaluates both with the same five-dimension rubric.
5. The user sees score deltas and evidence behind each metric.
6. WOLF issues `PROMOTE`, `HOLD`, or `REJECT`.
7. A SHA-256 receipt records request hash, scores, finality, reasons, and timestamp.
8. The user may open a fixed eight-case benchmark to check that the planner/rubric does not only succeed on one hand-picked example.

Success is not “the candidate generated more text.” Success is that the evaluator can explain why a candidate should or should not be promoted.

## Screens and Layout
Two responsive states:

### Landing
- centered wolf emblem;
- one search/request bar;
- circular **W** submit control;
- no explanatory cards, dashboard chrome, or long copy.

### Evidence view
- minimal top bar for New / WOLF / Benchmark;
- baseline and BrainCore plan cards;
- five-dimension score comparison;
- finality + receipt;
- benchmark panel only when explicitly opened.

## Look and Feel
Near-black background, restrained blue accent, generous negative space, strong visual hierarchy, and no unnecessary dashboard decoration. Status colors are reserved for evidence/finality.

## Features and Behavior

### W request entry
- Single-line request input.
- Enter or W submits.
- Empty input produces a small inline validation message.
- `?demo=1` preloads the canonical demonstration request without changing normal first-use minimalism.

### Baseline planner
- Follows the literal request with minimal structure.
- Does not invent hidden constraints.
- Exists as a comparison control, not as a caricature.

### BrainCore planner
- Produces Goal, Constraints, Assumptions, Unknowns, Definition of Done, Plan, and Verification.
- Detects budget, autonomy, revenue, consequential-action, and verification signals.
- Missing consequential details remain unknown instead of being fabricated.

### WOLF evaluator
- Scores both plans from 0–100 on:
  - ambiguity resolved;
  - assumptions exposed;
  - constraints retained;
  - definition of done;
  - verification readiness.
- Uses the same rules for baseline and candidate.
- Applies score, delta, and critical-gap gates.
- Treats severely under-specified input as a critical blocker rather than auto-promoting it.

### Fixed benchmark
- Eight deterministic cases:
  - bounded autonomy;
  - consequential publish;
  - under-specified intent;
  - verification-first build.
- Uses the same planner and evaluator as the live request.
- Must contain at least one non-PROMOTE outcome to demonstrate fail-closed behavior.

### Finality and receipt
- `PROMOTE`: thresholds clear and no critical gap remains.
- `HOLD`: improvement exists but evidence or specification is insufficient.
- `REJECT`: candidate does not provide sufficient measurable improvement.
- Receipt includes evidence and SHA-256 hash.

## States and Boundaries
- **First use** — only emblem + request bar.
- **Valid evaluation** — evidence view becomes visible.
- **Empty request** — no fabricated result.
- **Under-specified request** — may score well structurally but cannot auto-promote when a critical input blocker exists.
- **No persistence** — deliberate for this PoC.
- **No network execution** — evaluation stays local/browser-side.

## Product Decisions
- WOLF is the evaluator, not the cognitive engine being evaluated.
- Deterministic transforms make the PoC reproducible and secretless.
- Fixed benchmark reduces cherry-picked-demo risk.
- Minimal entry improves coherence and presentation while keeping technical detail available after interaction.
- V12 contributes patterns, not source code.

## What We're Building
A complete end-to-end PoC plus automated tests, public repository, live deployment, planning docs, and a short judge demo.

## Deferred From the POC
Real model adapters, benchmark persistence, multi-trial statistics, human-labelled calibration, direct Na0mi integration, and multi-user collaboration.

## Non-Goals
- Claiming objective/general intelligence.
- Executing consequential real-world actions.
- Replacing human judgment.
- Ranking commercial foundation models.
- Redistributing the Devpost Learn curriculum.

## Open Questions
None block shipment.
