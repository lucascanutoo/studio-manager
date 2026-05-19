"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, CheckCircle2, MessageCircle, Pencil, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, whatsappUrl } from "@/lib/format";
import { formatBrazilDate, todayInBrazil } from "@/lib/timezone";

type Appointment = { id: string; startsAt: string; endsAt: string; status: string; client: { name: string; phone: string }; service: { name: string; priceCents: number } };
type CompleteForm = { finalValue: string; paymentMethod: string };

export default function AgendaPage() {
  const [view, setView] = useState("day");
  const [date, setDate] = useState(todayInBrazil());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [completeTarget, setCompleteTarget] = useState<Appointment | null>(null);
  const [completeForm, setCompleteForm] = useState<CompleteForm>({ finalValue: "", paymentMethod: "PIX" });
  const [loadingAction, setLoadingAction] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const data = await fetch(`/api/appointments?view=${view}&date=${date}`).then((res) => res.json());
    setAppointments(data.appointments ?? []);
  }

  useEffect(() => { load(); }, [view, date]);

  const next = useMemo(() => appointments.find((item) => new Date(item.startsAt) >= new Date()), [appointments]);

  function openCompleteModal(item: Appointment) {
    setError("");
    setMessage("");
    setCompleteTarget(item);
    setCompleteForm({ finalValue: String((item.service.priceCents / 100).toFixed(2)).replace(".", ","), paymentMethod: "PIX" });
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    setLoadingAction("cancel");
    setError("");
    const response = await fetch(`/api/appointments/${cancelTarget.id}`, { method: "DELETE" });
    setLoadingAction("");
    if (!response.ok) {
      const data = await response.json();
      setError(data.message ?? "Nao foi possivel cancelar o agendamento.");
      return;
    }
    setAppointments((current) => current.filter((item) => item.id !== cancelTarget.id));
    setCancelTarget(null);
    setMessage("Agendamento cancelado com sucesso.");
  }

  async function confirmComplete() {
    if (!completeTarget) return;
    setLoadingAction("complete");
    setError("");
    const response = await fetch(`/api/appointments/${completeTarget.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...completeForm, notes: completeForm.paymentMethod === "PENDING" ? "Pagamento pendente" : "" })
    });
    setLoadingAction("");
    if (!response.ok) {
      const data = await response.json();
      setError(data.message ?? "Nao foi possivel concluir o agendamento.");
      return;
    }
    setAppointments((current) => current.filter((item) => item.id !== completeTarget.id));
    setCompleteTarget(null);
    setMessage("Atendimento concluido e registrado no financeiro.");
  }

  function confirmMessage(item: Appointment) {
    return `Ola, ${item.client.name}! Passando para confirmar seu horario no dia ${formatBrazilDate(item.startsAt, "dd/MM")} as ${formatBrazilDate(item.startsAt, "HH:mm")} para ${item.service.name}.`;
  }

  function reminderMessage(item: Appointment) {
    return `Ola, ${item.client.name}! Lembrando do seu atendimento amanha as ${formatBrazilDate(item.startsAt, "HH:mm")}.`;
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
      {message && <p className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</p>}
      {error && <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      {next && (
        <Card className="mb-4 border-rosewood bg-blush/60">
          <p className="text-xs font-bold uppercase tracking-wide text-rosewood">Proximo atendimento</p>
          <p className="mt-1 font-bold">{formatBrazilDate(next.startsAt, "dd/MM HH:mm")} - {next.client.name}</p>
          <p className="text-sm text-cocoa/65">{next.service.name}</p>
        </Card>
      )}
      <section className="space-y-3">
        {appointments.length ? appointments.map((item) => (
          <Card key={item.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{formatBrazilDate(item.startsAt, "dd/MM HH:mm")} - {item.client.name}</p>
                <p className="text-sm text-cocoa/60">{item.service.name} - {formatCurrency(item.service.priceCents)}</p>
              </div>
              <span className="rounded-full bg-nude px-3 py-1 text-xs font-bold text-cocoa">{item.status}</span>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              <a className="flex h-11 items-center justify-center rounded-2xl bg-green-50 text-green-700" href={whatsappUrl(item.client.phone)} target="_blank" rel="noreferrer"><MessageCircle size={18} /></a>
              <a className="flex h-11 items-center justify-center rounded-2xl bg-blush text-rosewood" href={whatsappUrl(item.client.phone, confirmMessage(item))} target="_blank" rel="noreferrer">C</a>
              <a className="flex h-11 items-center justify-center rounded-2xl bg-nude text-cocoa" href={whatsappUrl(item.client.phone, reminderMessage(item))} target="_blank" rel="noreferrer">L</a>
              <Link className="flex h-11 items-center justify-center rounded-2xl bg-white text-cocoa ring-1 ring-nude" href={`/agenda/novo?id=${item.id}`}><Pencil size={18} /></Link>
              <button onClick={() => openCompleteModal(item)} className="rounded-2xl bg-rosewood text-white"><CheckCircle2 size={18} className="mx-auto" /></button>
            </div>
            <Button variant="danger" className="mt-3 w-full" icon={<XCircle size={18} />} onClick={() => { setError(""); setMessage(""); setCancelTarget(item); }}>Cancelar</Button>
          </Card>
        )) : <EmptyState title="Sem horarios" description="Nao ha agendamentos no periodo escolhido." />}
      </section>
      <div className="mt-3 text-xs text-cocoa/50">C confirma horario, L envia lembrete.</div>

      {cancelTarget && (
        <div className="fixed inset-0 z-30 flex items-end bg-cocoa/40 p-4 backdrop-blur-sm sm:items-center sm:justify-center">
          <Card className="w-full sm:max-w-md">
            <h2 className="text-lg font-bold">Cancelar agendamento</h2>
            <p className="mt-2 text-sm text-cocoa/65">Tem certeza que deseja cancelar este agendamento?</p>
            <div className="mt-4 rounded-2xl bg-linen p-3">
              <p className="font-semibold">{cancelTarget.client.name}</p>
              <p className="text-sm text-cocoa/60">{formatBrazilDate(cancelTarget.startsAt, "dd/MM HH:mm")} - {cancelTarget.service.name}</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button type="button" variant="secondary" onClick={() => setCancelTarget(null)} disabled={loadingAction === "cancel"}>Voltar</Button>
              <Button type="button" variant="danger" onClick={confirmCancel} disabled={loadingAction === "cancel"}>{loadingAction === "cancel" ? "Cancelando..." : "Confirmar cancelamento"}</Button>
            </div>
          </Card>
        </div>
      )}

      {completeTarget && (
        <div className="fixed inset-0 z-30 flex items-end bg-cocoa/40 p-4 backdrop-blur-sm sm:items-center sm:justify-center">
          <Card className="w-full sm:max-w-md">
            <h2 className="text-lg font-bold">Concluir atendimento</h2>
            <p className="mt-2 text-sm text-cocoa/65">{completeTarget.client.name} - {formatBrazilDate(completeTarget.startsAt, "dd/MM HH:mm")}</p>
            <div className="mt-5">
              <Input label="Valor final" value={completeForm.finalValue} onChange={(event) => setCompleteForm({ ...completeForm, finalValue: event.target.value })} placeholder="85,00" />
              <Select label="Metodo de pagamento" value={completeForm.paymentMethod} onChange={(event) => setCompleteForm({ ...completeForm, paymentMethod: event.target.value })}>
                <option value="PIX">Pix</option>
                <option value="CASH">Dinheiro</option>
                <option value="CARD">Cartao</option>
                <option value="PENDING">Pagamento pendente</option>
              </Select>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button type="button" variant="secondary" onClick={() => setCompleteTarget(null)} disabled={loadingAction === "complete"}>Voltar</Button>
              <Button type="button" onClick={confirmComplete} disabled={loadingAction === "complete"}>{loadingAction === "complete" ? "Salvando..." : "Concluir"}</Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
