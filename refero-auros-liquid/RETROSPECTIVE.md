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

## What to test on device

- Does the outer shape feel attached to the finger?
- Does the internal lag read as "mass" or just "latency"?
- Is the difference between a slow release and a fast flick perceptible?
- Is the restoring motion too bouncy, too stiff, or convincingly cohesive?
- Can the orb be grabbed during restoration without a discontinuity?
- Does the coarse-pointer horizontal-intent rule preserve normal iPhone scrolling?
- Are ~100 particles enough to retain the Auros-like bioluminescent identity?
- Does the orb remain smooth enough on the target phone browser?

---

## General lesson candidate

If device testing supports it, the candidate reusable rule is:

> **Liquid response can be suggested by layered inertia: direct boundary response, delayed internal mass, velocity-preserving release, and a cohesive restore target.**

A second candidate is:

> **Do not confuse liquid-looking idle motion with liquid-feeling interaction. Let the user's disturbance create the fluid behavior.**

Neither should be promoted to Shared Learnings until the real interaction has been tested.
