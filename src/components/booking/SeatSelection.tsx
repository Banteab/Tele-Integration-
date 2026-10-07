import { AlertCircle, Loader2 } from 'lucide-react';
import { Bus } from '../../types';
import { useTranslation } from 'react-i18next';
import { type CSSProperties } from 'react';
import { toast } from 'sonner';
import {
  useSeatLayout,
  isSelectableSeat,
  isUnavailableSeat,
  type SeatData,
} from '../../hooks/useSeatLayout';
import {
  ScreenCard,
  TripBanner,
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

export default function SeatSelection({ bus, selectedSeats, onSeatSelect, onContinue, onBack, onSeatLayoutLoaded }: Props) {
  const { t } = useTranslation();
  const { seatLayout, loading, error } = useSeatLayout(bus, onSeatLayoutLoaded);

  const toggleSeat = (seatName: string) => {
    const seat = seatLayout?.seats.find(s => s.name === seatName);
    if (!seat || !isSelectableSeat(seat.type)) return;

    if (selectedSeats.includes(seatName)) {
      onSeatSelect(selectedSeats.filter(s => s !== seatName));
    } else {
      if (selectedSeats.length >= 4) {
        toast.warning(t('booking.seatLimitMessage'));
        return;
      }
      onSeatSelect([...selectedSeats, seatName]);
    }
  };

  /**
   * Seat color language: available seats read as interactive (light blue),
   * the selected seat is the one unmistakable yellow accent on the board,
   * and sold seats stay flat neutral gray — never random colors.
   */
  const getSeatStyle = (seat: SeatData) => {
    if (!seat.name) return 'hidden';

    const baseClass = 'w-11 h-11 rounded-lg border-2 font-semibold text-sm transition-all duration-150 flex items-center justify-center';

    if (isUnavailableSeat(seat.type)) {
      return `${baseClass} bg-[var(--surface-muted)] border-[var(--border-strong)] text-[var(--text-muted)] cursor-not-allowed`;
    }

    if (isSelectableSeat(seat.type)) {
      if (selectedSeats.includes(seat.name)) {
        return `${baseClass} text-[var(--text-primary)] scale-105 cursor-pointer`;
      }
      return `${baseClass} bg-[var(--color-brand-soft)] border-[var(--color-brand-border)] text-[var(--color-brand-deep)] hover:border-[var(--color-brand)] hover:bg-white hover:shadow-sm cursor-pointer`;
    }

    return 'hidden';
  };

  const getSeatInlineStyle = (seat: SeatData): CSSProperties | undefined => {
    if (isSelectableSeat(seat.type) && selectedSeats.includes(seat.name)) {
      return { backgroundImage: 'linear-gradient(145deg, #f9bb3f, var(--color-primary-hover))', boxShadow: '0 8px 20px -6px rgba(242,168,28,0.5)' };
    }
    return undefined;
  };

  if (loading) {
    return (
      <div className="pb-28">
        <TripBanner from={bus.from || ''} to={bus.to || ''} meta={`${bus.operator} · ${t('seats.loadingSeatsMeta')}`} />
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
        <TripBanner from={bus.from || ''} to={bus.to || ''} meta={bus.operator} />
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

  // Group seats by row for display
  const seatsByRow = new Map<string, SeatData[]>();
  seatLayout.seats.forEach(seat => {
    const row = String(seat.y);
    if (!seatsByRow.has(row)) {
      seatsByRow.set(row, []);
    }
    seatsByRow.get(row)!.push(seat);
  });

  const rows = Array.from(seatsByRow.keys())
    .map(Number)
    .sort((a, b) => a - b);

  const total = bus.price * selectedSeats.length;

  const legend = (
    <div className="flex justify-center gap-4 mt-5 pt-4 border-t border-[var(--border)] text-[10px] font-medium text-[var(--text-secondary)]">
      <span className="flex items-center gap-1.5">
        <span
          className="w-3.5 h-3.5 rounded border-2"
          style={{ backgroundColor: 'var(--color-brand-soft)', borderColor: 'var(--color-brand-border)' }}
        />
        {t('booking.legend.available')}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded border-2" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)' }} />
        {t('booking.legend.selected')}
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="w-3.5 h-3.5 rounded border-2"
          style={{ backgroundColor: 'var(--surface-muted)', borderColor: 'var(--border-strong)' }}
        />
        {t('seats.sold')}
      </span>
    </div>
  );

  const seatMap = (
    <div className="space-y-2 max-w-xs lg:max-w-sm mx-auto">
      {rows.map((row) => {
        const rowSeats = seatsByRow.get(String(row)) || [];
        const sortedSeats = rowSeats.sort((a, b) => a.x - b.x);
        return (
          <div key={row} className="flex items-center justify-center gap-2">
            <span className="w-5 text-[10px] font-bold text-[var(--text-muted)]">{row}</span>
            <div className="flex gap-1.5 lg:gap-2 flex-wrap justify-center">
              {sortedSeats.map((seat) => (
                <button
                  key={seat.id}
                  type="button"
                  onClick={() => toggleSeat(seat.name)}
                  disabled={!isSelectableSeat(seat.type)}
                  className={getSeatStyle(seat)}
                  style={getSeatInlineStyle(seat)}
                >
                  {seat.name}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="pb-28 lg:pb-10">
      <TripBanner
        from={bus.from || ''}
        to={bus.to || ''}
        meta={`${bus.operator} · ${t('seats.pricePerSeatMeta', { price: bus.price })}`}
      />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 lg:items-start">
        <ScreenCard className="mb-3 lg:mb-0 lg:p-8">
          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
            {t('booking.front')}
          </p>
          {seatMap}
          {legend}
        </ScreenCard>

        {/* Desktop: sticky order summary sidebar instead of a bottom bar */}
        <div className="hidden lg:block lg:sticky lg:top-24">
          <ScreenCard className="space-y-4">
            <h3 className="font-display font-bold text-[var(--text-primary)] text-sm">{t('booking.steps.seats')}</h3>
            {selectedSeats.length > 0 ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">
                    {t('common.seatShort', { count: selectedSeats.length, seats: selectedSeats.join(', ') })}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  <span className="font-bold text-[var(--text-primary)]">{t('common.total')}</span>
                  <span className="font-display font-bold tnum text-lg" style={{ color: THEME.brand }}>
                    ETB {total}
                  </span>
                </div>
                <PrimaryButton onClick={onContinue}>{t('booking.continueToDetails')}</PrimaryButton>
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">{t('seats.selectPrompt')}</p>
            )}
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
