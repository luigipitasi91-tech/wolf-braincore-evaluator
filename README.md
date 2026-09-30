# WOLF BrainCore Evaluator

**Candidate output ≠ cognitive improvement ≠ verified promotion.**

WOLF BrainCore Evaluator is a small, deterministic browser lab for testing whether a proposed AI planning workflow actually improves how an ambiguous request becomes an executable, verifiable plan.

It was built as a new project during the **Build With AI: Basics** submission period. The concept draws on lessons from the learner's earlier Na0mi/Xi0/WOLF work, but **no source code from those projects is reused**.

## Problem, audience, impact

AI-agent builders often change prompts, skills, or planning logic and judge the new version by reading one answer and deciding that it "looks better." That makes regressions easy to miss.

WOLF gives those builders a small independent test bench: the old and new planning paths face the same request and the same transparent rubric. The result is a concrete promotion decision instead of a subjective impression.

The immediate impact is safer iteration: a candidate can be held or rejected when it loses constraints, hides assumptions, lacks a definition of done, or cannot explain how success will be verified.

## What it demonstrates

1. Enter an ambiguous request.
2. Generate a minimal baseline interpretation and a structured BrainCore candidate from the same text.
3. Score both with the same transparent rubric:
   - ambiguity resolved;
   - assumptions exposed;
   - constraints retained;
   - definition of done;
   - verification readiness.
4. Produce `PROMOTE`, `HOLD`, or `REJECT`.
5. Generate a SHA-256 evidence receipt for the evaluated run.

The app deliberately uses deterministic heuristics instead of an external LLM. That keeps the proof of concept reproducible, free to run, and independent of API keys. A later version could swap in real model/skill outputs while preserving the WOLF evaluation contract.

## Live demo

Open the public demo: <https://wolf-braincore-evaluator.onrender.com>

The demo is served from the public `main` branch. No login or API key is required.

## Run

Requirements: Node.js 20+

```bash
npm start
```

Open <http://localhost:4173>.

## Test

```bash
npm test
```

## Hackathon planning artifacts

The repository includes the required Devpost Learn planning artifacts:

- `devpost/scope.md`
- `devpost/prd.md`
- `devpost/spec.md`
- `devpost/checklist.md`
- `devpost/app-map.html`

The planning workflow follows the official Devpost Learn Skill Pack: <https://github.com/challengepost/learn-ai-basics>.

`devpost/learner-profile.md` is intentionally ignored because it contains personal learning context.

## Judge demo path

Use the preloaded request and click **Run evaluation**. In under a minute you can show:

- the vague baseline;
- the structured BrainCore candidate;
- score deltas;
- WOLF's promotion gate;
- the receipt hash.

Then delete most of the sample request and run again to demonstrate that WOLF can return a weaker finality when evidence is insufficient.

## New-project / pre-existing-work disclosure

- New implementation started from an empty project directory during the hackathon submission period.
- No Na0mi, Xi0, XioARa, or earlier WOLF source files were copied into this project.
- Earlier work influenced the **idea** of independent verification/finality only.
- The Devpost Learn Skill Pack informed the planning process; this repository does not redistribute that curriculum.

## License

MIT — see `LICENSE`.
