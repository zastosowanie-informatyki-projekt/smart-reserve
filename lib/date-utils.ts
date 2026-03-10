import { fromZonedTime, toZonedTime } from "date-fns-tz";

export const APP_TIMEZONE = "Europe/Warsaw";

/**
 * Converts a date string ("YYYY-MM-DD") and time string ("HH:mm") in the app
 * timezone (Europe/Warsaw) to a UTC Date object.
 */
export function toUTC(dateStr: string, timeStr: string): Date {
  const local = new Date(`${dateStr}T${timeStr}:00`);
  return fromZonedTime(local, APP_TIMEZONE);
}

/**
 * Converts a UTC Date to a Date representing the same instant in the app
 * timezone. The returned Date's getHours/getMinutes/getDay reflect Warsaw time.
 */
export function toAppTimezone(date: Date): Date {
  return toZonedTime(date, APP_TIMEZONE);
}

/**
 * Returns an "HH:mm" string representing the given UTC Date in the app timezone.
 * Used to compare against opening hours stored as "HH:mm" strings.
 */
export function formatTimeInAppTz(date: Date): string {
  const zoned = toZonedTime(date, APP_TIMEZONE);
  return `${String(zoned.getHours()).padStart(2, "0")}:${String(zoned.getMinutes()).padStart(2, "0")}`;
}

/**
 * Returns the day of week (Monday=0 .. Sunday=6) for the given UTC Date
 * in the app timezone.
 */
export function getDayOfWeekInAppTz(date: Date): number {
  const zoned = toZonedTime(date, APP_TIMEZONE);
  const jsDay = zoned.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}
