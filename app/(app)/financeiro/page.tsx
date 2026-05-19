"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import { formatCurrency } from "@/lib/format";

type Attendance = {
  id: string;
  finalValueCents: number;
  paymentMethod: string;
  notes?: string;
  attendedAt: string;
  client: { name: string };
  service: { name: string };
};

const paymentLabels: Record<string, string> = {
  CASH: "Dinheiro",
  PIX: "Pix",
  DEBIT_CARD: "Cartao de debito",
  CREDIT_CARD: "Cartao de credito"
};

export default function FinancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);

  useEffect(() => {
    fetch("/api/attendances").then((res) => res.json()).then((data) => setAttendances(data.attendances ?? []));
  }, []);

  const total = useMemo(() => attendances.reduce((sum, item) => sum + item.finalValueCents, 0), [attendances]);

  return (
    <>
      <PageHeader title="Financeiro" description="Atendimentos concluidos e pagamentos." />
      <Card className="mb-4 bg-rosewood text-white">
        <p className="text-sm font-semibold text-white/75">Total registrado</p>
        <p className="mt-1 text-3xl font-bold">{formatCurrency(total)}</p>
      </Card>
      <section className="space-y-3">
        {attendances.length ? attendances.map((item) => (
          <Card key={item.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{item.client.name}</p>
                <p className="text-sm text-cocoa/60">{item.service.name}</p>
                <p className="mt-1 text-xs text-cocoa/50">{format(new Date(item.attendedAt), "dd/MM/yyyy HH:mm")} - {paymentLabels[item.paymentMethod]}</p>
              </div>
              <p className="font-bold text-rosewood">{formatCurrency(item.finalValueCents)}</p>
            </div>
            {item.notes && <p className="mt-3 rounded-2xl bg-linen p-3 text-sm text-cocoa/70">{item.notes}</p>}
          </Card>
        )) : <EmptyState title="Sem financeiro" description="Conclua atendimentos para registrar pagamentos." />}
      </section>
    </>
  );
}
