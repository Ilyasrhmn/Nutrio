"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Lightweight scroll-reveal hook using IntersectionObserver.
 * 
 * Performance-first approach:
 * - No scroll event listeners (uses IntersectionObserver → runs off main thread)
 * - CSS transforms only (GPU-accelerated, no layout thrashing)
 * - `once: true` by default → observer disconnects after reveal (zero ongoing cost)
 * - `will-change` hint added via CSS for compositor optimization
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: {
    threshold?: number;
    rootMargin?: string;
    once?: boolean;
  } = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0.15, rootMargin = "0px 0px -60px 0px", once = true } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, isVisible];
}

/**
 * CSS class builder for scroll-reveal animations.
 * Uses only transform + opacity for GPU-only compositing.
 */
export function revealClasses(
  isVisible: boolean,
  variant: "up" | "left" | "right" | "scale" | "fade" = "up",
  delay: number = 0
): string {
  const base = "transition-all duration-700 ease-out";
  const willChange = "will-change-[transform,opacity]";
  
  const delayClass = delay > 0 ? `delay-[${delay}ms]` : "";

  const variants = {
    up: isVisible
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-8",
    left: isVisible
      ? "opacity-100 translate-x-0"
      : "opacity-0 -translate-x-8",
    right: isVisible
      ? "opacity-100 translate-x-0"
      : "opacity-0 translate-x-8",
    scale: isVisible
      ? "opacity-100 scale-100"
      : "opacity-0 scale-95",
    fade: isVisible
      ? "opacity-100"
      : "opacity-0",
  };

  return `${base} ${willChange} ${variants[variant]} ${delayClass}`.trim();
}
