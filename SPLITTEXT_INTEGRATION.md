# SplitText Component Integration - Nutrio Footer

## Summary

Successfully integrated the SplitText component from React Bits with GSAP animations into the Nutrio footer section of the landing page.

## Changes Made

### 1. **Dependencies Installed**

- `gsap` ^3.15.0
- `@gsap/react` ^2.1.2

Command used:

```bash
pnpm add gsap @gsap/react -w
```

### 2. **SplitText Component Created**

**File:** `packages/modules/src/landing/SplitText.tsx`

A new TypeScript React component that:

- Splits text into individual characters using GSAP's SplitText plugin
- Animates each character with scroll-triggered animations
- Supports customizable animation properties (delay, duration, easing, etc.)
- Includes scroll trigger detection with Intersection Observer
- Properly manages font loading and component lifecycle

**Key Features:**

- Configurable animation properties (from/to states)
- Multiple split types: chars, words, lines, words+chars
- Scroll-based trigger with customizable threshold and margin
- Support for inline styles and custom CSS classes
- Callback function on animation completion

### 3. **Cta Component Updated**

**File:** `packages/modules/src/landing/Cta.tsx`

**Changes:**

- Imported the new SplitText component
- Replaced the letter-by-letter rendering with SplitText component
- Configured SplitText with specific animation properties:
  - Delay: 40ms between characters
  - Duration: 0.8 seconds per character
  - Ease: "power3.out" (smooth easing)
  - Split type: "chars" (individual characters)
  - From state: `{ opacity: 0, y: 50 }` (invisible, 50px down)
  - To state: `{ opacity: 1, y: 0 }` (visible, original position)
  - Threshold: 0.15 (trigger when 15% visible)
  - Root margin: "-50px" (adjust trigger timing)

- Increased mobile footer text padding:
  - Changed from `py-6` to `py-8 sm:py-10`
  - Adds better spacing to the copyright text on mobile devices

## Component Usage

```tsx
<SplitText
  text="NUTRIO."
  tag="span"
  className="font-black text-white leading-none uppercase pointer-events-none"
  style={{ fontWeight: 950, fontSize: "clamp(100px, 18vw, 350px)" }}
  delay={40}
  duration={0.8}
  ease="power3.out"
  splitType="chars"
  from={{ opacity: 0, y: 50 }}
  to={{ opacity: 1, y: 0 }}
  threshold={0.15}
  rootMargin="-50px"
/>
```

## Animation Behavior

- **Trigger:** Component animates when it enters the viewport (15% visible threshold)
- **Effect:** Each character of "NUTRIO." animates in sequentially with a 40ms delay
- **Easing:** Smooth power3.out easing for natural, organic feel
- **Duration:** 0.8 seconds per character
- **Reset:** Animation only plays once (ScrollTrigger: once=true)

## Desktop vs Mobile

- **Desktop (md+):** Large animated "NUTRIO." text fills the footer space
  - Font size scales responsively: clamp(100px, 18vw, 350px)
  - Each character animates in with SplitText
- **Mobile (below md):** Simple copyright text is displayed
  - Increased vertical padding (py-8 sm:py-10) prevents cramped appearance
  - Hidden NUTRIO text element (display: none on mobile)

## File Structure

```
packages/modules/src/landing/
├── SplitText.tsx          (new)
├── Cta.tsx               (updated)
└── useScrollReveal.tsx   (existing)
```

## Browser Support

- Modern browsers with ES2020+ support
- Requires JavaScript enabled for animations
- GSAP handles cross-browser compatibility

## Performance Considerations

- SplitText animations use GSAP's force3D and willChange properties for GPU acceleration
- ScrollTrigger manages animation triggering efficiently
- Font loading is properly detected before animation starts
- Animation instances are cleaned up on component unmount

## Testing

The integration was tested by:

1. Building the web application successfully
2. Running the development server without errors
3. Verifying component renders correctly in the browser
4. Confirming DOM structure shows split characters (N, U, T, R, I, O, .)

---

**Integration Date:** 2026-05-26
**Status:** ✅ Complete and Working
