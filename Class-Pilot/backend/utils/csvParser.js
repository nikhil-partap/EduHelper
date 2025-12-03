// File: /backend/utils/csvParser.js
// Parses raw CSV text into attendance rows with validation and date normalization.

import { parse } from "csv-parse/sync";

// Normalize to midnight UTC (helps with uniqueness and consistent day grouping)
function normalizeDateToUTC(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// Try common formats: DD-MM-YYYY, YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY
function parseFlexibleDate(dateStr) {
  if (!dateStr) return null;
  const s = String(dateStr).trim();

  // DD-MM-YYYY
  let m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m)
    return normalizeDateToUTC(
      new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
    );

  // YYYY-MM-DD
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m)
    return normalizeDateToUTC(
      new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    );

  // DD/MM/YYYY
  m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m)
    return normalizeDateToUTC(
      new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
    );

  // MM/DD/YYYY
  m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m)
    return normalizeDateToUTC(
      new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]))
    );

  // Fallback: native Date parsing
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : normalizeDateToUTC(d);
}

/**
 * parseCSV
 * Input: raw CSV text (headers required)
 * Expected headers: studentName, rollNumber (optional), date, status
 * Output: { data: Array<{studentName, rollNumber, date: Date, status}>, errors: string[] }
 */
export function parseCSV(rawCsvText) {
  try {
    const rows = parse(rawCsvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const data = [];
    const errors = [];

    for (const row of rows) {
      const studentName = (row.studentName || "").trim();
      const rollNumber =
        row.rollNumber != null ? String(row.rollNumber).trim() : null;
      const status = (row.status || "").trim();
      const dateStr = (row.date || "").trim();

      // Validate required fields
      if (!studentName) {
        errors.push(`Missing studentName in row: ${JSON.stringify(row)}`);
        continue;
      }
      if (!dateStr) {
        errors.push(`Missing date for ${studentName}`);
        continue;
      }
      if (!status) {
        errors.push(`Missing status for ${studentName}`);
        continue;
      }

      // Validate status values
      if (!["Present", "Absent"].includes(status)) {
        errors.push(
          `Invalid status "${status}" for ${studentName}. Use "Present" or "Absent".`
        );
        continue;
      }

      // Parse and normalize date
      const date = parseFlexibleDate(dateStr);
      if (!date) {
        errors.push(`Invalid date "${dateStr}" for ${studentName}`);
        continue;
      }

      data.push({ studentName, rollNumber, date, status });
    }

    return { data, errors };
  } catch (err) {
    return { data: [], errors: [`CSV parse error: ${err.message}`] };
  }
}
