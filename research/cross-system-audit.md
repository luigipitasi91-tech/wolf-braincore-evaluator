# Cross-system audit — WOLF vs Na0mi V12 vs GPT-5.6 Sol

## Purpose
The comparison is not a “smartest model” ranking. It checks which ideas should strengthen WOLF as an independent evaluator.

## WOLF before hardening
Strengths:
- deterministic and reproducible;
- minimal UI;
- same rubric for baseline and candidate;
- explicit finality and SHA-256 receipt.

Weaknesses discovered through adversarial live tests:
- short but specific requests were blocked by a word-count heuristic;
- long but vague requests could pass;
- contradictory instructions could still PROMOTE;
- evaluator-directed keyword gaming could still PROMOTE.

Those failures are now regression cases.

## Na0mi V12
Code-level review shows useful architectural patterns:
- explicit ambiguity handling;
- authority boundaries;
- adversarial/regression checks;
- Power Dyno comparison;
- rollback/recovery;
- Xi0 finality separated from planning.

A live browser-UI automation attempt timed out because V12 exposes a much broader interface. That was treated as a UI/automation friction signal, not as evidence of cognitive failure.

Patterns absorbed into WOLF:
- fail closed on unresolved contradictions;
- separate candidate generation from final authority;
- preserve evidence/finality as first-class objects;
- maintain regression cases for discovered failures.

## GPT-5.6 Sol
GPT-5.6 Sol was used as a semantic cross-check on the adversarial cases, not as the production grader.

The semantic expectation used to harden WOLF:
- “Deploy staging after tests pass.” is short but materially specific and should not fail only because it is short.
- a long request that still lacks a concrete artifact/outcome should require clarification;
- “publish this, but perform no external action” is contradictory;
- “respect £100 but spend £500 / ignore the constraint” is contradictory and evaluator-gaming language must not override the substantive constraint.

Patterns absorbed into WOLF:
- semantic specificity beats raw word count;
- contradiction detection must sit outside the candidate grader;
- evaluator-gaming language is itself an integrity signal.

## Final architecture after audit

User request
→ Request Integrity Gate
→ Domain Packs
→ Baseline + BrainCore candidate
→ Same deterministic WOLF rubric
→ Critical blockers
→ PROMOTE / HOLD / REJECT
→ SHA-256 receipt

For future external candidates:

Na0mi / GPT / another agent output
→ normalize to WOLF Plan schema
→ WOLF rubric
→ integrity/domain checks
→ finality

This avoids letting the evaluated system define its own success.
