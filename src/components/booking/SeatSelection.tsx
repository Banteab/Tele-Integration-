import { AlertCircle, Loader2 } from 'lucide-react';
import { Bus } from '../../types';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, type CSSProperties } from 'react';
import { toast } from 'sonner';
import { getVehicleLayout } from '../../services/api';
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

interface SeatData {
  id: number;
  name: string;
  type: string; // 'seat', 'sold', 'aisle', 'staircase', 'driver seat'
  x: number;
  y: number;
}

interface SeatLayout {
  seats: SeatData[];
  maxX: number;
  maxY: number;
}

export default function SeatSelection({ bus, selectedSeats, onSeatSelect, onContinue, onBack, onSeatLayoutLoaded }: Props) {
  const { t } = useTranslation();
  const [seatLayout, setSeatLayout] = useState<SeatLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch seat layout from API (Bank-Portal-2018 pattern)
  useEffect(() => {
    const fetchSeatLayout = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use vehicleId and scheduleId from bus object
        if (!bus.vehicleId || !bus.scheduleId) {
          throw new Error('missingInfo');
        }

        const response = await getVehicleLayout(
          String(bus.vehicleId),
          String(bus.scheduleId)
        );

        if (response && response.seats && Array.isArray(response.seats)) {
          setSeatLayout({
            seats: response.seats,
            maxX: response.maxX || 4,
            maxY: response.maxY || 10,
          });
          // Notify parent component of loaded seat layout
          if (onSeatLayoutLoaded) {
            onSeatLayoutLoaded(response.seats);
          }
        } else {
          throw new Error('noData');
        }
      } catch (err: any) {
        console.error('Failed to fetch seat layout:', err);

        const errorKeyMap: Record<string, string> = {
          missingInfo: 'seats.errors.missingInfo',
          noData: 'seats.errors.noData',
          notFound: 'seats.errors.notFound',
          notAvailable: 'seats.errors.notAvailable',
          notFoundVehicle: 'seats.errors.notFoundVehicle',
          serverError: 'seats.errors.serverError',
        };

        let errorMessage = t('seats.errors.loadFailed');

        if (err.message && errorKeyMap[err.message]) {
          errorMessage = t(errorKeyMap[err.message]);
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data) {
          const data = err.response.data;
          if (typeof data === 'string') {
            errorMessage = data.includes('No Seat Layout')
              ? t('seats.errors.notFound')
              : data;
          } else {
            errorMessage = t('seats.errors.notAvailable');
          }
        } else if (err.response?.status === 400) {
          errorMessage = t('seats.errors.notFound');
        } else if (err.response?.status === 404) {
          errorMessage = t('seats.errors.notFoundVehicle');
        } else if (err.response?.status === 500) {
          errorMessage = t('seats.errors.serverError');
        } else if (err.message && !errorKeyMap[err.message]) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        setSeatLayout(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSeatLayout();
  }, [bus.vehicleId, bus.scheduleId, t]);

  // Generate mock layout for fallback
  const generateMockLayout = (): SeatLayout => {
    const seats: SeatData[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const cols = [1, 2, 3, 4];
    const bookedSeats = ['A1', 'A2', 'C3', 'C4', 'F1', 'H2', 'J3', 'J4'];

    let id = 1;
    rows.forEach((row, y) => {
      cols.forEach((col, x) => {
        const seatName = `${row}${col}`;
        seats.push({
          id: id++,
          name: seatName,
          type: bookedSeats.includes(seatName) ? 'sold' : 'seat',
          x: x + 1,
          y: y + 1,
        });
      });
    });

    return { seats, maxX: 4, maxY: 10 };
  };

  const isSelectableSeat = (seatType: string): boolean => {
    return seatType === 'seat' || seatType === 'pending';
  };

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

    if (seat.type === 'sold') {
      return `${baseClass} bg-[var(--surface-muted)] border-[var(--border-strong)] text-[var(--text-muted)] cursor-not-allowed`;
    }

    if (isSelectableSeat(seat.type)) {
      if (selectedSeats.includes(seat.name)) {
        return `${baseClass} border-[var(--color-primary)] text-[var(--text-primary)] shadow-md scale-105 cursor-pointer`;
      }
      return `${baseClass} bg-[var(--color-brand-soft)] border-[var(--color-brand-border)] text-[var(--color-brand-deep)] hover:border-[var(--color-brand)] hover:bg-white hover:shadow-sm cursor-pointer`;
    }

    return 'hidden';
  };

  const getSeatInlineStyle = (seat: SeatData): CSSProperties | undefined => {
    if (isSelectableSeat(seat.type) && selectedSeats.includes(seat.name)) {
      return { backgroundColor: 'var(--color-primary)', boxShadow: THEME.shadowPrimary };
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
            <h3 className="font-bold text-[var(--text-primary)] text-sm">{t('booking.steps.seats')}</h3>
            {selectedSeats.length > 0 ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">
                    {t('common.seatShort', { count: selectedSeats.length, seats: selectedSeats.join(', ') })}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  <span className="font-bold text-[var(--text-primary)]">{t('common.total')}</span>
                  <span className="font-extrabold tnum text-lg" style={{ color: THEME.brand }}>
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
            <span className="font-extrabold tnum" style={{ color: THEME.brand }}>
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
