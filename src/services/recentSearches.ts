import { SearchParams } from '../types';

const STORAGE_KEY = 'menahariya_recent_searches';
const MAX_ENTRIES = 5;

export interface RecentSearch extends SearchParams {
  savedAt: number;
}

function isRecentSearch(value: unknown): value is RecentSearch {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.from === 'string' &&
    typeof v.to === 'string' &&
    typeof v.date === 'string' &&
    typeof v.savedAt === 'number'
  );
}

/** Only from/to/date are ever stored — no name, phone, or other personal data. */
export function getRecentSearches(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecentSearch);
  } catch {
    return [];
  }
}

export function addRecentSearch(entry: SearchParams): RecentSearch[] {
  try {
    const deduped = getRecentSearches().filter(
      (s) => !(s.from === entry.from && s.to === entry.to),
    );
    const next = [{ ...entry, savedAt: Date.now() }, ...deduped].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return getRecentSearches();
  }
}

/** A saved date that has since passed is bumped to today so repeating an old
 *  search never silently re-runs a date that can no longer be booked. */
export function resolveSearchDate(date: string, todayIso: string): string {
  return date < todayIso ? todayIso : date;
}
