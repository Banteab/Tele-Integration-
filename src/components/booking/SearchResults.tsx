import { motion } from 'motion/react';
import {
  Clock,
  MapPin,
  Users,
  AlertCircle,
  Bus as BusIcon,
  ShieldCheck,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { SearchParams, Bus } from '../../types';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useMemo, Fragment } from 'react';
import { searchTrips } from '../../services/api';
import { toast } from 'sonner';
import { PrimaryButton, Skeleton } from '../ui/ScreenUI';
import { THEME, BRAND } from '../../config/theme';

interface Props {
  searchParams: SearchParams;
  onSelectBus: (bus: Bus) => void;
  onBack: () => void;
  isLoading?: boolean;
}

type SortKey = 'cheapest' | 'fastest' | 'earliest';
type WindowKey = 'early' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';

const WINDOW_ORDER: WindowKey[] = ['early', 'morning', 'midday', 'afternoon', 'evening', 'night'];
const WINDOW_LABEL_KEYS: Record<WindowKey, string> = {
  early: 'search.windowEarly',
  morning: 'search.windowMorning',
  midday: 'search.windowMidday',
  afternoon: 'search.windowAfternoon',
  evening: 'search.windowEvening',
  night: 'search.windowNight',
};

function formatBusTime(value: string) {
  if (!value || value === 'N/A') return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString('en-ET', { hour: '2-digit', minute: '2-digit' });
}

