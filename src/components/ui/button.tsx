import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[14px] font-medium tracking-[-0.011em] ring-offset-background transition-[background-color,box-shadow,transform,color,border-color] duration-200 ease-[cubic-bezier(0.28,0.11,0.32,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.06)] hover:bg-primary/92 hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.1)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.06)] hover:bg-destructive/92 hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.1)]",
        outline:
          "border border-input bg-background/80 backdrop-blur-md text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.04)] hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.06)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.04)] hover:bg-secondary/85 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground rounded-xl",
        link:
          "text-primary underline-offset-[5px] hover:underline rounded-none px-0 active:scale-100",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-12 px-7 text-[15px]",
        xl: "h-[52px] px-8 text-[16px]",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
