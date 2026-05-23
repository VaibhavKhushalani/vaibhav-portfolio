# Screen Loader — Design Spec
_Date: 2026-05-23_

## Overview

A fullscreen intro overlay shown once on first page load. Features a dark liquid-glass aesthetic. User clicks START → cracks radiate from click point → glass shatters into flying polygon shards → page is revealed. The click also unmutes the VideoIntro video.

---

## Visual Design

**Glass state (before click):**
- Fixed fullscreen, `z-index: 10000` (above everything)
- `background: rgba(8, 8, 8, 0.82)` + `backdrop-filter: blur(20px) saturate(1.4)`
- Animated CSS gradient drift (slow, subtle — simulates liquid surface movement)
- Portfolio page rendered beneath but blurred and inaccessible
- Center: name or monogram (VK) as ambient label, below it the START button
- START button: outlined pill, `border: 1px solid var(--accent)`, uppercase tracked text
- No scroll, no interaction except the START button

---

## Interaction Flow

### 0. Immediate on click (0ms)
- Dispatch `window.dispatchEvent(new CustomEvent('loader-dismissed'))` — must happen synchronously inside the click handler, within the user gesture, so Safari grants audio unlock
- VideoIntro unmutes immediately; animation follows

### 1. Crack phase (0–280ms)
- Record the button's bounding rect center as `(cx, cy)`
- Create a full-screen SVG overlay (pointer-events: none) above the glass
- Generate 10 crack paths in JS: each starts at `(cx, cy)`, branches 1–2 times at random angles, varying lengths (15–40% of viewport dimension)
- Animate all paths simultaneously via GSAP `stroke-dashoffset`: `total-length → 0` over 280ms, `ease: power2.out`
- Crack stroke: `rgba(255,255,255,0.7)`, width 1.5px

### 2. Shatter phase (280–780ms)
- Replace the single overlay div with ~18 shard divs
- Each shard: `position: absolute; inset: 0` with a unique `clip-path: polygon(...)` that together tile 100% of the screen (pre-defined set, see implementation notes)
- Each shard shares the same glass background (`rgba(8,8,8,0.82)` + `backdrop-filter: blur(20px)`)
- GSAP stagger (30ms between shards, random order):
  - `translateX`: ±(50–200px) away from center
  - `translateY`: +(50–300px) downward bias (gravity feel)
  - `rotate`: ±(5–25deg)
  - `opacity`: 1 → 0
  - `duration: 0.5s`, `ease: power2.in`

### 3. Dismiss (780ms+)
- Remove all shard + SVG elements from DOM
- Call `onDismiss()` callback — `setShowLoader(false)` in page.js — ScreenLoader unmounts

---

## VideoIntro Integration

Add to VideoIntro's `useEffect` block:

```js
useEffect(() => {
  function onLoaderDismissed() {
    const v = videoRef.current
    if (!v) return
    v.muted = false
    setMuted(false)
    if (showHint) dismissHint()
  }
  window.addEventListener('loader-dismissed', onLoaderDismissed)
  return () => window.removeEventListener('loader-dismissed', onLoaderDismissed)
}, [showHint])
```

This runs inside a gesture context (the click that fired `loader-dismissed` is the same event loop) — Safari requires audio unlock inside a user gesture. The custom event fires synchronously after the GSAP timeline completes, which is still within the gesture chain.

> **Safari note:** Event fires at click time (step 0), not after animation — this keeps it inside the user gesture window required for audio unlock. Animation runs after.

---

## Files

| File | Change |
|------|--------|
| `components/sections/ScreenLoader.jsx` | New — loader component |
| `styles/sections/ScreenLoader.module.css` | New — loader styles |
| `app/page.js` | Add `showLoader` state, mount ScreenLoader above Navbar |
| `components/sections/VideoIntro.jsx` | Add `loader-dismissed` listener, unmute video |

---

## Implementation Notes

### Pre-defined shard polygons (18 shards, % coordinates)

Shards are defined as `clip-path: polygon(x1% y1%, x2% y2%, x3% y3%)` triangles. They must collectively cover 0–100% of both axes with no visible gaps. Use a 3×3 grid subdivided into triangles (2 triangles per cell = 18 total for a 3×3 grid).

Example for top-left cell (0–33% x, 0–33% y):
- Shard A: `polygon(0% 0%, 33% 0%, 0% 33%)`
- Shard B: `polygon(33% 0%, 33% 33%, 0% 33%)`

Repeat for all 9 cells. This guarantees full coverage.

### Crack path generation

```js
function generateCracks(cx, cy, n = 10) {
  const paths = []
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.6
    const len   = (0.15 + Math.random() * 0.25) * Math.max(window.innerWidth, window.innerHeight)
    let x = cx, y = cy
    let d = `M ${x} ${y}`
    const segments = 2 + Math.floor(Math.random() * 2)
    for (let s = 0; s < segments; s++) {
      const segLen = len / segments * (0.7 + Math.random() * 0.6)
      const jitter = (Math.random() - 0.5) * 0.4  // slight direction drift
      x += Math.cos(angle + jitter) * segLen
      y += Math.sin(angle + jitter) * segLen
      d += ` L ${x} ${y}`
    }
    paths.push(d)
  }
  return paths
}
```

### page.js changes

```jsx
const [showLoader, setShowLoader] = useState(true)

// In JSX, above Navbar:
{showLoader && <ScreenLoader onDismiss={() => setShowLoader(false)} />}
```

ScreenLoader receives `onDismiss` callback. Fires it after shatter animation completes.

---

## Constraints

- No `sessionStorage` persistence — loader shows every page load (portfolio context: intentional)
- Backdrop-filter not supported in Firefox < 103 — fallback: `background: rgba(8,8,8,0.95)` (solid dark)
- GSAP already loaded — no new animation library needed
- Three.js NOT used for this component — pure CSS/SVG/GSAP
