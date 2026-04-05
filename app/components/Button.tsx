import * as React from "react";

type ButtonColor = "primary" | "alt" | "red" | "gold" | "silver" | "bronze";

type ButtonVariant = "solid" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";
type IconPosition = "left" | "right";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ButtonColor;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
}

function cn(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(" ");
}

const BRUTAL_SHADOW = "shadow-[2px_2px_0_oklch(var(--border))]";
const BRUTAL_SHADOW_HOVER = "hover:shadow-[1px_1px_0_oklch(var(--border))]";
const BRUTAL_PRESS =
  "hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";

const COLOR_STYLES: Record<ButtonColor, Record<ButtonVariant, string>> = {
  primary: {
    solid: `border-2 border-[oklch(var(--border))] bg-[oklch(var(--primary))] text-[oklch(var(--background))] ${BRUTAL_SHADOW} ${BRUTAL_SHADOW_HOVER} ${BRUTAL_PRESS}`,
    outline: `border-2 border-[oklch(var(--primary))] bg-transparent text-[oklch(var(--primary))] ${BRUTAL_SHADOW} ${BRUTAL_SHADOW_HOVER} ${BRUTAL_PRESS}`,
    ghost:
      "border-2 border-transparent bg-transparent text-[oklch(var(--primary))] hover:bg-[oklch(var(--primary))]/10",
  },
  alt: {
    solid: `border-2 border-[oklch(var(--border))] bg-[oklch(var(--alt))] text-[oklch(var(--background))] ${BRUTAL_SHADOW} ${BRUTAL_SHADOW_HOVER} ${BRUTAL_PRESS}`,
    outline: `border-2 border-[oklch(var(--border))] bg-transparent text-[oklch(var(--text))] ${BRUTAL_SHADOW} ${BRUTAL_SHADOW_HOVER} ${BRUTAL_PRESS}`,
    ghost:
      "border-2 border-transparent bg-transparent text-[oklch(var(--text))] hover:bg-[oklch(var(--text))]/10",
  },
  red: {
    solid: `border-2 border-[oklch(var(--border))] bg-[oklch(var(--red-bg))] text-[oklch(var(--red-text))] ${BRUTAL_SHADOW} ${BRUTAL_SHADOW_HOVER} ${BRUTAL_PRESS}`,
    outline: `border-2 border-[oklch(var(--red-bg))] bg-transparent text-[oklch(var(--red-bg))] ${BRUTAL_SHADOW} ${BRUTAL_SHADOW_HOVER} ${BRUTAL_PRESS}`,
    ghost:
      "border-2 border-transparent bg-transparent text-[oklch(var(--red-bg))] hover:bg-[oklch(var(--red-bg))]/10",
  },
  gold: {
    solid: `border-2 border-[oklch(var(--border))] bg-[oklch(var(--gold-bg))] text-[oklch(var(--gold-text))] ${BRUTAL_SHADOW} ${BRUTAL_SHADOW_HOVER} ${BRUTAL_PRESS}`,
    outline: `border-2 border-[oklch(var(--gold-bg))] bg-transparent text-[oklch(var(--gold-bg))] ${BRUTAL_SHADOW} ${BRUTAL_SHADOW_HOVER} ${BRUTAL_PRESS}`,
    ghost:
      "border-2 border-transparent bg-transparent text-[oklch(var(--gold-bg))] hover:bg-[oklch(var(--gold-bg))]/10",
  },
  silver: {
    solid: `border-2 border-[oklch(var(--border))] bg-[oklch(var(--silver-bg))] text-[oklch(var(--silver-text))] ${BRUTAL_SHADOW} ${BRUTAL_SHADOW_HOVER} ${BRUTAL_PRESS}`,
    outline: `border-2 border-[oklch(var(--silver-bg))] bg-transparent text-[oklch(var(--silver-bg))] ${BRUTAL_SHADOW} ${BRUTAL_SHADOW_HOVER} ${BRUTAL_PRESS}`,
    ghost:
      "border-2 border-transparent bg-transparent text-[oklch(var(--silver-bg))] hover:bg-[oklch(var(--silver-bg))]/10",
  },
  bronze: {
    solid: `border-2 border-[oklch(var(--border))] bg-[oklch(var(--bronze-bg))] text-[oklch(var(--bronze-text))] ${BRUTAL_SHADOW} ${BRUTAL_SHADOW_HOVER} ${BRUTAL_PRESS}`,
    outline: `border-2 border-[oklch(var(--bronze-bg))] bg-transparent text-[oklch(var(--bronze-bg))] ${BRUTAL_SHADOW} ${BRUTAL_SHADOW_HOVER} ${BRUTAL_PRESS}`,
    ghost:
      "border-2 border-transparent bg-transparent text-[oklch(var(--bronze-bg))] hover:bg-[oklch(var(--bronze-bg))]/10",
  },
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      color = "primary",
      variant = "solid",
      size = "md",
      icon,
      iconPosition = "left",
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const base =
      "inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-lg font-bold transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[oklch(var(--primary))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    const variantClass = COLOR_STYLES[color][variant];

    const content = (
      <>
        {icon && iconPosition === "left" && (
          <span className="inline-flex items-center justify-center">
            {icon}
          </span>
        )}
        <span className="whitespace-nowrap">{children}</span>
        {icon && iconPosition === "right" && (
          <span className="inline-flex items-center justify-center">
            {icon}
          </span>
        )}
      </>
    );

    return (
      <button
        ref={ref}
        type={type}
        className={cn(base, sizeClass[size], variantClass, className)}
        {...props}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = "Button";
