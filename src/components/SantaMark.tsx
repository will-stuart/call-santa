interface SantaMarkProps {
  className?: string;
}

/**
 * Crafted Santa hat brand mark — replaces emoji art across the app.
 * Uses design tokens so it stays on-theme.
 */
export function SantaMark({ className = "h-8 w-8" }: SantaMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Cap */}
      <path
        d="M12 40C12 26 22 14 36 12c8-1.2 14 2 16 8 1.4 4.2-.4 8-4 10l-6 3.4C34 37.6 24 39.2 12 40Z"
        fill="hsl(var(--santa-red))"
      />
      {/* Cap fold shadow */}
      <path
        d="M12 40c10-.8 19-2.2 26-5.6l4.8-2.7c-6.4 4.9-18.6 7.4-30.8 8.3Z"
        fill="hsl(350 60% 30%)"
        opacity="0.55"
      />
      {/* Brim */}
      <rect
        x="7"
        y="37"
        width="40"
        height="11"
        rx="5.5"
        fill="hsl(var(--santa-white))"
      />
      <rect
        x="7"
        y="37"
        width="40"
        height="4"
        rx="2"
        fill="hsl(var(--foreground))"
        opacity="0.35"
      />
      {/* Pompom */}
      <circle cx="52" cy="22" r="7" fill="hsl(var(--santa-white))" />
      <circle cx="50" cy="20" r="2.4" fill="hsl(var(--foreground))" opacity="0.5" />
    </svg>
  );
}
