# V8V

V8V is a provider-neutral browser runtime for AI agents.

It is intentionally separate from the WOLF competition judge path.

## What V8V does

- launches isolated Chromium sessions;
- navigates to public http/https pages;
- exposes agent-friendly DOM snapshots with stable `v8v-id` handles;
- clicks, fills, presses keys, waits, goes back/forward;
- captures screenshots;
- exports browser storage state;
- keeps an auditable action trace;
- supports optional domain allowlists;
- blocks obvious private/local network targets;
- redacts likely secret/password values from traces.

## Architecture

```
Na0mi / another planner
        ↓ structured actions
      V8V API
        ↓
Playwright + Chromium
        ↓
      Website
```

V8V does not need an LLM to execute actions. A planner can inspect `/snapshot`, decide the next action, and call V8V again. This separation makes browser execution deterministic and replaceable.

## API

Create session:

```http
POST /v1/sessions
{
  "startUrl": "https://example.com",
  "allowedDomains": ["example.com"]
}
```

Snapshot:

```http
GET /v1/sessions/:id/snapshot
```

Run actions:

```http
POST /v1/sessions/:id/actions
{
  "actions": [
    {"type":"click","v8vId":"v8v-3"},
    {"type":"fill","v8vId":"v8v-5","value":"hello"},
    {"type":"press","v8vId":"v8v-5","key":"Enter"},
    {"type":"snapshot"}
  ]
}
```

## Security boundary

V8V v0.3 is not a stealth bot or CAPTCHA-bypass product. It blocks non-http(s) navigation and obvious localhost/private IP targets, supports per-session domain allowlists, and avoids arbitrary JavaScript evaluation endpoints.

For authenticated or consequential workflows, keep human approval in the planner layer.

## Session persistence

Sessions live in memory and expire by default after 15 minutes. `exportState` returns Playwright storage state so a caller can persist it externally and pass it back when creating a new session.

## Environment

- `PORT`
- `V8V_API_TOKEN` required for control endpoints; without it V8V stays locked
- `MAX_SESSIONS` default 2
- `SESSION_TTL_MS` default 900000


Public verification endpoints:
- `GET /health` — runtime/browser state only;
- `GET /selftest` — fixed, read-only check against `https://example.com`.


## Na0mi compatibility

V8V v0.3 exposes a compatibility surface for Na0mi's existing `REMOTE_HTTP_BROWSER` adapter.

Configure Na0mi with:

```text
NA0MI_BROWSER_HTTP_URL=https://v8v-runtime.onrender.com
NA0MI_BROWSER_HTTP_TOKEN=<same value as V8V_API_TOKEN>
```

Na0mi can then use its existing browser planner while V8V performs the browser execution.

Compatibility endpoints:

- `POST /session`
- `POST /session/:id/goto`
- `POST /session/:id/observe`
- `POST /session/:id/extract`
- `POST /session/:id/click-link`
- `POST /session/:id/click`
- `POST /session/:id/fill`
- `POST /session/:id/press`
- `POST /session/:id/select`
- `DELETE /session/:id`

This makes TinyFish an optional fallback rather than the primary browser backend.

## Security notes

- Control routes require `V8V_API_TOKEN`.
- Public/private network checks include DNS resolution to reduce SSRF through hostnames.
- URL credentials are blocked.
- Domain allowlists and blocklists are supported per session.
- Navigation to private/local networks is blocked unless explicitly enabled for a trusted local test.
- V8V does not expose arbitrary JavaScript evaluation.
- Consequential actions still require authorization in the planner layer; V8V does not grant that authority itself.


## Autonomous agent API

V8V v0.3 includes a bounded goal-driven browser loop in addition to the low-level runtime.

`POST /v1/agent/run` accepts a start URL, a goal, optional domain policy, optional success conditions and a bounded step count. V8V observes the page, scores safe read-only links against the goal, follows the most relevant link, records evidence, and returns a provisional result.

The autonomous loop deliberately refuses dangerous link patterns such as delete, logout, checkout, purchase and account termination. Interactive scripted actions require `allowInteractiveActions: true`; the runtime itself does not grant purchasing, outreach, account-management or other consequential authority.

Example:

```json
{
  "url": "https://example.com",
  "goal": "Find the documentation page",
  "allowedDomains": ["example.com"],
  "maxSteps": 6,
  "successConditions": [
    {"kind": "TEXT_CONTAINS", "value": "documentation"}
  ]
}
```

Public fixed verification: `GET /selftest/agent` runs a rate-limited read-only check against example.com.
