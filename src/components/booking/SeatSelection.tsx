import { AlertCircle, Loader2, DoorOpen, Gauge, MapPin, X, ShieldCheck } from 'lucide-react';
import { Bus } from '../../types';
import { useTranslation } from 'react-i18next';
import { Fragment, type ReactNode } from 'react';
import { toast } from 'sonner';
import {
  useSeatLayout,
  isSelectableSeat,
  isUnavailableSeat,
  normalizeSeatType,
  type SeatData,
} from '../../hooks/useSeatLayout';
import {
  ScreenCard,
  PrimaryButton,
  StickyFooter,
} from '../ui/ScreenUI';
import { THEME } from '../../config/theme';

interface Props {
  bus: Bus;
  selectedSeats: string[];
  onSeatSelect: (seats: string[]) => void;
  onContinue: () => void;
  onBack: () => void;
  onSeatLayoutLoaded?: (seatLayout: Array<{ id: number; name: string; type: string; x: number; y: number }>) => void;
}

type RowItem =
  | { kind: 'seat'; seat: SeatData; label?: 'window' | 'aisle' }
  | { kind: 'driver'; seat: SeatData }
  | { kind: 'gap'; key: string };

/** A row's bookable seats (real `seat`/`sold`/`pending` cells, left to right) plus
 *  a gap marker wherever the real x positions actually skip — never a fabricated
 *  fixed column count. Window/aisle labels are only added when the row's real
 *  seat count is 2 or 4, since that's the only shape where "outer = window,
 *  inner = aisle" is unambiguous from the data; anything else goes unlabeled. */
function buildRowItems(rowSeats: SeatData[]): RowItem[] {
  const sorted = [...rowSeats].sort((a, b) => a.x - b.x);
  const bookable = sorted.filter(
    (s) => s.name && (isSelectableSeat(s.type) || isUnavailableSeat(s.type)),
  );
  const driverSeat = sorted.find((s) => normalizeSeatType(s.type) === 'driver seat');

  const labels: Record<number, 'window' | 'aisle'> = {};
  if (bookable.length === 2) {
    labels[bookable[0].id] = 'window';
    labels[bookable[1].id] = 'window';
  } else if (bookable.length === 4) {
    labels[bookable[0].id] = 'window';
    labels[bookable[1].id] = 'aisle';
    labels[bookable[2].id] = 'aisle';
    labels[bookable[3].id] = 'window';
  }

  const items: RowItem[] = [];
  if (driverSeat) items.push({ kind: 'driver', seat: driverSeat });
  let prevX: number | null = null;
  for (const seat of bookable) {
    if (prevX !== null && seat.x - prevX > 1) {
      items.push({ kind: 'gap', key: `gap-${seat.id}` });
    }
    items.push({ kind: 'seat', seat, label: labels[seat.id] });
    prevX = seat.x;
  }
  return items;
}

function formatDateTime(value: string, locale: string): { date: string; time: string } | null {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return {
    date: d.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString('en-ET', { hour: '2-digit', minute: '2-digit' }),
  };
}

