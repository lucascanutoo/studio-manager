import type { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function Select({ label, children, ...props }: Props) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-sm font-semibold text-cocoa">{label}</span>
      <select className="min-h-12 w-full rounded-2xl border border-nude bg-white px-4 py-3 text-cocoa outline-none focus:border-rosewood focus:ring-4 focus:ring-blush/60" {...props}>
        {children}
      </select>
    </label>
  );
}
