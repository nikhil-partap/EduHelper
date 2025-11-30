// File: /backend/utils/dateCalculator.js
// Calculates an end date by skipping weekends and provided holidays.

const normalizeUTC = (d) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

const isWeekend = (d) => {
  const day = d.getUTCDay(); // 0=Sun, 6=Sat
  return day === 0 || day === 6;
};

/**
 * calculateEndDate
 * - Takes a start date, a duration in working days, and an array of holiday dates
 * - Skips weekends (Sat, Sun) and holidays
 * - Returns the computed end date (inclusive)
 *
 * @param {Date|string|number} startDate
 * @param {number} durationDays - number of working days (>=1)
 * @param {Array<Date|string|number>} holidays - list of dates to skip
 * @returns {Date} endDate (normalized to midnight UTC)
 */
export function calculateEndDate(startDate, durationDays, holidays = []) {
  if (!startDate || !Number.isFinite(durationDays) || durationDays < 1) {
    throw new Error(
      "Invalid inputs: startDate and durationDays (>=1) are required"
    );
  }

  const holidaySet = new Set(holidays.map((h) => normalizeUTC(h).getTime()));

  // Move to the first working day if startDate is weekend/holiday
  let current = normalizeUTC(startDate);
  while (isWeekend(current) || holidaySet.has(current.getTime())) {
    current.setUTCDate(current.getUTCDate() + 1);
    current = normalizeUTC(current);
  }

  let remaining = Math.floor(durationDays);

  // Count the start day as day 1 (inclusive duration)
  while (remaining > 1) {
    current.setUTCDate(current.getUTCDate() + 1);
    const day = normalizeUTC(current);
    if (!isWeekend(day) && !holidaySet.has(day.getTime())) {
      remaining -= 1;
    }
  }

  return normalizeUTC(current);
}
