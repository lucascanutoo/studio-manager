"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { formatPhone, whatsappUrl } from "@/lib/format";

type Client = { id: string; name: string; phone: string; notes?: string; _count?: { attendances: number } };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });

  async function load() {
    setLoading(true);
    const response = await fetch(`/api/clients?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    setClients(data.clients ?? []);
    setLoading(false);
  }

  useEffect(() => {
    const id = setTimeout(load, 250);
    return () => clearTimeout(id);
  }, [q]);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ name: "", phone: "", notes: "" });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta cliente e seu historico?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <PageHeader title="Clientes" description="Cadastro, busca e historico das clientes." />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <h2 className="mb-4 font-bold">Nova cliente</h2>
          <form onSubmit={create}>
            <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })} required />
            <Textarea label="Observacoes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <Button className="w-full" icon={<Plus size={18} />}>Adicionar</Button>
          </form>
        </Card>
        <section>
          <div className="mb-4">
            <Input label="Buscar por nome ou telefone" value={q} icon={<Search size={18} />} onChange={(e) => setQ(e.target.value)} />
          </div>
          {loading ? <p className="text-center text-cocoa/60">Carregando...</p> : clients.length ? (
            <div className="space-y-3">
              {clients.map((client) => (
                <Card key={client.id} className="flex items-center justify-between gap-3">
                  <Link href={`/clientes/${client.id}`} className="min-w-0 flex-1">
                    <p className="truncate font-bold">{client.name}</p>
                    <p className="text-sm text-cocoa/60">{formatPhone(client.phone)} - {client._count?.attendances ?? 0} atend.</p>
                  </Link>
                  <a className="rounded-2xl bg-green-50 p-3 text-green-700" href={whatsappUrl(client.phone)} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={20} /></a>
                  <button className="rounded-2xl bg-red-50 p-3 text-red-700" onClick={() => remove(client.id)} aria-label="Excluir"><Trash2 size={20} /></button>
                </Card>
              ))}
            </div>
          ) : <EmptyState title="Nenhuma cliente" description="Cadastre a primeira cliente para iniciar." />}
        </section>
      </div>
    </>
  );
}
