import { Star } from "lucide-react";

/**
 * Storybook section divider: a hairline, a small gold star, a hairline.
 */
export function OrnamentDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-2" aria-hidden="true">
      <span className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-accent/50" />
      <Star className="h-4 w-4 text-accent fill-accent/40" />
      <span className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-accent/50" />
    </div>
  );
}
