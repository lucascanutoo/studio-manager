import { addMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { APP_TIME_ZONE, getBrazilDayRange, parseBrazilDateTime } from "../lib/timezone";

const startsAt = parseBrazilDateTime("2026-05-19T10:00");
const endsAt = addMinutes(startsAt, 45);
const { from, to } = getBrazilDayRange("2026-05-19");
const appearsOnBrazilDay = startsAt >= from && startsAt <= to;

console.log("Timezone:", APP_TIME_ZONE);
console.log("Created local:", "2026-05-19T10:00");
console.log("Stored UTC:", startsAt.toISOString());
console.log("Ends UTC:", endsAt.toISOString());
console.log("Filter from UTC:", from.toISOString());
console.log("Filter to UTC:", to.toISOString());
console.log("Displayed in Brazil:", formatInTimeZone(startsAt, APP_TIME_ZONE, "yyyy-MM-dd HH:mm"));
console.log("Returned when searching 2026-05-19:", appearsOnBrazilDay);

if (!appearsOnBrazilDay) {
  throw new Error("Expected 2026-05-19T10:00 America/Sao_Paulo to be inside the 2026-05-19 filter.");
}
