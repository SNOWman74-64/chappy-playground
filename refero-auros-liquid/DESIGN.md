# TIDE — Bioluminescent Liquid Mass Study

## Sources

### Visual / composition source
- Refero Auros style: `https://styles.refero.design/style/21cfe0c1-778d-4613-9f47-a5718eb929b3`

Source-derived visual grammar used in this study:
- near-black teal canvas,
- teal-only depth stack (`#011d1c → #012624 → #003734`),
- no drop shadows for elevation,
- bioluminescent particle orb as the defining atmospheric object,
- cyan / white particle light with restrained lavender-pink edge accents,
- pure white mainly for headings,
- silver / mist body copy,
- medium-weight geometric display typography,
- 16px card radius and 6px small-control radius,
- chromatic gradients rationed to signature accent moments rather than large generic backgrounds.

### Motion source
- `refero-apple-fluid`
- Apple Design skill used by that study

Motion principles reused:
- immediate response,
- direct manipulation,
- release velocity handoff,
- continuous presentation state,
- interruptibility from the live rendered value,
- runtime spring instead of a prescribed release animation,
- no permanent idle animation loop,
- reduced-motion fallback.

---

## Goal

Test whether a UI object can feel liquid because its **response layers have different inertia**, rather than because it runs a perpetual blob morph.

The interaction hypothesis is:

```text
pointer pull
→ shell responds first
→ internal mass follows slightly later

release
→ velocity survives
→ shell elongates once
→ surface tension restores shell
→ inner mass catches up
→ animation loop stops
```

Important source distinction:

> The deformable / inertial liquid interaction is **not claimed as part of the Auros reference**. It is a new behavior experiment built from Auros' deep-water visual grammar and the existing Apple-fluid motion rules.

---

## 1. Visual Grammar

### Surface stack
Use only the Auros teal depth family for structural surfaces:

```text
Liquid Deep  #011d1c
Liquid Abyss #012624
Liquid Kelp  #003734
```

Depth should read as `deeper / shallower water`, not `card + shadow`.

No drop shadow is required for the hero orb or the analytic surfaces.

### Color roles
- `#ffffff` → headings / strongest navigation text
- `#bbc7c6` → body / secondary copy
- `#edfffe` → emphasized body / labels
- `#fde9ff` → rare luminous statistic / particle punctuation
- cyan-to-pink light → optical event only

Do not make the whole page aurora-gradient colored.

### Orb
The hero orb is a deterministic SVG approximation of the reference's bioluminescent particle sphere.

The study intentionally uses far fewer particles than a production 3D render because the goal is behavior, not particle-rendering fidelity.

A static shell exists before runtime particle generation so the hero still has a no-JS visual state.

---

## 2. Response Layers

The liquid feeling is split into two physical-looking presentation layers.

### Layer A — shell
The outer boundary owns direct manipulation.

While dragging:

```text
pointer displacement
→ bounded pull value
→ blob geometry
```

The user should not wait for a spring to catch up while their finger is still down.

### Layer B — internal mass
The particle field does **not** track the pointer 1:1.

Instead:

```text
shell pull × small ratio
→ internal mass target
→ slower spring
```

This intentional phase lag suggests weight inside the shell.

The lag must remain small enough that the control still feels responsive.

---

## 3. Shape Deformation

The shell is a closed SVG path built from a small set of radial points.

Pull direction affects the radius asymmetrically:
- leading edge expands,
- trailing edge compresses slightly,
- the entire shape shifts only a small fraction of the pointer displacement.

This keeps the object cohesive instead of turning the interaction into moving a loose sticker around the screen.

Release speed adds a small directional wake / elongation term to the path.

The release deformation is derived from current velocity, not a separate keyframed squash animation.

---

## 4. Rubber-Banded Direct Manipulation

Pointer displacement is bounded with a smooth nonlinear response instead of a hard clamp.

Conceptually:

```text
small pull
→ almost direct

large pull
→ increasing resistance
```

This prevents extreme path distortion while preserving continuous feedback.

The constraint should feel like surface tension beginning before release.

---

## 5. Velocity Handoff

Recent pointer velocity becomes the restoring shell spring's initial velocity.

```text
pointer velocity
→ shell velocity
→ release elongation
→ restoring spring
```

A fast release should produce a visibly stronger first stretch than a slow release.

The release must not restart from zero velocity.

---

## 6. Surface Tension / Restore

After release, the shell target is the undeformed resting body.

Use a high-damping spring:
- cohesive,
- little or no decorative bouncing,
- allowed to overshoot only when the user's release energy naturally causes it.

The inner mass continues following the shell with its own slower spring.

The useful perceptual sequence is:

```text
shell starts restoring
→ internal particles are still displaced
→ particles catch up
→ both settle together
```

---

## 7. Interruptibility

A new pointer-down during restoration must:
1. stop the current runtime loop,
2. preserve the live shell deformation,
3. preserve the live internal mass displacement,
4. use that current presentation state as the new drag origin.

Never jump back to the perfect circle before accepting new input.

This is inherited directly from the Apple-fluid interaction rule.

---

## 8. Idle State

There is no automatic rotation, breathing loop, shimmer loop, or perpetual blob morph.

```text
interaction / restore
→ requestAnimationFrame active

fully settled
→ requestAnimationFrame = 0
```

