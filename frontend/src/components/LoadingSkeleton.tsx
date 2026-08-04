/* ──────────────────────────────────────────────
 *  LoadingSkeleton – pulse-animated placeholder
 * ────────────────────────────────────────────── */

type Props = {
  lines?: number;
  /** visual variant */
  variant?: "text" | "card" | "table-row";
};

/** Deterministic varying widths for text skeleton lines. */
const TEXT_WIDTHS = ["92%", "78%", "85%", "65%", "95%", "72%", "88%", "60%"];

export function LoadingSkeleton({ lines = 3, variant = "text" }: Props) {
  return (
    <div className={`skeleton skeleton--${variant}`} aria-busy="true" aria-label="Loading">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="skeleton__line"
          style={{
            width: variant === "text" ? TEXT_WIDTHS[i % TEXT_WIDTHS.length] : "100%",
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  );
}
