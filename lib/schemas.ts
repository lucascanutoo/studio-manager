import { AppointmentStatus, PaymentMethod } from "@prisma/client";
import { z } from "zod";
import { currencyToCents, onlyDigits } from "@/lib/format";

export const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
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
  finalValue: z.union([z.string(), z.number()]).transform(currencyToCents),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().optional().nullable()
});
