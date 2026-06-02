"use client";

import React, { useLayoutEffect, useRef, useCallback, useEffect } from "react";
import type { ReactNode } from "react";

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
  children,
  itemClassName = "",
}) => (
  <div
    className={`scroll-stack-card relative w-full my-8 rounded-[32px] box-border origin-top will-change-transform ${itemClassName}`.trim()}
    style={{
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
    }}
  >
    {children}
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  onStackComplete?: () => void;
}

/**
 * ScrollStack — adapted from React Bits.
 *
 * JITTER FIX: Positions are cached on mount/resize so that
 * getBoundingClientRect() (which returns the *transformed* position)
 * is never called inside the hot scroll path.
 */
const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = "",
  itemDistance = 80,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
  onStackComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const cardsRef = useRef<HTMLElement[]>([]);
  const rafRef = useRef<number | null>(null);

  // ── Cached layout data (computed once, updated on resize) ──
  const cachedOffsetsRef = useRef<number[]>([]);
  const cachedEndOffsetRef = useRef<number>(0);

  // ── Interpolation targets for smooth animation ──
  const targetTransformsRef = useRef<
    { translateY: number; scale: number; rotation: number; blur: number }[]
  >([]);
  const currentTransformsRef = useRef<
    { translateY: number; scale: number; rotation: number; blur: number }[]
  >([]);
  const isAnimatingRef = useRef(false);

  const parsePercentage = useCallback(
    (value: string | number, containerHeight: number) => {
      if (typeof value === "string" && value.includes("%")) {
        return (parseFloat(value) / 100) * containerHeight;
      }
      return parseFloat(value as string);
    },
    []
  );

  /**
   * Measure & cache the *untransformed* offsetTop of every card.
   * We temporarily reset transforms so getBoundingClientRect gives the
   * natural document-flow position.
   */
  const cachePositions = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;

    // Save & strip transforms
    const saved = cards.map((c) => c.style.transform);
    cards.forEach((c) => {
      c.style.transform = "none";
    });

    // Force a single synchronous layout
    const offsets = cards.map((c) => {
      const rect = c.getBoundingClientRect();
      return rect.top + window.scrollY;
    });

    const endEl = containerRef.current?.querySelector(
      ".scroll-stack-end"
    ) as HTMLElement | null;
    const endOffset = endEl
      ? endEl.getBoundingClientRect().top + window.scrollY
      : 0;

    // Restore transforms
    cards.forEach((c, i) => {
      c.style.transform = saved[i] || "";
    });

    cachedOffsetsRef.current = offsets;
    cachedEndOffsetRef.current = endOffset;
  }, []);

  /**
   * Compute desired transforms from cached positions (no layout reads).
   */
  const computeTargets = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;

    const scrollTop = window.scrollY;
    const vh = window.innerHeight;
    const stackPosPx = parsePercentage(stackPosition, vh);
    const scaleEndPx = parsePercentage(scaleEndPosition, vh);
    const offsets = cachedOffsetsRef.current;
    const endTop = cachedEndOffsetRef.current;

    const targets = cards.map((_, i) => {
      const cardTop = offsets[i] ?? 0;
      const triggerStart = cardTop - stackPosPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPx;
      const pinStart = triggerStart;
      const pinEnd = endTop - vh / 2;

      // Scale progress
      let scaleProgress = 0;
      if (scrollTop >= triggerEnd) scaleProgress = 1;
      else if (scrollTop > triggerStart)
        scaleProgress =
          (scrollTop - triggerStart) / (triggerEnd - triggerStart);

      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount
        ? i * rotationAmount * scaleProgress
        : 0;

      // Blur
      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cards.length; j++) {
          const jTop = offsets[j] ?? 0;
          const jTrigger = jTop - stackPosPx - itemStackDistance * j;
          if (scrollTop >= jTrigger) topCardIndex = j;
        }
        if (i < topCardIndex) {
          blur = Math.max(0, (topCardIndex - i) * blurAmount);
        }
      }

      // Pin / translate
      let translateY = 0;
      if (scrollTop >= pinStart && scrollTop <= pinEnd) {
        translateY = scrollTop - cardTop + stackPosPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPosPx + itemStackDistance * i;
      }

      return { translateY, scale, rotation, blur };
    });

    targetTransformsRef.current = targets;

    // Fire stack-complete callback
    if (cards.length > 0) {
      const last = cards.length - 1;
      const lastOffset = offsets[last] ?? 0;
      const lastPinStart =
        lastOffset - stackPosPx - itemStackDistance * last;
      const lastPinEnd = endTop - vh / 2;
      const isInView = scrollTop >= lastPinStart && scrollTop <= lastPinEnd;
      if (isInView && !stackCompletedRef.current) {
        stackCompletedRef.current = true;
        onStackComplete?.();
      } else if (!isInView && stackCompletedRef.current) {
        stackCompletedRef.current = false;
      }
    }
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    onStackComplete,
    parsePercentage,
  ]);

  /**
   * Smooth interpolation loop — lerps current → target each frame
   * to eliminate jitter and produce buttery-smooth motion.
   */
  const LERP_FACTOR = 0.12;

  const animationLoop = useCallback(() => {
    const cards = cardsRef.current;
    const targets = targetTransformsRef.current;
    const currents = currentTransformsRef.current;

    if (!cards.length || !targets.length) {
      isAnimatingRef.current = false;
      return;
    }

    let needsMore = false;

    cards.forEach((card, i) => {
      if (!card || !targets[i]) return;
      const t = targets[i];
      const c = currents[i] ?? {
        translateY: 0,
        scale: 1,
        rotation: 0,
        blur: 0,
      };

      // Lerp each value
      const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
      const newY = lerp(c.translateY, t.translateY, LERP_FACTOR);
      const newScale = lerp(c.scale, t.scale, LERP_FACTOR);
      const newRot = lerp(c.rotation, t.rotation, LERP_FACTOR);
      const newBlur = lerp(c.blur, t.blur, LERP_FACTOR);

      // Snap if close enough
      const snapThreshold = 0.05;
      const finalY =
        Math.abs(newY - t.translateY) < snapThreshold ? t.translateY : newY;
      const finalScale =
        Math.abs(newScale - t.scale) < 0.0005 ? t.scale : newScale;
      const finalRot =
        Math.abs(newRot - t.rotation) < snapThreshold ? t.rotation : newRot;
      const finalBlur =
        Math.abs(newBlur - t.blur) < snapThreshold ? t.blur : newBlur;

      currents[i] = {
        translateY: finalY,
        scale: finalScale,
        rotation: finalRot,
        blur: finalBlur,
      };

      // Check if we still need to animate
      if (
        Math.abs(finalY - t.translateY) > 0.01 ||
        Math.abs(finalScale - t.scale) > 0.0001 ||
        Math.abs(finalRot - t.rotation) > 0.01 ||
        Math.abs(finalBlur - t.blur) > 0.01
      ) {
        needsMore = true;
      }

      // Apply
      const roundY = Math.round(finalY * 10) / 10;
      const roundScale = Math.round(finalScale * 10000) / 10000;
      const roundRot = Math.round(finalRot * 100) / 100;

      card.style.transform = `translate3d(0, ${roundY}px, 0) scale(${roundScale}) rotate(${roundRot}deg)`;
      card.style.filter =
        finalBlur > 0.1
          ? `blur(${Math.round(finalBlur * 10) / 10}px)`
          : "";
    });

    if (needsMore) {
      rafRef.current = requestAnimationFrame(animationLoop);
    } else {
      isAnimatingRef.current = false;
    }
  }, []);

  const startAnimation = useCallback(() => {
    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      rafRef.current = requestAnimationFrame(animationLoop);
    }
  }, [animationLoop]);

  const handleScroll = useCallback(() => {
    computeTargets();
    startAnimation();
  }, [computeTargets, startAnimation]);

  // ── Setup ──
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = Array.from(
      container.querySelectorAll(".scroll-stack-card")
    ) as HTMLElement[];
    cardsRef.current = cards;

    // Init current transforms
    currentTransformsRef.current = cards.map(() => ({
      translateY: 0,
      scale: 1,
      rotation: 0,
      blur: 0,
    }));

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = "transform, filter";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
      (card.style as any).webkitBackfaceVisibility = "hidden";
      card.style.transform = "translateZ(0)";
    });

    // Initial cache and first render
    cachePositions();
    computeTargets();
    // Set initial transforms instantly (no lerp on first paint)
    const targets = targetTransformsRef.current;
    cards.forEach((card, i) => {
      const t = targets[i];
      if (!t) return;
      currentTransformsRef.current[i] = { ...t };
      card.style.transform = `translate3d(0, ${t.translateY}px, 0) scale(${t.scale}) rotate(${t.rotation}deg)`;
      card.style.filter =
        t.blur > 0.1 ? `blur(${Math.round(t.blur * 10) / 10}px)` : "";
    });

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      isAnimatingRef.current = false;
      stackCompletedRef.current = false;
      cardsRef.current = [];
    };
  }, [itemDistance, cachePositions, computeTargets, handleScroll]);

  // ── Recache on resize ──
  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cachePositions();
        computeTargets();
        startAnimation();
      }, 100);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }, [cachePositions, computeTargets, startAnimation]);

  return (
    <div className={`relative w-full ${className}`.trim()} ref={containerRef}>
      <div className="scroll-stack-inner">
        {children}
        {/* Spacer so the last pin can release cleanly */}
        <div className="scroll-stack-end w-full h-40" />
      </div>
    </div>
  );
};

export default ScrollStack;
