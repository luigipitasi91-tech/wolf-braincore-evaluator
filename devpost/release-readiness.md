# WOLF — Release Readiness

Date: 2026-10-05  
Target: Build With AI: Basics

This file is a factual release checklist. It is not a substitute for learner-authored Devpost submission answers.

## Stage One — pass/fail

- [x] New software implementation built during the submission period.
- [x] Devpost Learn Skill Pack used for planning.
- [x] Required planning artifacts present:
  - `devpost/scope.md`
  - `devpost/prd.md`
  - `devpost/spec.md`
- [x] Working end-to-end core: request → integrity → baseline/candidate → shared rubric → finality → evidence receipt.
- [x] Public GitHub repository.
- [x] MIT license.
- [x] Public deployed app.
- [x] No login required for judge path.
- [x] Deterministic evaluator requires no paid model/API key.

## Stage Two — judging evidence

### Design
- [x] One primary question and one request field.
- [x] Human-readable result before technical scoring.
- [x] Technical evidence available on demand.
- [x] Under-specified input uses a clarification state instead of foregrounding meaningless scores.
- [x] Responsive mobile/desktop CSS.
- [x] User-tested mobile layout.

### Potential Impact
- [x] Clear audience: AI-agent builders changing prompts, skills, planners or cognitive workflows.
- [x] Clear failure mode: vibe-based promotion can hide regressions.
- [x] Explicit promotion thresholds and fail-closed blockers.

### Innovation / Idea
- [x] Same-request baseline/candidate comparison.
- [x] Independent Request Integrity gate.
- [x] High score cannot override a critical blocker.
- [x] Fixed eight-case benchmark includes both promotion and refusal.
- [x] Optional Discovery is separated from evaluator evidence.

### Presentation
- [x] Judge-ready preloaded URL.
- [x] Final video script and recording plan.
- [ ] Record final judge-focused video.
- [ ] Upload final video publicly to YouTube or Vimeo.
- [ ] Put final public video URL into the Devpost submission.

## Verification

- [x] Standard GitHub CI restored.
- [x] Verified GitHub Actions result for the latest inspected main commit (October 5, 2026): 68 tests passed, 0 failed (run 37355763302). Do not infer judge-browser interaction from CI alone.
- [x] Fixed eight-case benchmark protected by tests.
- [x] Browser client keeps Brave credentials out of source/browser.
- [x] Discovery results cannot enter evaluator scoring.
- [x] Openverse visual cards include source and license links.
- [ ] Re-verify both Render services after merge to `main`.
- [x] Re-run live canonical demo after deployment — Chromium live browser pass 2026-10-09, run 37930745889.
- [x] Re-run live vague-input / clarification UI after deployment — Chromium verified; optional Discovery API response mocked, not a Brave-live claim.
- [x] Re-test mobile screenshot and tap after deployment — Chromium 390px viewport, no horizontal overflow; screenshots in run 37930745889 artifact.

## Optional Discovery

Backend:
- `https://wolf-discovery-api.onrender.com`

- [x] Separate Render Node service created.
- [x] Server-side `BRAVE_API_KEY` boundary implemented.
- [x] Openverse visual discovery implemented.
- [x] Rate limit, query length and CORS controls implemented.
- [ ] Create/activate Brave Search API account and key.
- [ ] Configure `BRAVE_API_KEY` on Render.
- [ ] Verify live Brave web results.

Brave is optional. If it is not configured, WOLF core still evaluates clear requests and the clarification screen falls back safely.

## Submission gates still requiring the learner

- [ ] Secure Devpost sign-in / contest registration confirmation.
- [ ] Learner-authored project name, short description and required submission fields reviewed in the actual form.
- [ ] Final public video URL.
- [ ] Final irreversible Devpost Submit action.

## Release decision

Code may ship when:
1. latest PR CI is green;
2. merge to `main` succeeds;
3. both Render services deploy successfully;
4. live deterministic judge path passes smoke tests.

Contest submission is **not complete** until the final public video and authenticated Devpost submission are complete.
