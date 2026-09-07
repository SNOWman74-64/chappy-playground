# Retrospective

## What worked

Browser inspection completed on 2026-09-07 in the Codex In-app Browser at `http://127.0.0.1:4173/afterhours-run-club/`. Phone checks used 390 × 844 and a narrow 320 px viewport; desktop checks used a 1440 × 900 viewport override. These are browser viewport checks, not physical-device tests.

- The portrait hero retained its headline, photograph, navigation, and primary action at both phone widths. Earlier DOM measurements showed matching client/scroll widths of 375/375 px at 390 px and 305/305 px at 320 px.
- Desktop screenshots showed a readable photographic hero, full navigation, a two-column map/details layout, the green manifesto, the community photograph, and the FAQ/footer without visible horizontal clipping.
- CITY LOOP and PARK SIDE selection updated the selected state, map, title, distance, pace, meeting information, and live announcement. The participation sheet inherited the selected course.
- Submitting without a pace focused the required field and did not show success. A completed CITY LOOP submission produced the matching local demo pass. Restart retained the selections and focused the route field.
- The phone menu opened and navigated to FAQ while closing the menu. The first FAQ expanded with its answer and a visible focus outline. The fixed phone action appeared while browsing and hid near the footer.
- After the keyboard fix, fresh accessibility state and screenshots confirmed Shift+Tab from the sheet's close button reached the last form button, Tab returned to the close button, and Escape closed the sheet and restored focus to the initiating route action.
- `node --check afterhours-run-club/app.js` exited successfully. The study contract checker reported `UI_STUDY_CHECK_PASS: afterhours-run-club`.

## What felt wrong

Hiding the route-heading line break on mobile initially joined the two words. Early modal keyboard testing also produced inconsistent focus evidence, so the focus boundary needed an explicit check instead of relying on an assumed native behavior.

## Fixes

- Inserted a literal space before the route-heading line break; the mobile heading now reads as separate words.
- Added Tab/Shift+Tab wrapping among currently visible, enabled dialog controls. Verified both boundary directions and Escape/focus restoration using the browser after reloading the revised script.
- Retained the backdrop-boundary check so clicking blank space inside a dialog does not close it.

## Open questions

- Runtime console/error-log collection was blocked by the tool's automatic safety check. Console cleanliness is therefore unverified; successful visible interactions and the JavaScript syntax check are not substitutes for that evidence.
- Reduced-motion rules were inspected in CSS: they remove transitions/animations, smooth scrolling, and the community-image hover transform. Runtime reduced-motion emulation was not tested.
- Physical iPhone/Android behavior, virtual-keyboard layout, and assistive-technology speech were not tested.
- A real club service would need actual event data and a separately authorized registration backend. This study provides a clearly labeled local demo without sending or storing participant input.

## Candidates for shared learnings

Candidate observations are the portrait poster composition, route headings that survive a change in line-break behavior, and a fixed action that yields to the hero/footer. Keep them local to this study until they recur in another study; no shared LEARNINGS changes were made.
