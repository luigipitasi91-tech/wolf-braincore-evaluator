# WOLF External Evidence Lab — optional independent-input mode (2026-10-17)

**This module is NOT the competition judge path.** The original `?demo=1` experience, fixed benchmark, planner, thresholds, receipts and capture video remain unchanged.

## User journey
Go to `/external.html`, enter a shared user request, explicitly list literal required constraint phrases, paste one external baseline JSON and one external candidate JSON, then choose "Evaluate both outputs".

The browser compares the **user-supplied** plans; WOLF does not generate the baseline or candidate in this mode and does not invoke model APIs. Each plan must use this schema:
```json
{
  "label": "Source label (unverified)",
  "goal": "The plan's user goal",
  "constraints": [],
  "assumptions": [],
  "unknowns": [],
  "definitionOfDone": [],
  "steps": [],
  "verification": []
}
```

The original five-metric WOLF rubric and Request Integrity conditions apply to both plans. Additional checks compare **literal case-insensitive mentions** of user-declared mandatory constraint phrases; absent phrases prohibit `PROMOTE`. They do not prove semantic compliance. No user-specified phrases likewise prohibit `PROMOTE`. This separate gate avoids mistaking polished, missing-constraint outputs for proven improvements.

`PROMOTE` still means **provisional heuristic preference**, NOT provider-level evidence of actual model intelligence and NOT permission to deploy. Labels like "GPT" are supplied by the person who pastes the text and cannot be verified. No blind benchmark, independent human truth labels, ground-truth task execution, statistically sampled dataset, or calibrated precision is claimed.

## Privacy and receipts
- Runs in the user's browser; no fetch, signup, upload, analytics, storage, model key or payment.
- SHA-256 receipt is computed over a deterministic serialized JSON evidence object; a downloaded bundle provides both evaluated content and digest. This hash binds bytes; it is not proof the input source is genuine or that the decision is correct.
- A synthetic example can demonstrate the mechanics. It is labeled **SYNTHETIC** and must never be described as actual Claude/GPT output.

## Regression checks
Run `npm test`. The new `tests/external-audit.test.mjs` protects two-input provenance, no silent candidate synthesis, identical candidates, missing required constraints, malformed JSON/schema restrictions, browser-only posture and main judge flow isolation. Full browser screenshot/playback evidence, real independently authenticated LLM completions and external outcome labels remain future work.

## Contest isolation
The competition judge path remains `https://wolf-braincore-evaluator.onrender.com/?demo=1`. The Devpost 90.24-second captioned video was captured before this optional work and should not be misrepresented as showing this new mode. Its existing submission description remains focused on the narrow original change-gate proof-of-concept.

## What a statistically valid future evaluation requires
1. Collect independent model outputs using authorized accounts/providers and track model/version/time/token settings, without secret disclosure.
2. Pre-register a representative held-out task sample and blinded human rubric with multiple raters.
3. Measure agreement, false promotions, false holds, confidence intervals and operational downstream outcomes.
4. Compare against a baseline evaluator under the same data and budget, avoid cherry-picked examples and cross-contamination.
5. Publish transparent limitations and permit reproduction.
