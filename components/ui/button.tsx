import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold leading-none tracking-[0.01em] transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        primary:
          "border border-[color:rgba(24,49,92,0.9)] bg-[color:var(--accent-strong)] px-5 py-3 text-accent-foreground shadow-[0_14px_34px_rgba(23,46,86,0.24)] hover:-translate-y-px hover:bg-[color:var(--accent-strong-hover)] hover:text-accent-foreground hover:shadow-[0_18px_38px_rgba(23,46,86,0.28)] active:translate-y-0 active:text-accent-foreground active:shadow-[0_12px_28px_rgba(23,46,86,0.22)]",
        secondary:
          "border border-[color:var(--hero-border)] bg-white/72 px-4 py-2.5 text-foreground shadow-[0_12px_28px_rgba(35,68,127,0.08)] backdrop-blur-sm hover:-translate-y-px hover:border-[color:rgba(35,68,127,0.22)] hover:bg-white/90",
        outline:
          "border border-border bg-surface-strong px-4 py-2.5 text-secondary-foreground hover:border-[color:var(--border-strong)] hover:bg-white",
        disabled:
          "cursor-not-allowed border border-border bg-disabled-surface px-5 py-3 text-disabled-foreground shadow-inner",
      },
      size: {
        default: "min-h-11 px-5 py-3 text-[15px]",
        sm: "min-h-9 px-4 py-2.5 text-sm",
        lg: "min-h-12 px-6 py-3.5 text-base",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  style,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const resolvedVariant = variant ?? "primary";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant: resolvedVariant, size, className }))}
      style={
        resolvedVariant === "primary"
          ? { color: "var(--accent-foreground)", ...style }
          : style
      }
      {...props}
    />
  );
}

export { Button, buttonVariants };
