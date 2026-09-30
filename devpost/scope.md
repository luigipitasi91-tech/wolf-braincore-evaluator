---
doc: scope
status: approved
---
# WOLF BrainCore Evaluator

One line: a local web lab that tests whether a proposed AI planning workflow actually improves ambiguous requests before that workflow is promoted into an agent.

## The Unique Kernel
A cognitive change does **not** count as an improvement because it sounds smarter. WOLF runs the same ambiguous request through a baseline and a structured BrainCore path, measures both with the same rubric, and issues a promotion receipt only when the candidate is measurably better.

## Who It's For
Builders of AI agents who keep changing prompts, skills, or planning logic and need a quick way to see whether a change really improves how ambiguous requests become executable plans.

Today they often judge a new prompt or skill by reading one answer and deciding whether it feels better. That makes regressions easy to miss.

## The Core Loop
The builder pastes an ambiguous request. The app creates a minimal baseline interpretation and a BrainCore interpretation that explicitly surfaces goal, constraints, assumptions, unknowns, definition of done, plan, and verification. WOLF scores both, highlights the deltas, and returns `PROMOTE`, `HOLD`, or `REJECT` with an evidence receipt.

The builder comes back whenever they want to test a new cognitive pattern against the same kind of ambiguity.

## Inspiration & Identity
A compact cognitive laboratory rather than a chatbot: dark technical workspace, high information density, clear evidence cards, no decorative AI imagery. Inspired by the user's Na0mi/Xi0/WOLF architecture principle that completion is not the same as verified success, and by the Devpost Learn pattern of scope → requirements → spec → verified build.

## Why This Matters to the Learner
The learner wants Na0mi to become better at turning vague requests into reliable execution without blindly importing external skills. WOLF is the independent evaluator that prevents “new” from being treated as “better.”

## What "Working" Looks Like
A judge opens the app, keeps the preloaded ambiguous request or enters another one, clicks **Run evaluation**, and immediately sees:

- baseline vs BrainCore plans;
- five measurable planning-quality scores;
- exact strengths and gaps;
- a deterministic promotion decision;
- a signed-style SHA-256 receipt that changes when the request or evaluated plans change.

The “oh, that's cool” beat is seeing a vague request become a testable candidate plan and then watching WOLF refuse to promote it unless the evidence clears the threshold.

## The POC Boundary
In scope: one local browser app, deterministic plan generation, deterministic evaluation, three finality states, built-in example, editable request, and a verifiable receipt.

## Later
Real LLM adapters, regression prompt suites, persistent benchmark history, model-vs-model comparisons, Na0mi skill registry integration, CI promotion gates, and human-labelled benchmark datasets.

## Explicitly Cut
- **No Na0mi V12 source code reuse** — the hackathon requires new code; V12 contributes only design lessons.
- **No external LLM/API calls** — removes keys, cost, latency, and judging fragility; the PoC proves the evaluator loop itself.
- **No automatic self-modification** — promotion remains a decision artifact, not a live rewrite of another agent.
- **No login/database/deployment dependency** — unnecessary to prove the kernel and would weaken the end-to-end demo.
