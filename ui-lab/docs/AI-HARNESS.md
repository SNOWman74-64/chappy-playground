# AI harness

Harness contract version: 3.1.0
Managed baseline digest: sha256:ec46ea342d21ddf6e57f6c6be933bb8f4d867135a359eebade67d551d3052104
Generated from: contracts/HARNESS.md
Project-local canonical: yes

<!-- BEGIN MANAGED HARNESS CONTRACT -->
## Four-line core

1. Established requirements define scope and acceptance.
2. One Decision Owner decides; one Writer owns each canonical workspace at a time.
3. Delegation is bounded by scope, authority, protected state, and stop conditions.
4. Done requires sufficient evidence; agent and reviewer claims are not truth or authority.

Until durable requirements exist, current explicit human intent is the starting scope and acceptance source. Do not invent missing requirements.

## Hard invariants

1. When present, `docs/REQUIREMENTS.md` is the sole normative source for implementation scope, constraints, and acceptance. Reconcile conflicting sibling documents in the same task.
2. Each canonical workspace has one active Writer. Advisory roles return findings or proposals and do not edit canonical files.
3. Tool availability is not authority. Destructive, external, credential, deployment, publication, and protected-state operations require explicit authority.
4. Minimal Change never removes accessibility, security, data-loss prevention, trust-boundary validation, required error handling, or an explicit requirement.
5. Direct evidence outranks agent or reviewer claims. Passing checks or review never grants additional authority.
6. Delegation and independent review are optional. Use them only when they reduce a named uncertainty or satisfy an explicit policy or requirement.

## Core roles

### Decision Owner

Owns scope interpretation, route selection, final design decisions, Evidence Budget acceptance, finding adjudication, and user escalation. The role does not gain destructive or external authority implicitly.

### Writer

Is the only role that changes files in its assigned canonical workspace. The assignment must state scope, authority, protected state, and a stop condition. A Writer may not silently expand requirements or overwrite another workspace's canonical state.

### Specialist

Provides bounded analysis, options, or domain evidence. A Specialist is advisory and read-only unless separately assigned as the Writer of an isolated canonical workspace.

### Reviewer

Provides an independent, bounded, read-only challenge to design or acceptance evidence. A Reviewer does not implement, change scope, accept its own findings, or make the final decision.

Verification is a responsibility and evidence lane, not a fifth Core Role.

## Authority and protected state

- **Read:** inspect only the context needed for the task.
- **Write:** change only the assigned canonical workspace and scope.
- **Destructive:** delete, overwrite, migrate, rewrite history, or take an action that can cause material loss.
- **External:** deploy, publish, send messages, call state-changing services, modify accounts, or expose data outside the workspace.

State explicit authority separately from role and capability. Preserve user-owned changes, credentials, secrets, production data, recovery material, external systems, and other declared protected state. Start with read-only discovery when the current state is not established.

## Operating defaults

### Minimal Change

After understanding the relevant flow, stop at the first sufficient option:

1. Do not make the change when it is unnecessary.
2. Reuse current project code.
3. Use the standard library.
4. Use a native platform capability.
5. Use an already-installed dependency.
6. Add the minimum new implementation required.

Minimal Change means avoiding unnecessary change, not minimizing line count. Do not add speculative abstractions, configuration, dependencies, tests, review, or unrelated cleanup.

### Risk routing and Evidence Budget

Consider Change Size, Failure or Impact Risk, Execution Environment, Authority, and Persistence or Trust-Boundary impact independently. Do not require a numeric score or form. Keep ordinary local and reversible values implicit; state only an axis that changes authority, implementation, evidence, review, or recovery.

Before implementation, define the minimum evidence needed for safe completion:

`Credible Failure Mode -> Required Evidence -> Focused Verification -> Evidence satisfied -> STOP`

A broad check is justified only by a broad credible failure mode. Test count, review count, and workflow length are not quality metrics. Reuse existing evidence when it addresses the same requirement or failure mode, relevant code and assumptions are unchanged, the result remains inspectable, and no later observation contradicts it. Require environment equivalence only for environment-sensitive evidence.

### Completion persistence

Within the assigned authority and scope, continue through the implementation needed for acceptance, focused verification, repair of failures caused by the current change, and re-verification until the stop condition is satisfied. Do not stop merely because an intermediate implementation step or focused check completed.

Stop and escalate when required work would cross the assigned authority or scope, protected state would be put at material risk, a material requirement ambiguity prevents safe progress, or the stop condition cannot be satisfied with the available evidence and authorized capabilities.

### Context routing

