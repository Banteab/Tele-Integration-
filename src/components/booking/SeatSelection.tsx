import { AlertCircle, Loader2 } from 'lucide-react';
import { Bus } from '../../types';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
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

  const getSeatStyle = (seat: SeatData) => {
    if (!seat.name) return 'hidden';

    const baseClass = 'w-11 h-11 rounded-lg border-2 font-semibold text-sm transition-all duration-200 flex items-center justify-center';

    if (seat.type === 'sold') {
      return `${baseClass} bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed`;
    }

    if (isSelectableSeat(seat.type)) {
      if (selectedSeats.includes(seat.name)) {
        return `${baseClass} bg-[#f2a81c] border-[#f2a81c] text-white shadow-lg scale-105 cursor-pointer`;
      }
      return `${baseClass} bg-white border-gray-300 text-gray-700 hover:border-[#c9922a] hover:shadow-md cursor-pointer`;
    }

    return 'hidden';
  };

  if (loading) {
    return (
      <div className="pb-28">
        <TripBanner from={bus.from || ''} to={bus.to || ''} meta={`${bus.operator} · ${t('seats.loadingSeatsMeta')}`} />
        <ScreenCard className="flex items-center justify-center py-12 gap-3">
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: THEME.brand }} />
          <span className="text-sm text-gray-500">{t('booking.loadingSeats')}</span>
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

  return (
    <div className="pb-28">
      <TripBanner
        from={bus.from || ''}
        to={bus.to || ''}
        meta={`${bus.operator} · ${t('seats.pricePerSeatMeta', { price: bus.price })}`}
      />

      <ScreenCard className="mb-3">
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
          {t('booking.front')}
        </p>
        <div className="space-y-2 max-w-xs mx-auto">
          {rows.map((row) => {
            const rowSeats = seatsByRow.get(String(row)) || [];
            const sortedSeats = rowSeats.sort((a, b) => a.x - b.x);
            return (
              <div key={row} className="flex items-center justify-center gap-2">
                <span className="w-5 text-[10px] font-bold text-gray-300">{row}</span>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {sortedSeats.map((seat) => (
                    <button
                      key={seat.id}
                      type="button"
                      onClick={() => toggleSeat(seat.name)}
                      disabled={!isSelectableSeat(seat.type)}
                      className={getSeatStyle(seat)}
                    >
                      {seat.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-5 pt-4 border-t border-gray-100 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded border-2 border-gray-300" /> {t('booking.legend.available')}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#f2a81c]" /> {t('booking.legend.selected')}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-200" /> {t('seats.sold')}
          </span>
        </div>
      </ScreenCard>

      {selectedSeats.length > 0 && (
        <StickyFooter>
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-gray-500">
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