/** Estimated journey time from the real departure/arrival timestamps — never fabricated. */
function formatDuration(departure: string, arrival: string): string | null {
  const dep = new Date(departure);
  const arr = new Date(arrival);
  if (Number.isNaN(dep.getTime()) || Number.isNaN(arr.getTime())) return null;
  const minutes = Math.round((arr.getTime() - dep.getTime()) / 60000);
  if (minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function durationMinutes(departure: string, arrival: string): number {
  const dep = new Date(departure);
  const arr = new Date(arrival);
  if (Number.isNaN(dep.getTime()) || Number.isNaN(arr.getTime())) return Number.POSITIVE_INFINITY;
  const minutes = (arr.getTime() - dep.getTime()) / 60000;
  return minutes > 0 ? minutes : Number.POSITIVE_INFINITY;
}

function formatMinutes(minutes: number): string | null {
  if (!Number.isFinite(minutes)) return null;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** Which part of the day a real departure timestamp falls in — used for the
 *  departure-window filter. Returns null only when the timestamp is unusable. */
function departureWindowKey(departureTime: string): WindowKey | null {
  const d = new Date(departureTime);
  if (Number.isNaN(d.getTime())) return null;
  const h = d.getHours();
  if (h < 6) return 'early';
  if (h < 9) return 'morning';
  if (h < 13) return 'midday';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

/** A presentational accent for the real bus-class string the API returns
 *  (e.g. "VIP", "Special", "Standard") — purely a color choice, not a claim. */
function typeBadgeClasses(type: string): string {
  const v = type.toLowerCase();
  if (v.includes('vip') || v.includes('lux')) return 'bg-sky-100 text-sky-800';
  if (v.includes('special')) return 'bg-amber-100 text-amber-800';
  return 'bg-slate-100 text-slate-700';
}

function isoDateOnly(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function shiftDate(dateString: string, days: number): string {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  d.setDate(d.getDate() + days);
  return isoDateOnly(d);
}

function todayIsoDate(): string {
  return isoDateOnly(new Date());
}

export default function SearchResults({
  searchParams,
  onSelectBus,
  onBack,
  isLoading,
}: Props) {
  const { t, i18n } = useTranslation();
  const [activeDate, setActiveDate] = useState(searchParams.date);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(isLoading || false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('cheapest');
  const [selectedOperators, setSelectedOperators] = useState<Set<string> | null>(null);
  const [selectedWindows, setSelectedWindows] = useState<Set<WindowKey> | null>(null);
  const [selectedTerminals, setSelectedTerminals] = useState<Set<string> | null>(null);

  // A fresh search from Home resets the locally-shiftable date strip back to what was searched.
  useEffect(() => {
    setActiveDate(searchParams.date);
  }, [searchParams.from, searchParams.to, searchParams.date]);

  useEffect(() => {
    let cancelled = false;

    const fetchBuses = async () => {
      try {
        setLoading(true);
        setError(null);
        const dateObj = new Date(activeDate);
        const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        const response = await searchTrips(
          searchParams.from,
          searchParams.to,
          formattedDate,
        );
        if (cancelled) return;

        const transformedBuses: Bus[] = (response || []).map((trip: Bus) => ({
          id: trip.id,
          operator: trip.operator || t('common.unknownOperator'),
          type: trip.type || t('common.standard'),
          departureTime: trip.departureTime || 'N/A',
          arrivalTime: trip.arrivalTime || 'N/A',
          price: trip.price || 0,
          totalSeats: trip.totalSeats || 0,
          availableSeats: trip.availableSeats || 0,
          sideNumber: trip.sideNumber,
          from: trip.from || searchParams.from,
          to: trip.to || searchParams.to,
          vehicleId: trip.vehicleId,
          scheduleId: trip.scheduleId,
          routeId: trip.routeId,
        }));

        setBuses(transformedBuses);
        setSelectedOperators(null);
        setSelectedWindows(null);
        setSelectedTerminals(null);
        if (transformedBuses.length === 0) {
          setError(t('booking.noResults'));
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ||
          (err as Error)?.message ||
          t('search.searchFailed');
        setError(message);
        toast.error(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (searchParams.from && searchParams.to && activeDate) {
      fetchBuses();
    }

    return () => {
      cancelled = true;
    };
  }, [searchParams.from, searchParams.to, activeDate, t]);

  /** Cheapest real fare per real operator appearing in this result set. */
  const operatorGroups = useMemo(() => {
    const map = new Map<string, number>();
    buses.forEach((b) => {
      const cur = map.get(b.operator);
      if (cur === undefined || b.price < cur) map.set(b.operator, b.price);
    });
    return Array.from(map.entries()).sort((a, b) => a[1] - b[1]);
  }, [buses]);

  /** Real departure-time buckets, only the ones that actually have a bus in them. */
  const windowGroups = useMemo(() => {
    const counts = new Map<WindowKey, number>();
    buses.forEach((b) => {
      const key = departureWindowKey(b.departureTime);
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    });
    return WINDOW_ORDER.filter((k) => counts.has(k)).map((key) => ({ key, count: counts.get(key)! }));
  }, [buses]);

  /** Real boarding points — whatever the API returned as each bus's origin (terminal or city). */
  const terminalGroups = useMemo(() => {
    const counts = new Map<string, number>();
    buses.forEach((b) => {
      if (b.from) counts.set(b.from, (counts.get(b.from) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [buses]);

  const activeOperators = selectedOperators ?? new Set(operatorGroups.map(([op]) => op));
  const activeWindows = selectedWindows ?? new Set(windowGroups.map((w) => w.key));
  const activeTerminals = selectedTerminals ?? new Set(terminalGroups.map(([term]) => term));
  const filtersActive = selectedOperators !== null || selectedWindows !== null || selectedTerminals !== null;

  const visibleBuses = useMemo(() => {
    const filtered = buses.filter((b) => {
      const opOk = activeOperators.has(b.operator);
      const winKey = departureWindowKey(b.departureTime);
      const winOk = !winKey || activeWindows.has(winKey);
      const termOk = !b.from || activeTerminals.has(b.from);
      return opOk && winOk && termOk;
    });
    return [...filtered].sort((a, b) => {
      if (sortBy === 'cheapest') return a.price - b.price;
      if (sortBy === 'fastest') return durationMinutes(a.departureTime, a.arrivalTime) - durationMinutes(b.departureTime, b.arrivalTime);
      return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
    });
  }, [buses, activeOperators, activeWindows, activeTerminals, sortBy]);

  const cheapestPrice = buses.length ? Math.min(...buses.map((b) => b.price)) : null;
  const fastestLabel = buses.length ? formatMinutes(Math.min(...buses.map((b) => durationMinutes(b.departureTime, b.arrivalTime)))) : null;
  const earliestBus = buses.length
    ? buses.reduce((best, b) => (new Date(b.departureTime).getTime() < new Date(best.departureTime).getTime() ? b : best))
    : null;

  const toggleValue = <K,>(active: Set<K>, value: K, setter: (s: Set<K>) => void) => {
    const next = new Set(active);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  const resetFilters = () => {
    setSelectedOperators(null);
    setSelectedWindows(null);
    setSelectedTerminals(null);
  };

  const dateStrip = useMemo(() => Array.from({ length: 7 }, (_, i) => shiftDate(activeDate, i - 3)), [activeDate]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(
        i18n.language === 'am' ? 'am-ET' : 'en-ET',
        { weekday: 'short', month: 'short', day: 'numeric' },
      );
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="pb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-3.5 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Fragment key={i}>
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (error && buses.length === 0) {
    return (
      <div className="pb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
          <p className="text-sm font-bold text-slate-900">{searchParams.from} → {searchParams.to}</p>
          <p className="text-xs text-slate-500 mt-0.5">{formatDate(activeDate)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">{t('search.noBusesFound')}</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </div>
          <PrimaryButton className="mt-4" onClick={onBack}>
            {t('search.changeSearch')}
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-6"
    >
      {/* Route context banner */}
      <div className="mb-4 rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50/80 via-white to-sky-50/50 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-slate-900 truncate">{searchParams.from}</span>
                <span className="text-sky-500 font-bold">→</span>
                <span className="text-lg font-bold text-slate-900 truncate">{searchParams.to}</span>
                <span className="ml-1 inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 tracking-wide uppercase">
                  {t('search.oneWayTrip')}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {formatDate(activeDate)} · {t('search.busCount', { count: buses.length })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
              <span>{t('search.modifySearch')}</span>
            </button>
            <div className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>{t('search.directCashless')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Date strip — shifts the real search date, no fabricated per-day pricing */}
      <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-stretch divide-x divide-slate-100 overflow-x-auto">
          {dateStrip.map((d) => {
            const selected = d === activeDate;
            const past = d < todayIsoDate();
            return (
              <button
                key={d}
                type="button"
                disabled={past}
                onClick={() => setActiveDate(d)}
                className={`flex min-w-[110px] flex-1 flex-col py-2.5 px-3 text-center transition disabled:opacity-40 disabled:cursor-not-allowed ${
                  selected ? 'bg-sky-50 border-b-2 border-sky-600' : 'hover:bg-slate-50'
                }`}
              >
                <span className={`text-xs font-medium ${selected ? 'font-bold text-sky-700' : 'text-slate-400'}`}>
                  {formatDate(d)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filters — built only from fields the real API returns */}
        <aside className="space-y-5 lg:col-span-1">
          {(windowGroups.length > 0 || terminalGroups.length > 0 || operatorGroups.length > 0) && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">{t('search.filterBuses')}</h2>
                {filtersActive && (
                  <button type="button" onClick={resetFilters} className="text-xs font-semibold text-sky-600 hover:text-sky-700">
                    {t('search.reset')}
                  </button>
                )}
              </div>

              {windowGroups.length > 1 && (
                <FilterGroup
                  title={t('search.departureWindow')}
                  rows={windowGroups.map((w) => ({ key: w.key, label: t(WINDOW_LABEL_KEYS[w.key]), value: String(w.count) }))}
                  active={activeWindows as Set<string>}
                  onToggle={(key) => toggleValue(activeWindows, key as WindowKey, setSelectedWindows)}
                />
              )}

              {terminalGroups.length > 1 && (
                <FilterGroup
                  title={t('search.boardingPoint')}
                  rows={terminalGroups.map(([term, count]) => ({ key: term, label: term, value: String(count) }))}
                  active={activeTerminals}
                  onToggle={(key) => toggleValue(activeTerminals, key, setSelectedTerminals)}
                />
              )}

              {operatorGroups.length > 1 && (
                <FilterGroup
                  title={t('search.busOperator')}
                  rows={operatorGroups.map(([op, price]) => ({ key: op, label: op, value: `${price} ETB` }))}
                  active={activeOperators}
                  onToggle={(key) => toggleValue(activeOperators, key, setSelectedOperators)}
                  last
                />
              )}
            </div>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white font-bold text-xs">?</div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{t('search.needHelp')}</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">{t('search.callSupport')}</p>
                <a className="mt-2 inline-flex items-center text-xs font-extrabold text-amber-800 hover:text-amber-900" href={`tel:${BRAND.phone}`}>
                  {t('search.dialTollFree', { phone: BRAND.phone })}
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section className="space-y-4 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <span className="font-bold text-slate-700">{t('search.sortBy')}</span>
              <SortButton active={sortBy === 'cheapest'} onClick={() => setSortBy('cheapest')}>
                {t('search.sortCheapest')}{cheapestPrice !== null ? ` (${cheapestPrice} ETB)` : ''}
              </SortButton>
              <SortButton active={sortBy === 'fastest'} onClick={() => setSortBy('fastest')}>
                {t('search.sortFastest')}{fastestLabel ? ` (~${fastestLabel})` : ''}
              </SortButton>
              <SortButton active={sortBy === 'earliest'} onClick={() => setSortBy('earliest')}>
                {t('search.sortEarliest')}{earliestBus ? ` (${formatBusTime(earliestBus.departureTime)})` : ''}
              </SortButton>
            </div>
            <div className="text-xs font-bold text-slate-500">
              {t('search.showingCount', { count: visibleBuses.length })}
            </div>
          </div>

          {visibleBuses.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm font-semibold text-slate-700">{t('search.noMatchFilters')}</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 text-xs font-bold text-sky-600 hover:text-sky-700"
              >
                {t('search.resetFilters')}
              </button>
            </div>
          ) : (
            visibleBuses.map((bus) => (
              <Fragment key={bus.id}>
                <BusResultCard bus={bus} onSelect={() => onSelectBus(bus)} />
              </Fragment>
            ))
          )}

          {/* Trust banner */}
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 text-white shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{t('search.trustTitle')}</h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">{t('search.trustBody')}</p>
                </div>
              </div>
              {terminalGroups.length > 0 && (
                <div className="flex flex-col items-center sm:items-end gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{t('search.trustBoarding')}</span>
                  <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-xs font-semibold text-slate-300">
                    {terminalGroups.slice(0, 4).map(([term]) => (
                      <span key={term} className="rounded-lg bg-white/10 px-3 py-1.5 border border-white/10">{term}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}

function SortButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1 font-semibold transition ${
        active ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

function FilterGroup({
  title,
  rows,
  active,
  onToggle,
  last,
}: {
  title: string;
  rows: { key: string; label: string; value: string }[];
  active: Set<string>;
  onToggle: (key: string) => void;
  last?: boolean;
}) {
  return (
    <div className={`py-4 ${last ? '' : 'border-b border-slate-100'}`}>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">{title}</label>
      <div className="space-y-1">
        {rows.map((row) => (
          <label key={row.key} className="flex items-center justify-between rounded-lg p-1.5 hover:bg-slate-50 cursor-pointer">
            <div className="flex items-center gap-2 min-w-0">
              <input
                type="checkbox"
                checked={active.has(row.key)}
                onChange={() => onToggle(row.key)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 shrink-0"
              />
              <span className="text-xs text-slate-700 font-medium truncate">{row.label}</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 ml-2">{row.value}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function BusResultCard({ bus, onSelect }: { bus: Bus; onSelect: () => void }) {
  const { t } = useTranslation();
  const duration = formatDuration(bus.departureTime, bus.arrivalTime);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: THEME.brand }}>
              <BusIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 leading-none truncate">{bus.operator}</h3>
              {bus.sideNumber && (
                <p className="text-[11px] text-slate-500 font-medium mt-1">{t('search.sideNumber', { number: bus.sideNumber })}</p>
              )}
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${typeBadgeClasses(bus.type)}`}>
              {bus.type}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium shrink-0">
            <Zap className="h-4 w-4" />
            <span>{t('search.instantTicket')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-center gap-6 p-5 sm:grid-cols-12">
        <div className="sm:col-span-8">
          <div className="flex items-center justify-between">
            <div className="text-left min-w-0">
              <span className="block text-2xl font-extrabold text-slate-900 tnum">{formatBusTime(bus.departureTime)}</span>
              <span className="block text-xs font-bold text-slate-700 mt-0.5 truncate">{bus.from}</span>
            </div>
            <div className="flex flex-1 flex-col items-center px-4">
              {duration && <span className="text-[11px] font-semibold text-slate-400 mb-1 whitespace-nowrap">{duration}</span>}
              <div className="relative flex w-full items-center justify-center">
                <div className="h-0.5 w-full bg-slate-200" />
                <div className="absolute flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-300 bg-white">
                  <Clock className="h-3 w-3" style={{ color: THEME.brand }} />
                </div>
              </div>
            </div>
            <div className="text-right min-w-0">
              <span className="block text-2xl font-extrabold text-slate-900 tnum">{formatBusTime(bus.arrivalTime)}</span>
              <span className="block text-xs font-bold text-slate-700 mt-0.5 truncate">{bus.to}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end justify-center border-t border-slate-100 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 sm:col-span-4">
          <div className="text-right">
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-3xl font-black text-slate-900 tracking-tight tnum">{bus.price}</span>
              <span className="text-sm font-bold text-sky-700">ETB</span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">{t('search.perPassenger')}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
            <Users className="h-3.5 w-3.5" />
            <span>{t('search.seatsLeft', { count: bus.availableSeats })}</span>
          </div>
          <button
            type="button"
            onClick={onSelect}
            disabled={bus.availableSeats === 0}
            className="mt-3.5 w-full rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed py-3 px-4 text-center text-sm font-extrabold text-slate-900 shadow-sm transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            {bus.availableSeats === 0 ? t('booking.noSeats') : t('search.selectSeats')}
          </button>
        </div>
      </div>
    </article>
  );
}