Start from current task context, relevant requirements, and the smallest available router. When a Knowledge Index or code index exists, use it to narrow retrieval, then confirm conclusions in actual decisions, source, tests, or runtime. An index is never a source of truth. Fall back to targeted search and reads without adding a dependency.

Stop when acceptance and the Evidence Budget are satisfied, no credible failure remains unaccounted for, and required authority boundaries are respected.

## Minimal Task State

Keep task state session-local by default. The minimum state is:

- `goal`
- `status`
- `next_action`

Create or update `handoff/TASK-STATUS.md` only when work must resume across sessions, compaction needs a durable recovery point, or another role needs a durable handoff. Add evidence status or unresolved items only when they change the next action. Replace current state instead of appending history.

## Routing boundary

Apply requirements, Hard Invariants, and current authority before route preferences. Within those boundaries, route selection may consider a task recommendation, project policy, user or project preferences, resource budget, and a current explicit human override. The Decision Owner resolves conflicts and records only decisions with reuse or recovery value.

Provider and model bindings belong in project-local extensions, current Task State, an explicit preference overlay, or runtime configuration. They do not belong in this managed provider-neutral baseline. Preference and budget never weaken authority, required evidence, reviewer independence, or acceptance.

## Independent review boundary

No reviewer is the default. Choose review only from the Evidence Budget or an explicit policy:

- Self Review when direct evidence is sufficient.
- Focused Review for named failure modes and exact files, functions, or routes.
- Broad Review only when a cross-cutting invariant or the blast radius itself remains uncertain.
- Design Critic only when at least two viable implementation-boundary choices remain, a wrong choice has material impact, and independent criticism can reduce that uncertainty.

The Reviewer receives a bounded packet and safe read-only context. The configured provider transports the request but does not decide whether review is needed, its scope, the Evidence Budget, call limits, or finding closure. Provider output is advisory until the Decision Owner verifies its evidence.

Close every finding as:

- `supported`: fix it and obtain changed evidence;
- `unsupported`: record concise counter-evidence and close it;
- `unresolved`: escalate to the human owner.

Do not resubmit the same finding without material implementation or evidence change. The default limit is one initial Design Critic call plus one after a supported redesign, and one initial Acceptance Review plus one materially changed re-review. If a required independent provider is unavailable, stop and escalate. If review is optional, continue the normal Core workflow without pretending self-review is independent review.

## Knowledge and durable records

Use this lifecycle:

`Observation -> Candidate Knowledge -> Project Knowledge -> repeated usefulness and evidence -> Global Harness Knowledge`

Candidate Knowledge is temporary task state. At Session End, promote a supported candidate to `handoff/DECISION-LOG.md` or discard it; never accumulate candidates in Task Status or an index.

- Keep reusable or costly-to-reverse Project Knowledge in `handoff/DECISION-LOG.md`.
- Create `handoff/KNOWLEDGE-INDEX.md` only when it prevents repeated broad reading. Without it, search the Decision Log by heading, ID, or keyword.
- Create a dated evidence log only for cross-session handoff, audit, recovery, migration, high-risk work, costly reproduction, or expected reuse.
- Do not persist full conversations, raw history, routine check output, or unnecessary user data.

Global Harness Knowledge requires a separate manual, evidence-backed harness-maintenance change. Never append it automatically, inject it automatically into projects, or promote it automatically into this contract.

## Session lifecycle

### Session Start

Restore current task context. Read Task Status only when it exists and resumable state is relevant, then retrieve relevant requirements and routed Project Knowledge. Expand context iteratively only after identifying a gap. Define the Minimal Change choice, workflow-changing risk factors, Evidence Budget, and stop condition.

### Before Compaction

Checkpoint confirmed state, decisions made, evidence satisfied or pending, unresolved items, and the exact next action. Keep it session-local unless a durable recovery point is justified; then create or update Task Status. Link durable details instead of copying history.

### Session End

Report the result and close or hand off unresolved work. Update Task Status only when it already exists or durable resume value justifies it. Promote supported Candidate Knowledge or discard it. Preserve detailed evidence only when its future value justifies storage.

## Snapshot and refresh boundary

A generated project snapshot is project-local canonical policy. Its header records this contract version, the SHA-256 digest of the normalized managed body, source provenance, and project-local canonical status. The managed body is delimited by the managed markers; project-specific policy belongs only between the project-local extension markers.

Source changes never update a project automatically. Refresh must compare the snapshot's current normalized managed body with its recorded digest and preserve the local extension bytes. A missing header is legacy unversioned state. A digest mismatch is user-owned modification or a packaging inconsistency and requires conflict handling with zero write. Never silently refresh, auto-merge conflicts, or inject Global Harness Knowledge.
<!-- END MANAGED HARNESS CONTRACT -->

