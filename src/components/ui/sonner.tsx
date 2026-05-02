import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const isMobile = useIsMobile();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={isMobile ? "top-center" : "bottom-right"}
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/95 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-black/[0.06] group-[.toaster]:rounded-2xl group-[.toaster]:shadow-[0_4px_8px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.08)] group-[.toaster]:p-4 group-[.toaster]:text-[14px] group-[.toaster]:tracking-[-0.011em]",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-[13px] group-[.toast]:tracking-[-0.006em]",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-full group-[.toast]:px-3 group-[.toast]:py-1.5",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-full group-[.toast]:px-3 group-[.toast]:py-1.5",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
