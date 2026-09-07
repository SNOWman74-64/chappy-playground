# Decision log

This file records promoted Project Knowledge for UI Lab: reusable decisions, failed approaches, failure patterns, verification methods, compromises, and safety constraints. Routine progress and unsupported observations do not belong here.

## Entry format

```markdown
## YYYY-MM-DD: Short decision title

**ID**: DEC-YYYYMMDD-NNN | KNO-YYYYMMDD-NNN
**Type**: decision | failed-approach | failure-pattern | verification-pattern
**Owner**: current Decision Owner
**Status**: active | superseded | deprecated | revoked
**Scope**: affected components or policy
**Evidence strength**: confirmed | repeated
**Last confirmed**: YYYY-MM-DD
**Situation**: observable context and problem
**Decision**: the call and meaningful alternatives
**Reason**: concise auditable rationale
**Reuse when**: conditions under which a future task should apply this entry
**Do not reuse when**: invalidating assumptions, limits, or counterexamples
**Related**: files, tests, reports, or earlier IDs
```

One observation is not automatically Project Knowledge. Promote it only when evidence supports future reuse; otherwise discard it at Session End or retain it only in a justified evidence log.

Do not rewrite an old entry to hide a reversal. Append a new entry and reference the superseded ID. Do not record credentials, private chain-of-thought, raw conversation history, or unnecessary user data.

Global promotion is separate and manual. Never copy an entry automatically into a global ledger or Core policy.

## Entries

## 2026-09-07: Keep design knowledge separate from Harness policy

**ID**: DEC-20260907-001
**Type**: decision
**Owner**: current Decision Owner
**Status**: superseded by DEC-20260907-003
**Scope**: UI Lab Harness, shared design docs, isolated workspace boundary
**Evidence strength**: confirmed
**Last confirmed**: 2026-09-07
**Situation**: UI Lab already contained a shared `DESIGN.md`, `LEARNINGS.md`, reference-research notes, and per-study design/retrospective evidence before the project Harness was added. The current checkout intentionally isolates `ui-lab/`, while Mock Gallery registration lives outside that sparse scope.
**Decision**: Use the bootstrap HarnessOnly layer inside `ui-lab/`. `docs/AI-HARNESS.md` owns Harness policy, shared `DESIGN.md` owns design rules, per-study `DESIGN.md` owns local design decisions, and `LEARNINGS.md` owns repeated cross-study design knowledge. Treat repository-level gallery registration as a separate task scope.
**Reason**: This preserves the existing UI research workflow without creating competing canonical documents or silently widening the isolated Writer workspace.
**Reuse when**: Routing future UI Lab work, deciding where a new rule belongs, or deciding whether gallery integration is in scope.
**Do not reuse when**: The user deliberately widens the canonical workspace, introduces a different requirements hierarchy, or replaces the UI Lab documentation contract.
**Related**: `AGENTS.md`, `docs/AI-HARNESS.md`, `DESIGN.md`, `LEARNINGS.md`

## 2026-09-07: Integrate Mock Gallery as the UI Lab home

**ID**: DEC-20260907-003
**Type**: decision
**Owner**: current Decision Owner
**Status**: active
**Scope**: UI Lab navigation, catalog registration, local serving
**Evidence strength**: confirmed
**Last confirmed**: 2026-09-07
**Situation**: The existing Mock Gallery already used a catalog-driven index and a Preview / Design / Learnings viewer, but it lived outside the isolated `ui-lab/` workspace. The user chose to make that gallery the growing home for UI Lab studies.
**Decision**: Make `ui-lab/index.html`, `ui-lab/catalog.json`, and `ui-lab/viewer.html` the canonical Gallery. Register new UI Lab studies in the local catalog as part of normal study work. Keep legacy sibling `refero-*` studies in the same catalog as read-only destinations. Serve the repository parent when testing so both current and legacy destinations are reachable.
**Reason**: One catalog now acts as the durable navigation layer while each study keeps its own implementation, design decisions, and retrospective evidence.
**Reuse when**: Adding a new study, changing Gallery navigation, or deciding where UI Lab entry metadata belongs.
**Do not reuse when**: A future task replaces the catalog contract or deliberately migrates legacy study files into `ui-lab/`.
**Related**: `index.html`, `catalog.json`, `viewer.html`, `DESIGN.md`, `AGENTS.md`

## 2026-09-07: Route design research through indexed site knowledge

**ID**: DEC-20260907-002
**Type**: decision
**Owner**: current Decision Owner
**Status**: active
**Scope**: UI Lab knowledge routing and design-research documents
**Evidence strength**: confirmed
**Last confirmed**: 2026-09-07
**Situation**: Reference discovery, observation guidance, Design Language notes, reusable learnings, and future site-specific design DNA were beginning to overlap across root-level documents. Broad reading would become increasingly expensive as more UI references are added.
**Decision**: Keep `DESIGN.md` and `LEARNINGS.md` as the canonical shared design sources. Route non-normative design research through `knowledge/`, using site-specific profiles plus cross-site pattern and anti-pattern indexes. Use `handoff/KNOWLEDGE-INDEX.md` as the durable top-level router. Indexes contain identifiers and links rather than copies of detailed rules.
**Reason**: AI can retrieve only the site or pattern relevant to the current task while stable rules keep one canonical owner and source-specific observations remain traceable to their evidence.
**Reuse when**: Adding a new reference site, promoting a repeated design pattern, recording an avoid pattern, or deciding which design document an agent should read.
**Do not reuse when**: A future requirements hierarchy deliberately replaces the current UI Lab design contract or a separate project owns its own knowledge architecture.
**Related**: `handoff/KNOWLEDGE-INDEX.md`, `knowledge/INDEX.md`, `knowledge/sites/INDEX.md`, `knowledge/PATTERN-INDEX.md`, `knowledge/ANTI-PATTERN-INDEX.md`, `DESIGN.md`, `LEARNINGS.md`
