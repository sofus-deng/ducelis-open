import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-3xl border border-border bg-surface shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-sm",
  {
    variants: {
      tone: {
        default: "",
        emphasis: "shadow-[0_18px_48px_rgba(35,68,127,0.08)]",
        muted: "bg-surface-strong shadow-none",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

type CardElement = "div" | "article" | "section";

type CardProps = React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & {
    as?: CardElement;
  };

function Card({ className, tone, as = "div", ...props }: CardProps) {
  const Comp = as;

  return (
    <Comp
      data-slot="card"
      className={cn(cardVariants({ tone }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("flex flex-col gap-2 p-7", className)} {...props} />;
}

type CardTitleElement = "h2" | "h3" | "div";

type CardTitleProps = React.ComponentProps<"h2"> & {
  as?: CardTitleElement;
};

function CardTitle({ className, as = "div", ...props }: CardTitleProps) {
  const Comp = as;

  return (
    <Comp
      data-slot="card-title"
      className={cn("text-2xl font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("leading-8 text-secondary-foreground", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("p-7 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center p-7 pt-0", className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cardVariants };