export default function SeatSelection({ bus, selectedSeats, onSeatSelect, onContinue, onBack, onSeatLayoutLoaded }: Props) {
  const { t, i18n } = useTranslation();
  const { seatLayout, loading, error } = useSeatLayout(bus, onSeatLayoutLoaded);

  const toggleSeat = (seatName: string) => {
    const seat = seatLayout?.seats.find((s) => s.name === seatName);
    if (!seat || !isSelectableSeat(seat.type)) return;

    if (selectedSeats.includes(seatName)) {
      onSeatSelect(selectedSeats.filter((s) => s !== seatName));
    } else {
      if (selectedSeats.length >= 4) {
        toast.warning(t('booking.seatLimitMessage'));
        return;
      }
      onSeatSelect([...selectedSeats, seatName]);
    }
  };

  if (loading) {
    return (
      <div className="pb-28">
        <ScreenCard className="mb-4 space-y-1.5">
          <p className="text-sm font-bold text-[var(--text-primary)]">{bus.from} → {bus.to}</p>
          <p className="text-xs text-[var(--text-muted)]">{bus.operator} · {t('seats.loadingSeatsMeta')}</p>
        </ScreenCard>
        <ScreenCard className="flex items-center justify-center py-12 gap-3">
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: THEME.brand }} />
          <span className="text-sm text-[var(--text-muted)]">{t('booking.loadingSeats')}</span>
        </ScreenCard>
      </div>
    );
  }

  if (error && !seatLayout) {
    return (
      <div className="pb-6">
        <ScreenCard className="mb-4">
          <p className="text-sm font-bold text-[var(--text-primary)]">{bus.from} → {bus.to}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{bus.operator}</p>
        </ScreenCard>
        <ScreenCard>
          <div className="flex gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
          <PrimaryButton className="mt-4" onClick={onBack}>
            {t('seats.backToBuses')}
          </PrimaryButton>
        </ScreenCard>
      </div>
    );
  }

  if (!seatLayout) return null;

  const seatsByRow = new Map<number, SeatData[]>();
  seatLayout.seats.forEach((seat) => {
    if (!seatsByRow.has(seat.y)) seatsByRow.set(seat.y, []);
    seatsByRow.get(seat.y)!.push(seat);
  });
  const rowKeys = Array.from(seatsByRow.keys()).sort((a, b) => a - b);
  let passengerRowCount = 0;
  const rows = rowKeys.map((y) => {
    const items = buildRowItems(seatsByRow.get(y)!);
    const hasBookableSeat = items.some((item) => item.kind === 'seat');
    if (hasBookableSeat) passengerRowCount += 1;
    return { rowNumber: passengerRowCount, items };
  });

  // Window/aisle label + row number for each real seat name, used by the sidebar cards.
  const seatMeta = new Map<string, { row: number; label?: 'window' | 'aisle' }>();
  rows.forEach(({ rowNumber, items }) => {
    items.forEach((item) => {
      if (item.kind === 'seat') seatMeta.set(item.seat.name, { row: rowNumber, label: item.label });
    });
  });

  const total = bus.price * selectedSeats.length;
  const departure = formatDateTime(bus.departureTime, i18n.language === 'am' ? 'am-ET' : 'en-ET');
  const arrival = formatDateTime(bus.arrivalTime, i18n.language === 'am' ? 'am-ET' : 'en-ET');

  const legend = (
    <div className="flex flex-wrap items-center justify-center gap-4 mt-5 pt-4 border-t border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)]">
      <LegendSwatch state="available" label={`${t('booking.legend.available')} (ETB ${bus.price})`} />
      <div className="h-4 w-px bg-[var(--border-strong)]" />
      <LegendSwatch state="selected" label={`${t('booking.legend.selected')} (${t('common.seat', { count: selectedSeats.length || 1 })})`} />
      <div className="h-4 w-px bg-[var(--border-strong)]" />
      <LegendSwatch state="sold" label={t('seats.sold')} />
    </div>
  );

  const seatGrid = (
    <div className="max-w-md mx-auto">
      <div className="bus-shell bg-slate-100 border-2 border-slate-300/90 p-4 sm:p-6 relative shadow-xl overflow-hidden">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200/90 text-[10px] font-extrabold uppercase tracking-widest text-slate-700 border border-slate-300">
            <DoorOpen className="w-3.5 h-3.5 text-sky-600" />
            {t('seats.frontWindshield')}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-slate-800 to-slate-950 text-white flex items-center justify-center shrink-0">
              <Gauge className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">{t('seats.driver')}</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1.5 rounded-xl">
            <span className="text-[10px] font-black tracking-tight">{t('seats.entryDoor')}</span>
            <DoorOpen className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="space-y-2.5">
          {rows.map(({ rowNumber, items }) => (
            <div key={rowNumber} className="flex items-center justify-center gap-1.5">
              <div className="flex-1 flex items-center justify-center gap-1.5 flex-wrap">
                {items.map((item, i) => (
                  <Fragment key={item.kind === 'gap' ? item.key : item.seat.id}>
                    {renderCell(item, {
                      selected: item.kind === 'seat' && selectedSeats.includes(item.seat.name),
                      onToggle: item.kind === 'seat' ? () => toggleSeat(item.seat.name) : undefined,
                      price: bus.price,
                      t,
                    })}
                    {item.kind !== 'gap' && i < items.length - 1 && items[i + 1]?.kind === 'gap' && (
                      <span className="text-[9px] font-black text-slate-400 bg-white/90 px-1 py-0.5 rounded border border-slate-200">
                        R{rowNumber}
                      </span>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-300 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 text-[9px] font-extrabold uppercase tracking-widest text-slate-500">
            {t('seats.rearBaggage')}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-28 lg:pb-10">
      <ScreenCard className="mb-4 lg:p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[15px] font-bold text-[var(--text-primary)] truncate">{bus.from} → {bus.to}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                {t('seats.confirmedSchedule')}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {bus.operator}{bus.sideNumber ? ` · Side ${bus.sideNumber}` : ''} · {bus.type}
              {departure ? ` · ${departure.date} · ${t('seats.departsAt', { time: departure.time })}` : ''}
            </p>
          </div>
          <span className="shrink-0 font-display text-sm font-bold tnum px-2.5 py-1 rounded-lg bg-[var(--surface-muted)]" style={{ color: THEME.brand }}>
            {t('seats.pricePerSeatMeta', { price: bus.price })}
          </span>
        </div>
      </ScreenCard>

      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 lg:items-start">
        <ScreenCard className="mb-3 lg:mb-0 lg:p-8">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--border)] flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[var(--text-primary)]">{t('seats.selectSeatTitle')}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: THEME.brandSoft, color: THEME.brandDeep }}>
                  {bus.type}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{bus.operator} · {t('seats.maxSeatsNote', { count: 4 })}</p>
            </div>
          </div>

          {seatGrid}
          {legend}

          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] font-medium text-center">
            {t('seats.tapHint', { count: 4 })}
          </p>
        </ScreenCard>

        {/* Desktop: sticky order summary sidebar instead of a bottom bar */}
        <div className="hidden lg:block lg:sticky lg:top-24">
          <ScreenCard className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="font-display font-bold text-[var(--text-primary)] text-sm">{t('seats.summaryTitle')}</h3>
              </div>
              {selectedSeats.length > 0 && (
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold" style={{ backgroundColor: THEME.primarySoft, color: THEME.primaryPressed }}>
                  {t('seats.seatsChosen', { count: selectedSeats.length })}
                </span>
              )}
            </div>

            {selectedSeats.length > 0 ? (
              <>
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">{t('seats.selectedSeatsLabel')}</span>
                  {selectedSeats.map((name) => {
                    const meta = seatMeta.get(name);
                    return (
                      <div key={name} className="p-2.5 rounded-xl flex items-center justify-between" style={{ backgroundColor: THEME.primarySoft, border: `1px solid ${THEME.primaryBorder}` }}>
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0"
                            style={{ backgroundImage: `linear-gradient(145deg, ${THEME.primary}, ${THEME.primaryHover})` }}
                          >
                            {name}
                          </div>
                          {meta && (
                            <div className="text-xs">
                              <p className="font-bold text-[var(--text-primary)]">{t('seats.rowLabel', { row: meta.row })}</p>
                              {meta.label && <p className="text-[11px]" style={{ color: THEME.primaryPressed }}>{t(meta.label === 'window' ? 'seats.windowSeat' : 'seats.aisleSeat')}</p>}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSeat(name)}
                          aria-label={t('common.close')}
                          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: THEME.primaryBorder, color: THEME.primaryPressed }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2.5 py-3 border-y border-[var(--border)] text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-[var(--text-primary)] truncate">{bus.from}</p>
                      {departure && <p className="text-[var(--text-muted)] text-[11px]">{t('seats.departsAt', { time: departure.time })}</p>}
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-[var(--text-primary)] truncate">{bus.to}</p>
                      {arrival && <p className="text-[var(--text-muted)] text-[11px]">{t('seats.arrivesAt', { time: arrival.time })}</p>}
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {t('seats.arriveEarly')}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>{t('seats.baseFare', { count: selectedSeats.length })}</span>
                    <span className="font-bold text-[var(--text-primary)] tnum">ETB {total}</span>
                  </div>
                  <div className="pt-2.5 flex justify-between items-baseline border-t border-[var(--border)]">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[var(--text-muted)]">{t('seats.totalAmount')}</span>
                    <span className="font-display text-xl font-black tnum" style={{ color: THEME.brand }}>ETB {total}</span>
                  </div>
                </div>

                <PrimaryButton onClick={onContinue}>{t('booking.continueToDetails')}</PrimaryButton>
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">{t('seats.selectPrompt')}</p>
            )}

            <div className="p-3 rounded-xl flex items-center gap-2.5" style={{ backgroundColor: THEME.brandSoft }}>
              <ShieldCheck className="w-7 h-7 shrink-0" style={{ color: THEME.brand }} />
              <div>
                <p className="text-xs font-extrabold text-[var(--text-primary)]">{t('seats.trustTitle')}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{t('seats.trustBody')}</p>
              </div>
            </div>
          </ScreenCard>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <StickyFooter>
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-[var(--text-muted)]">
              {t('common.seatShort', { count: selectedSeats.length, seats: selectedSeats.join(', ') })}
            </span>
            <span className="font-display font-bold tnum" style={{ color: THEME.brand }}>
              ETB {total}
            </span>
          </div>
          <PrimaryButton onClick={onContinue}>
            {t('booking.continueToDetails')}
          </PrimaryButton>
        </StickyFooter>
      )}
    </div>
  );
}

function LegendSwatch({ state, label }: { state: 'available' | 'selected' | 'sold'; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`bus-seat seat-${state} pointer-events-none`} style={{ transform: 'scale(0.55)' }} aria-hidden="true">
        <span className="seat-headrest w-9 h-3 rounded-t-lg" />
        <span className="w-full flex items-center justify-center relative">
          <span className="seat-armrest w-1.5 h-9 rounded-full -mr-0.5" />
          <span className="flex-1 flex flex-col">
            <span className="seat-backrest h-4 rounded-t-sm block" />
            <span className="seat-cushion h-8 rounded-b-xl block" />
          </span>
          <span className="seat-armrest w-1.5 h-9 rounded-full -ml-0.5" />
        </span>
      </span>
      <span>{label}</span>
    </span>
  );
}

function renderCell(
  item: RowItem,
  opts: { selected: boolean; onToggle?: () => void; price: number; t: (key: string, opts?: Record<string, unknown>) => string },
): ReactNode {
  if (item.kind === 'gap') {
    return <span className="aisle-tread w-6 h-9 rounded-md block shrink-0" aria-hidden="true" />;
  }

  if (item.kind === 'driver') {
    return (
      <span className="w-11 h-11 rounded-xl bg-gradient-to-b from-slate-800 to-slate-950 text-white flex items-center justify-center shrink-0" aria-hidden="true">
        <Gauge className="w-5 h-5" />
      </span>
    );
  }

  const { seat, label } = item;
  const { selected, onToggle, price, t } = opts;
  const sold = isUnavailableSeat(seat.type);

  if (sold) {
    return (
      <span className="bus-seat seat-sold" title={t('seats.sold')}>
        <span className="seat-headrest w-9 h-3 rounded-t-lg mx-auto relative z-10" />
        <span className="w-full flex items-center justify-center relative">
          <span className="seat-armrest w-1.5 h-9 rounded-full -mr-0.5 z-20" />
          <span className="flex-1 flex flex-col">
            <span className="seat-backrest h-4 rounded-t-sm block" />
            <span className="seat-cushion h-8 rounded-b-xl flex flex-col items-center justify-center">
              <span className="text-xs font-black text-slate-200 leading-none">{seat.name}</span>
              <span className="text-[7px] font-bold text-slate-300 uppercase tracking-tight mt-0.5">{t('seats.sold')}</span>
            </span>
          </span>
          <span className="seat-armrest w-1.5 h-9 rounded-full -ml-0.5 z-20" />
        </span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`bus-seat cursor-pointer ${selected ? 'seat-selected' : 'seat-available'}`}
      title={seat.name}
    >
      <span className="seat-headrest w-9 h-3 rounded-t-lg mx-auto relative z-10 flex items-center justify-center">
        {label && <span className={`text-[7px] font-black ${selected ? 'text-amber-100' : 'text-sky-200'}`}>{label === 'window' ? 'W' : 'A'}</span>}
      </span>
      <span className="w-full flex items-center justify-center relative">
        <span className="seat-armrest w-1.5 h-9 rounded-full -mr-0.5 z-20" />
        <span className="flex-1 flex flex-col">
          <span className="seat-backrest h-4 rounded-t-sm block" />
          <span className="seat-cushion h-8 rounded-b-xl flex flex-col items-center justify-center">
            <span className="text-xs font-black text-white leading-none">{seat.name}</span>
            <span className={`text-[7px] font-bold uppercase tracking-tight mt-0.5 ${selected ? 'text-amber-100' : 'text-sky-200'}`}>
              {selected ? t('seats.selectedBadge') : `ETB ${price}`}
            </span>
          </span>
        </span>
        <span className="seat-armrest w-1.5 h-9 rounded-full -ml-0.5 z-20" />
      </span>
    </button>
  );
}
