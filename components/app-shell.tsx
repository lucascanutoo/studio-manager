"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, CalendarDays, CreditCard, LogOut, Scissors, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Inicio", icon: BarChart3 },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/servicos", label: "Servicos", icon: Scissors },
  { href: "/financeiro", label: "Financeiro", icon: CreditCard }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-linen text-cocoa">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-nude bg-white p-5 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rosewood text-white"><Sparkles size={22} /></div>
          <div>
            <p className="font-bold">Beauty Schedule</p>
            <p className="text-xs text-cocoa/55">Studio admin</p>
          </div>
        </div>
        <nav className="space-y-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold", active ? "bg-blush text-rosewood" : "text-cocoa/70 hover:bg-nude")}>
                <Icon size={19} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={logout} className="absolute bottom-5 left-5 right-5 flex items-center justify-center gap-2 rounded-2xl bg-nude px-4 py-3 text-sm font-bold text-cocoa">
          <LogOut size={18} /> Sair
        </button>
      </aside>
      <main className="mx-auto min-h-screen max-w-6xl px-4 pb-28 pt-5 lg:ml-64 lg:px-8 lg:pb-8">
        {children}
      </main>
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-20 border-t border-nude bg-white/95 px-2 pt-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold", active ? "bg-blush text-rosewood" : "text-cocoa/55")}>
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
