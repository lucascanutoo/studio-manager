"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { CalendarClock, DollarSign, ImagePlus, Save, Users, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
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

type StudioSettings = { name: string; logoUrl: string; primaryColor: string; secondaryColor: string };

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
  const [studio, setStudio] = useState<StudioSettings>({ name: "", logoUrl: "", primaryColor: "#9f5366", secondaryColor: "#f8dfe7" });
  const [studioMessage, setStudioMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?period=${period}`).then((res) => res.json()).then(setData).finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    fetch("/api/studio").then((res) => res.json()).then((data) => {
      if (!data.studio) return;
      setStudio({
        name: data.studio.name ?? "",
        logoUrl: data.studio.logoUrl ?? "",
        primaryColor: data.studio.primaryColor ?? "#9f5366",
        secondaryColor: data.studio.secondaryColor ?? "#f8dfe7"
      });
    });
  }, []);

  function onLogoChange(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setStudio((current) => ({ ...current, logoUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  async function saveStudio() {
    setStudioMessage("");
    await fetch("/api/studio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studio)
    });
    document.documentElement.style.setProperty("--color-primary-rgb", "");
    setStudioMessage("Identidade visual salva. Recarregue a pagina para aplicar no menu.");
  }

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

      <Card className="mt-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-ink">Identidade do studio</h2>
            <p className="text-sm text-cocoa/60">Logo e cores usadas na navegacao do sistema.</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-blush text-rosewood">
            {studio.logoUrl ? <img src={studio.logoUrl} alt="Logo do studio" className="h-full w-full object-cover" /> : <ImagePlus size={20} />}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <Input label="Nome do studio" value={studio.name} onChange={(event) => setStudio({ ...studio, name: event.target.value })} />
          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-semibold text-cocoa">Logo</span>
            <input type="file" accept="image/*" onChange={(event) => onLogoChange(event.target.files?.[0])} className="block min-h-12 w-full rounded-2xl border border-nude/80 bg-white px-4 py-3 text-sm text-cocoa shadow-sm file:mr-3 file:rounded-xl file:border-0 file:bg-nude file:px-3 file:py-2 file:text-sm file:font-bold file:text-cocoa" />
          </label>
          <Input label="Cor principal" type="color" value={studio.primaryColor} onChange={(event) => setStudio({ ...studio, primaryColor: event.target.value })} />
          <Input label="Cor secundaria" type="color" value={studio.secondaryColor} onChange={(event) => setStudio({ ...studio, secondaryColor: event.target.value })} />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button icon={<Save size={18} />} onClick={saveStudio}>Salvar identidade</Button>
          {studioMessage && <p className="text-sm font-semibold text-green-700">{studioMessage}</p>}
        </div>
      </Card>

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
