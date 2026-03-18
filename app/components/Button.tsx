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

const COLOR_STYLES: Record<ButtonColor, Record<ButtonVariant, string>> = {
  primary: {
    solid:
      "bg-[oklch(var(--primary))] text-[oklch(var(--text))] hover:bg-[oklch(var(--primary))]/85",
    outline:
      "bg-transparent shadow-none border border-[oklch(var(--primary))]/80 text-[oklch(var(--primary))] hover:bg-[oklch(var(--primary))]/15",
    ghost:
      "bg-transparent shadow-none text-[oklch(var(--primary))] hover:bg-[oklch(var(--primary))]/15",
  },
  alt: {
    solid:
      "bg-[oklch(var(--alt))]/70 text-[oklch(var(--text))] hover:bg-[oklch(var(--alt))]/55",
    outline:
      "bg-transparent shadow-none border border-[oklch(var(--text))]/40 text-[oklch(var(--text))] hover:bg-[oklch(var(--text))]/10",
    ghost:
      "bg-transparent shadow-none text-[oklch(var(--text))] hover:bg-[oklch(var(--text))]/10",
  },
  red: {
    solid:
      "bg-[oklch(var(--red-bg))] text-[oklch(var(--red-text))] hover:bg-[oklch(var(--red-bg))]/85",
    outline:
      "bg-transparent shadow-none border border-[oklch(var(--red-bg))]/80 text-[oklch(var(--red-bg))] hover:bg-[oklch(var(--red-bg))]/15",
    ghost:
      "bg-transparent shadow-none text-[oklch(var(--red-bg))] hover:bg-[oklch(var(--red-bg))]/15",
  },
  gold: {
    solid:
      "bg-[oklch(var(--gold-bg))] text-[oklch(var(--gold-text))] hover:bg-[oklch(var(--gold-bg))]/85",
    outline:
      "bg-transparent shadow-none border border-[oklch(var(--gold-bg))]/80 text-[oklch(var(--gold-bg))] hover:bg-[oklch(var(--gold-bg))]/15",
    ghost:
      "bg-transparent shadow-none text-[oklch(var(--gold-bg))] hover:bg-[oklch(var(--gold-bg))]/15",
  },
  silver: {
    solid:
      "bg-[oklch(var(--silver-bg))] text-[oklch(var(--silver-text))] hover:bg-[oklch(var(--silver-bg))]/85",
    outline:
      "bg-transparent shadow-none border border-[oklch(var(--silver-bg))]/80 text-[oklch(var(--silver-bg))] hover:bg-[oklch(var(--silver-bg))]/15",
    ghost:
      "bg-transparent shadow-none text-[oklch(var(--silver-bg))] hover:bg-[oklch(var(--silver-bg))]/15",
  },
  bronze: {
    solid:
      "bg-[oklch(var(--bronze-bg))] text-[oklch(var(--bronze-text))] hover:bg-[oklch(var(--bronze-bg))]/85",
    outline:
      "bg-transparent shadow-none border border-[oklch(var(--bronze-bg))]/80 text-[oklch(var(--bronze-bg))] hover:bg-[oklch(var(--bronze-bg))]/15",
    ghost:
      "bg-transparent shadow-none text-[oklch(var(--bronze-bg))] hover:bg-[oklch(var(--bronze-bg))]/15",
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
      "inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-full font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(var(--primary))/0.5] disabled:pointer-events-none disabled:opacity-50";
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
