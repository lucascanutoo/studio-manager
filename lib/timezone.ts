import { endOfWeek, format, parseISO, startOfWeek } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const APP_TIME_ZONE = "America/Sao_Paulo";

export function parseBrazilDateTime(value: string) {
  const hasExplicitTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
  return hasExplicitTimezone ? new Date(value) : fromZonedTime(value, APP_TIME_ZONE);
}

export function getBrazilDayRange(date: string) {
  return {
    from: fromZonedTime(`${date}T00:00:00.000`, APP_TIME_ZONE),
    to: fromZonedTime(`${date}T23:59:59.999`, APP_TIME_ZONE)
  };
}

export function getBrazilWeekRange(date: string) {
  const localBase = parseISO(`${date}T12:00:00`);
  const weekStart = startOfWeek(localBase, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(localBase, { weekStartsOn: 1 });

  return {
    from: fromZonedTime(`${format(weekStart, "yyyy-MM-dd")}T00:00:00.000`, APP_TIME_ZONE),
    to: fromZonedTime(`${format(weekEnd, "yyyy-MM-dd")}T23:59:59.999`, APP_TIME_ZONE)
  };
}

export function todayInBrazil() {
  return formatInTimeZone(new Date(), APP_TIME_ZONE, "yyyy-MM-dd");
}

export function formatBrazilDateTimeInput(value: string | Date) {
  return formatInTimeZone(value, APP_TIME_ZONE, "yyyy-MM-dd'T'HH:mm");
}

export function formatBrazilDate(value: string | Date, pattern: string) {
  return formatInTimeZone(value, APP_TIME_ZONE, pattern);
}
