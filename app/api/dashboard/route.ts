import { addDays, addMonths } from "date-fns";
import { NextResponse } from "next/server";
import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireUser } from "@/lib/api";
import { formatBrazilDate, getBrazilDayRange, getBrazilMonthRange, getBrazilWeekRange, todayInBrazil } from "@/lib/timezone";

type DashboardPeriod = "daily" | "weekly" | "monthly";

function getPeriodRange(period: DashboardPeriod) {
  const today = todayInBrazil();
  if (period === "daily") return getBrazilDayRange(today);
  if (period === "weekly") return getBrazilWeekRange(today);
  return getBrazilMonthRange(today);
}

function buildRevenueSeries(rows: { attendedAt: Date; finalValueCents: number; paymentStatus: PaymentStatus }[], period: DashboardPeriod, from: Date) {
  const buckets = new Map<string, number>();

  if (period === "daily") {
    Array.from({ length: 24 }).forEach((_, index) => buckets.set(`${String(index).padStart(2, "0")}h`, 0));
  } else if (period === "weekly") {
    Array.from({ length: 7 }).forEach((_, index) => buckets.set(formatBrazilDate(addDays(from, index), "dd/MM"), 0));
  } else {
    Array.from({ length: 6 }).forEach((_, index) => buckets.set(formatBrazilDate(addMonths(from, -5 + index), "MM/yy"), 0));
  }

  rows.filter((row) => row.paymentStatus === PaymentStatus.PAID).forEach((row) => {
    const key = period === "daily"
      ? formatBrazilDate(row.attendedAt, "HH'h'")
      : period === "weekly"
        ? formatBrazilDate(row.attendedAt, "dd/MM")
        : formatBrazilDate(row.attendedAt, "MM/yy");
    buckets.set(key, (buckets.get(key) ?? 0) + row.finalValueCents / 100);
  });

  return Array.from(buckets.entries()).map(([label, revenue]) => ({ label, revenue }));
}

export async function GET(request: Request) {
  try {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") ?? "monthly") as DashboardPeriod;
  const safePeriod: DashboardPeriod = ["daily", "weekly", "monthly"].includes(period) ? period : "monthly";
  const { from, to } = getPeriodRange(safePeriod);
  const todayRange = getBrazilDayRange(todayInBrazil());

  const chartFrom = safePeriod === "monthly" ? addMonths(from, -5) : from;
  const [attendances, chartAttendances, clientsCount, todayAppointments, topClients] = await Promise.all([
    prisma.attendance.findMany({
      where: { studioId: auth.user!.studioId, attendedAt: { gte: from, lte: to } },
      include: { service: true, client: true }
    }),
    prisma.attendance.findMany({
      where: { studioId: auth.user!.studioId, attendedAt: { gte: chartFrom, lte: to } }
    }),
    prisma.client.count({ where: { studioId: auth.user!.studioId } }),
    prisma.appointment.findMany({
      where: {
        studioId: auth.user!.studioId,
        startsAt: { gte: todayRange.from, lte: todayRange.to },
        status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] }
      },
      orderBy: { startsAt: "asc" },
      include: { client: true, service: true }
    }),
    prisma.attendance.groupBy({ by: ["clientId"], where: { studioId: auth.user!.studioId }, _count: { clientId: true }, orderBy: { _count: { clientId: "desc" } }, take: 5 })
  ]);

  const paidAttendances = attendances.filter((item) => item.paymentStatus === PaymentStatus.PAID);
  const pendingAttendances = attendances.filter((item) => item.paymentStatus === PaymentStatus.PENDING);
  const revenue = paidAttendances.reduce((sum, item) => sum + item.finalValueCents, 0);
  const pendingValue = pendingAttendances.reduce((sum, item) => sum + item.finalValueCents, 0);
  const byService = Object.values(
    attendances.reduce<Record<string, { name: string; count: number; revenue: number }>>((acc, item) => {
      acc[item.serviceId] ??= { name: item.service.name, count: 0, revenue: 0 };
      acc[item.serviceId].count += 1;
      if (item.paymentStatus === PaymentStatus.PAID) acc[item.serviceId].revenue += item.finalValueCents;
      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count);

  const revenueSeries = buildRevenueSeries(chartAttendances, safePeriod, from);

  const clientNames = await prisma.client.findMany({ where: { studioId: auth.user!.studioId, id: { in: topClients.map((item) => item.clientId) } } });
  const topReturningClients = topClients.map((item) => ({
    name: clientNames.find((client) => client.id === item.clientId)?.name ?? "Cliente",
    count: item._count.clientId
  }));

  return NextResponse.json({
    metrics: {
      revenue,
      attendancesCount: attendances.length,
      clientsCount,
      averageTicket: paidAttendances.length ? Math.round(revenue / paidAttendances.length) : 0,
      pendingValue,
      pendingCount: pendingAttendances.length
    },
    byService,
    revenueSeries,
    todayAppointments,
    topReturningClients
  });
  } catch (error) {
    return handleApiError(error);
  }
}
