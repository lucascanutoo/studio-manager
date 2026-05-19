export function getAppointmentStatusLabel(status?: string | null) {
  const normalized = (status ?? "").trim().toUpperCase();

  const labels: Record<string, string> = {
    SCHEDULED: "Agendado",
    CONFIRMED: "Confirmado",
    COMPLETED: "Concluído",
    CANCELED: "Cancelado",
    CANCELLED: "Cancelado"
  };

  return labels[normalized] ?? "Agendado";
}

export function getAppointmentStatusBadgeClass(status?: string | null) {
  const normalized = (status ?? "").trim().toUpperCase();

  if (normalized === "CONFIRMED") return "bg-green-50 text-green-700";
  if (normalized === "COMPLETED") return "bg-blush text-rosewood";
  if (normalized === "CANCELED" || normalized === "CANCELLED") return "bg-red-50 text-red-700";
  return "bg-nude text-cocoa";
}
