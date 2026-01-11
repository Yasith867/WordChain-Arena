import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant = "primary", isLoading, fullWidth, children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-primary text-white shadow-lg shadow-primary/25 border-transparent hover:bg-primary/90",
      secondary: "bg-secondary text-white hover:bg-secondary/80 border-transparent",
      outline: "bg-transparent border-2 border-primary/50 text-primary hover:bg-primary/10 hover:border-primary",
      ghost: "bg-transparent text-muted-foreground hover:text-white hover:bg-white/5 border-transparent",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "relative inline-flex items-center justify-center rounded-xl px-6 py-3.5 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed glow-button",
          variants[variant],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {children}
      </button>
    );
  }
);

NeonButton.displayName = "NeonButton";
