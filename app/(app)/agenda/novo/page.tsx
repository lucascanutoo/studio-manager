"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { formatCurrency } from "@/lib/format";
import { formatBrazilDateTimeInput } from "@/lib/timezone";

type Client = { id: string; name: string };
type Service = { id: string; name: string; priceCents: number; active: boolean };

export default function AppointmentFormPage() {
  return (
    <Suspense fallback={<p className="py-10 text-center text-cocoa/60">Carregando formulario...</p>}>
      <AppointmentForm />
    </Suspense>
  );
}

function AppointmentForm() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ clientId: "", serviceId: "", startsAt: formatBrazilDateTimeInput(new Date()), status: "SCHEDULED", notes: "" });

  useEffect(() => {
    Promise.all([fetch("/api/clients").then((res) => res.json()), fetch("/api/services").then((res) => res.json())]).then(([clientData, serviceData]) => {
      setClients(clientData.clients ?? []);
      setServices((serviceData.services ?? []).filter((service: Service) => service.active));
    });
    if (id) {
      fetch(`/api/appointments/${id}`).then((res) => res.json()).then((data) => {
        const item = data.appointment;
        setForm({ clientId: item.clientId, serviceId: item.serviceId, startsAt: formatBrazilDateTimeInput(item.startsAt), status: item.status, notes: item.notes ?? "" });
      });
    }
  }, [id]);

  useEffect(() => {
    if (!form.clientId && clients[0]) setForm((current) => ({ ...current, clientId: clients[0].id }));
    if (!form.serviceId && services[0]) setForm((current) => ({ ...current, serviceId: services[0].id }));
  }, [clients, services, form.clientId, form.serviceId]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const payload = id ? form : { ...form, status: "SCHEDULED" };
    const response = await fetch(id ? `/api/appointments/${id}` : "/api/appointments", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message ?? "Nao foi possivel salvar.");
      return;
    }
    router.push("/agenda");
  }

  return (
    <>
      <PageHeader title={id ? "Remarcar horario" : "Novo agendamento"} description={id ? "Atualize cliente, servico, data e status." : "Selecione cliente, servico, data e horario."} />
      <Card className="mx-auto max-w-xl">
        <form onSubmit={submit}>
          <Select label="Cliente" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
            {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
          </Select>
          <Select label="Servico" value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}>
            {services.map((service) => <option key={service.id} value={service.id}>{service.name} - {formatCurrency(service.priceCents)}</option>)}
          </Select>
          <Input label="Data e horario" type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
          {id && (
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="SCHEDULED">Agendado</option>
              <option value="CONFIRMED">Confirmado</option>
            </Select>
          )}
          <Textarea label="Observacoes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          {error && <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button className="w-full" icon={<Save size={18} />}>Salvar horario</Button>
        </form>
      </Card>
    </>
  );
}
