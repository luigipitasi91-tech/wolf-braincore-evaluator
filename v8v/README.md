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

V8V v0.1 is not a stealth bot or CAPTCHA-bypass product. It blocks non-http(s) navigation and obvious localhost/private IP targets, supports per-session domain allowlists, and avoids arbitrary JavaScript evaluation endpoints.

For authenticated or consequential workflows, keep human approval in the planner layer.

## Session persistence

Sessions live in memory and expire by default after 15 minutes. `exportState` returns Playwright storage state so a caller can persist it externally and pass it back when creating a new session.

## Environment

- `PORT`
- `V8V_API_TOKEN` optional bearer token
- `MAX_SESSIONS` default 2
- `SESSION_TTL_MS` default 900000
