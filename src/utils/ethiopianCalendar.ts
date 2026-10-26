/**
 * Ethiopian-calendar date *display* for Amharic only. English and Afaan
 * Oromo both use the ordinary Gregorian calendar — Oromo keeps its own
 * weekday and month names (Qubee), but the date is numbered the Gregorian
 * way, same as English.
 *
 * Conversion itself is delegated to `kenat` (a dedicated, tested Ethiopian
 * calendar library) rather than hand-rolled — the Gregorian↔Ethiopian
 * New Year offset is notoriously easy to get subtly wrong.
 *
 * This only ever affects *read-only display text*. Native
 * `<input type="date">` pickers are governed by the browser/OS and have no
 * way to render an Ethiopian calendar, so the journey-date and
 * date-of-birth pickers stay Gregorian; only text the app renders itself
 * (trip dates, ticket history, etc.) is converted.
 */

import { toEC, monthNames as ETHIOPIAN_MONTH_NAMES } from 'kenat';

export type DisplayLanguage = 'en' | 'am' | 'om';

export const WEEKDAYS_AM = ['እሁድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'];
// Standard Afaan Oromo weekday names; kenat has no Oromo locale to draw from.
export const WEEKDAYS_OM = ['Dilbata', 'Wiixata', 'Kibxata', 'Roobii', 'Kamiisa', 'Jimaata', 'Sanbata'];
// Afaan Oromo (Qubee) names for the Gregorian months; kenat has no Oromo locale to draw from.
export const MONTHS_OM = [
  'Amajjii', 'Guraandhala', 'Bitootessa', 'Caamsaa', 'Eebila', 'Waxabajjii',
  'Adoolessa', 'Hagayya', 'Fuulbana', 'Onkololeessa', 'Sadaasa', 'Muddee',
];

export { ETHIOPIAN_MONTH_NAMES };

interface FormatOptions {
  weekday?: 'short';
  month?: 'short';
  day: 'numeric';
  year?: 'numeric';
}

/**
 * Formats `date` for display — the Ethiopian calendar for 'am' only, the
 * ordinary Gregorian calendar for 'en' and 'om' — mirroring the
 * `date.toLocaleDateString(locale, options)` calls this app used before,
 * for the same two option shapes it relies on: `{ weekday: 'short', day: 'numeric' }`
 * (compact pill form) and the same plus `month: 'short'` (full form).
 */
export function formatDisplayDate(date: Date, lang: DisplayLanguage, options: FormatOptions): string {
  if (lang === 'en') {
    return date.toLocaleDateString('en-ET', options);
  }

  if (lang === 'om') {
    // Gregorian calendar, same as English, but with Afaan Oromo weekday and month names.
    const weekday = options.weekday ? WEEKDAYS_OM[date.getDay()] : undefined;
    let dateBody = options.month
      ? `${MONTHS_OM[date.getMonth()]} ${date.getDate()}`
      : `${date.getDate()}`;
    if (options.year) dateBody += ` ${date.getFullYear()}`;
    return weekday ? `${weekday}, ${dateBody}` : dateBody;
  }

  const eth = toEC(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const weekday = options.weekday ? WEEKDAYS_AM[date.getDay()] : undefined;
  let dateBody = options.month ? `${ETHIOPIAN_MONTH_NAMES.amharic[eth.month - 1]} ${eth.day}` : `${eth.day}`;
  if (options.year) dateBody += ` ${eth.year}`;
  return weekday ? `${weekday}፣ ${dateBody}` : dateBody;
}

/** Full numeric "day/month/year" date, for plain ticket/history records — Gregorian for 'en'/'om', Ethiopian for 'am'. */
export function formatDisplayDateNumeric(date: Date, lang: DisplayLanguage): string {
  if (lang === 'en' || lang === 'om') return date.toLocaleDateString();
  const eth = toEC(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return `${eth.day}/${eth.month}/${eth.year}`;
}
