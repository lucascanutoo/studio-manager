import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { getBrazilDayRange, todayInBrazil } from "@/lib/timezone";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { searchParams } = new URL(request.url);
  const base = searchParams.get("month") ? new Date(`${searchParams.get("month")}-01T00:00:00`) : new Date();
  const from = startOfMonth(base);
  const to = endOfMonth(base);
  const todayRange = getBrazilDayRange(todayInBrazil());

  const [attendances, clientsCount, todayAppointments, topClients] = await Promise.all([
    prisma.attendance.findMany({
      where: { attendedAt: { gte: from, lte: to } },
      include: { service: true, client: true }
    }),
    prisma.client.count(),
    prisma.appointment.findMany({
      where: { startsAt: { gte: todayRange.from, lte: todayRange.to } },
      orderBy: { startsAt: "asc" },
      include: { client: true, service: true }
    }),
    prisma.attendance.groupBy({ by: ["clientId"], _count: { clientId: true }, orderBy: { _count: { clientId: "desc" } }, take: 5 })
  ]);

  const revenue = attendances.reduce((sum, item) => sum + item.finalValueCents, 0);
  const byService = Object.values(
    attendances.reduce<Record<string, { name: string; count: number; revenue: number }>>((acc, item) => {
      acc[item.serviceId] ??= { name: item.service.name, count: 0, revenue: 0 };
      acc[item.serviceId].count += 1;
      acc[item.serviceId].revenue += item.finalValueCents;
      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count);

  const monthlyRevenue = await Promise.all(
    Array.from({ length: 6 }).map(async (_, index) => {
      const month = subMonths(base, 5 - index);
      const rows = await prisma.attendance.findMany({ where: { attendedAt: { gte: startOfMonth(month), lte: endOfMonth(month) } } });
      return { month: format(month, "MM/yy"), revenue: rows.reduce((sum, row) => sum + row.finalValueCents, 0) / 100 };
    })
  );

  const clientNames = await prisma.client.findMany({ where: { id: { in: topClients.map((item) => item.clientId) } } });
  const topReturningClients = topClients.map((item) => ({
    name: clientNames.find((client) => client.id === item.clientId)?.name ?? "Cliente",
    count: item._count.clientId
  }));

  return NextResponse.json({
    metrics: {
      revenue,
      attendancesCount: attendances.length,
      clientsCount,
      averageTicket: attendances.length ? Math.round(revenue / attendances.length) : 0
    },
    byService,
    monthlyRevenue,
    todayAppointments,
    topReturningClients
  });
}
