# WOLF — AI Change Gate

**Don't promote an AI change because it looks smarter. Make it prove it.**

WOLF is an independent, deterministic change gate for AI-agent planning changes. It gives a baseline and a candidate the same request, scores both with the same rubric, applies independent hard blockers, and returns `PROMOTE`, `HOLD`, or `REJECT`.

Built as a new project for **Build With AI: Basics**.

## The question

**Should this AI change be promoted?**

AI-agent builders change prompts, skills, planners and cognitive workflows constantly. A common failure mode is deciding that a new version is better because one output simply looks smarter.

WOLF replaces that vibe-based promotion decision with repeatable evidence.

## Live demo

Judge-ready demo:

<https://wolf-braincore-evaluator.onrender.com/?demo=1>

Minimal landing:

<https://wolf-braincore-evaluator.onrender.com>

No login, model API key, paid token or external model call is required in the deterministic judge path.

For vague input, WOLF can optionally open a clarification/discovery layer. Brave web discovery is enabled only when a server-side key is configured; Openverse visual context includes source and license links. Discovery results never affect WOLF scores or finality.

## Optional Learning Skills Pack

WOLF also includes a separate **Learning Skills Pack** at `/skills.html`. It is not part of the competition judge acceptance criteria.

The pack contains six reusable learning modes:
- Fast Track Coach;
- Real Error Simulator;
- Core Idea Translator;
- Learning Path Architect;
- Hidden Gap Detector;
- Teach-Back Checker.

Each mode is available in **English, Italian, Spanish, French, German and Portuguese**. The composer builds a structured request and passes the selected learning skill into BrainCore as an explicit pedagogical contract. The core evaluator and fixed benchmark remain unchanged when no learning skill is selected.

The pack implements general learning mechanisms such as diagnostic questioning, error reflection, applied retrieval, progressive scaffolding and teach-back. It does not copy source-product code, branding or proprietary runtime behavior.

## Core loop

1. One request enters WOLF.
2. Request Integrity checks specificity, contradictions and evaluator-gaming signals.
3. Under-specified input is paused for clarification instead of foregrounding raw technical scores.
4. Evaluable requests give baseline and BrainCore candidate the same request and shared explicit constraints.
5. Both are scored with the same five-dimension rubric:
   - ambiguity resolved;
   - assumptions exposed;
   - constraints retained;
   - definition of done;
   - verification readiness.
6. Independent hard blockers are applied.
7. WOLF returns `PROMOTE`, `HOLD`, or `REJECT`.
8. A SHA-256 evidence receipt is generated.
9. A fixed eight-case benchmark checks both successful promotion and fail-closed behavior.

## Promotion rules

`PROMOTE` requires:

- candidate score ≥ 78;
- improvement ≥ 15 points;
- no critical blocker.

A candidate may therefore score well and still be `HOLD` if Request Integrity finds a critical problem.

## Canonical demo

Request:

> Create an autonomous app that makes money for me with a £100 budget. It should work as independently as possible, never pretend revenue is real without proof, and ask me only when a human decision is genuinely required.

Result:

- Baseline: **50/100**
- BrainCore candidate: **94/100**
- Delta: **+44**
- Request Integrity: **CLEAR**
- Finality: **PROMOTE**

## Fixed regression benchmark

The eight competition cases are intentionally mixed:

- Bounded autonomy → PROMOTE
- Consequential publish → PROMOTE
- Under-specified intent → HOLD
- Verification-first build → PROMOTE
- Short but specific → PROMOTE
- Long but vague → HOLD
- Conflicting constraints → HOLD
- Constraint override / evaluator gaming → HOLD

The benchmark matters because WOLF must prove that it can refuse promotion, not only produce an impressive success case.

## Why deterministic?

The competition PoC deliberately uses deterministic heuristics instead of a live external LLM.

That makes the judge path:

- reproducible;
- free to run;
- secretless;
- fast;
- independent of provider availability.

WOLF evaluates whether a candidate planning change clears the gate; it does not claim to be a scientific intelligence benchmark or model leaderboard.

## Run and test

Node.js 20+:

```bash
npm start
npm test
```

Current regression suite target: **59/59 tests passing**.

## Hackathon planning artifacts

Required Skill Pack planning documents:

- `devpost/scope.md`
- `devpost/prd.md`
- `devpost/spec.md`

Competition support material:

- `devpost/checklist.md`
- `devpost/demo-plan.md`
- `devpost/submission-draft.md`
- `devpost/video-script.md`

Planning follows the official Devpost Learn Skill Pack:

<https://github.com/challengepost/learn-ai-basics>

## Competition video

The final judge-focused recording is still to be recorded.

The final 1–3 minute script is in:

`devpost/video-script.md`

## Competition boundary

The competition judge path is intentionally narrow: **AI change evaluation only**. The optional Discovery layer improves clarification UX but remains outside evaluator scoring and benchmark evidence. The multilingual Learning Skills Pack is also an optional non-judge extension and is hidden from the `?demo=1` judge path.

Additional experiments or research that may exist elsewhere in the repository are not part of the competition acceptance criteria and are not surfaced in the judge demo.

## New-project disclosure

- Implementation began from an empty folder during the submission period.
- Earlier Na0mi/Xi0/WOLF work influenced the ideas of independent verification and finality only.
- No earlier source files were copied into this project.
- The Skill Pack informed the planning process.

## License

MIT.
