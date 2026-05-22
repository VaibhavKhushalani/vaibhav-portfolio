# Work Experience UI Fix + Smooth Animation — Design Spec

**Date:** 2026-05-22  
**Approach:** A — Fix ScrollTrigger scroll-scrub (preserve horizontal slide structure)

---

## Problem

Work Experience section is not visible / content not rendering. Three root causes:

1. **Pin conflict** — `ScrollTrigger pin:true` does not reliably pin inside the `main` custom scroller. Section scrolls off-screen after snap index 3.
2. **Z-index conflict** — Canvas element (`z-index:3`) sits above track (`z-index:1`) in stacking context. Slide content inside track has `z-index:4` but that is within track's stacking context, not competing with canvas in section's context.
3. **Scrub instant** — `scrub:true` means no smoothing, animation jumps instead of following with inertia.

---

## Architecture

### Sticky Wrapper (pin fix)

Replace `ScrollTrigger pin:true / pinSpacing:false` with CSS `position:sticky`.

WorkExperienceSection renders a wrapper div of height `n × 100vh` (300vh for 3 companies) containing a sticky section (`height:100vh; position:sticky; top:0`). The sticky section stays pinned to viewport top for exactly `(n-1) × 100vh` of scroll — matching the 2 extra snap positions (indices 4 and 5) in `page.js`.

`page.js` wrapper changes `height:'600vh'` → no explicit height (children sum to 600vh naturally: 100+100+100+300).

### ScrollTrigger

- `trigger`: section ref
- `scroller`: `document.querySelector('main')`
- `start`: `'top top'`
- `end`: `() => += (n-1) * window.innerHeight`
- `pin`: `false` (CSS sticky replaces this)
- `pinSpacing`: removed
- `scrub`: `1` (1-second GSAP lag for inertia)

### Z-index Fix

| Element | Old z-index | New z-index |
|---------|-------------|-------------|
| canvas  | 3           | 0           |
| track   | 1           | 1 (unchanged) |
| topBar  | 10          | 10          |
| bottomUI| 10          | 10          |

Canvas moves behind track. Particles render as background texture. Slide content always on top.

### WorkExpParticles Integration

Replace inline Three.js canvas code in `WorkExperienceSection.jsx` with `<WorkExpParticles slideIdx={activeSlideIdx} />`.

Track `activeSlideIdx` via `useState(0)` in the component. In `ScrollTrigger.onUpdate`, compute `Math.round(progress * (n-1))` and call `setSlideIdx(prev => prev !== newIdx ? newIdx : prev)` — guard prevents re-renders on every scroll tick, only fires at discrete slide boundaries (2 times total). Pass as prop to WorkExpParticles to trigger particle burst.

Fix O(n²) bug in `WorkExpParticles.jsx`: currently creates a new `BufferGeometry` per frame per connection line (`scene.add(new THREE.Line(lg, lineMat))`). Replace with pre-allocated `LineSegments` geometry (same approach as the inline canvas code). Up to 60 connections max.

### Animation Timeline (per slide enter, scrubbed)

All animations are added to the GSAP timeline and scrubbed via `ScrollTrigger`. Timings are in timeline units where total duration = `n-1 = 2`.

Per transition `i` (0→1, 1→2):

| Element | Animation | Timeline position |
|---------|-----------|-------------------|
| track | `x: -(i+1)*100vw`, `ease:none` | `i → i+1` |
| prev slide content | `opacity:0, y:-40, filter:blur(6px)`, `duration:0.2, ease:power2.in` | `i+0.30` |
| next period + type tag | `x:-10→0, opacity:0→1`, `duration:0.25` | `i+0.45` |
| next company name | `clipPath:inset(0 100% 0 0)→inset(0 0% 0 0)` + `x:-8→0`, `duration:0.45, ease:expo.out` | `i+0.48` |
| next role text | `y:15→0, opacity:0→1`, `duration:0.3` | `i+0.56` |
| next bullets (stagger) | `x:-15→0, opacity:0→1`, `stagger:0.04, duration:0.35` | `i+0.60` |
| next tech tags (stagger) | `y:6→0, opacity:0→1`, `stagger:0.03, duration:0.25` | `i+0.72` |
| bg image | `scale:1.04→1.0`, `duration:1, ease:power2.out` | `i` |

Slide number decorative element: no animation (static low-opacity element).

Progress bar and dot indicators: driven by `onUpdate` (unchanged, already working).

### Initial state

First slide content: no `gsap.set` needed (visible by default).  
Slides 2+: `gsap.set(el, { opacity:0, y:30 })` — hidden before timeline runs. The `fromTo` in the timeline overrides these values on entry, so no clipPath needed here.

---

## Files Changed

| File | Change |
|------|--------|
| `components/sections/WorkExperienceSection.jsx` | Sticky wrapper, remove pin from ST, scrub:1, enhanced timeline, WorkExpParticles, slideIdx tracking |
| `styles/sections/WorkExperienceSection.module.css` | Section sticky, canvas z-index:0, add blur filter class |
| `components/three/WorkExpParticles.jsx` | Fix O(n²) line geometry — pre-allocate LineSegments |
| `app/page.js` | Remove `height:'600vh'` from wrapper div |

---

## Constraints

- Do NOT change scroll snap logic in `page.js` — goTo/onWheel/onScroll stay exactly the same.
- Do NOT change profile.json experience data.
- Do NOT add new npm packages — Three.js and GSAP already installed.
- Mobile breakpoint: `slideRight` hidden on mobile (existing CSS kept). WorkExpParticles count reduced on mobile (existing isMobile check in component).

---

## Success Criteria

- Section visible when scrolled to (snap index 3).
- Horizontal slides transition correctly at snap index 4 and 5.
- Animations are smooth and tied to scroll scrub.
- Particle burst fires on each slide transition.
- No console errors.
- Mobile layout unaffected.
