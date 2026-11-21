import { useMemo } from "react";

interface SnowflakeData {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  blur: number;
}

/**
 * Soft drifting snow — blurred light dots instead of emoji glyphs,
 * with depth (near flakes larger and sharper, far flakes small and hazy).
 */
export function Snowfall() {
  const snowflakes = useMemo<SnowflakeData[]>(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const size = Math.random() * 7 + 2;
      return {
        id: i,
        left: Math.random() * 100,
        size,
        duration: Math.random() * 12 + 9,
        delay: Math.random() * 12,
        opacity: Math.random() * 0.5 + 0.25,
        // smaller flakes get more blur to fake distance
        blur: size < 4 ? 2 : size < 6 ? 1 : 0,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full animate-snowfall"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            opacity: flake.opacity,
            filter: flake.blur ? `blur(${flake.blur}px)` : undefined,
            background:
              "radial-gradient(circle, hsl(var(--snow)) 0%, hsl(var(--snow) / 0.4) 70%, transparent 100%)",
          }}
        />
      ))}
    </div>
  );
}
