import { cn } from "@/lib/utils";

export function Loading({ label = "Carregando...", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 rounded-2xl bg-white/80 px-4 py-5 text-sm font-semibold text-cocoa/60 shadow-sm backdrop-blur", className)}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-blush border-t-rosewood" />
      {label}
    </div>
  );
}
