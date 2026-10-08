# Build With AI: Basics — final submission gate (2026-10-08)

Scope: standalone **WOLF AI Change Gate**, NOT Na0mi, V8V, the x402 seller, or unrelated research modules.

## Official event facts
- Submission deadline: **October 26, 2026 at 5:00 pm Eastern Time** (source: https://learn-ai-basics.devpost.com/rules).
- Project must be newly created during the submission period, built using Devpost Learn Skill Pack.
- Public source repo must contain the Skill Pack's `scope.md`, `prd.md`, `spec.md` (this repo currently stores these under `devpost/`).
- Public project demo video **1–3 minutes** is required; judges rely on the video, not running a local clone.
- Devpost added **two mandatory form fields**: learner explanation of how the Devpost Learn Skill Pack was used; age-of-majority checkbox. Existing submissions need updating. Source: https://learn-ai-basics.devpost.com/updates/46821-two-new-questions-on-the-submission-form
- Make public repository link available in the submission's **Try it out** field (per official Devpost announcement).
- Judging weights: design, potential impact, innovation/idea, presentation (equal weights).

## Evidence already available
- Public repo: https://github.com/luigipitasi91-tech/wolf-braincore-evaluator
- Judge demo: https://wolf-braincore-evaluator.onrender.com/?demo=1
- Source-level isolation: no Na0mi runtime dependency for judge path; discovery results do not affect promotion scoring.
- Canonical proof: request -> request-integrity -> baseline & candidate -> same rubric -> PROMOTE/HOLD/REJECT -> SHA-256 receipt.
- Fixed 8-case suite, includes hold/refusal.
- GitHub Actions CI **October 5, 2026**: `68 tests`, `68 pass`, `0 fail` (run 37355763302, job 111917643107).
- Public learning pack exists at `/skills.html`; it remains optional, not the primary judge task.

## Unfinished, do not misrepresent
- [ ] Record and upload **final redesigned** judge-focused 1–3 minute video; existing older YouTube clip is not evidence of the latest UI.
- [ ] Verify mobile and desktop **real-interaction** judge flow on deployed page; static accessibility/text fetch and code tests alone cannot prove clicks, dynamic hide behavior, or screenshots.
- [ ] Ensure actual Devpost submission is completed from the learner's authorized account before the deadline.
- [ ] Learner completes **Skill Pack usage explanation** in their own words. AI may fact-check and proofread but must not invent an account-holder attestation.
- [ ] Learner personally completes the **age of majority** checkbox.
- [ ] Confirm public repo URL occupies `Try it out`; provide judge demo link as an additional demo URL if the form allows.
- [ ] Confirm video URL entered and the Devpost form saved/updated successfully.

## Controlled demonstration sequence (video)
1. Start with the concrete pain: an AI-agent planning change can look better while dropping constraints.
2. Open the **judge** URL (preloaded request), press **W**, show the resulting PROMOTE/HOLD/REJECT, baseline and candidate, and SHA-256 receipt.
3. Show one adversarial case that must **HOLD**; explain that the blocker overrides a high superficial score.
4. Show the fixed **eight-case** regression evidence, with both positive and negative cases.
5. End with audience/problem/innovation; stay under 3 minutes.

## Scope guard
Do not claim external-model leaderboard accuracy, independent third-party evaluation of real LLM outputs, production autonomy, paid settlement, or a completed Devpost submission. The deterministic demo constructs baseline and candidate plans from the supplied request using its own planner; the project is a **change-gate proof of concept**, not a blind head-to-head model benchmark.

Do not require a Brave key, x402 wallet, live browser agent, or paid account for the judge demonstration.
