# Worker preflight — astra-luna-01

status: ENVIRONMENT_NOT_ESTABLISHED
experiment: B
run_id: astra-luna-01
requested_model: gpt-5.6-luna
requested_reasoning: high
requested_speed: Fast

## Timing

- start_utc: 2026-09-07T15:34:42Z (pre-existing worker-preflight start marker)
- end_utc: 2026-09-07T15:36:17.5518760Z

## Scope

- Read only: `experiments/social-game/README.md`, `PROTOCOL.md`, and `ACCEPTANCE.md`.
- No implementation, model launch, dependency installation, shared-input edit, gallery edit, commit, push, publish, or server shutdown performed.

## Browser connection

- CUA initialization succeeded.
- `cua.getState()` returned no apps and no browsers.
- `cua.listBrowsers()` returned `[]`.
- Attempted documented in-app browser creation for `http://localhost:4173/ui-lab/experiments/social-game/environment.html` with `visible: true`; result: `Browser is not available: iab`.
- Worker-owned real-browser session: not established.
- Image check: not performed.
- Input entry: not performed.
- Confirmation click: not performed.
- Tab exercise: not performed.
- Screenshot evidence: unavailable; no screenshot file written.

## Server and checker

- Direct local HTTP probe of the requested URL: HTTP 200; server reachable.
- `python experiments/social-game/check_environment.py`: PASS — fixed inputs, IDs, references and acceptance fixture expectations.
- Checker note: browser not tested by the script; each implementation actor must open `environment.html`.

## Model/settings observability

- No model was invoked.
- Actual serving model, reasoning level, and speed/tier were not independently exposed and are therefore unverified (`null`/not observed).
- Requested settings above are not evidence of actual serving tier.

## Files written

- `game-astra-luna-01/logs/worker-preflight-luna-01.md`

Preflight stopped because browser tools were unavailable, as required.
