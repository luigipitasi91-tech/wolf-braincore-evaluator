# Submission facts — learner reference only

This file is intentionally factual and not drafted Devpost prose.

## Final project facts
- Project: `WOLF BrainCore Evaluator`.
- New implementation began from an empty folder during the Build With AI: Basics submission period.
- No Na0mi, Xi0, XioARa, or earlier WOLF source code was reused.
- Earlier work influenced the independent-verification/finality idea only.
- Final public landing: centered wolf emblem + one request bar + W submit action.
- Core flow: request → baseline + BrainCore candidate → five fixed metrics → critical-gap gates → PROMOTE/HOLD/REJECT → SHA-256 receipt.
- Fixed eight-case balanced/adversarial benchmark added to reduce cherry-picked-demo risk.
- Request Integrity Gate blocks semantic underspecification, explicit request conflicts, and evaluator-gaming language from auto-promotion.
- Short but specific requests are allowed; raw word count is no longer used as the deciding signal.
- Finance Evidence Pack: 10 transformed financial-analysis families derived from user-provided screenshots, without copying their prompt text.
- Browser Runtime Contract: 10 provider-neutral requirements informed by global browser-agent research across Canada, Australia, Europe, and Asia.
- External Candidate Contract allows structured Na0mi/GPT/other-agent outputs to be evaluated under the same WOLF rubric.
- Automated verification: `npm test`, **59 passing tests**.
- GitHub pull-request CI for the final code upgrade: PASS.
- Public live verification:
  - canonical request: 50/100 baseline → 94/100 BrainCore → PROMOTE;
  - benchmark: 8 cases / 4 PROMOTE / 4 HOLD;
  - under-specified case: 38 → 88 → HOLD.
- Runtime: browser + Node.js 20+ local server; Render static frontend plus optional Render Node discovery service.
- External services/API keys required by the evaluator: none.
- Optional clarification/discovery: Brave Search via server-side `BRAVE_API_KEY` when configured; Openverse visual context with source/license links.
- Discovery results do not feed evaluator scoring, benchmark decisions, or SHA-256 evaluation receipts.
- Open-source license: MIT.
- Required planning docs present and aligned with final build: `scope.md`, `prd.md`, `spec.md`.
- Public repository: https://github.com/luigipitasi91-tech/wolf-braincore-evaluator
- Public live demo: https://wolf-braincore-evaluator.onrender.com
- Judge-ready preloaded demo: https://wolf-braincore-evaluator.onrender.com/?demo=1
- Existing public YouTube demo: https://www.youtube.com/watch?v=PMyaJutqnRE
- Final redesigned competition video is still to be recorded and uploaded publicly; the existing public YouTube demo is not treated as proof that the final recording is complete.
- Official submission deadline recorded from contest rules: October 26, 2026 at 5:00 PM EDT.

## Stage-one evidence
- New project.
- Devpost Learn Skill Pack planning artifacts.
- Public repository.
- Working end-to-end PoC.

## Stage-two evidence
- Design: coherent minimal entry + human-first decision + evidence on demand + clarification state for vague input.
- Potential Impact: specific problem and audience — AI-agent builders validating prompt/skill/planner changes.
- Innovation: independent cognitive promotion gate rather than self-grading.
- Presentation: one-action demo, deterministic evidence, fixed benchmark, short video path.

## External research applied
- OpenAI evaluation best practices: task-specific evals, automated scoring where possible, pass/fail thresholds, avoid vibe-based evaluation.
- Anthropic agent eval guidance: evaluation suites, deterministic graders when possible, regression protection, outcome/evidence emphasis.
- Canada: Browse AI — monitoring, task/run records, API/webhook patterns.
- Australia: Relevance AI — composable typed browser tools and provider separation.
- Europe: Browser Use / Notte — secret boundaries, domain controls, persistence, replay/observability.
- Asia: Tencent BrowserSkill / NEC cotomi Agent / ego — logged-in browser state, human demonstration/handoff, semantic snapshots, isolated workspaces.
- Devpost demo guidance: set the problem quickly, show the product working, keep the demo concise.

## Learner-authored Devpost fields
Per the Devpost Learn shipping skill, the learner writes their own project name/short description/submission answers and exit-survey responses. The agent may verify facts and correct spelling/grammar but should not invent those learner responses.
