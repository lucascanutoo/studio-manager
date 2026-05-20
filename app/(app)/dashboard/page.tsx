"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { CalendarClock, DollarSign, ImagePlus, Palette, Save, Sparkles, Trash2, Users, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
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

type StudioSettings = {
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
};

const periodOptions: { value: Period; label: string }[] = [
  { value: "daily", label: "Hoje" },
  { value: "weekly", label: "Semana" },
  { value: "monthly", label: "Mes" }
];

const defaultStudio: StudioSettings = {
  name: "",
  logoUrl: "",
  primaryColor: "#9f5366",
  secondaryColor: "#f8dfe7"
};

function hexToRgb(hex: string, fallback = "159 83 102") {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return fallback;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
}

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState<Period>("monthly");
  const [loading, setLoading] = useState(true);
  const [studioModalOpen, setStudioModalOpen] = useState(false);
  const [studio, setStudio] = useState<StudioSettings>(defaultStudio);
  const [studioLoading, setStudioLoading] = useState(false);
  const [studioSaving, setStudioSaving] = useState(false);
  const [studioMessage, setStudioMessage] = useState("");
  const [studioError, setStudioError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?period=${period}`).then((res) => res.json()).then(setData).finally(() => setLoading(false));
  }, [period]);

  async function openStudioModal() {
    setStudioModalOpen(true);
    setStudioLoading(true);
    setStudioMessage("");
    setStudioError("");
    try {
      const response = await fetch("/api/studio");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Nao foi possivel carregar a identidade do studio.");
      setStudio({
        name: payload.studio?.name ?? "",
        logoUrl: payload.studio?.logoUrl ?? "",
        primaryColor: payload.studio?.primaryColor ?? defaultStudio.primaryColor,
        secondaryColor: payload.studio?.secondaryColor ?? defaultStudio.secondaryColor
      });
    } catch (error) {
      setStudioError(error instanceof Error ? error.message : "Nao foi possivel carregar a identidade do studio.");
    } finally {
      setStudioLoading(false);
    }
  }

  function onLogoChange(file?: File) {
    setStudioError("");
    setStudioMessage("");
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setStudioError("Envie uma imagem PNG, JPG ou WebP.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setStudioError("A logo deve ter no maximo 1MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setStudio((current) => ({ ...current, logoUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  async function saveStudio() {
    if (!studio.name.trim()) {
      setStudioError("Informe o nome do studio.");
      return;
    }
    setStudioSaving(true);
    setStudioMessage("");
    setStudioError("");
    try {
      const response = await fetch("/api/studio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studio)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Nao foi possivel salvar a identidade visual.");
      document.documentElement.style.setProperty("--color-primary-rgb", hexToRgb(studio.primaryColor));
      document.documentElement.style.setProperty("--color-secondary-rgb", hexToRgb(studio.secondaryColor, "248 223 231"));
      window.dispatchEvent(new CustomEvent("studio-theme-updated"));
      setStudioMessage("Identidade do studio atualizada com sucesso.");
      window.setTimeout(() => {
        setStudioModalOpen(false);
        setStudioMessage("");
      }, 650);
    } catch (error) {
      setStudioError(error instanceof Error ? error.message : "Nao foi possivel salvar a identidade visual.");
    } finally {
      setStudioSaving(false);
    }
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

      <Card className="mt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blush text-rosewood">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="font-bold text-ink">Editar identidade do studio</h2>
              <p className="mt-1 text-sm leading-6 text-cocoa/60">Altere nome, logo e cores do seu studio.</p>
            </div>
          </div>
          <Button variant="outline" className="w-full sm:w-auto" onClick={openStudioModal}>
            Abrir edicao
          </Button>
        </div>
      </Card>

      <Modal
        open={studioModalOpen}
        title="Editar identidade do studio"
        description="Atualize os detalhes visuais usados no sistema."
        onClose={() => !studioSaving && setStudioModalOpen(false)}
        className="max-h-[92vh] overflow-y-auto sm:max-w-2xl"
      >
        <div className="mt-5 space-y-4">
          {studioLoading ? (
            <p className="rounded-2xl bg-linen px-4 py-6 text-center text-sm font-semibold text-cocoa/60">Carregando identidade do studio...</p>
          ) : (
            <>
              {studioMessage && <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{studioMessage}</p>}
              {studioError && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{studioError}</p>}

              <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-nude/80 bg-white p-4 shadow-sm">
                    <Input label="Nome do studio" value={studio.name} onChange={(event) => setStudio({ ...studio, name: event.target.value })} placeholder="Ex: Rose Beauty" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Cor principal" type="color" value={studio.primaryColor} onChange={(event) => setStudio({ ...studio, primaryColor: event.target.value })} />
                      <Input label="Cor secundaria" type="color" value={studio.secondaryColor} onChange={(event) => setStudio({ ...studio, secondaryColor: event.target.value })} />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-nude/80 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-ink">Logo</h3>
                        <p className="text-sm text-cocoa/60">PNG, JPG ou WebP ate 1MB.</p>
                      </div>
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-blush text-rosewood shadow-sm">
                        {studio.logoUrl ? <img src={studio.logoUrl} alt="Preview da logo" className="h-full w-full object-cover" /> : <ImagePlus size={24} />}
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => onLogoChange(event.target.files?.[0])}
                      className="block min-h-12 w-full rounded-2xl border border-nude/80 bg-white px-4 py-3 text-sm text-cocoa shadow-sm file:mr-3 file:rounded-xl file:border-0 file:bg-nude file:px-3 file:py-2 file:text-sm file:font-bold file:text-cocoa"
                    />
                    {studio.logoUrl && (
                      <Button type="button" className="mt-3 w-full" variant="danger" icon={<Trash2 size={18} />} onClick={() => setStudio({ ...studio, logoUrl: "" })} disabled={studioSaving}>
                        Remover logo
                      </Button>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-nude/80 bg-white p-4 shadow-sm">
                  <h3 className="mb-4 font-bold text-ink">Preview</h3>
                  <div className="mb-4 flex items-center gap-3 rounded-2xl p-3" style={{ backgroundColor: studio.secondaryColor }}>
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl text-white" style={{ backgroundColor: studio.primaryColor }}>
                      {studio.logoUrl ? <img src={studio.logoUrl} alt="Logo preview" className="h-full w-full object-cover" /> : <Sparkles size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-ink">{studio.name || "Nome do studio"}</p>
                      <p className="text-xs text-cocoa/60">Preview do sistema</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button type="button" style={{ backgroundColor: studio.primaryColor }} className="w-full text-white">
                      Botao principal
                    </Button>
                    <div className="rounded-2xl border border-nude bg-white p-4 shadow-sm">
                      <p className="font-bold text-ink">Card de exemplo</p>
                      <p className="mt-1 text-sm text-cocoa/60">Cores aplicadas ao studio.</p>
                    </div>
                    <Badge style={{ backgroundColor: studio.secondaryColor, color: studio.primaryColor, borderColor: studio.secondaryColor }}>
                      Destaque secundario
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 pt-1 sm:grid-cols-2">
                <Button type="button" variant="secondary" onClick={() => setStudioModalOpen(false)} disabled={studioSaving}>
                  Cancelar
                </Button>
                <Button type="button" icon={<Save size={18} />} onClick={saveStudio} disabled={studioSaving}>
                  {studioSaving ? "Salvando..." : "Salvar alteracoes"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
