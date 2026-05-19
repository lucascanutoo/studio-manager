import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Card({ className, ...props }, ref) {
  return <div ref={ref} className={cn("rounded-2xl border border-white/80 bg-white/90 p-4 shadow-panel backdrop-blur transition-shadow duration-200 hover:shadow-soft", className)} {...props} />;
});
