---
doc: scope
status: approved
---
# WOLF BrainCore Evaluator

One line: an independent evaluation lab that tests whether a proposed AI planning workflow actually improves a request before that workflow is promoted into an agent.

## The Unique Kernel
A cognitive change does **not** count as an improvement because it sounds smarter. WOLF separates request integrity from candidate scoring, runs baseline and candidate through the same transparent rubric, and returns `PROMOTE`, `HOLD`, or `REJECT`.

## Who It's For
Builders of AI agents who change prompts, skills, planning logic, or cognitive workflows and need evidence that a change is actually better.

The failure mode WOLF targets is vibe-based evaluation: one output looks more sophisticated, so the new version gets promoted even when it lost a constraint, hid uncertainty, or misunderstood the request.

## The Core Loop
1. User enters one request through the minimal WOLF landing screen.
2. Request Integrity checks semantic specificity, contradictions, and evaluator-gaming language.
3. Domain Packs add evidence requirements when the request is finance- or browser-agent-related.
4. Baseline and BrainCore candidate receive the same request.
5. WOLF scores both on five fixed dimensions.
6. Critical blockers can stop promotion even when the numeric score is high.
7. WOLF issues finality and a SHA-256 evidence receipt.
8. An eight-case balanced/adversarial benchmark checks known regression modes.

## Transfer Evidence
The PoC also contains two non-UI transfer packs:
- 10 finance-analysis families distilled from user-supplied screenshots into evidence requirements, without copying the original prompt text;
- 6 browser-agent cases exercising a provider-neutral 10-point Browser Runtime Contract derived from global platform research.

Structured outputs from an external agent can also be normalized into the same WOLF Plan schema, so WOLF is not limited to grading its own candidate generator.

## Inspiration & Identity
The product is intentionally minimal: a centered wolf emblem and one W action on entry, with technical evidence revealed only after evaluation.

Earlier Na0mi/Xi0/WOLF work influenced the **idea** of authority, verification and finality, but this hackathon implementation is new code built from an empty project. No Na0mi V12 source code is reused.

## What "Working" Looks Like
A judge opens the app, sees only WOLF + one request bar, submits with **W**, then sees:
- baseline vs BrainCore plans;
- request-integrity status;
- five planning-quality metrics;
- exact blockers/reasons;
- deterministic finality;
- SHA-256 receipt;
- optional 8-case benchmark with both pass and fail-closed outcomes.

The key moment is that WOLF can say **HOLD** to a candidate that scores highly if the request itself is contradictory or insufficiently specified.

## The POC Boundary
In scope: responsive browser app, deterministic plan generation, independent request-integrity gate, five-metric evaluation, three finality states, eight core regression cases, finance/browser transfer packs, external-candidate normalization, and verifiable receipts.

## Later
Real live model adapters, repeated trials for nondeterministic models, human-labelled calibration, persistent benchmark history, CI promotion gates, and direct Na0mi integration.

## Explicitly Cut
- no Na0mi V12 source-code reuse;
- no live external LLM dependency in the judge path;
- no paid browser provider dependency;
- no automatic self-modification;
- no login/database requirement.
