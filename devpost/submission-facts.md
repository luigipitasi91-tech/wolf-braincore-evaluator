# Submission facts — learner reference only

This file is intentionally factual and not drafted Devpost prose.

## Final project facts
- Project: `WOLF BrainCore Evaluator`.
- New implementation began from an empty folder during the Build With AI: Basics submission period.
- No Na0mi, Xi0, XioARa, or earlier WOLF source code was reused.
- Earlier work influenced the independent-verification/finality idea only.
- Final public landing: centered wolf emblem + one request bar + W submit action.
- Core flow: request → baseline + BrainCore candidate → five fixed metrics → critical-gap gates → PROMOTE/HOLD/REJECT → SHA-256 receipt.
- Fixed four-case benchmark added to reduce cherry-picked-demo risk.
- Severely under-specified input receives `CRITICAL_INPUT_UNDERSPECIFIED` and cannot auto-promote.
- Automated verification: `npm test`, **11 passing tests**.
- GitHub pull-request CI for the final code upgrade: PASS.
- Public live verification:
  - canonical request: 49/100 baseline → 94/100 BrainCore → PROMOTE;
  - benchmark: 4 cases / 3 PROMOTE / 1 HOLD;
  - under-specified case: 38 → 88 → HOLD.
- Runtime: browser + Node.js 20+ local static server.
- External services/API keys required by the evaluator: none.
- Open-source license: MIT.
- Required planning docs present and aligned with final build: `scope.md`, `prd.md`, `spec.md`.
- Public repository: https://github.com/luigipitasi91-tech/wolf-braincore-evaluator
- Public live demo: https://wolf-braincore-evaluator.onrender.com
- Judge-ready preloaded demo: https://wolf-braincore-evaluator.onrender.com/?demo=1
- Existing public YouTube demo: https://www.youtube.com/watch?v=PMyaJutqnRE
- Final redesigned 62-second competition video has been generated locally for upload/replacement.
- Official submission deadline recorded from contest rules: October 26, 2026 at 5:00 PM EDT.

## Stage-one evidence
- New project.
- Devpost Learn Skill Pack planning artifacts.
- Public repository.
- Working end-to-end PoC.

## Stage-two evidence
- Design: coherent minimal entry + evidence-first results view.
- Potential Impact: specific problem and audience — AI-agent builders validating prompt/skill/planner changes.
- Innovation: independent cognitive promotion gate rather than self-grading.
- Presentation: one-action demo, deterministic evidence, fixed benchmark, short video path.

## External research applied
- OpenAI evaluation best practices: task-specific evals, automated scoring where possible, pass/fail thresholds, avoid vibe-based evaluation.
- Anthropic agent eval guidance: evaluation suites, deterministic graders when possible, regression protection, outcome/evidence emphasis.
- Devpost demo guidance: set the problem quickly, show the product working, keep the demo concise.

## Learner-authored Devpost fields
Per the Devpost Learn shipping skill, the learner writes their own project name/short description/submission answers and exit-survey responses. The agent may verify facts and correct spelling/grammar but should not invent those learner responses.