The untouched state should already look complete.

This keeps "liquid" associated with response rather than decorative motion noise.

---

## 9. Touch / Mobile

Desktop pointer can deform the orb in two dimensions.

On coarse-pointer mobile:
- preserve `touch-action: pan-y`,
- wait for an intent threshold,
- horizontal intent activates liquid manipulation,
- vertical intent remains normal page scroll,
- vertical deformation is intentionally reduced after horizontal capture.

This is a UX compromise: unrestricted two-axis liquid dragging is less important than keeping ordinary page scrolling predictable.

The orb is recomposed larger in the mobile layout rather than simply using the desktop two-column composition at a smaller scale.

---

## 10. Accessibility

### Reduced Motion
Direct user manipulation may remain because it is immediate feedback.

On release:
- restore immediately,
- remove extended spring travel,
- keep the stable static orb available.

### Keyboard
Arrow keys apply a small deformation impulse and then restore through the same runtime path.

### Visual dependency
The liquid state is expressed through geometry and motion, not color alone.

---

## 11. Performance

No permanent animation loop.

The prototype uses:
- one SVG shell path,
- one matching clip path,
- one rim path,
- one sheen path,
- ~100 deterministic SVG particle circles,
- one transformed particle group.

During drag:
- shell geometry renders directly from pointer events,
- rAF runs only while the internal mass still has lag to resolve.

After release:
- rAF runs until shell + internal mass settle,
- then stops completely.

Avoid heavy SVG filters, animated blur and thousands of DOM particles in this phase.

---

## 12. Source vs Derived Knowledge

### Directly supported by Auros reference
- abyssal teal color system,
- bioluminescent data-orb imagery,
- cyan / pale / lavender-pink optical accent,
- depth through surface color rather than shadow,
- sparse cinematic layout,
- restrained color usage.

### Derived in this study
- direct shell deformation,
- internal-mass lag,
- release-velocity elongation,
- surface-tension restoration,
- interactive liquid as layered inertia.

### Reused from previous UI Lab studies
- no-JS critical first frame,
- event-driven rAF,
- Apple-fluid continuity / interruptibility,
- mobile gesture-intent separation.

---

## 13. Gooey Response 002 — Exaggerate Geometry, Not Input Latency

The first device check confirmed that the orb responds to touch, but the initial deformation was intentionally conservative. The second pass tests stronger liquid character without slowing direct manipulation.

### Core rule

> **If the interaction already feels direct, exaggerate the geometry before exaggerating the input lag.**

The shell still receives the live pointer-derived pull immediately. Gooey character is increased through four independent presentation controls.

### A. Lead stretch
The edge facing the pull direction expands much more strongly.

Starting relationship:

```text
v1 lead radial stretch ≈ 10.5% of base radius
v2 lead radial stretch ≈ 22% of base radius
+
extra directional tail ≈ 11.5% of base radius
```

The tail term is directional rather than a global scale, so the orb appears pulled rather than enlarged.

### B. Cross-axis compression
The sides perpendicular to the pull compress slightly while the rear also contracts.

```text
lead     → elongate
sides    → squeeze
rear     → compress
```

This is important because `scale(1.2)` alone reads as zoom. Liquid deformation needs anisotropy.

### C. Heavier internal mass
The particle mass target is increased from roughly `24%` of shell pull to `34%`, while its spring becomes slower.

The mass group also receives a small directional stretch / cross-axis squash based on its own displaced position.

```text
shell = immediate shape
mass  = later translation + later shape response
```

Do not delay the shell merely to make the mass feel heavier.

### D. One release overshoot
The shell restore spring is made slightly underdamped rather than fully critically damped.

Goal:
- preserve release velocity,
- visibly pass the rest shape once,
- settle quickly after that,
- never become perpetual jelly wobble.

Current starting point:

```text
shell stiffness ≈ 108
shell damping   ≈ 16

mass stiffness  ≈ 49
mass damping    ≈ 10.8
```

These are perceptual tuning values, not physical simulation constants.

### Larger but still bounded pull
The rubber-band limits are widened rather than removed.

```text
horizontal effective bound ≈ 152px
vertical effective bound   ≈ 122px before mobile reduction
```

The large-pull resistance remains essential. Without it, stronger deformation can quickly become path instability rather than gooey cohesion.

### What must remain unchanged
Even in the exaggerated version:
- direct shell response remains immediate,
- vertical mobile scroll keeps priority until horizontal intent is clear,
- release velocity is preserved,
- restoration is interruptible,
- idle animation loop remains zero.

The visual response may be dramatic; control semantics stay conservative.

---

## Success Criteria

1. Pulling the orb feels directly connected to the pointer.
2. The inner particles feel heavier than the shell without making the control feel delayed.
3. Fast and slow releases visibly differ because velocity survives release.
4. Restoration feels cohesive rather than bouncy or gelatinous for its own sake.
5. A restoring orb can be grabbed again without a jump.
6. Mobile vertical scrolling remains predictable.
7. Idle runtime performs no animation work.
8. The visual still reads as Auros-like deep-water bioluminescence rather than a generic rainbow blob.
9. Gooey Response 002 reads as stronger deformation rather than slower controls.
10. The single overshoot adds material character without becoming repeated wobble.
