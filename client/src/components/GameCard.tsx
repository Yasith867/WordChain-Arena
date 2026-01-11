import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface GameCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GameCard({ children, className, delay = 0 }: GameCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(
        "glass-panel rounded-2xl p-6 md:p-8 w-full max-w-md mx-auto relative overflow-hidden",
        className
      )}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 opacity-80" />
      {children}
    </motion.div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-2xl md:text-3xl font-bold mb-2 text-white", className)}>
      {children}
    </h2>
  );
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-muted-foreground mb-6 text-sm md:text-base", className)}>
      {children}
    </p>
  );
}
