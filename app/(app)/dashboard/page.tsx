"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { CalendarClock, DollarSign, Users, WalletCards } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import { formatCurrency } from "@/lib/format";
import { formatBrazilDate } from "@/lib/timezone";

type Dashboard = {
  metrics: { revenue: number; attendancesCount: number; clientsCount: number; averageTicket: number; pendingValue: number; pendingCount: number };
  byService: { name: string; count: number; revenue: number }[];
  revenueSeries: { label: string; revenue: number }[];
  todayAppointments: { id: string; startsAt: string; client: { name: string }; service: { name: string } }[];
  topReturningClients: { name: string; count: number }[];
};

type Period = "daily" | "weekly" | "monthly";

const periodOptions: { value: Period; label: string }[] = [
  { value: "daily", label: "Hoje" },
  { value: "weekly", label: "Semana" },
  { value: "monthly", label: "Mes" }
];

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState<Period>("monthly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?period=${period}`).then((res) => res.json()).then(setData).finally(() => setLoading(false));
  }, [period]);

  if (!data) return <p className="py-10 text-center text-cocoa/60">Carregando dashboard...</p>;

  const cards = [
    { label: "Faturamento", value: formatCurrency(data.metrics.revenue), icon: DollarSign },
    { label: "Atendimentos", value: data.metrics.attendancesCount, icon: CalendarClock },
    { label: "Clientes", value: data.metrics.clientsCount, icon: Users },
    { label: "Ticket medio", value: formatCurrency(data.metrics.averageTicket), icon: WalletCards },
    { label: "Pendente", value: `${formatCurrency(data.metrics.pendingValue)} (${data.metrics.pendingCount})`, icon: WalletCards }
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumo rapido do studio."
        action={
          <div className="grid grid-cols-3 rounded-2xl bg-nude p-1">
            {periodOptions.map((option) => (
              <button key={option.value} onClick={() => setPeriod(option.value)} className={`rounded-xl px-3 py-2 text-sm font-bold ${period === option.value ? "bg-white text-rosewood shadow" : "text-cocoa/60"}`}>
                {option.label}
              </button>
            ))}
          </div>
        }
      />
      {loading && <p className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-cocoa/60 shadow-sm">Atualizando indicadores...</p>}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-blush text-rosewood"><Icon size={20} /></div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cocoa/50">{item.label}</p>
              <p className="mt-1 text-xl font-bold text-cocoa">{item.value}</p>
            </Card>
          );
        })}
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="h-72">
          <h2 className="mb-4 font-bold">Faturamento recebido</h2>
          {data.revenueSeries.some((item) => item.revenue > 0) ? (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={data.revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value) * 100), "Receita"]} />
                <Bar dataKey="revenue" name="Receita" fill="#9f5366" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState title="Sem faturamento" description="Nenhum pagamento recebido no periodo." />}
        </Card>
        <Card className="h-72">
          <h2 className="mb-4 font-bold">Servicos mais vendidos</h2>
          {data.byService.length ? (
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={data.byService} dataKey="count" nameKey="name" innerRadius={48} outerRadius={82}>
                  {data.byService.map((_, index) => <Cell key={index} fill={["#9f5366", "#d88fa0", "#c8a99c", "#6e5450"][index % 4]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState title="Sem vendas" description="Conclua atendimentos para ver o grafico." />}
        </Card>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-bold">Proximos de hoje</h2>
          {data.todayAppointments.length ? data.todayAppointments.map((item) => (
            <div key={item.id} className="mb-3 rounded-2xl bg-linen p-3 last:mb-0">
              <p className="font-semibold">{formatBrazilDate(item.startsAt, "HH:mm")} - {item.client.name}</p>
              <p className="text-sm text-cocoa/60">{item.service.name}</p>
            </div>
          )) : <EmptyState title="Agenda livre" description="Nenhum atendimento para hoje." />}
        </Card>
        <Card>
          <h2 className="mb-3 font-bold">Clientes que retornaram</h2>
          {data.topReturningClients.length ? data.topReturningClients.map((item) => (
            <div key={item.name} className="mb-3 flex items-center justify-between rounded-2xl bg-linen p-3 last:mb-0">
              <span className="font-semibold">{item.name}</span>
              <span className="rounded-full bg-blush px-3 py-1 text-sm font-bold text-rosewood">{item.count}x</span>
            </div>
          )) : <EmptyState title="Sem historico" description="Os retornos aparecem apos atendimentos." />}
        </Card>
      </section>
    </>
  );
}
