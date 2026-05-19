"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { CalendarPlus, CheckCircle2, MessageCircle, Pencil, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, whatsappUrl } from "@/lib/format";

type Appointment = { id: string; startsAt: string; endsAt: string; status: string; client: { name: string; phone: string }; service: { name: string; priceCents: number } };

export default function AgendaPage() {
  const [view, setView] = useState("day");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  async function load() {
    const data = await fetch(`/api/appointments?view=${view}&date=${date}`).then((res) => res.json());
    setAppointments(data.appointments ?? []);
  }

  useEffect(() => { load(); }, [view, date]);

  const next = useMemo(() => appointments.find((item) => new Date(item.startsAt) >= new Date() && item.status !== "CANCELED"), [appointments]);

  async function cancel(id: string) {
    if (!confirm("Cancelar este agendamento?")) return;
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    load();
  }

  async function complete(item: Appointment) {
    const value = prompt("Valor final do atendimento", String((item.service.priceCents / 100).toFixed(2)).replace(".", ","));
    if (!value) return;
    await fetch(`/api/appointments/${item.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ finalValue: value, paymentMethod: "PIX", notes: "" })
    });
    load();
  }

  function confirmMessage(item: Appointment) {
    return `Ola, ${item.client.name}! Passando para confirmar seu horario no dia ${format(new Date(item.startsAt), "dd/MM")} as ${format(new Date(item.startsAt), "HH:mm")} para ${item.service.name}.`;
  }

  function reminderMessage(item: Appointment) {
    return `Ola, ${item.client.name}! Lembrando do seu atendimento amanha as ${format(new Date(item.startsAt), "HH:mm")}.`;
  }

  return (
    <>
      <PageHeader title="Agenda" description="Controle manual de horarios." action={<Link href="/agenda/novo"><Button icon={<CalendarPlus size={18} />}>Novo</Button></Link>} />
      <div className="mb-4 grid grid-cols-[1fr_auto] gap-3">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 rounded-2xl border border-nude bg-white px-4" />
        <div className="grid grid-cols-2 rounded-2xl bg-nude p-1">
          <button onClick={() => setView("day")} className={`rounded-xl px-3 text-sm font-bold ${view === "day" ? "bg-white text-rosewood" : "text-cocoa/60"}`}>Dia</button>
          <button onClick={() => setView("week")} className={`rounded-xl px-3 text-sm font-bold ${view === "week" ? "bg-white text-rosewood" : "text-cocoa/60"}`}>Semana</button>
        </div>
      </div>
      {next && (
        <Card className="mb-4 border-rosewood bg-blush/60">
          <p className="text-xs font-bold uppercase tracking-wide text-rosewood">Proximo atendimento</p>
          <p className="mt-1 font-bold">{format(new Date(next.startsAt), "dd/MM HH:mm")} - {next.client.name}</p>
          <p className="text-sm text-cocoa/65">{next.service.name}</p>
        </Card>
      )}
      <section className="space-y-3">
        {appointments.length ? appointments.map((item) => (
          <Card key={item.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{format(new Date(item.startsAt), "dd/MM HH:mm")} - {item.client.name}</p>
                <p className="text-sm text-cocoa/60">{item.service.name} - {formatCurrency(item.service.priceCents)}</p>
              </div>
              <span className="rounded-full bg-nude px-3 py-1 text-xs font-bold text-cocoa">{item.status}</span>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              <a className="flex h-11 items-center justify-center rounded-2xl bg-green-50 text-green-700" href={whatsappUrl(item.client.phone)} target="_blank" rel="noreferrer"><MessageCircle size={18} /></a>
              <a className="flex h-11 items-center justify-center rounded-2xl bg-blush text-rosewood" href={whatsappUrl(item.client.phone, confirmMessage(item))} target="_blank" rel="noreferrer">C</a>
              <a className="flex h-11 items-center justify-center rounded-2xl bg-nude text-cocoa" href={whatsappUrl(item.client.phone, reminderMessage(item))} target="_blank" rel="noreferrer">L</a>
              <Link className="flex h-11 items-center justify-center rounded-2xl bg-white text-cocoa ring-1 ring-nude" href={`/agenda/novo?id=${item.id}`}><Pencil size={18} /></Link>
              {item.status === "COMPLETED" ? <button className="rounded-2xl bg-green-50 text-green-700"><CheckCircle2 size={18} className="mx-auto" /></button> : <button onClick={() => complete(item)} className="rounded-2xl bg-rosewood text-white"><CheckCircle2 size={18} className="mx-auto" /></button>}
            </div>
            {item.status !== "CANCELED" && <Button variant="danger" className="mt-3 w-full" icon={<XCircle size={18} />} onClick={() => cancel(item.id)}>Cancelar</Button>}
          </Card>
        )) : <EmptyState title="Sem horarios" description="Nao ha agendamentos no periodo escolhido." />}
      </section>
      <div className="mt-3 text-xs text-cocoa/50">C confirma horario, L envia lembrete.</div>
    </>
  );
}
