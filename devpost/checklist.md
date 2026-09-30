---
doc: checklist
status: approved
---
# Build Checklist

Build mode: fast

## Slices

- [x] **1. Run one ambiguous request through baseline and BrainCore**
  Becomes usable: A local page accepts a request and displays two structured interpretations.
  Why now: Proves the full request-to-plan path immediately.
  PRD ref: `prd.md > The Core Journey` (steps 1-3)
  Spec ref: `spec.md > Request Workbench`, `spec.md > BrainCore Planner`
  Build: Create the zero-dependency app shell, planner module, request form, sample input, and side-by-side plan rendering.
  Verify (mechanical): Start the server, load the page, run the sample, and confirm both plans render; run planner tests.
  Learner check: Use the sample and confirm the BrainCore plan exposes constraints/unknowns rather than silently assuming them.
  Commit: `Build baseline and BrainCore comparison`

- [x] **2. Score both plans and issue WOLF finality**
  Becomes usable: The same run now shows five comparable metrics and `PROMOTE`, `HOLD`, or `REJECT`.
  Why now: This is the unique kernel and converts comparison into an evidence-based decision.
  PRD ref: `prd.md > WOLF evaluator`, `prd.md > Finality and receipt`
  Spec ref: `spec.md > WOLF Evaluator`
  Build: Implement transparent scoring, critical-gap guards, delta display, and finality reasons.
  Verify (mechanical): Automated tests cover promotion, hold, rejection, and score bounds.
  Learner check: Run both a detailed and a vague request; confirm finality and reasons are understandable.
  Commit: `Add WOLF scoring and finality`

- [x] **3. Produce a verifiable receipt and submission-ready experience**
  Becomes usable: Each evaluation has a SHA-256 receipt; the interface and repository are ready for a short judge demo.
  Why now: Completes the evidence loop and presentation requirement without expanding product scope.
  PRD ref: `prd.md > Finality and receipt`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Receipt Renderer`, `spec.md > Look and Feel`
  Build: Add receipt hashing, responsive styling, README, license, app map, and demo instructions.
  Verify (mechanical): Full tests pass; request changes produce a different receipt; repository scan contains no secrets.
  Learner check: Run the sample end to end and confirm it communicates the problem, comparison, and decision clearly enough for a <3 minute recording.
  Commit: `Finish verified evaluator experience`

## Hands-on Checkpoints
- [x] Early usable behavior explored — concept and core loop were explicitly approved before build.
- [x] Final kick-the-tires exploration completed mechanically on the public Render deployment; learner confirmation of readiness is still pending.

## Final Review
- [ ] Final review complete — learner must explicitly confirm the current mobile experience is ready to ship.

## Code Tour and App Map
- [ ] Learning activity complete — focused alternative: inspect how the same request becomes an evidence receipt
- [ ] Optional edit and transfer reflection addressed — not applicable until final user review
- [x] `devpost/app-map.html` generated from finished code and mechanically checked; learner walkthrough still pending

Activity and evidence: implementation complete; `npm test` passes 8/8. Public end-to-end check also passed on Render using the unchanged sample request: Baseline 49/100, BrainCore 94/100, finality PROMOTE, receipt SHA-256 d1e0d0bc06d1c7004891df4c7e684ddfd4e4720f004b35e2e95f1c2302de4730.
Route and stops: `src/braincore.mjs` → `src/evaluator.mjs` → `src/app.js`.
Edit outcome: mobile visibility/layout bug fixed before final review; results now remain hidden until evaluation runs.
Reflection: not yet requested.
Activity mode: focused alternative.

## Revisions
- Mobile results visibility fixed — CSS `.results { display:grid }` overrode the HTML `hidden` state; added `[hidden]{display:none!important}` and tightened responsive layout for phone widths.
