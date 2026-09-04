import { useEffect, useRef, type ReactNode } from "react";

interface StackedPanelProps {
  children: ReactNode;
  index: number;
  total: number;
}

/**
 * Sticky stacking panel.
 * Each panel pins to the top of the viewport, and the next sibling
 * scrolls up to cover it. While being covered, this panel scales down
 * and dims slightly to create a "card pushed back" depth effect.
 */
const StackedPanel = ({ children, index, total }: StackedPanelProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      rafRef.current = null;
      const wrap = wrapperRef.current;
      const inner = innerRef.current;
      if (!wrap || !inner) return;

      const next = wrap.nextElementSibling as HTMLElement | null;
      const isLast = index === total - 1 || !next;
      if (isLast) {
        inner.style.transform = "";
        inner.style.opacity = "";
        inner.style.filter = "";
        inner.style.borderRadius = "";
        return;
      }

      const nextRect = next.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 = next is fully below viewport, 1 = next has fully covered
      const progress = Math.min(1, Math.max(0, 1 - nextRect.top / vh));

      const scale = 1 - 0.06 * progress;
      const opacity = 1 - 0.45 * progress;
      const brightness = 1 - 0.4 * progress;
      const radius = 28 * progress;

      inner.style.transform = `scale(${scale})`;
      inner.style.opacity = String(opacity);
      inner.style.filter = `brightness(${brightness})`;
      inner.style.borderRadius = `${radius}px`;
    };

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [index, total]);

  return (
    <div ref={wrapperRef} className="sticky top-0">
      <div
        ref={innerRef}
        className="will-change-transform"
        style={{ transformOrigin: "center top" }}
      >
        {children}
      </div>
    </div>
  );
};

export default StackedPanel;
