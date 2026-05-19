import { PrismaClient, AppointmentStatus, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, addMinutes, setHours, setMinutes, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  await prisma.attendance.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      name: "Admin Beauty",
      email: "admin@beautyschedule.com",
      passwordHash: await bcrypt.hash("123456", 10)
    }
  });

  const clients = await Promise.all([
    prisma.client.create({ data: { name: "Mariana Costa", phone: "11988887777", birthDate: new Date("1994-06-12"), notes: "Prefere henna castanho claro." } }),
    prisma.client.create({ data: { name: "Bianca Souza", phone: "11977776666", birthDate: new Date("1990-03-20"), notes: "Cliente recorrente." } }),
    prisma.client.create({ data: { name: "Camila Alves", phone: "11966665555", notes: "Evitar horários após 18h." } })
  ]);

  const services = await Promise.all([
    prisma.service.create({ data: { name: "Design de sobrancelhas", description: "Mapeamento e design personalizado.", priceCents: 6000, durationMinutes: 45 } }),
    prisma.service.create({ data: { name: "Design com henna", description: "Design com aplicação de henna.", priceCents: 8500, durationMinutes: 60 } }),
    prisma.service.create({ data: { name: "Brow lamination", description: "Alinhamento e finalização dos fios.", priceCents: 14000, durationMinutes: 75 } }),
    prisma.service.create({ data: { name: "Lash lifting", description: "Curvatura e hidratação dos cílios.", priceCents: 16000, durationMinutes: 90 } }),
    prisma.service.create({ data: { name: "Manutenção", description: "Retoque e limpeza do design.", priceCents: 5000, durationMinutes: 35 } })
  ]);

  const now = new Date();
  const today10 = setMinutes(setHours(now, 10), 0);
  const tomorrow14 = setMinutes(setHours(addDays(now, 1), 14), 0);
  const doneDate = setMinutes(setHours(subDays(now, 7), 15), 0);

  const completed = await prisma.appointment.create({
    data: {
      clientId: clients[1].id,
      serviceId: services[1].id,
      startsAt: doneDate,
      endsAt: addMinutes(doneDate, services[1].durationMinutes),
      status: AppointmentStatus.COMPLETED
    }
  });

  await prisma.attendance.create({
    data: {
      appointmentId: completed.id,
      clientId: clients[1].id,
      serviceId: services[1].id,
      finalValueCents: 8500,
      paymentMethod: PaymentMethod.PIX,
      notes: "Cliente satisfeita com a tonalidade.",
      attendedAt: doneDate
    }
  });

  await prisma.appointment.createMany({
    data: [
      { clientId: clients[0].id, serviceId: services[0].id, startsAt: today10, endsAt: addMinutes(today10, 45), status: AppointmentStatus.CONFIRMED },
      { clientId: clients[2].id, serviceId: services[2].id, startsAt: tomorrow14, endsAt: addMinutes(tomorrow14, 75), status: AppointmentStatus.SCHEDULED }
    ]
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
