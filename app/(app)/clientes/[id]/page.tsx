"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MessageCircle, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatPhone, whatsappUrl } from "@/lib/format";
import { formatBrazilDate } from "@/lib/timezone";
import { getAppointmentStatusBadgeClass, getAppointmentStatusLabel } from "@/lib/appointment-status";

type ClientDetail = {
  id: string; name: string; phone: string; notes?: string;
  appointments: { id: string; startsAt: string; status: string; service: { name: string }; attendance?: { finalValueCents: number } | null }[];
};

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });

  useEffect(() => {
    fetch(`/api/clients/${params.id}`).then((res) => res.json()).then((data) => {
      setClient(data.client);
      setForm({ name: data.client.name, phone: formatPhone(data.client.phone), notes: data.client.notes ?? "" });
    });
  }, [params.id]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetch(`/api/clients/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    router.refresh();
  }

  if (!client) return <p className="py-10 text-center text-cocoa/60">Carregando cliente...</p>;

  return (
    <>
      <PageHeader title={client.name} description="Dados e historico de atendimentos." action={<a className="rounded-2xl bg-green-50 p-3 text-green-700" href={whatsappUrl(client.phone)} target="_blank" rel="noreferrer"><MessageCircle size={22} /></a>} />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <form onSubmit={save}>
            <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })} />
            <Textarea label="Observacoes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <Button className="w-full" icon={<Save size={18} />}>Salvar</Button>
          </form>
        </Card>
        <Card>
          <h2 className="mb-4 font-bold">Historico</h2>
          {client.appointments.length ? client.appointments.map((item) => (
            <div key={item.id} className="mb-3 rounded-2xl bg-linen p-3 last:mb-0">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{item.service.name}</p>
                <Badge className={getAppointmentStatusBadgeClass(item.status)}>{getAppointmentStatusLabel(item.status)}</Badge>
              </div>
              <p className="mt-1 text-sm text-cocoa/60">{formatBrazilDate(item.startsAt, "dd/MM/yyyy HH:mm")}</p>
              {item.attendance && <p className="mt-1 text-sm font-semibold">{formatCurrency(item.attendance.finalValueCents)}</p>}
            </div>
          )) : <p className="text-sm text-cocoa/60">Nenhum atendimento registrado.</p>}
        </Card>
      </div>
    </>
  );
}
