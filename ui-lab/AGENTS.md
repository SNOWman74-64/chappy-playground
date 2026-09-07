# Workspace instructions for UI Lab

## Project facts

- Purpose: Isolated workspace for researching, building, and evaluating web sites and product UI.
- Bootstrap date: 2026-09-07
- Run command: `python -m http.server 4173 --directory ..`
- UI Lab URL: `http://localhost:4173/ui-lab/`
- Test/check command: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-ui-study.ps1`

Verify the running system and current code when documentation disagrees with observable facts. Do not infer hidden context from another AI session.

## Core

1. Established requirements define scope and acceptance.
2. One Decision Owner decides; one Writer owns each canonical workspace at a time.
3. Delegation is bounded by scope, authority, protected state, and stop conditions.
4. Done requires sufficient evidence; agent and reviewer claims are not truth or authority.

Until durable requirements exist, use the current explicit user intent as the task scope; do not invent requirements. The active project role binding is recorded in the project-local extensions of `docs/AI-HARNESS.md` or, when present, current Task Status.

## Context routing

Start with the smallest context that can route the task:

1. Read `handoff/TASK-STATUS.md` when it exists and resumable state is relevant.
2. Read the relevant parts of `docs/REQUIREMENTS.md` when the task can affect behavior, scope, constraints, acceptance, or other normative requirements, or when material ambiguity requires them; when present, it is the sole normative implementation scope and acceptance source.
3. When `handoff/KNOWLEDGE-INDEX.md` exists, use it to select only relevant entries and linked evidence.
4. Use an available code index only to narrow files; otherwise use manifests, entry points, search, and targeted reads.
5. Confirm conclusions in actual files, tests, or runtime behavior.

Read `docs/AI-HARNESS.md` only when the task needs detailed Minimal Change, risk, Evidence Budget, role binding, review, knowledge, or session rules beyond this router. It is the project-local canonical Harness policy. Read other project documents only for facts they own.

## Authority

- Use read-only discovery first and preserve user-owned or unrelated changes.
- Do not overwrite policy, weaken a safety boundary, install dependencies, or expand access without authority.
- Treat credentials, destructive operations, deployment, publishing, git writes, and external communication as explicit authority boundaries.
- Tests and reviewer approval do not grant authority. The Decision Owner verifies evidence and closes every finding.
- Bootstrap does not authorize commits, pushes, remotes, deployment, external messages, or application changes.

## UI / Web context routing

For work inside this lab, keep scope/acceptance, design decisions, and accumulated learning separate.

1. Current explicit user intent defines task scope until `docs/REQUIREMENTS.md` exists. When that file exists, it owns implementation scope and acceptance.
2. Read `DESIGN.md` before designing or changing a study. It owns shared UI Lab design rules.
3. Read the target study's `DESIGN.md` before implementation when it exists. It owns that study's visual and interaction decisions.
4. Search `LEARNINGS.md` by relevant topic or learning ID instead of loading it wholesale by default. It owns repeated cross-study design knowledge.
5. When reference or design knowledge is needed, use `knowledge/INDEX.md` to route to the smallest relevant site, pattern, anti-pattern, preference, observation, or reference file.
6. Treat `knowledge/` indexes as routers rather than normative design requirements; confirm shared rules in `DESIGN.md` or `LEARNINGS.md`, and source-specific claims in the relevant study or site evidence.
7. Treat a study's `RETROSPECTIVE.md` and `TEST-REPORT.md` as evidence and learning material, not as normative requirements.

`handoff/DECISION-LOG.md` is for reusable Harness or engineering decisions. Do not duplicate design knowledge there when it belongs in `LEARNINGS.md`.

## Design execution loop

Follow `DESIGN.md` for shared design principles and the study artifact contract. Use this retrieval-and-evidence loop as the default:

`Reference -> routed knowledge -> visual grammar -> study DESIGN.md -> implementation -> browser verification -> RETROSPECTIVE.md -> shared LEARNINGS.md when repeated`

For a new study, prefer the artifact contract already defined in `DESIGN.md`: `index.html`, study `DESIGN.md`, and `RETROSPECTIVE.md`. A short `README.md` remains optional.

## Product Design routing

Use the Product Design plugin only when the user explicitly invokes it or when the task is primarily design exploration, faithful visual cloning, or product-flow audit. Follow the selected skill's current instructions rather than duplicating its workflow here.

- Use visual ideation before build when the active Product Design workflow requires choosing a visual target.
- Use image-to-code only after the exact visual target is selected.
- Use URL-to-code for faithful live-URL recreation.
- Use audit for screenshot-grounded critique of an existing flow or screen.
- Ordinary implementation tasks do not need Product Design merely because they involve UI.

## UI completion evidence

The static check command validates the study/document contract; it is not sufficient visual evidence by itself.

For implementation work, choose the smallest evidence set that covers credible failure modes. Usually this means:

- render the requested state in a real browser;
- exercise the primary interaction or flow when interactive behavior changed;
- inspect at the intended viewport plus a meaningful mobile/desktop counterpart when responsive behavior matters;
- check visible focus/keyboard behavior for primary controls when interaction or navigation changed;
- check browser/runtime errors;
- compare against the actual reference at the same viewport/state when fidelity is an acceptance criterion.

If browser evidence is required but unavailable, report visual verification as blocked. A successful build, HTTP response, or static file check does not prove visual correctness.

## Isolated workspace boundary

The canonical Writer scope for normal work here is `ui-lab/`. The integrated gallery now lives inside this scope as `index.html`, `catalog.json`, and `viewer.html`; adding a study to the UI Lab index is a normal in-scope update when the active task creates or adopts that study. Legacy `refero-*` studies remain outside the Writer scope and are referenced read-only from the catalog unless the user explicitly expands scope. Follow `docs/AI-HARNESS.md` when a legacy catalog target is absent from the sparse checkout.

Do not redesign or clean up unrelated studies while working on one study.
