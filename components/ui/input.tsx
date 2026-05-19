import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
};

export function Input({ label, icon, className, ...props }: Props) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-sm font-semibold text-cocoa">{label}</span>
      <span className="flex min-h-12 items-center rounded-2xl border border-nude bg-white px-4 focus-within:border-rosewood focus-within:ring-4 focus-within:ring-blush/60">
        <input className={cn("w-full bg-transparent py-3 text-cocoa outline-none placeholder:text-cocoa/35", className)} {...props} />
        {icon && <span className="text-cocoa/45">{icon}</span>}
      </span>
    </label>
  );
}
