"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollableRow({ children }) {
  const trackRef = useRef(null);
  const animationRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);
    el.addEventListener("scroll", updateArrows);
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", updateArrows);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  function scrollByAmount(direction) {
    const el = trackRef.current;
    if (!el) return;

    const start = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const target = Math.max(0, Math.min(start + el.clientWidth * 0.8 * direction, maxScroll));
    const duration = 600;
    const startTime = performance.now();

    cancelAnimationFrame(animationRef.current);

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      el.scrollLeft = start + (target - start) * eased;
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      }
    }

    animationRef.current = requestAnimationFrame(step);
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-1)}
          aria-label="Scroll left"
          className="absolute -left-3 top-1/3 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-line bg-paper md:flex"
        >
          &#8592;
        </button>
      )}
      <div ref={trackRef} className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {children}
      </div>
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(1)}
          aria-label="Scroll right"
          className="absolute -right-3 top-1/3 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-line bg-paper md:flex"
        >
          &#8594;
        </button>
      )}
    </div>
  );
}