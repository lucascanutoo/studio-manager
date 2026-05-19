import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  icon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant = "primary", icon, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blush/70 active:scale-[0.98]",
        variant === "primary" && "bg-rosewood text-white shadow-soft hover:bg-[#884457]",
        variant === "secondary" && "bg-nude text-cocoa hover:bg-blush",
        variant === "outline" && "border border-nude bg-white text-cocoa shadow-sm hover:bg-linen",
        variant === "ghost" && "bg-transparent text-cocoa hover:bg-nude",
        variant === "danger" && "bg-red-50 text-red-700 hover:bg-red-100",
        variant === "success" && "bg-green-50 text-green-700 hover:bg-green-100",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
});
