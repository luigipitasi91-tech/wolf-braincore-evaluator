# Global browser-agent research absorbed into WOLF

This research is used as design input only. WOLF does not depend on, resell, or automatically call these vendors.

## Canada — Browse AI
Browse AI describes itself as a Vancouver-based startup focused on web extraction, monitoring, scheduled runs, workflows, APIs, and webhooks.

Patterns absorbed:
- separate one-off extraction from scheduled monitoring;
- treat website changes as observable events;
- use explicit task/run records;
- expose structured outputs rather than only browser traces.

Reference:
- https://www.browse.ai/blog/raising-seed-round
- https://help.browse.ai/en/articles/10595109-how-to-run-your-robot

## Australia — Relevance AI
Relevance AI has a team in Sydney and integrates browser infrastructure such as Browserbase and Anchor Browser into larger AI-agent workflows.

Patterns absorbed:
- keep browser execution as a replaceable tool/provider behind an agent;
- make browser steps typed and explicit;
- compose browser capability with other tools instead of making browsing the whole agent.

Reference:
- https://relevanceai.com/careers
- https://relevanceai.com/integrations/browserbase
- https://relevanceai.com/integrations/anchor-browser

## Europe — Browser Use / Notte
Browser Use documents controls such as zero/limited data retention, sensitive-data placeholders, domain allow/block lists, vault integrations, and optional EU data residency. Notte exposes sessions, agents, serverless browser functions, credential vaults, session profiles, replays and observability.

Patterns absorbed:
- credentials stay outside model-visible text;
- allowed domains must be explicit;
- session persistence must be declared;
- replays/logs are evidence, not decoration;
- browser functions/agents should remain separable from the evaluation layer.

Reference:
- https://browser-use.com/enterprise
- https://www.notte.cc/

## Asia — Tencent BrowserSkill / NEC cotomi Agent / ego (lite)
Tencent BrowserSkill lets an agent use a real logged-in browser in a separate visible agent window and includes reproducible browser evals. NEC cotomi Agent learns from demonstrated human browser operations. ego (lite) emphasizes separate workspaces, logged-in state, semantic snapshots, parallel tasks and reduced token cost.

Patterns absorbed:
- real logged-in state is a distinct capability from stateless cloud browsing;
- human demonstration/handoff is valuable when tasks are hard to specify;
- semantic browser state can be cheaper and more stable than screenshot-only loops;
- parallel tasks need isolated workspaces;
- browser capability itself needs reproducible evals.

Reference:
- https://github.com/Tencent/BrowserSkill
- https://group.nec/jp/ja/solutions/ai/llm/cotomi-agent
- https://www.egolite.ai/ja

## Global infrastructure cross-check — TinyFish / Browserbase / Steel
TinyFish, Browserbase and Steel all expose browser sessions through standard browser-control interfaces and emphasize isolated sessions, managed browser infrastructure, identity/access handling, and observability. Browserbase additionally exposes replay/live debugging and separate search/fetch paths; Steel remains provider-neutral/open-source at the browser-infrastructure layer.

Patterns absorbed:
- prefer search/fetch for simple read-only work and full browser sessions only when interaction/state is required;
- separate browser infrastructure from the cognitive evaluator;
- budget browser time and retries;
- verify post-action state rather than treating a successful click as task completion.

Reference:
- https://www.tinyfish.ai/browser
- https://www.browserbase.com/solutions/browser-agents
- https://steel.dev/

## WOLF Browser Runtime Contract
The research above is distilled into a provider-neutral contract:

1. session isolation;
2. credential boundary;
3. domain/authority boundary;
4. read-vs-act choice;
5. observability/replay;
6. post-action verification;
7. retry/recovery;
8. human handoff;
9. cost/time budget;
10. persistence mode.

WOLF evaluates these properties without depending on any one browser vendor.