<!-- BEGIN PROJECT-LOCAL EXTENSIONS -->
## Bootstrap role binding

- Decision Owner: Codex.
- Writer: Codex for normal work unless a current explicit human instruction assigns one Writer to another canonical workspace.
- Independent Reviewer provider: none configured.
- Current explicit human overrides take precedence within requirements, authority, and Hard Invariants.

## UI Lab canonical sources

- `DESIGN.md` is the shared design-policy source for UI Lab.
- `<study>/DESIGN.md` owns study-specific visual, layout, interaction, motion, responsive, and adaptation decisions.
- `LEARNINGS.md` owns design knowledge that has proven reusable across studies.
- `<study>/RETROSPECTIVE.md` and optional test reports are evidence and candidate learning sources, not scope authority.
- `handoff/DECISION-LOG.md` is reserved for reusable Harness and engineering decisions so it does not compete with `LEARNINGS.md`.
- `handoff/KNOWLEDGE-INDEX.md` is the top-level durable knowledge router when design or Harness knowledge retrieval would otherwise require broad reading.
- `knowledge/INDEX.md` routes design research into site profiles, pattern indexes, anti-pattern indexes, preferences, observation guidance, and external reference discovery.
- `knowledge/PATTERN-INDEX.md` and `knowledge/ANTI-PATTERN-INDEX.md` are search indexes only. Shared rule details remain canonical in `DESIGN.md` or `LEARNINGS.md`; site-specific observations remain in the relevant `knowledge/sites/<site>/` profile and study evidence.

## UI Lab operating route

For a normal design/build task:

1. Resolve the current user outcome, target surface/viewport, relevant reference, and minimum acceptance evidence.
2. Read shared `DESIGN.md`, the target study's design file when present, and only the relevant shared learnings.
3. When references are involved, use `handoff/KNOWLEDGE-INDEX.md` / `knowledge/INDEX.md` to select the smallest relevant profile or index, then inspect the actual reference and extract visual grammar before implementation.
4. Keep a new study's design intent and constraints in its own `DESIGN.md`; do not turn one-off preferences into shared policy.
5. Implement the smallest coherent experience that satisfies the task.
6. Verify rendered behavior in a browser when visual, responsive, interaction, or accessibility behavior changed.
7. Record study-specific failures/fixes in `RETROSPECTIVE.md`.
8. Promote a learning to `LEARNINGS.md` only when it is supported and useful beyond the current study.

## UI evidence defaults

Use these as Evidence Budget examples, not mandatory ceremony:

| Credible failure mode | Minimum direct evidence |
| --- | --- |
| Visual hierarchy or fidelity is wrong | Browser screenshot/inspection at the target viewport and state |
| Interaction does not match intent | Exercise the primary interaction and inspect the resulting state |
| Responsive layout collapses or merely compresses | Inspect a meaningful desktop/mobile counterpart and relevant breakpoint behavior |
| Motion hides or breaks the hero | Confirm a useful static first frame and reduced-motion behavior when applicable |
| Primary controls are inaccessible by keyboard | Keyboard/focus check of the changed primary controls |
| Runtime implementation is broken | Browser console/runtime check plus the focused project check command |
| Study contract drifted | `scripts/check-ui-study.ps1` passes for the affected study |

Do not claim visual completion from an HTTP 200, server start, build success, or the static contract check alone. When required browser evidence cannot be obtained, mark that evidence lane blocked and report the limit.

## Design capability routing

Product Design is optional. Use it when explicitly invoked or when the task's primary goal is design exploration, faithful source recreation, or audit. Follow the current focused skill instructions. Typical routing is ideation before choosing a new visual target, image-to-code after selection, URL-to-code for faithful live-URL recreation, and audit for screenshot-grounded critique.

## Workspace boundary

Normal canonical write scope is `ui-lab/`. The canonical Gallery entry is also inside this scope: `index.html`, `catalog.json`, and `viewer.html`. When a task creates or adopts a UI Lab study, registering that study in the integrated catalog is part of the same normal scope. Legacy sibling `refero-*` studies remain read-only references unless the user explicitly widens Writer scope. Preserve unrelated studies and existing design evidence.

Local Gallery verification serves the repository parent so both `/ui-lab/` and sibling legacy studies are reachable. If a legacy catalog target is missing because sparse checkout contains only `ui-lab`, add only the sibling directories named by the catalog with `git sparse-checkout add` from the repository root; this materializes tracked references without granting Writer authority over them.
<!-- END PROJECT-LOCAL EXTENSIONS -->
