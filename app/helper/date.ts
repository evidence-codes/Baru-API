import { DateTime } from 'luxon';

export function convertDateFromString(dateString: string): Date {
  return DateTime.fromISO(dateString).toUTC().toJSDate();
}

export function parseDateToLuxonDate(date: Date) {
  return DateTime.fromJSDate(date).toUTC();
}

export function isDateInPast(date: Date): boolean {
  const currentDateUTC = DateTime.utc();
  return DateTime.fromJSDate(date) < currentDateUTC;
}

export function subtractMinutesFromDate(
  sessionDateUTC: Date,
  minutesBefore: number,
): Date {
  return DateTime.fromJSDate(sessionDateUTC)
    .minus({ minutes: minutesBefore })
    .toUTC()
    .toJSDate();
}

export function convertToUTC(date: Date): Date {
  return DateTime.fromJSDate(date).toUTC().toJSDate();
}

export function getCurrentDateInUTC(timezone: string): Date {
  return DateTime.now().setZone(timezone).toUTC().toJSDate();
}

export function getCurrentDateInTimezone(timezone: string): Date {
  return DateTime.now().setZone(timezone).toJSDate();
}

export function addHoursToDate(date: Date, hours: number): Date {
  return DateTime.fromJSDate(date).plus({ hours }).toJSDate();
}

export function getEndOfDay(
  date: Date,
  timezone: string,
): DateTime<true> | DateTime<false> {
  return DateTime.fromJSDate(date).setZone(timezone).endOf('day');
}
export function getStartOfDay(
  date: Date,
  timezone: string,
): DateTime<true> | DateTime<false> {
  return DateTime.fromJSDate(date).setZone(timezone).startOf('day');
}

export function getToday(timezone: string): { startDay: Date; endDay: Date } {
  const today = DateTime.now().setZone(timezone);

  const startDay = today.startOf('day').toJSDate();
  const endDay = today.endOf('day').toJSDate();

  return { startDay, endDay };
}

export function hoursToMilliseconds(hours: number): number {
  return hours * 60 * 60 * 1000;
}

export function isTheSameDay(
  date1: Date,
  date2: Date,
  timezone: string,
): boolean {
  return DateTime.fromJSDate(date1)
    .setZone(timezone)
    .hasSame(DateTime.fromJSDate(date2).setZone(timezone), 'day');
}

export function isDateToday(date: Date, timezone: string): boolean {
  const currentDate = DateTime.now().setZone(timezone).toJSDate();
  return isTheSameDay(date, currentDate, timezone);
}
