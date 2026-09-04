import {
  Children,
  cloneElement,
  createElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";

export type RevealVariant =
  | "up"
  | "rise"
  | "blur"
  | "scale"
  | "mask"
  | "stage";

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  /** Animation delay in PROGRESS units (0–1). Default 0. */
  delay?: number;
  /** When using stagger mode, fraction of progress between siblings (0–1). */
  stagger?: number;
  /** Pixel offset before viewport bottom that primes the reveal. Default 80. */
  offset?: number;
  /** Re-trigger as element scrolls back out of view. */
  repeat?: boolean;
  as?: ElementType;
  className?: string;
}

/**
 * Scroll-linked reveal.
 *
 * Instead of toggling an `in` class once and letting a CSS transition run
 * on its own clock, we sample the element's position in the viewport on
 * every scroll frame and turn that into a 0→1 progress value, which drives
 * opacity / transform / blur directly. The animation therefore breathes
 * with the user's scroll — it feels like the elements are being pulled
 * into place, not popping in on a fixed timer.
 *
 * Progress curve: as the top of the element moves from
 *     (viewport.bottom + offset)  →  (viewport.bottom - travel)
 * progress goes 0 → 1, then sticks at 1 while the element is on screen.
 * If `repeat` is on, scrolling the element back below the trigger line
 * resets progress, so the entrance plays again on next scroll-in.
 */
const Reveal = ({
  children,
  variant = "up",
  delay = 0,
  stagger,
  offset = 140,
  repeat = true,
  as = "div",
  className = "",
}: RevealProps) => {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect users who don't want motion.
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setProgress(1);
      return;
    }

    let raf = 0;
    let lastP = -1;
    const TRAVEL = 240; // px of scroll that maps to 0→1 progress

    const sample = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;

      // 0 when the top of the element is still `offset` below the viewport
      // bottom, 1 once it has travelled `TRAVEL` further up.
      const start = vh - offset;
      const end = start - TRAVEL;
      let p = (start - r.top) / (start - end);
      p = Math.max(0, Math.min(1, p));

      // If user scrolls all the way past, keep at 1 — don't snap back.
      if (!repeat && p < lastP) p = lastP;
      if (Math.abs(p - lastP) > 0.001) {
        lastP = p;
        setProgress(p);
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(sample);
    };

    sample();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [offset, repeat]);

  // Soft ease so the progress curve doesn't feel linear/mechanical.
  const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic

  const buildStyle = (localDelay: number): CSSProperties => {
    // Map raw progress through delay window into 0→1 for this item.
    const span = 1 - Math.min(localDelay, 0.95);
    const local = ease(Math.max(0, Math.min(1, (progress - localDelay) / span)));
    return variantStyle(variant, local);
  };

  if (typeof stagger === "number") {
    const items = Children.toArray(children);
    return createElement(
      as,
      { ref, className },
      items.map((child, i) => {
        const itemDelay = delay + i * stagger;
        const style = buildStyle(itemDelay);
        if (isValidElement(child)) {
          const el = child as ReactElement<{
            className?: string;
            style?: CSSProperties;
          }>;
          return cloneElement(el, {
            key: el.key ?? i,
            style: { ...(el.props.style ?? {}), ...style },
          });
        }
        return (
          <span key={i} style={style}>
            {child}
          </span>
        );
      })
    );
  }

  return createElement(
    as,
    { ref, className, style: buildStyle(delay) },
    children
  );
};

/* ------------------------------------------------------------------ */
/*  Variant interpolation                                              */
/* ------------------------------------------------------------------ */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function variantStyle(variant: RevealVariant, t: number): CSSProperties {
  const willChange = "opacity, transform, filter";
  switch (variant) {
    case "up":
      return {
        opacity: t,
        transform: `translate3d(0, ${lerp(18, 0, t)}px, 0)`,
        willChange,
      };
    case "rise":
      return {
        opacity: t,
        transform: `translate3d(0, ${lerp(14, 0, t)}px, 0)`,
        willChange,
      };
    case "blur":
      return {
        opacity: t,
        transform: `translate3d(0, ${lerp(22, 0, t)}px, 0)`,
        filter: `blur(${lerp(10, 0, t)}px)`,
        willChange,
      };
    case "scale":
      return {
        opacity: t,
        transform: `scale(${lerp(0.97, 1, t)})`,
        willChange,
      };
    case "mask": {
      const pct = Math.round(lerp(0, 100, t));
      const mask = `linear-gradient(90deg, #000 0%, #000 ${pct}%, transparent ${pct}%)`;
      return {
        opacity: lerp(0.6, 1, t),
        transform: `translate3d(0, ${lerp(6, 0, t)}px, 0)`,
        WebkitMaskImage: mask,
        maskImage: mask,
        willChange: "opacity, transform, -webkit-mask-image, mask-image",
      };
    }
    case "stage":
      return {
        opacity: lerp(0.55, 1, t),
        transform: `translate3d(0, ${lerp(28, 0, t)}px, 0) scale(${lerp(
          0.992,
          1,
          t
        )})`,
        filter: `blur(${lerp(4, 0, t)}px)`,
        willChange,
      };
  }
}

export default Reveal;
