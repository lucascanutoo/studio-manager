import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: ReactNode;
};

export function Button({ className, variant = "primary", icon, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-rosewood text-white shadow-soft hover:bg-[#884457]",
        variant === "secondary" && "bg-nude text-cocoa hover:bg-blush",
        variant === "ghost" && "bg-transparent text-cocoa hover:bg-nude",
        variant === "danger" && "bg-red-50 text-red-700 hover:bg-red-100",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
