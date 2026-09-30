---
doc: checklist
status: approved
---
# Build Checklist

Build mode: fast

## Core slices
- [x] Baseline and BrainCore receive the same request.
- [x] WOLF scores both with one fixed five-dimension rubric.
- [x] Finality is deterministic: PROMOTE / HOLD / REJECT.
- [x] SHA-256 receipt records evaluated evidence.
- [x] Responsive public demo is live.
- [x] Minimal landing: wolf emblem + request bar + W only.
- [x] Fixed eight-case balanced/adversarial benchmark added.
- [x] Severely under-specified input fails closed and cannot auto-promote.
- [x] Automated benchmark regression tests added.

## Hands-on checkpoints
- [x] Early usable behavior explored.
- [x] Original mobile layout tested by learner.
- [x] Competition redesign explicitly requested by learner.
- [x] Final redesigned live flow mechanically verified end-to-end.

## Final verification
GitHub CI: PASS.

Automated tests: **15/15 PASS**.

Public live verification:
- Landing contains only centered wolf emblem + request bar + W.
- Canonical request: Baseline **49/100** → BrainCore **94/100** → **PROMOTE**.
- Five metrics present.
- SHA-256 receipt present.
- Fixed benchmark present.
- Under-specified benchmark case: **38 → 88 → HOLD**.
- Benchmark summary: **4 cases / 3 PROMOTE / 1 HOLD / 0 REJECT**.

## Code tour
Primary path:
`src/braincore.mjs` → `src/evaluator.mjs` → `src/app.js`

Regression path:
`src/benchmark.mjs` → same BrainCore/evaluator → benchmark evidence UI.

## Competition delivery
- [x] Public repository.
- [x] MIT license.
- [x] Devpost Learn planning docs.
- [x] Public live demo.
- [x] Existing public YouTube demo: https://www.youtube.com/watch?v=PMyaJutqnRE
- [x] Final redesigned demo recording plan.
- [x] Official judging criteria reviewed and build aligned to Design / Impact / Innovation / Presentation.
- [x] Public agent-eval guidance reviewed and applied through fixed criteria, multi-case regression evidence and fail-closed behavior.
- [ ] Devpost final submission — requires the learner's authenticated account and learner-authored submission answers.

## Revisions
- Fixed early mobile `hidden` CSS bug.
- Replaced information-heavy landing page with ultra-minimal WOLF entry point.
- Added fixed eight-case benchmark to reduce cherry-picked-demo risk.
- Added `CRITICAL_INPUT_UNDERSPECIFIED`.
- Added benchmark tests and reran CI.
- Updated scope / PRD / spec / demo plan to match the shipped build.
