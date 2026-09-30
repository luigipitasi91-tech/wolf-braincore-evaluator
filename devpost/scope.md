---
doc: scope
status: approved
---
# WOLF BrainCore Evaluator

One line: a focused evaluation lab that tests whether a proposed AI planning workflow actually improves ambiguous requests before that workflow is promoted into an agent.

## The Unique Kernel
A cognitive change does **not** count as an improvement because it sounds smarter. WOLF runs the same request through a baseline and a structured BrainCore path, measures both with the same transparent rubric, and returns `PROMOTE`, `HOLD`, or `REJECT`.

## Who It's For
Builders of AI agents who change prompts, skills, planning logic, or cognitive workflows and need evidence that a change is actually better.

The common failure mode is vibe-based evaluation: reading one answer and deciding the new version “looks smarter.” That makes regressions easy to miss.

## The Core Loop
The builder enters one request through a minimal WOLF landing screen. WOLF creates a baseline and BrainCore candidate, scores both on five fixed dimensions, applies critical-gap guards, and issues a SHA-256 evidence receipt.

A fixed four-case benchmark can then test the same planner/rubric across multiple request types, including an intentionally under-specified case that must not auto-promote.

## Inspiration & Identity
The final product is intentionally minimal: a centered wolf emblem and one W search action on entry, with the technical evidence revealed only after evaluation. The idea is inspired by the broader Na0mi/Xi0/WOLF principle that completion is not the same as verified success, but this hackathon implementation is new code built from an empty project.

## Why This Matters to the Learner
The learner wants Na0mi to improve without blindly accepting every new skill or prompt. WOLF is the independent evaluator that prevents “new” from being treated as “better.”

## What "Working" Looks Like
A judge opens the app, sees only the WOLF emblem and one request bar, submits a request with **W**, and immediately sees:

- baseline vs BrainCore plans;
- five measurable planning-quality scores;
- exact strengths and gaps;
- a deterministic promotion decision;
- a SHA-256 receipt;
- an optional fixed four-case benchmark showing both promotion and fail-closed behavior.

The “oh, that's cool” beat is seeing a vague request become a testable candidate plan and then watching WOLF refuse to promote an under-specified benchmark case.

## The POC Boundary
In scope: one responsive browser app, deterministic plan generation, deterministic evaluation, three finality states, one-request interaction, four fixed benchmark cases, critical-gap guards, and verifiable receipts.

## Later
Real LLM adapters, larger regression suites, multiple trials for nondeterministic models, persistent benchmark history, human-labelled calibration, model-vs-model comparisons, Na0mi skill registry integration, and CI promotion gates.

## Explicitly Cut
- **No Na0mi V12 source code reuse** — V12 contributes only design lessons.
- **No external LLM/API calls** — removes keys, cost, latency, and judging fragility.
- **No automatic self-modification** — promotion is evidence, not a live rewrite.
- **No login/database dependency** — unnecessary for proving the kernel.
