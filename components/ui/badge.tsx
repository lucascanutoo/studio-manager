import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "neutral" | "rose" | "success" | "danger" | "warning";
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset",
        variant === "neutral" && "bg-nude text-cocoa ring-nude",
        variant === "rose" && "bg-blush text-rosewood ring-blush",
        variant === "success" && "bg-green-50 text-green-700 ring-green-100",
        variant === "danger" && "bg-red-50 text-red-700 ring-red-100",
        variant === "warning" && "bg-amber-50 text-amber-700 ring-amber-100",
        className
      )}
      {...props}
    />
  );
}
