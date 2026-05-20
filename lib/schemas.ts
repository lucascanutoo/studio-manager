import { AppointmentStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { currencyToCents, onlyDigits } from "@/lib/format";

const paymentMethodSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toUpperCase();
  const aliases: Record<string, PaymentMethod | "PENDING"> = {
    PIX: PaymentMethod.PIX,
    CASH: PaymentMethod.CASH,
    DINHEIRO: PaymentMethod.CASH,
    DEBIT_CARD: PaymentMethod.CARD,
    CREDIT_CARD: PaymentMethod.CARD,
    CARD: PaymentMethod.CARD,
    CARTAO: PaymentMethod.CARD,
    CARTÃO: PaymentMethod.CARD,
    PENDING: "PENDING",
    PENDENTE: "PENDING",
    PAGAMENTO_PENDENTE: "PENDING"
  };
  return aliases[normalized] ?? value;
}, z.union([z.nativeEnum(PaymentMethod), z.literal("PENDING")]));

const paidPaymentMethodSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toUpperCase();
  const aliases: Record<string, PaymentMethod> = {
    PIX: PaymentMethod.PIX,
    CASH: PaymentMethod.CASH,
    DINHEIRO: PaymentMethod.CASH,
    DEBIT_CARD: PaymentMethod.CARD,
    CREDIT_CARD: PaymentMethod.CARD,
    CARD: PaymentMethod.CARD,
    CARTAO: PaymentMethod.CARD,
    CARTÃO: PaymentMethod.CARD
  };
  return aliases[normalized] ?? value;
}, z.nativeEnum(PaymentMethod));

const optionalCurrencySchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return "0";
  return value;
}, z.union([z.string(), z.number()]).transform(currencyToCents));

const requiredCurrencySchema = z.preprocess((value) => value, z.union([z.string().min(1, "Informe o valor pago."), z.number()]).transform(currencyToCents)).refine((value) => value >= 0, "Informe um valor valido.");

export const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  studioName: z.string().min(2, "Informe o nome do studio."),
  email: z.string().email("Informe um email valido."),
  password: z.string().min(6, "Use pelo menos 6 caracteres.")
});

export const loginSchema = z.object({
  email: z.string().email("Informe um email valido."),
  password: z.string().min(1, "Informe sua senha.")
});

export const clientSchema = z.object({
  name: z.string().min(2, "Informe o nome."),
  phone: z.string().min(8, "Informe o WhatsApp.").transform(onlyDigits),
  notes: z.string().optional().nullable()
});

export const serviceSchema = z.object({
  name: z.string().min(2, "Informe o servico."),
  description: z.string().optional().nullable(),
  price: z.union([z.string(), z.number()]).transform(currencyToCents),
  durationMinutes: z.coerce.number().int().min(10, "Duracao minima de 10 minutos."),
  active: z.coerce.boolean().default(true)
});

export const appointmentSchema = z.object({
  clientId: z.string().min(1),
  serviceId: z.string().min(1),
  startsAt: z.string().datetime().or(z.string().min(16)),
  status: z.nativeEnum(AppointmentStatus).default(AppointmentStatus.SCHEDULED),
  notes: z.string().optional().nullable()
});

export const attendanceSchema = z.object({
  finalValue: optionalCurrencySchema,
  paymentMethod: paymentMethodSchema,
  notes: z.string().optional().nullable()
}).transform((data) => ({
  finalValue: data.finalValue,
  paymentMethod: data.paymentMethod === "PENDING" ? null : data.paymentMethod,
  paymentStatus: data.paymentMethod === "PENDING" ? PaymentStatus.PENDING : PaymentStatus.PAID,
  notes: data.notes
}));

export const paymentUpdateSchema = z.object({
  finalValue: requiredCurrencySchema,
  paymentMethod: paidPaymentMethodSchema
});
