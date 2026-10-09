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
- [x] Judge-focused landing: WOLF identity + plain-English product question + request bar + W.
- [x] Fixed eight-case balanced/adversarial benchmark added.
- [x] Severely under-specified input fails closed and cannot auto-promote.
- [x] Automated benchmark regression tests added.
- [x] Request Integrity Gate detects long-vague input, explicit contradictions, and evaluator-gaming language.
- [x] Short but specific requests are no longer blocked by word count alone.
- [x] Human-first result shown before raw evaluator scores.
- [x] Under-specified input routes to clarification/discovery instead of foregrounding misleading scores.
- [x] Brave discovery secret boundary is server-side only; evaluator has no Brave dependency.
- [x] Openverse visuals retain source + license links and are not evaluator evidence.
- [x] Finance Evidence Pack: 10 transformed analysis families from user-provided screenshots.
- [x] Browser Runtime Contract: 10 provider-neutral requirements informed by Canada / Australia / Europe / Asia research.
- [x] Six browser-agent transfer cases pass the runtime contract.
- [x] Ten finance transfer cases pass the evidence contract.
- [x] External Candidate Contract added for normalized Na0mi / GPT / other-agent outputs.

## Hands-on checkpoints
- [x] Early usable behavior explored.
- [x] Original mobile layout tested by learner.
- [x] Competition redesign explicitly requested by learner.
- [x] Final judge-focused change-gate flow mechanically verified end-to-end.

## Final verification
GitHub CI: PASS.

Latest GitHub Actions verification (2026-10-09): **68/68 PASS, 0 FAIL** (run [37932007869](https://github.com/luigipitasi91-tech/wolf-braincore-evaluator/actions/runs/37932007869)). Any older 82-test figure was a target, not a measured result.

Public live verification:
- Landing explains the change-gate problem, offers one request bar, W action and three deterministic demo scenarios.
- Canonical request: Baseline **50/100** → BrainCore **94/100** → **PROMOTE**.
- Five metrics present.
- SHA-256 receipt present.
- Fixed benchmark present.
- Under-specified benchmark case: **38 → 88 → HOLD**.
- Benchmark summary: **8 cases / 4 PROMOTE / 4 HOLD / 0 REJECT**.

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
- [x] Capture authentic 90.24-second judge-focused MP4 with English captions (GitHub Actions [run 37931654553](https://github.com/luigipitasi91-tech/wolf-braincore-evaluator/actions/runs/37931654553); video artifact [11617140759](https://github.com/luigipitasi91-tech/wolf-braincore-evaluator/actions/runs/37931654553/artifacts/11617140759), expires 2026-10-30).
- [ ] Review captioned MP4 and upload it publicly to YouTube or Vimeo (not proven complete).
- [ ] Configure optional Brave Search API key on the discovery service (not required for core judging).
- [x] Official judging criteria reviewed and build aligned to Design / Impact / Innovation / Presentation.
- [x] Public agent-eval guidance reviewed and applied through fixed criteria, multi-case regression evidence and fail-closed behavior.
- [ ] Devpost final submission — requires authenticated learner account, learner-authored Skill Pack usage answer, age-of-majority confirmation, public repository in 'Try it out', and public video URL. Do not claim submitted without confirmation.

## Revisions
- Fixed early mobile `hidden` CSS bug.
- Replaced the ambiguous ultra-minimal entry point with a judge-focused WOLF change-gate product shell.
- Added fixed eight-case benchmark to reduce cherry-picked-demo risk.
- Replaced raw word-count underspecification with semantic Request Integrity.
- Added `CRITICAL_REQUEST_CONFLICT` and `CRITICAL_EVAL_GAMING`.
- Added provider-neutral Browser Runtime Contract and Finance Evidence Pack.
- Added benchmark tests and reran CI.
- Updated scope / PRD / spec / demo plan to match the shipped build.
