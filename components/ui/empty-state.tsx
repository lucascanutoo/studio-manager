import { CalendarX } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-nude bg-white/70 px-5 py-8 text-center">
      <CalendarX className="mx-auto mb-3 text-rosewood" />
      <h3 className="font-bold text-cocoa">{title}</h3>
      <p className="mt-1 text-sm text-cocoa/60">{description}</p>
    </div>
  );
}
