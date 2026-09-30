# WOLF Product Experience Audit — 2026-09-30

## Objective
Make WOLF feel like a useful product first and a cognitive evaluator second, without weakening its evidence/finality architecture.

Audit inputs:
- real mobile screenshots supplied by the learner;
- WOLF source and regression suite;
- Na0mi V12 Cognitive Fabric, Market Data, Market Lab, WOLF V8 and authority patterns;
- GPT-5.6 Sol semantic/product review.

## Problems found and actions

### 1. Language mismatch
Observed: Italian request, English BrainCore plan and finality.

Cause: user language was not a first-class object; visible strings were hard-coded in English.

Fix:
- clean-room `Language Perception Layer`;
- language detection runs before user-facing rendering;
- Italian plan/UI/finality localization;
- source titles/excerpts remain in their original language for fidelity;
- language is included in the receipt.

Boundary: English and Italian currently have complete visible catalogs. Other major Latin languages and non-Latin scripts are detected, but full response catalogs remain future work rather than silently claiming support.

### 2. Search result did not answer the user
Observed: “Trovami un mercato azionario” returned academic Crossref papers and then a large evaluator report.

Cause: generic web search was being treated as the primary result for a market-information intent.

Fix:
- add Na0mi V12 read-only Market Lens;
- use the existing Market Data / Market Lab architecture without exposing Trading212 execution;
- global market comparison uses regional market proxies and current provider evidence when available;
- specific ticker requests can add bars + descriptive technical observations;
- Market Lens is explicitly read-only and never prepares or places orders.

### 3. Technical audit dominated the product
Observed: several mobile screens of Baseline / BrainCore / metrics before the useful result was clear.

Fix:
- result hierarchy is now:
  1. WOLF Answer
  2. Market Lens when relevant
  3. useful live sources
  4. collapsible WOLF technical audit
- landing remains wolf + one input + W.

### 4. Academic-only source noise
Observed: Crossref results were technically related but low-value for a generic market lookup.

Fix:
- source priority favors general web/reference evidence ahead of academic metadata;
- when Market Lens is available and web research is academic-only, the low-value source block is suppressed rather than dominating the answer.

### 5. Finance intent gaps
Observed: “mercato azionario” did not activate the Finance Evidence Pack because the detector recognized “azioni” but not “azionario”.

Fix:
- Italian finance intent expanded to azionario / azionari / borsa.

### 6. Ticker-only intent gap
Observed: a request such as “Analizza SPY” could miss Market Lens routing.

Fix:
- explicit uppercase ticker detection added alongside semantic market terms.

### 7. Broker capability / authority confusion risk
Risk: importing broker-like capabilities could accidentally imply trading authority.

Fix:
- only quote/history/analysis patterns are exposed to WOLF;
- Trading212 credentials and order endpoints never enter the browser client;
- Market Lens response carries read-only controls and no-order invariants;
- execution authority remains outside this app.

### 8. Evidence vs answer
Risk: an evaluator can optimize for visible rubric language instead of helping the user.

Fix:
- Request Integrity stays independent from candidate scoring;
- answer generation and market evidence happen before the technical audit;
- external-candidate contract remains separate from self-generated candidate logic.

## Current “wow” path
User enters:
`Trovami un mercato azionario`

Expected experience:
1. WOLF detects Italian.
2. WOLF Answer explains what it can compare and what it will not assume.
3. Market Lens shows regional market proxies, latest available provider data, changes and freshness.
4. User sees three narrowing questions: region, horizon, risk.
5. Useful web sources appear only if they add value.
6. Technical WOLF audit remains one tap away for judges/builders.

## Remaining deliberate boundaries
- no investment recommendation or automatic “best market” selection;
- no live trade execution;
- no claim of realtime entitlement when provider freshness does not guarantee it;
- no full multilingual generation beyond complete English/Italian catalogs in this build;
- no paid browser-agent dependency in the judge path.

## Product principle
**Answer first. Evidence second. Audit always available. Authority never implied.**
