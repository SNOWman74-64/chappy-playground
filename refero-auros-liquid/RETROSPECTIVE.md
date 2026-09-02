# TIDE — Bioluminescent Liquid Mass Retrospective

## Initial hypothesis

The Auros reference already creates a liquid / abyssal atmosphere visually through:
- a deep teal surface stack,
- bioluminescent orb imagery,
- restrained cyan-to-lavender edge light,
- depth without drop shadows.

This study asks a separate interaction question:

> Can an object feel more liquid when its **surface and internal mass respond at different speeds**?

---

## What comes from the reference

The visual study preserves:
- Liquid Abyss / Deep / Kelp surface roles,
- sparse cinematic spacing,
- white heading + silver body hierarchy,
- pink as rare luminous punctuation,
- bioluminescent particle-orb identity,
- no shadow-based elevation.

The reference does **not** define the draggable liquid physics used here.

That behavior is deliberately treated as a derived experiment.

---

## Interaction model

```text
pointer down
→ grab live presentation state

pointer drag
→ shell deforms directly
→ particle mass lags slightly

pointer release
→ retain release velocity
→ shell restores toward rest
→ inner mass follows
→ both settle
→ rAF stops
```

This combines the reference atmosphere with the previously validated Apple-fluid continuity rules.

---

## Why not use a perpetual blob morph

A looping blob animation can communicate "organic" or "alive", but it does not necessarily communicate physical relationship to the user.

It also weakens the earlier UI Lab rule that motion should primarily explain state or respond to intent.

This prototype therefore keeps the orb completely static at rest.

The liquid character should appear most strongly **because the user disturbed it**.

---

## Two-layer mass model

### Outer shell
The shell is intentionally fast.

The pointer directly changes the deformation values, with a nonlinear resistance only near larger pulls.

This protects agency.

### Inner particle mass
The particle field receives a smaller target displacement and reaches it through a slower spring.

The intended perception is:

```text
surface moved
→ contents are still catching up
```

The lag is not meant to be realistic fluid simulation. It is a low-dimensional perceptual shortcut.

---

## Velocity as shape information

Release speed is not only used to decide a destination.

Here it also affects the shape itself.

A stronger release velocity produces a small directional wake / elongation while the shell starts restoring.

This is useful because velocity becomes visible evidence of the user's action rather than hidden implementation state.

---

## Surface tension as a UX constraint

The drag is rubber-banded instead of unlimited.

This serves two jobs:
1. prevent path geometry from becoming unstable,
2. make the object feel cohesive before release.

The spring then restores the body to its canonical shape.

The target is not playful jelly motion. The object should feel like one mass with a preferred shape.

---

## Mobile compromise

Free 2D deformation and ordinary vertical page scrolling compete on touch devices.

The current prototype therefore prioritizes predictable navigation:
- horizontal-intent threshold activates the liquid gesture,
- vertical intent stays browser scrolling,
- vertical deformation is reduced after horizontal capture.

This means desktop has a richer two-axis interaction than mobile.

That is intentional unless testing shows that the liquid concept needs full 2D touch freedom badly enough to justify a dedicated interaction region or scroll lock.

---

## Performance choice

The reference describes a much denser particle sphere, but reproducing thousands of DOM / SVG particles is not the purpose of this stage.

The prototype uses a deterministic small particle field inside one SVG clip.

The important layers are:
- shell geometry,
- internal mass offset,
- edge light,
- response timing.

Rendering fidelity can increase later without changing the interaction architecture.

---

## Device feedback after Response 001

The first phone check confirmed that the orb **responds correctly to touch** and that the interaction architecture survives the target mobile browser.

The next user request was not to repair responsiveness, but to make the deformation more exaggerated / gooey.

That distinction matters:

```text
problem was NOT
→ input feels broken or late

next experiment IS
→ can the same responsive control support more dramatic material deformation?
```

So Response 002 deliberately preserves the gesture model and changes the material presentation instead.

---

## Response 002 — Gooey exaggeration

### Change 1: much stronger directional geometry
The first version mostly changed radial distance.

The second version adds separate deformation roles:

```text
leading edge
→ strong radial stretch
→ extra directional tail

perpendicular sides
→ compression

rear edge
→ stronger contraction
```

The goal is to make the shape look **pulled**, not simply larger.

This is a useful distinction for future deformation work:

> Global scaling changes size. Directional stretch + cross-axis compression changes material character.

### Change 2: larger bounded drag range
The nonlinear rubber-band remains, but the usable range is widened.

This gives the shape enough displacement to visibly form a tail without allowing unbounded control-point distortion.

The resistance remains part of the material model rather than merely a safety clamp.

### Change 3: heavier internal mass
The mass target increases from roughly 24% to 34% of shell pull and uses a slower spring.

The particle group also stretches slightly along its own displacement axis.

This creates two separable signals:
- where the shell is being pulled,
- where the internal matter is still flowing.

### Change 4: one intentional overshoot
Response 001 was relatively restrained on release.

Response 002 lowers damping enough to allow the shell to cross the rest shape once when release energy is sufficient.

This should read as stored surface energy being released.

The important constraint is **one characterful overshoot, not repeated wobbling**.

---

## Why geometry is exaggerated before latency

A tempting way to make an interface feel more liquid is to make everything follow the pointer more slowly.

That is risky because the same perceptual cue can be interpreted as input lag.

Response 002 therefore follows this priority:

```text
1. preserve direct boundary response
2. increase asymmetric deformation
3. increase internal phase lag
4. allow a small release overshoot
5. only then consider slower primary response
```

This keeps the Apple-fluid agency rule intact while increasing material expressiveness.

---

## What to test on device now

- Does the stronger leading tail read as gooey / liquid rather than broken geometry?
- Does side compression make the deformation feel directional?
- Is the larger pull range still controllable with one thumb?
- Does the 34% internal-mass follow feel heavier or merely more detached?
- Is the release overshoot visible but limited to one useful beat?
- Does grabbing during overshoot still start from the live rendered state?
- Does vertical scrolling remain predictable on iPhone?
- Does the orb still retain the Auros-like bioluminescent identity when heavily deformed?
- Does the stronger geometry remain smooth enough on the target browser?

---

## General lesson candidates

The original candidate remains:

> **Liquid response can be suggested by layered inertia: direct boundary response, delayed internal mass, velocity-preserving release, and a cohesive restore target.**

A second candidate remains:

> **Do not confuse liquid-looking idle motion with liquid-feeling interaction. Let the user's disturbance create the fluid behavior.**

Response 002 adds a third candidate:

> **To exaggerate material feel without hurting agency, exaggerate directional geometry before slowing direct input.**

The third rule should not be promoted to Shared Learnings until the Gooey version is tested on the real device.
