/**
 * Ethiopian-calendar date *display* for Amharic and Afaan Oromo.
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

const WEEKDAYS_AM = ['እሁድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'];
// Standard Afaan Oromo weekday names; kenat has no Oromo locale to draw from.
const WEEKDAYS_OM = ['Dilbata', 'Wiixata', 'Kibxata', 'Roobii', 'Kamiisa', 'Jimaata', 'Sanbata'];

interface FormatOptions {
  weekday?: 'short';
  month?: 'short';
  day: 'numeric';
  year?: 'numeric';
}

/**
 * Formats `date` for display — the Ethiopian calendar for 'am'/'om', the
 * ordinary Gregorian calendar for 'en' — mirroring the
 * `date.toLocaleDateString(locale, options)` calls this app used before,
 * for the same two option shapes it relies on: `{ weekday: 'short', day: 'numeric' }`
 * (compact pill form) and the same plus `month: 'short'` (full form).
 */
export function formatDisplayDate(date: Date, lang: DisplayLanguage, options: FormatOptions): string {
  if (lang === 'en') {
    return date.toLocaleDateString('en-ET', options);
  }

  const eth = toEC(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const months = lang === 'am' ? ETHIOPIAN_MONTH_NAMES.amharic : ETHIOPIAN_MONTH_NAMES.english;
  const weekdays = lang === 'am' ? WEEKDAYS_AM : WEEKDAYS_OM;
  const separator = lang === 'am' ? '፣' : ',';

  const weekday = options.weekday ? weekdays[date.getDay()] : undefined;
  let dateBody = options.month ? `${months[eth.month - 1]} ${eth.day}` : `${eth.day}`;
  if (options.year) dateBody += ` ${eth.year}`;
  return weekday ? `${weekday}${separator} ${dateBody}` : dateBody;
}

/** Full numeric "day/month/year" Ethiopian date, for plain ticket/history records. */
export function formatDisplayDateNumeric(date: Date, lang: DisplayLanguage): string {
  if (lang === 'en') return date.toLocaleDateString();
  const eth = toEC(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return `${eth.day}/${eth.month}/${eth.year}`;
}
