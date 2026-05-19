"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Power, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { formatCurrency } from "@/lib/format";

type Service = { id: string; name: string; description?: string; priceCents: number; durationMinutes: number; active: boolean };

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Service | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [message, setMessage] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", durationMinutes: "45", active: true });

  async function load() {
    const data = await fetch("/api/services").then((res) => res.json());
    setServices(data.services ?? []);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!deactivateTarget) return;
    cancelButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !deactivating) setDeactivateTarget(null);
      if (event.key !== "Tab" || !modalRef.current) return;

      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")).filter((element) => !element.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [deactivateTarget, deactivating]);

  function edit(service: Service) {
    setEditing(service);
    setForm({ name: service.name, description: service.description ?? "", price: String((service.priceCents / 100).toFixed(2)).replace(".", ","), durationMinutes: String(service.durationMinutes), active: service.active });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetch(editing ? `/api/services/${editing.id}` : "/api/services", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setEditing(null);
    setForm({ name: "", description: "", price: "", durationMinutes: "45", active: true });
    load();
  }

  async function deactivate() {
    if (!deactivateTarget) return;
    setDeactivating(true);
    const response = await fetch(`/api/services/${deactivateTarget.id}`, { method: "DELETE" });
    setDeactivating(false);
    if (!response.ok) return;
    setServices((current) => current.map((service) => service.id === deactivateTarget.id ? { ...service, active: false } : service));
    if (editing?.id === deactivateTarget.id) {
      setEditing(null);
      setForm({ name: "", description: "", price: "", durationMinutes: "45", active: true });
    }
    setDeactivateTarget(null);
    setMessage("Servico desativado com sucesso.");
  }

  return (
    <>
      <PageHeader title="Servicos" description="Tabela de precos, duracao e status." />
      {message && <p className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</p>}
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <h2 className="mb-4 font-bold">{editing ? "Editar servico" : "Novo servico"}</h2>
          <form onSubmit={submit}>
            <Input label="Nome do servico" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Textarea label="Descricao" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Input label="Preco" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="85,00" />
            <Input label="Duracao em minutos" type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} required />
            <label className="mb-4 flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Ativo</label>
            <Button className="w-full" icon={editing ? <Save size={18} /> : <Plus size={18} />}>{editing ? "Salvar" : "Adicionar"}</Button>
          </form>
        </Card>
        <section className="space-y-3">
          {services.length ? services.map((service) => (
            <Card key={service.id}>
              <div className="flex items-start justify-between gap-3">
                <button className="min-w-0 flex-1 text-left" onClick={() => edit(service)}>
                  <p className="font-bold">{service.name}</p>
                  <p className="text-sm text-cocoa/60">{service.description || "Sem descricao"}</p>
                  <p className="mt-2 text-sm font-semibold">{formatCurrency(service.priceCents)} - {service.durationMinutes} min</p>
                </button>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${service.active ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>{service.active ? "Ativo" : "Inativo"}</span>
              </div>
              {service.active && <Button className="mt-3 w-full" variant="secondary" icon={<Power size={18} />} onClick={() => { setMessage(""); setDeactivateTarget(service); }}>Desativar</Button>}
            </Card>
          )) : <EmptyState title="Sem servicos" description="Cadastre os servicos do studio." />}
        </section>
      </div>

      {deactivateTarget && (
        <div className="fixed inset-0 z-30 flex items-end bg-cocoa/40 p-4 backdrop-blur-sm transition-opacity sm:items-center sm:justify-center" role="presentation">
          <Card
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="deactivate-service-title"
            aria-describedby="deactivate-service-description"
            className="w-full animate-[modalIn_160ms_ease-out] shadow-soft sm:max-w-md"
          >
            <h2 id="deactivate-service-title" className="text-lg font-bold">Desativar servico</h2>
            <p id="deactivate-service-description" className="mt-2 text-sm text-cocoa/65">Este servico nao ficara mais disponivel para novos agendamentos, mas continuara aparecendo no historico.</p>
            <div className="mt-4 rounded-2xl bg-linen p-3">
              <p className="font-semibold">{deactivateTarget.name}</p>
              <p className="text-sm text-cocoa/60">{formatCurrency(deactivateTarget.priceCents)} - {deactivateTarget.durationMinutes} min</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button ref={cancelButtonRef} type="button" variant="secondary" onClick={() => setDeactivateTarget(null)} disabled={deactivating}>Cancelar</Button>
              <Button type="button" variant="danger" onClick={deactivate} disabled={deactivating}>{deactivating ? "Desativando..." : "Desativar servico"}</Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
