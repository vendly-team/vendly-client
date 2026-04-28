import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[112px] w-full rounded-2xl glass-input px-4 py-3 text-[15px] tracking-[-0.011em] leading-[1.5] ring-offset-background placeholder:text-muted-foreground/65 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 resize-y",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
