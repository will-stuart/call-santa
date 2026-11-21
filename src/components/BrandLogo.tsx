import logoDark from "@/assets/logo-hat-oneline.png";
import logoLight from "@/assets/logo-hat-oneline-light.png";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  priority?: boolean;
}

/**
 * "Call Santa" storybook logo. Automatically swaps between the cream-on-dark
 * and crimson-on-light variants based on the active theme.
 */
export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  const loading = priority ? "eager" : "lazy";
  return (
    <>
      <img
        src={logoDark}
        alt="Call Santa"
        width={1849}
        height={469}
        loading={loading}
        className={cn("hidden dark:block", className)}
      />
      <img
        src={logoLight}
        alt="Call Santa"
        width={1849}
        height={469}
        loading={loading}
        className={cn("dark:hidden", className)}
      />
    </>
  );
}
