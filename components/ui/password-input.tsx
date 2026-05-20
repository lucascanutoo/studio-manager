"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function PasswordInput({ label, className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-sm font-semibold text-cocoa">{label}</span>
      <span className="flex min-h-12 items-center rounded-2xl border border-nude/80 bg-white px-4 shadow-sm transition focus-within:border-rosewood focus-within:ring-4 focus-within:ring-blush/60">
        <input
          className={cn("w-full bg-transparent py-3 pr-3 text-cocoa outline-none placeholder:text-cocoa/35", className)}
          type={showPassword ? "text" : "password"}
          {...props}
        />
        <button
          type="button"
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setShowPassword((current) => !current)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-cocoa/50 transition hover:bg-nude hover:text-cocoa focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blush/70 active:scale-95"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
  );
}
