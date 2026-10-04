# Devpost submission draft — WOLF

## Project name
**WOLF — AI Change Gate**

## One-line description
Don't promote an AI change because it looks smarter. Make it prove it.

## Short description
WOLF is an independent, deterministic change gate for AI-agent builders. It gives a baseline planning workflow and a candidate workflow the **same request**, scores both with the **same five-dimension rubric**, applies independent Request Integrity blockers, and returns one of three decisions: **PROMOTE, HOLD, or REJECT**.

The key idea is simple: a candidate can score highly and still be held if the request is vague, contradictory, or tries to game the evaluator.

WOLF also generates a SHA-256 evidence receipt and includes a fixed eight-case regression benchmark so the demo is not based on one cherry-picked success.

## Who it is for
AI-agent builders who change prompts, skills, planning logic, or cognitive workflows and need a repeatable way to decide whether the new version is actually better.

## The problem
AI changes are often evaluated by vibe: the new output is longer, more polished, or sounds more intelligent, so it gets promoted.

That can hide regressions:
- an explicit constraint is lost;
- uncertainty is hidden;
- a contradictory request is silently resolved;
- verification becomes weaker;
- the evaluator rewards wording rather than evidence.

WOLF turns that subjective promotion decision into an inspectable gate.

## What it does
1. Accepts one request.
2. Checks Request Integrity independently of candidate scoring.
3. Builds a baseline and BrainCore candidate from that same request.
4. Scores both on:
   - ambiguity resolved;
   - assumptions exposed;
   - constraints retained;
   - definition of done;
   - verification readiness.
5. Applies hard blockers.
6. Returns PROMOTE / HOLD / REJECT.
7. Produces a SHA-256 evidence receipt.
8. Runs a fixed eight-case benchmark covering both promotion and fail-closed behavior.

## Why it is different
WOLF is not another chatbot and it is not a model leaderboard.

It evaluates the **change itself**.

The evaluator is deliberately provider-neutral and deterministic in the judge path. It does not need a model API, secret, paid token, or network call to decide whether a candidate clears the gate.

The important design choice is separating:
- **request integrity** — is the request itself safe and specific enough to evaluate?
from
- **candidate quality** — did the new planning workflow actually improve?

That means a numerically strong candidate still cannot auto-promote through a critical semantic failure.

## Built with
- Devpost Learn Skill Pack
- Vanilla browser ES modules
- Node.js 20+
- Node test runner
- Web Crypto SHA-256
- Render static hosting

## What I learned
The biggest lesson was that planning before adding features matters more than adding more features.

During development, WOLF briefly grew into a broader research experience. Returning to the scope, PRD, and spec made the product stronger: the competition version now does one thing end to end and makes that purpose obvious before the user presses a button.

I also learned that a useful evaluator needs negative evidence, not only successful demos. A short but specific request should not fail just because it is short, while a long vague request should not pass because it contains more words. Contradictions and evaluator-gaming language also need to remain independent hard blockers.

The final workflow is therefore smaller, more explainable, and more testable.

## Challenges
The hardest part was preventing the rubric from rewarding superficial signals.

Early versions risked treating length as specificity. The Request Integrity layer was redesigned around semantic features such as action, artifact, conditions, explicit contradictions, and constraint override signals.

Another challenge was keeping scoring and finality separate. WOLF now requires both measurable score improvement and the absence of critical blockers.

## Accomplishments
- Working public standalone app.
- Same-request / same-rubric baseline-vs-candidate comparison.
- PROMOTE / HOLD / REJECT finality.
- Independent Request Integrity gate.
- Five shared planning-quality metrics.
- SHA-256 evidence receipts.
- Eight fixed core regression cases.
- Finance and browser-agent transfer packs in the repository.
- External-candidate normalization contract.
- **52/52 automated tests passing.**
- No runtime API key required for the judge path.

## New-project disclosure
This hackathon implementation was started from an empty folder during the submission period and built with the Devpost Learn Skill Pack.

Earlier Na0mi/Xi0/WOLF work influenced the idea of independent verification and finality, but no earlier source code was copied into this project.

## Links
### Public repository — required
https://github.com/luigipitasi91-tech/wolf-braincore-evaluator

### Live demo
https://wolf-braincore-evaluator.onrender.com/?demo=1

### Demo video
Replace this line with the final 1–3 minute public video URL after recording.

## Recommended Devpost field mapping
- **Project name:** WOLF — AI Change Gate
- **Tagline / one line:** Don't promote an AI change because it looks smarter. Make it prove it.
- **What it does:** use “Short description” + “What it does”
- **Who it's for:** use “Who it is for”
- **What I learned:** use “What I learned”
- **Try it out link:** public GitHub repository URL, because the hackathon specifically requires the public repo in the submission
- **Additional project link:** live Render demo, if the form provides another URL field
