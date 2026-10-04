---
doc: scope
status: approved
---
# WOLF — AI Change Gate

One line: an independent evaluation gate that tests whether a proposed AI planning change actually improves a request before that change is promoted.

## The Unique Kernel
A cognitive change does **not** count as an improvement because it sounds smarter. WOLF separates request integrity from candidate scoring, runs baseline and candidate through the same transparent rubric, and returns `PROMOTE`, `HOLD`, or `REJECT`.

## Who It's For
Builders of AI agents who change prompts, skills, planning logic, or cognitive workflows and need evidence that a change is actually better.

The failure mode WOLF targets is vibe-based evaluation: one output looks more sophisticated, so the new version gets promoted even when it lost a constraint, hid uncertainty, or misunderstood the request.

## The Core Loop
1. User enters one request through the minimal WOLF landing screen.
2. Request Integrity checks semantic specificity, contradictions, and evaluator-gaming language.
3. Baseline and BrainCore candidate receive the same request.
4. WOLF scores both on five fixed dimensions.
5. Critical blockers can stop promotion even when the numeric score is high.
6. WOLF issues `PROMOTE`, `HOLD`, or `REJECT`.
7. WOLF generates a SHA-256 evidence receipt.
8. An eight-case balanced/adversarial benchmark checks known regression modes.

## Competition Experience
The product is intentionally focused: a centered WOLF identity, one plain-English question — **Should this AI change be promoted?** — one request field, and three fixed demo scenarios.

Technical evidence appears only after evaluation.

## What "Working" Looks Like
A judge opens the app, immediately understands the change-gate problem, submits one request with **W**, then sees:
- deterministic finality;
- baseline vs BrainCore scores;
- request-integrity status;
- five planning-quality metrics;
- exact blockers/reasons;
- baseline vs candidate plans;
- SHA-256 receipt;
- optional eight-case benchmark with both pass and fail-closed outcomes.

The key moment is that WOLF can say **HOLD** to a candidate that scores highly if the request itself is contradictory or insufficiently specified.

## Promotion Rules
`PROMOTE` requires:
- candidate score ≥ 78;
- improvement ≥ 15 points;
- no critical blocker.

## The POC Boundary
In scope:
- responsive browser app;
- deterministic baseline and candidate planning;
- independent request-integrity gate;
- five-metric evaluation;
- three finality states;
- fixed eight-case benchmark;
- SHA-256 evidence receipt;
- automated regression tests.

## Explicitly Out of the Competition Judge Path
- Na0mi integration;
- Market Lens;
- Live Research;
- Adamo / failure-lab experiments;
- trading or broker workflows;
- finance/browser transfer packs;
- external-model adapters;
- paid browser or LLM dependencies.

These may exist as separate research or experiments, but they are not competition acceptance criteria.

## New-Project Boundary
Earlier Na0mi/Xi0/WOLF work influenced the **ideas** of authority, verification and finality, but this hackathon implementation is new code built from an empty project during the submission period. No earlier source code is reused.

## Later
Possible future work includes real model adapters, repeated trials for nondeterministic models, human-labelled calibration, persistent benchmark history and CI promotion gates.
