import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toEC, toGC } from 'kenat';
import { useTranslation } from 'react-i18next';
import {
  ETHIOPIAN_MONTH_NAMES,
  WEEKDAYS_AM,
  WEEKDAYS_OM,
  type DisplayLanguage,
} from '../../utils/ethiopianCalendar';

interface Props {
  /** Plain Gregorian `yyyy-mm-dd`, same shape a native `<input type="date">` uses. */
  value: string;
  onChange: (iso: string) => void;
  /** Calendar/month-name language — mirrors the rest of the app's date display. */
  lang: DisplayLanguage;
  min?: string;
  max?: string;
  ariaLabel: string;
  triggerClassName: string;
  id?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

function parseIso(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysInGregorianMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

function daysInEthiopianMonth(y: number, m: number): number {
  if (m !== 13) return 30;
  try {
    toGC(y, 13, 6);
    return 6;
  } catch {
    return 5;
  }
}

interface DayCell {
  iso: string;
  label: number;
  isToday: boolean;
}

function buildGregorianGrid(y: number, m: number, todayIso: string): (DayCell | null)[] {
  const startWeekday = new Date(y, m - 1, 1).getDay();
  const count = daysInGregorianMonth(y, m);
  const cells: (DayCell | null)[] = Array(startWeekday).fill(null);
  for (let d = 1; d <= count; d++) {
    const iso = `${y}-${pad(m)}-${pad(d)}`;
    cells.push({ iso, label: d, isToday: iso === todayIso });
  }
  return cells;
}

function buildEthiopianGrid(y: number, m: number, todayIso: string): (DayCell | null)[] {
  const first = toGC(y, m, 1);
  const startWeekday = new Date(first.year, first.month - 1, first.day).getDay();
  const count = daysInEthiopianMonth(y, m);
  const cells: (DayCell | null)[] = Array(startWeekday).fill(null);
  for (let d = 1; d <= count; d++) {
    const g = toGC(y, m, d);
    const iso = `${g.year}-${pad(g.month)}-${pad(g.day)}`;
    cells.push({ iso, label: d, isToday: iso === todayIso });
  }
  return cells;
}

/**
 * Journey-date picker whose calendar text (month names, weekday headers)
 * follows the selected site language, replacing a native
 * `<input type="date">`. A native picker's popup calendar is drawn by the
 * browser/OS using the device's own locale, not the site's language choice —
 * which is why Gregorian month names could show up transliterated into
 * Amharic script (e.g. "ኦክቶበር") even while English was selected in-app.
 * The underlying value is still a plain Gregorian `yyyy-mm-dd` string, so
 * every caller (search, min-date checks, API submission) is unaffected.
 */
export default function DatePicker({ value, onChange, lang, min, max, ariaLabel, triggerClassName, id }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(0);
  const [viewMonth, setViewMonth] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const parsed = parseIso(value) ?? parseIso(todayIsoDate())!;

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const openPicker = () => {
    if (lang === 'en') {
      setViewYear(parsed.y);
      setViewMonth(parsed.m);
    } else {
      const eth = toEC(parsed.y, parsed.m, parsed.d);
      setViewYear(eth.year);
      setViewMonth(eth.month);
    }
    setOpen(true);
  };

  const todayIso = todayIsoDate();
  const monthCount = lang === 'en' ? 12 : 13;

  const grid = useMemo(() => {
    if (!open || viewYear === 0) return [];
    return lang === 'en'
      ? buildGregorianGrid(viewYear, viewMonth, todayIso)
      : buildEthiopianGrid(viewYear, viewMonth, todayIso);
  }, [open, lang, viewYear, viewMonth, todayIso]);

  const monthLabel = useMemo(() => {
    if (!open || viewYear === 0) return '';
    if (lang === 'en') {
      return new Date(viewYear, viewMonth - 1, 1).toLocaleDateString('en-ET', { month: 'long', year: 'numeric' });
    }
    const names = lang === 'am' ? ETHIOPIAN_MONTH_NAMES.amharic : ETHIOPIAN_MONTH_NAMES.english;
    return `${names[viewMonth - 1]} ${viewYear}`;
  }, [open, lang, viewYear, viewMonth]);

  const weekdayHeaders = useMemo(
    () =>
      lang === 'en'
        ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
        : (lang === 'am' ? WEEKDAYS_AM : WEEKDAYS_OM).map((name) => name.slice(0, 2)),
    [lang],
  );

  const goMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 1) {
      m = monthCount;
      y -= 1;
    } else if (m > monthCount) {
      m = 1;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  };

  const triggerLabel = useMemo(() => {
    if (lang === 'en') {
      return new Date(parsed.y, parsed.m - 1, parsed.d).toLocaleDateString('en-ET', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
    const eth = toEC(parsed.y, parsed.m, parsed.d);
    const names = lang === 'am' ? ETHIOPIAN_MONTH_NAMES.amharic : ETHIOPIAN_MONTH_NAMES.english;
    const weekdays = lang === 'am' ? WEEKDAYS_AM : WEEKDAYS_OM;
    const separator = lang === 'am' ? '፣' : ',';
    const jsWeekday = new Date(parsed.y, parsed.m - 1, parsed.d).getDay();
    return `${weekdays[jsWeekday]}${separator} ${names[eth.month - 1]} ${eth.day}`;
  }, [lang, parsed.y, parsed.m, parsed.d]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={triggerClassName}
      >
        {triggerLabel}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={ariaLabel}
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-[280px] rounded-xl bg-white p-3 shadow-lg"
          style={{ border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              aria-label={t('common.prevMonth')}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-slate-900">{monthLabel}</span>
            <button
              type="button"
              onClick={() => goMonth(1)}
              aria-label={t('common.nextMonth')}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekdayHeaders.map((label, i) => (
              <span key={i} className="text-[11px] font-bold text-slate-400 text-center">
                {label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {grid.map((cell, i) => {
              if (!cell) return <span key={`blank-${i}`} />;
              const disabled = (min !== undefined && cell.iso < min) || (max !== undefined && cell.iso > max);
              const selected = cell.iso === value;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(cell.iso);
                    setOpen(false);
                  }}
                  aria-label={`${monthLabel} ${cell.label}`}
                  aria-current={cell.isToday ? 'date' : undefined}
                  className={`h-8 rounded-lg text-[13px] font-semibold ${
                    selected
                      ? 'bg-sky-600 text-white'
                      : disabled
                        ? 'text-slate-300'
                        : 'text-slate-700 hover:bg-slate-100'
                  } ${cell.isToday && !selected ? 'ring-1 ring-sky-400' : ''}`}
                >
                  {cell.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
