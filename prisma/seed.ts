import { PrismaClient, AppointmentStatus, PaymentMethod, PaymentStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, addMinutes, setHours, setMinutes, subDays } from "date-fns";

const prisma = new PrismaClient();

async function createStudioData(input: {
  name: string;
  slug: string;
  email: string;
  primaryColor: string;
  secondaryColor: string;
  clients: { name: string; phone: string; notes?: string }[];
}) {
  const studio = await prisma.studio.create({
    data: {
      name: input.name,
      slug: input.slug,
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      theme: "light"
    }
  });

  await prisma.user.create({
    data: {
      name: `Admin ${input.name}`,
      email: input.email,
      passwordHash: await bcrypt.hash("123456", 10),
      role: UserRole.ADMIN,
      studioId: studio.id
    }
  });

  const clients = await Promise.all(input.clients.map((client) => prisma.client.create({ data: { ...client, studioId: studio.id } })));

  const services = await Promise.all([
    prisma.service.create({ data: { studioId: studio.id, name: "Design de sobrancelhas", description: "Mapeamento e design personalizado.", priceCents: 6000, durationMinutes: 45 } }),
    prisma.service.create({ data: { studioId: studio.id, name: "Design com henna", description: "Design com aplicacao de henna.", priceCents: 8500, durationMinutes: 60 } }),
    prisma.service.create({ data: { studioId: studio.id, name: "Brow lamination", description: "Alinhamento e finalizacao dos fios.", priceCents: 14000, durationMinutes: 75 } }),
    prisma.service.create({ data: { studioId: studio.id, name: "Lash lifting", description: "Curvatura e hidratacao dos cilios.", priceCents: 16000, durationMinutes: 90 } }),
    prisma.service.create({ data: { studioId: studio.id, name: "Manutencao", description: "Retoque e limpeza do design.", priceCents: 5000, durationMinutes: 35 } })
  ]);

  const now = new Date();
  const today10 = setMinutes(setHours(now, 10), 0);
  const tomorrow14 = setMinutes(setHours(addDays(now, 1), 14), 0);
  const doneDate = setMinutes(setHours(subDays(now, 7), 15), 0);

  const completed = await prisma.appointment.create({
    data: {
      studioId: studio.id,
      clientId: clients[1].id,
      serviceId: services[1].id,
      startsAt: doneDate,
      endsAt: addMinutes(doneDate, services[1].durationMinutes),
      status: AppointmentStatus.COMPLETED
    }
  });

  await prisma.attendance.create({
    data: {
      studioId: studio.id,
      appointmentId: completed.id,
      clientId: clients[1].id,
      serviceId: services[1].id,
      finalValueCents: 8500,
      paymentMethod: PaymentMethod.PIX,
      paymentStatus: PaymentStatus.PAID,
      notes: "Cliente satisfeita com a tonalidade.",
      attendedAt: doneDate
    }
  });

  await prisma.appointment.createMany({
    data: [
      { studioId: studio.id, clientId: clients[0].id, serviceId: services[0].id, startsAt: today10, endsAt: addMinutes(today10, 45), status: AppointmentStatus.CONFIRMED },
      { studioId: studio.id, clientId: clients[2].id, serviceId: services[2].id, startsAt: tomorrow14, endsAt: addMinutes(tomorrow14, 75), status: AppointmentStatus.SCHEDULED }
    ]
  });
}

async function main() {
  await prisma.attendance.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.studio.deleteMany();

  await createStudioData({
    name: "Rose Beauty",
    slug: "rose-beauty",
    email: "admin@rosebeauty.com",
    primaryColor: "#9f5366",
    secondaryColor: "#f8dfe7",
    clients: [
      { name: "Mariana Costa", phone: "11988887777", notes: "Prefere henna castanho claro." },
      { name: "Bianca Souza", phone: "11977776666", notes: "Cliente recorrente." },
      { name: "Camila Alves", phone: "11966665555", notes: "Evitar horarios apos 18h." }
    ]
  });

  await createStudioData({
    name: "Gold Brows",
    slug: "gold-brows",
    email: "admin@goldbrows.com",
    primaryColor: "#b98b2f",
    secondaryColor: "#f6e8c8",
    clients: [
      { name: "Larissa Mendes", phone: "21988887777", notes: "Gosta de design natural." },
      { name: "Fernanda Lima", phone: "21977776666", notes: "Prefere manutencao mensal." },
      { name: "Paula Rocha", phone: "21966665555", notes: "Indicada pela Larissa." }
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
