"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "admin@beautyschedule.com", password: "123456" });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.message ?? "Nao foi possivel entrar.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f7dce4,transparent_35%),#fffaf7] px-5 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rosewood text-white shadow-soft">
            <Sparkles size={26} />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rosewood">Beauty Schedule</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-cocoa">Agenda e gestao para beleza</h1>
          <p className="mt-3 text-base text-cocoa/70">Entre para organizar clientes, agenda, atendimentos e faturamento em uma experiencia pensada para celular.</p>
        </div>

        <form onSubmit={submit} className="rounded-[1.6rem] border border-white bg-white/90 p-5 shadow-soft backdrop-blur">
          <div className="mb-5 grid grid-cols-2 rounded-full bg-nude p-1">
            <button type="button" onClick={() => setMode("login")} className={`rounded-full py-3 text-sm font-semibold ${mode === "login" ? "bg-white text-rosewood shadow" : "text-cocoa/60"}`}>Login</button>
            <button type="button" onClick={() => setMode("register")} className={`rounded-full py-3 text-sm font-semibold ${mode === "register" ? "bg-white text-rosewood shadow" : "text-cocoa/60"}`}>Cadastro</button>
          </div>
          {mode === "register" && <Input label="Nome" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />}
          <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <Input label="Senha" type="password" icon={<Eye size={18} />} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          {error && <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button className="w-full" disabled={loading} icon={<LockKeyhole size={18} />}>{loading ? "Entrando..." : mode === "login" ? "Entrar" : "Criar conta"}</Button>
          <p className="mt-4 text-center text-xs text-cocoa/60">Seed: admin@beautyschedule.com / 123456</p>
        </form>
      </section>
    </main>
  );
}
