---
doc: prd
status: approved
---
# WOLF BrainCore Evaluator — Product Requirements

A one-screen cognitive evaluation lab for AI-agent builders who want evidence that a planning change improves ambiguous requests.
Source: `scope.md > Who It's For`, `scope.md > The Unique Kernel`.

## The Core Journey
Source: `scope.md > The Core Loop`.

1. The user lands on a lab screen with a preloaded ambiguous request and can edit it.
2. They click **Run evaluation**.
3. The app produces a deliberately thin baseline interpretation and a structured BrainCore interpretation from the same request.
4. WOLF evaluates each interpretation across ambiguity resolution, assumption exposure, constraint retention, definition of done, and verification readiness.
5. The user sees score deltas and concrete evidence behind each metric.
6. The app issues one finality state: `PROMOTE`, `HOLD`, or `REJECT`.
7. A receipt shows request hash, score summary, finality, reasons, and timestamp; changing the request changes the receipt.

Success is not “the candidate generated text.” Success is that the evaluator can explain why the candidate should or should not be promoted.

## Screens and Layout
Single responsive page with five zones:

- header / product principle;
- request workbench;
- baseline and BrainCore plan cards side by side;
- WOLF metric comparison;
- final decision + receipt.

On narrow screens the comparison stacks vertically.

## Look and Feel
Dark laboratory / control-room feel. Compact, readable sans-serif typography. Neutral surfaces with status color used only for pass/hold/reject and score deltas. No gradients, mascots, stock imagery, or “magic AI” visual language. Copy should sound precise and test-oriented.

## Features and Behavior
Source: `scope.md > What "Working" Looks Like`.

### Request workbench
- Editable multiline request.
- One-click sample reset.
- Empty input produces a clear validation state and no fake result.

### Baseline planner
- Creates a short interpretation that mostly follows the literal request.
- Intentionally does not invent hidden constraints or claim unknowns are resolved.
- Exists as a comparison control, not as a “bad AI” caricature.

### BrainCore planner
- Produces explicit sections for Goal, Constraints, Assumptions, Unknowns, Definition of Done, Plan, and Verification.
- Detects common signals such as budget amounts, autonomy language, money/earnings, “send/submit,” and explicit safety/verification wording.
- When information is unknown, says it is unknown rather than fabricating a value.

### WOLF evaluator
- Scores both plans on the same 0–100 rubric across five dimensions.
- Shows why each dimension received its score.
- Does not award points based on longer output alone.
- Applies a promotion threshold and critical-gap guard.

### Finality and receipt
- `PROMOTE`: candidate clears quality threshold, improves sufficiently over baseline, and has no critical verification/constraint gap.
- `HOLD`: candidate improves but evidence is insufficient for promotion.
- `REJECT`: candidate fails to improve or regresses materially.
- Receipt includes evidence and SHA-256 hash.

## States and Boundaries
- **First use** — sample request is loaded; no evaluation receipt until the user runs it.
- **Valid evaluation** — both plans and all scores are visible.
- **Empty request** — inline error, prior result cleared.
- **No persistence** — reloading resets to the sample; deliberate for the PoC.
- **No network execution** — nothing is sent to external models or services.

## Product Decisions
- WOLF is the independent evaluator, not the cognitive engine being evaluated — avoids self-grading.
- The demo uses deterministic transformations — keeps judging reproducible and proves the evaluation architecture without external dependencies.
- V12 contributes patterns, not source code — preserves hackathon eligibility.
- One strong end-to-end journey beats a broad dashboard — aligns with the proof-of-concept boundary.

## What We're Building
A working local web application implementing the complete Core Journey, plus automated tests for scoring/finality behavior and public documentation sufficient to run it.

## Deferred From the POC
- LLM connectors and model credentials — unnecessary for the evaluator kernel.
- Benchmark persistence — valuable once repeated experiments exist.
- Direct Na0mi integration — a later adapter can consume the receipt.
- Multi-user collaboration — no value for this single-user experiment.

## Possible Later Enhancements
A benchmark suite could run hundreds of saved prompts and compare BrainCore versions statistically. A Na0mi integration could block skill promotion unless WOLF receipts pass agreed thresholds.

## Non-Goals
- Guaranteeing that a plan is objectively intelligent.
- Executing consequential real-world actions.
- Replacing human product judgment.
- Ranking commercial foundation models.
- Reproducing or redistributing the Devpost Learn skills themselves.

## Open Questions
None block `4-spec`. Real-world LLM evaluation and human-labelled gold sets are intentionally deferred.
