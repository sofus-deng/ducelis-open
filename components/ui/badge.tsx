import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-strong text-secondary-foreground",
        accent:
          "border-[color:rgba(35,68,127,0.18)] bg-[color:rgba(47,90,166,0.08)] text-accent",
        eyebrow:
          "border-[color:var(--hero-border)] bg-[color:var(--hero-chip-background)] px-4 py-[0.55rem] text-[0.8125rem] font-bold uppercase tracking-[0.24em] text-[color:var(--hero-eyebrow)] shadow-[0_12px_28px_rgba(35,68,127,0.08)] backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
