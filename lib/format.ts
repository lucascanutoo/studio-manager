export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function currencyToCents(value: string | number) {
  if (typeof value === "number") return Math.round(value * 100);
  const normalized = value.replace(/\D/g, "");
  return Number(normalized || 0);
}

export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function whatsappUrl(phone: string, message?: string) {
  const digits = onlyDigits(phone);
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function dateInputValue(value?: string | Date | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function datetimeLocalValue(value?: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}
