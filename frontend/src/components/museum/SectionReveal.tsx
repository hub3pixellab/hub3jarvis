import { useEffect, useRef, type ReactNode } from "react";

interface SectionRevealProps {
  children: ReactNode;
  /** Re-trigger every time an item re-enters the viewport */
  repeat?: boolean;
  /** Per-step stagger in ms (applied to siblings revealed in the same batch) */
  step?: number;
}

/**
 * Per-element scroll reveal.
 *
 * Walks the meaningful block-level descendants and gives each its own
 * IntersectionObserver, so every element animates only when IT actually
 * crosses the viewport — works correctly even inside sticky / pinned
 * parents (where the whole section can otherwise be considered "visible"
 * for the entire duration of the pin).
 *
 * Sibling items that enter together get a small stagger so they cascade
 * in rather than popping in unison.
 */
const SectionReveal = ({
  children,
  repeat = true,
  step = 110,
}: SectionRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const selector =
      "h1, h2, h3, h4, .eyebrow, blockquote, p, article, li, figure, picture, video, img, button, a, [data-reveal]";

    const candidates = Array.from(
      root.querySelectorAll<HTMLElement>(selector)
    );

    // Keep only top-level candidates so we don't double-animate nested
    // (e.g. animate the card wrapper, not also the <img> inside it).
    const items = candidates.filter(
      (el) => !candidates.some((other) => other !== el && other.contains(el))
    );

    items.forEach((el) => {
      el.classList.add("reveal-item");
    });

    // Track recently-revealed elements so siblings entering in the same
    // tick get a cascading delay.
    let recentBatch: HTMLElement[] = [];
    let batchTimer: number | null = null;

    const flushBatch = () => {
      recentBatch.forEach((el, i) => {
        el.style.setProperty("--reveal-delay", `${i * step}ms`);
        el.classList.add("is-visible");
      });
      recentBatch = [];
      batchTimer = null;
    };

    const observers: IntersectionObserver[] = [];

    items.forEach((el) => {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const target = entry.target as HTMLElement;
            if (entry.isIntersecting) {
              if (target.classList.contains("is-visible")) return;
              recentBatch.push(target);
              if (batchTimer !== null) window.clearTimeout(batchTimer);
              batchTimer = window.setTimeout(flushBatch, 30);
            } else if (repeat) {
              target.classList.remove("is-visible");
              target.style.removeProperty("--reveal-delay");
            }
          });
        },
        {
          threshold: 0.15,
          // Trigger slightly before fully entering so the animation
          // feels responsive instead of "late".
          rootMargin: "0px 0px -8% 0px",
        }
      );
      io.observe(el);
      observers.push(io);
    });

    return () => {
      if (batchTimer !== null) window.clearTimeout(batchTimer);
      observers.forEach((io) => io.disconnect());
      items.forEach((el) => {
        el.classList.remove("reveal-item", "is-visible");
        el.style.removeProperty("--reveal-delay");
      });
    };
  }, [step, repeat]);

  return (
    <div ref={ref} className="section-reveal">
      {children}
    </div>
  );
};

export default SectionReveal;
