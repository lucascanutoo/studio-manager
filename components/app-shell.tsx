"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, CreditCard, LogOut, Scissors, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Inicio", icon: BarChart3 },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/servicos", label: "Servicos", icon: Scissors },
  { href: "/financeiro", label: "Financeiro", icon: CreditCard }
];

type StudioTheme = {
  name: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
};

function hexToRgb(hex?: string | null, fallback = "159 83 102") {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return fallback;
  const value = hex.slice(1);
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [studio, setStudio] = useState<StudioTheme | null>(null);

  useEffect(() => {
    function loadStudio() {
      fetch("/api/auth/me").then((response) => response.json()).then((data) => setStudio(data.user?.studio ?? null)).catch(() => setStudio(null));
    }

    loadStudio();
    window.addEventListener("studio-theme-updated", loadStudio);
    return () => window.removeEventListener("studio-theme-updated", loadStudio);
  }, []);

  const themeStyle = useMemo(() => ({
    "--color-primary-rgb": hexToRgb(studio?.primaryColor),
    "--color-secondary-rgb": hexToRgb(studio?.secondaryColor, "248 223 231")
  }) as React.CSSProperties, [studio]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-shell text-cocoa" style={themeStyle}>
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-rosewood text-white shadow-soft">
            {studio?.logoUrl ? <img src={studio.logoUrl} alt={`Logo ${studio.name}`} className="h-full w-full object-cover" /> : <Sparkles size={22} />}
          </div>
          <div>
            <p className="font-bold text-ink">{studio?.name ?? "Beauty Schedule"}</p>
            <p className="text-xs text-cocoa/55">Studio admin</p>
          </div>
        </div>
        <nav className="space-y-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.99]", active ? "bg-blush text-rosewood shadow-sm" : "text-cocoa/70 hover:bg-nude")}>
                <Icon size={19} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={logout} className="absolute bottom-5 left-5 right-5 flex items-center justify-center gap-2 rounded-2xl bg-nude px-4 py-3 text-sm font-bold text-cocoa transition hover:bg-blush">
          <LogOut size={18} /> Sair
        </button>
      </aside>
      <main className="mx-auto min-h-screen max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:ml-64 lg:px-8 lg:pb-8 lg:pt-8">
        {children}
      </main>
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-20 border-t border-white/70 bg-white/90 px-2 pt-2 shadow-[0_-18px_40px_rgba(92,71,68,0.08)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold transition active:scale-95", active ? "bg-blush text-rosewood shadow-sm" : "text-cocoa/55")}>
                <Icon size={21} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
