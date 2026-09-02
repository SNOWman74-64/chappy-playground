# FOLD — Spatial Card Curtain Retrospective

## Initial hypothesis

Steep's reference grammar presents product surfaces as quiet floating artifacts around editorial copy rather than inside a dashboard shell.

This study asks whether those artifacts can become a spatial browsing system while keeping the original restraint.

The derived hypothesis is:

> **A front / adjacent / rear depth hierarchy can replace a conventional selected-card treatment.**

---

## Source boundary

The following are supported by the Steep reference:
- editorial serif hierarchy,
- near-monochrome paper canvas,
- quiet soft-edged cards,
- rare peach emphasis,
- floating product artifacts,
- low-shadow / hairline visual weight.

The following are **not** claimed as Steep source behavior:
- cylindrical card arrangement,
- curtain-like horizontal rotation,
- front / rear depth scaling,
- velocity-based card selection,
- writing after settle.

Those are the experiment built on top of the visual source.

---

## Combined motion stack

### From Apple Fluid
- horizontal direct manipulation,
- live presentation value as interaction source,
- recent pointer velocity measurement,
- velocity handoff into settle,
- momentum-informed target,
- runtime spring,
- interruption during settle.

### From Daybook Notebook
- left-to-right writing reveal,
- small opacity ramp,
- tiny vertical lift,
- deterministic reveal order.

### From recent spatial studies
- mobile spatial composition must be recomposed,
- navigation motion should settle before long-form content animation,
- no permanent render loop.

---

## Why a curtain rather than a normal carousel

A normal carousel usually communicates hierarchy through screen-space position alone:

```text
previous | selected | next
```

The curtain adds depth:

```text
rear
→ adjacent
→ FRONT
→ adjacent
→ rear
```

The intended benefit is that selection becomes visible from several redundant cues:
- central position,
- larger scale,
- shallower Z depth,
- stronger readability,
- active artifact copy.

This should reduce the need for colored selected states or heavy UI chrome.

---

## Why internal animation waits

Animating five charts and five text blocks while the curtain moves would create two competing tasks:

```text
track spatial selection
+
read changing analytics
```

The study therefore clears reading state on pointer-down.

Only after settle does the selected artifact receive:
- writing reveal,
- selected chart draw,
- stronger semantic priority.

This is another application of:

> **Orient first. Explain second.**

---

## Interaction risk

The main UX risk is not whether the cards can rotate.
It is whether the spatial treatment becomes slower or less legible than a normal carousel.

Questions for device testing:
- Can the user predict which card will settle from their swipe?
- Does momentum ever advance one card farther than expected?
- Are adjacent cards useful context or just visual clutter?
- Is the front card large enough on phone without side cards covering it?
- Does vertical scrolling remain reliable?
- Does a second pointer-down during settling resume smoothly?
- Does the writing delay feel rewarding or merely slow?

---

## Performance strategy

No autoplay rotation is present.
No perpetual animation loop is present.

Runtime work is limited to:
- pointer-driven transforms during direct drag,
- spring frames after release,
- short deterministic writing / chart animation after settle.

Card shadows remain quiet and no animated blur is used.

---

## Current lesson candidates

### Candidate A

> **Spatial hierarchy can act as selection styling.**

If front / adjacent / rear are visually distinct enough, a separate selected-color system may be unnecessary.

### Candidate B

> **Container motion should finish before dense internal motion begins.**

For information-heavy cards, move the object first, then animate its data.

### Candidate C

> **A visual reference and an interaction reference can be composed without pretending they came from the same source.**

Steep supplies appearance and object grammar.
Apple Fluid supplies control behavior.
Daybook supplies writing timing.

These remain candidates until real-device testing confirms the interaction quality.
