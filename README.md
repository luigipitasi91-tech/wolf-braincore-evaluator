# WOLF BrainCore Evaluator

**Candidate output ≠ cognitive improvement ≠ verified promotion.**

WOLF is an independent, deterministic test bench for AI-agent planning changes. It compares a baseline and BrainCore candidate on the same request, using the same rubric, before issuing `PROMOTE`, `HOLD`, or `REJECT`.

Built as a new project for **Build With AI: Basics**. No Na0mi, Xi0, XioARa, or previous WOLF source code is reused.

## Problem, audience, impact

AI-agent builders constantly change prompts, skills and planning logic. A common failure mode is deciding a new version is better because one answer “looks smarter.”

WOLF replaces that vibe-based decision with explicit evidence: fixed criteria, critical blockers, multiple benchmark cases and a verifiable receipt.

## Live demo

Minimal landing:
<https://wolf-braincore-evaluator.onrender.com>

Judge-ready preloaded demo:
<https://wolf-braincore-evaluator.onrender.com/?demo=1>

No login or API key required.

## What it demonstrates

1. Same request → baseline + BrainCore candidate.
2. Same five-dimension rubric for both.
3. Score + delta + critical-gap promotion gates.
4. `PROMOTE`, `HOLD`, or `REJECT`.
5. SHA-256 evidence receipt.
6. Fixed four-case benchmark to reduce cherry-picked-demo risk.
7. Fail-closed behavior: severely under-specified input cannot auto-promote.

Canonical demo result:
**Baseline 49/100 → BrainCore 94/100 → PROMOTE**

Benchmark:
- Bounded autonomy → PROMOTE
- Consequential publish → PROMOTE
- Under-specified intent → HOLD
- Verification-first build → PROMOTE

## Why deterministic?

The PoC deliberately uses deterministic heuristics instead of an external LLM. That makes judging reproducible, free, secretless and independent of provider availability. A future adapter can evaluate real model/skill outputs while preserving the WOLF contract.

## Evaluation method

WOLF applies public eval-design principles: task-specific criteria, fixed test cases, deterministic graders where possible, numeric scores plus hard gates, and regression testing.

References:
- OpenAI evaluation best practices: <https://developers.openai.com/api/docs/guides/evaluation-best-practices>
- Anthropic agent eval guidance: <https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents>

These sources informed the method; they do not imply endorsement.

## Run and test

Node.js 20+:

```bash
npm start
npm test
```

## Hackathon planning artifacts

- `devpost/scope.md`
- `devpost/prd.md`
- `devpost/spec.md`
- `devpost/checklist.md`
- `devpost/demo-plan.md`
- `devpost/app-map.html`

Planning follows the official Devpost Learn Skill Pack:
<https://github.com/challengepost/learn-ai-basics>

`devpost/learner-profile.md` remains ignored because it contains personal learning context.

## Competition video

Current public YouTube demo:
<https://www.youtube.com/watch?v=PMyaJutqnRE>

The final recording plan for the redesigned minimal UI is in `devpost/demo-plan.md`.

## New-project disclosure

- Implementation began from an empty folder during the submission period.
- Earlier Na0mi/Xi0/WOLF work influenced the idea of independent verification/finality only.
- No earlier source files were copied.
- The Skill Pack informed process; this repo does not redistribute the curriculum.

## License

MIT.
