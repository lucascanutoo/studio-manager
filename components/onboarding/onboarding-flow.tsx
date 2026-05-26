"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, Plus, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Studio = {
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
};

type ServiceDraft = {
  name: string;
  price: string;
  durationMinutes: number;
};

const steps = ["Studio", "Logo", "Servicos", "Identidade"];

const defaultStudio: Studio = {
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

function serviceFromApi(service: { name: string; priceCents: number; durationMinutes: number }): ServiceDraft {
  return {
    name: service.name,
    price: (service.priceCents / 100).toFixed(2).replace(".", ","),
    durationMinutes: service.durationMinutes
  };
}

export function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(248,223,231,0.75),transparent_30rem),linear-gradient(180deg,#fffaf7,#f8f1ed)] px-4 py-6 text-cocoa">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col justify-center">
        {children}
      </section>
    </main>
  );
}

export function StepIndicator({ step }: { step: number }) {
  const progress = ((step + 1) / steps.length) * 100;
  return (
    <div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-nude">
        <div className="h-full rounded-full bg-rosewood transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {steps.map((label, index) => (
          <div key={label} className="text-center">
            <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${index <= step ? "bg-rosewood text-white shadow-soft" : "bg-nude text-cocoa/45"}`}>
              {index < step ? <Check size={15} /> : index + 1}
            </div>
            <p className={`text-[11px] font-bold ${index <= step ? "text-rosewood" : "text-cocoa/45"}`}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudioNameStep({ studio, setStudio }: { studio: Studio; setStudio: (studio: Studio) => void }) {
  return (
    <div className="animate-[modalIn_180ms_ease-out]">
      <h2 className="text-2xl font-bold text-ink">Como seu studio se chama?</h2>
      <p className="mt-2 text-sm leading-6 text-cocoa/65">Esse nome aparece no cabecalho, dashboard e comunicacoes do sistema.</p>
      <div className="mt-6">
        <Input label="Nome do studio" value={studio.name} onChange={(event) => setStudio({ ...studio, name: event.target.value })} placeholder="Ex: Rose Beauty Studio" />
        <div className="rounded-2xl bg-linen p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-cocoa/45">Preview</p>
          <p className="mt-2 text-2xl font-bold text-rosewood">{studio.name || "Seu Studio"}</p>
        </div>
      </div>
    </div>
  );
}

export function LogoUploadStep({ studio, setStudio, setError }: { studio: Studio; setStudio: (studio: Studio) => void; setError: (error: string) => void }) {
  function onLogoChange(file?: File) {
    setError("");
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Envie uma imagem PNG, JPG ou WebP.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("A logo deve ter no maximo 1MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setStudio({ ...studio, logoUrl: String(reader.result) });
    reader.readAsDataURL(file);
  }

  return (
    <div className="animate-[modalIn_180ms_ease-out]">
      <h2 className="text-2xl font-bold text-ink">Adicione a logo do seu studio</h2>
      <p className="mt-2 text-sm leading-6 text-cocoa/65">Opcional agora, mas ajuda o sistema a ficar com cara de marca propria.</p>
      <div className="mt-6 rounded-2xl border border-nude bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-blush text-rosewood">
            {studio.logoUrl ? <img src={studio.logoUrl} alt="Preview da logo" className="h-full w-full object-cover" /> : <ImagePlus size={28} />}
          </div>
          <div>
            <p className="font-bold text-ink">{studio.name || "Seu Studio"}</p>
            <p className="text-sm text-cocoa/60">PNG, JPG ou WebP ate 1MB.</p>
          </div>
        </div>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => onLogoChange(event.target.files?.[0])} className="block min-h-12 w-full rounded-2xl border border-nude bg-white px-4 py-3 text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-nude file:px-3 file:py-2 file:text-sm file:font-bold" />
        {studio.logoUrl && <Button className="mt-3 w-full" variant="danger" icon={<Trash2 size={18} />} onClick={() => setStudio({ ...studio, logoUrl: "" })}>Remover logo</Button>}
      </div>
    </div>
  );
}

export function ServicesStep({ services, setServices }: { services: ServiceDraft[]; setServices: (services: ServiceDraft[]) => void }) {
  function updateService(index: number, service: ServiceDraft) {
    setServices(services.map((item, currentIndex) => currentIndex === index ? service : item));
  }

  function addService(service = { name: "", price: "", durationMinutes: 45 }) {
    setServices([...services, service]);
  }

  return (
    <div className="animate-[modalIn_180ms_ease-out]">
      <h2 className="text-2xl font-bold text-ink">Quais servicos voce oferece?</h2>
      <p className="mt-2 text-sm leading-6 text-cocoa/65">Comece com uma lista simples. Voce pode editar tudo depois.</p>
      <div className="mt-5 space-y-3">
        {!services.length && (
          <div className="rounded-3xl border border-dashed border-nude bg-linen p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blush text-rosewood">
              <Plus size={22} />
            </div>
            <h3 className="font-bold text-ink">Adicione os servicos que seu studio oferece.</h3>
            <p className="mt-2 text-sm leading-6 text-cocoa/60">Voce podera editar ou adicionar novos servicos depois.</p>
            <Button className="mt-5 w-full" icon={<Plus size={18} />} onClick={() => addService()}>
              Adicionar servico
            </Button>
          </div>
        )}
        {services.map((service, index) => (
          <div key={index} className="rounded-2xl border border-nude bg-white p-4 shadow-sm">
            <Input label="Servico" value={service.name} onChange={(event) => updateService(index, { ...service, name: event.target.value })} placeholder="Nome do servico" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Preco" value={service.price} onChange={(event) => updateService(index, { ...service, price: event.target.value })} placeholder="0,00" />
              <Input label="Duracao em minutos" type="number" value={service.durationMinutes} onChange={(event) => updateService(index, { ...service, durationMinutes: Number(event.target.value) })} />
            </div>
            <Button variant="danger" className="w-full" icon={<Trash2 size={18} />} onClick={() => setServices(services.filter((_, currentIndex) => currentIndex !== index))}>Remover</Button>
          </div>
        ))}
        {services.length > 0 && <Button variant="outline" className="w-full" icon={<Plus size={18} />} onClick={() => addService()}>Novo servico</Button>}
      </div>
    </div>
  );
}

export function ThemeStep({ studio, setStudio }: { studio: Studio; setStudio: (studio: Studio) => void }) {
  return (
    <div className="animate-[modalIn_180ms_ease-out]">
      <h2 className="text-2xl font-bold text-ink">Escolha a identidade do seu studio</h2>
      <p className="mt-2 text-sm leading-6 text-cocoa/65">As cores aparecem nos botoes, badges e destaques do sistema.</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-nude bg-white p-4 shadow-sm">
          <Input label="Cor principal" type="color" value={studio.primaryColor} onChange={(event) => setStudio({ ...studio, primaryColor: event.target.value })} />
          <Input label="Cor secundaria" type="color" value={studio.secondaryColor} onChange={(event) => setStudio({ ...studio, secondaryColor: event.target.value })} />
        </div>
        <div className="rounded-2xl border border-nude bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3 rounded-2xl p-3" style={{ backgroundColor: studio.secondaryColor }}>
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl text-white" style={{ backgroundColor: studio.primaryColor }}>
              {studio.logoUrl ? <img src={studio.logoUrl} alt="Logo preview" className="h-full w-full object-cover" /> : <Sparkles size={20} />}
            </div>
            <div>
              <p className="font-bold text-ink">{studio.name || "Seu Studio"}</p>
              <p className="text-xs text-cocoa/60">Preview do sistema</p>
            </div>
          </div>
          <Button style={{ backgroundColor: studio.primaryColor }} className="w-full text-white">Botao principal</Button>
          <div className="mt-3 rounded-2xl border border-nude bg-white p-4 shadow-sm">
            <p className="font-bold text-ink">Card de exemplo</p>
            <p className="mt-1 text-sm text-cocoa/60">Aparencia aplicada ao studio.</p>
          </div>
          <Badge className="mt-3" style={{ backgroundColor: studio.secondaryColor, color: studio.primaryColor, borderColor: studio.secondaryColor }}>Badge personalizada</Badge>
        </div>
      </div>
    </div>
  );
}

export function OnboardingFooter({ step, saving, onBack, onNext }: { step: number; saving: boolean; onBack: () => void; onNext: () => void }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <Button type="button" variant="secondary" onClick={onBack} disabled={saving || step === 0}>Voltar</Button>
      <Button type="button" onClick={onNext} disabled={saving}>{saving ? "Salvando..." : step === 3 ? "Finalizar" : "Continuar"}</Button>
    </div>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [studio, setStudio] = useState<Studio>(defaultStudio);
  const [services, setServices] = useState<ServiceDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const themeStyle = useMemo(() => ({
    "--color-primary-rgb": hexToRgb(studio.primaryColor),
    "--color-secondary-rgb": hexToRgb(studio.secondaryColor, "248 223 231")
  }) as React.CSSProperties, [studio.primaryColor, studio.secondaryColor]);

  useEffect(() => {
    fetch("/api/onboarding").then((response) => response.json()).then((data) => {
      if (data.studio?.onboardingCompleted) {
        router.replace("/dashboard");
        return;
      }
      setStudio({
        name: data.studio?.name ?? "",
        logoUrl: data.studio?.logoUrl ?? "",
        primaryColor: data.studio?.primaryColor ?? defaultStudio.primaryColor,
        secondaryColor: data.studio?.secondaryColor ?? defaultStudio.secondaryColor,
        onboardingCompleted: data.studio?.onboardingCompleted,
        onboardingStep: data.studio?.onboardingStep
      });
      setStep(Math.max(0, Math.min(3, (data.studio?.onboardingStep ?? 1) - 1)));
      setServices((data.services ?? []).map(serviceFromApi));
    }).catch(() => setError("Nao foi possivel carregar o onboarding.")).finally(() => setLoading(false));
  }, [router]);

  async function save(nextStep: number, complete = false) {
    if (step === 0 && !studio.name.trim()) {
      setError("Informe o nome do studio para continuar.");
      return;
    }
    setSaving(true);
    setError("");
    const response = await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: nextStep + 1,
        studio,
        services: step >= 2 ? services.filter((service) => service.name.trim()) : undefined,
        complete
      })
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(data.message ?? "Nao foi possivel salvar o progresso.");
      return;
    }
    document.documentElement.style.setProperty("--color-primary-rgb", hexToRgb(studio.primaryColor));
    document.documentElement.style.setProperty("--color-secondary-rgb", hexToRgb(studio.secondaryColor, "248 223 231"));
    window.dispatchEvent(new CustomEvent("studio-theme-updated"));
    if (complete) {
      router.push("/dashboard");
      return;
    }
    setStep(nextStep);
  }

  if (loading) {
    return (
      <OnboardingLayout>
        <Card className="mx-auto w-full max-w-xl text-center">
          <p className="font-bold text-ink">Carregando configuracao inicial...</p>
        </Card>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout>
      <div style={themeStyle}>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rosewood text-white shadow-soft">
            <Sparkles size={26} />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-rosewood">Studio Manager</p>
          <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Bem-vinda ao Studio Manager ✨</h1>
          <p className="mt-2 text-cocoa/65">Vamos configurar seu studio.</p>
        </div>
        <Card className="mx-auto w-full max-w-3xl">
          <StepIndicator step={step} />
          <div className="mt-8">
            {error && <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
            {step === 0 && <StudioNameStep studio={studio} setStudio={setStudio} />}
            {step === 1 && <LogoUploadStep studio={studio} setStudio={setStudio} setError={setError} />}
            {step === 2 && <ServicesStep services={services} setServices={setServices} />}
            {step === 3 && <ThemeStep studio={studio} setStudio={setStudio} />}
          </div>
          <OnboardingFooter step={step} saving={saving} onBack={() => setStep((current) => Math.max(0, current - 1))} onNext={() => save(Math.min(3, step + 1), step === 3)} />
          {step === 1 && <button type="button" onClick={() => save(2)} className="mt-3 w-full rounded-2xl px-4 py-3 text-sm font-bold text-cocoa/55 transition hover:bg-nude">Pular por enquanto</button>}
        </Card>
      </div>
    </OnboardingLayout>
  );
}
