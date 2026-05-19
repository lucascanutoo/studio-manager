"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatPhone, whatsappUrl } from "@/lib/format";
import { formatBrazilDate } from "@/lib/timezone";

type Attendance = {
  id: string;
  finalValueCents: number;
  paymentMethod?: string | null;
  paymentStatus: string;
  notes?: string;
  attendedAt: string;
  client: { name: string; phone: string };
  service: { name: string };
};

const paymentLabels: Record<string, string> = {
  CASH: "Dinheiro",
  PIX: "Pix",
  CARD: "Cartao"
};

export default function FinancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [showPending, setShowPending] = useState(false);
  const [payTarget, setPayTarget] = useState<Attendance | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [paidValue, setPaidValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/attendances${showPending ? "?status=pending" : ""}`).then((res) => res.json()).then((data) => setAttendances(data.attendances ?? []));
  }, [showPending]);

  const total = useMemo(() => attendances.filter((item) => item.paymentStatus === "PAID").reduce((sum, item) => sum + item.finalValueCents, 0), [attendances]);
  const pendingTotal = useMemo(() => attendances.filter((item) => item.paymentStatus === "PENDING").reduce((sum, item) => sum + item.finalValueCents, 0), [attendances]);

  function openPayModal(item: Attendance) {
    setError("");
    setMessage("");
    setPaymentMethod("PIX");
    setPaidValue(String((item.finalValueCents / 100).toFixed(2)).replace(".", ","));
    setPayTarget(item);
  }

  async function markAsPaid() {
    if (!payTarget) return;
    if (!paidValue.trim()) {
      setError("Informe o valor pago.");
      return;
    }
    setLoading(true);
    setError("");
    const response = await fetch(`/api/attendances/${payTarget.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ finalValue: paidValue, paymentMethod })
    });
    setLoading(false);
    if (!response.ok) {
      const data = await response.json();
      setError(data.message ?? "Nao foi possivel marcar como pago.");
      return;
    }
    const data = await response.json();
    setAttendances((current) => showPending ? current.filter((item) => item.id !== payTarget.id) : current.map((item) => item.id === payTarget.id ? data.attendance : item));
    setPayTarget(null);
    setMessage("Pagamento marcado como pago.");
  }

  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Atendimentos concluidos e pagamentos."
        action={<Button variant={showPending ? "primary" : "secondary"} onClick={() => { setShowPending((value) => !value); setMessage(""); setError(""); }}>Pagamentos pendentes</Button>}
      />
      {message && <p className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</p>}
      {error && <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <Card className="mb-4 bg-rosewood text-white">
        <p className="text-sm font-semibold text-white/75">{showPending ? "Total pendente" : "Total recebido"}</p>
        <p className="mt-1 text-3xl font-bold">{formatCurrency(showPending ? pendingTotal : total)}</p>
      </Card>
      <section className="space-y-3">
        {attendances.length ? attendances.map((item) => (
          <Card key={item.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{item.client.name}</p>
                <p className="text-sm text-cocoa/60">{item.service.name}</p>
                <p className="text-sm text-cocoa/60">{formatPhone(item.client.phone)}</p>
                <p className="mt-1 text-xs text-cocoa/50">{formatBrazilDate(item.attendedAt, "dd/MM/yyyy HH:mm")} - {item.paymentStatus === "PENDING" ? "Pagamento pendente" : paymentLabels[item.paymentMethod ?? ""]}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-rosewood">{formatCurrency(item.finalValueCents)}</p>
                {item.paymentStatus === "PENDING" && <Badge variant="warning" className="mt-1">Pendente</Badge>}
              </div>
            </div>
            {item.notes && <p className="mt-3 rounded-2xl bg-linen p-3 text-sm text-cocoa/70">{item.notes}</p>}
            {item.paymentStatus === "PENDING" && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-green-50 px-3 py-2 text-sm font-bold text-green-700" href={whatsappUrl(item.client.phone)} target="_blank" rel="noreferrer"><MessageCircle size={18} /> WhatsApp</a>
                <Button icon={<CheckCircle2 size={18} />} onClick={() => openPayModal(item)}>Marcar como pago</Button>
              </div>
            )}
          </Card>
        )) : <EmptyState title="Sem financeiro" description="Conclua atendimentos para registrar pagamentos." />}
      </section>

      {payTarget && (
        <div className="fixed inset-0 z-30 flex items-end bg-cocoa/40 p-4 backdrop-blur-sm sm:items-center sm:justify-center">
          <Card className="w-full sm:max-w-md">
            <h2 className="text-lg font-bold">Marcar como pago</h2>
            <p className="mt-2 text-sm text-cocoa/65">{payTarget.client.name}</p>
            <div className="mt-4 rounded-2xl bg-linen p-3">
              <p className="font-semibold">{payTarget.service.name}</p>
              <p className="text-sm text-cocoa/60">{formatBrazilDate(payTarget.attendedAt, "dd/MM/yyyy HH:mm")}</p>
            </div>
            <div className="mt-5">
              <Input label="Valor pago" value={paidValue} onChange={(event) => setPaidValue(event.target.value)} placeholder="85,00" inputMode="decimal" />
              <Select label="Metodo de pagamento" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                <option value="PIX">Pix</option>
                <option value="CASH">Dinheiro</option>
                <option value="CARD">Cartao</option>
              </Select>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button type="button" variant="secondary" onClick={() => setPayTarget(null)} disabled={loading}>Cancelar</Button>
              <Button type="button" onClick={markAsPaid} disabled={loading}>{loading ? "Salvando..." : "Confirmar pagamento"}</Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
