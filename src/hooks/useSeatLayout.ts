import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bus } from '../types';
import { getVehicleLayout } from '../services/api';

export interface SeatData {
  id: number;
  name: string;
  type: string; // 'seat', 'sold', 'pending', 'aisle', 'staircase', 'driver seat'
  x: number;
  y: number;
}

export interface SeatLayout {
  seats: SeatData[];
  maxX: number;
  maxY: number;
}

export function normalizeSeatType(seatType: string): string {
  return (seatType || '').toLowerCase();
}

export function isUnavailableSeat(seatType: string): boolean {
  const type = normalizeSeatType(seatType);
  return type === 'sold' || type === 'pending';
}

export function isSelectableSeat(seatType: string): boolean {
  return normalizeSeatType(seatType) === 'seat';
}

/**
 * Fetches the real vehicle seat layout for a bus. Shared by the 2D grid
 * seat map and the 3D bus interior so both read from one real data source
 * instead of two copies of the same fetch/error-handling logic.
 */
export function useSeatLayout(
  bus: Bus,
  onLoaded?: (seatLayout: SeatData[]) => void,
) {
  const { t } = useTranslation();
  const [seatLayout, setSeatLayout] = useState<SeatLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchSeatLayout = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!bus.vehicleId || !bus.scheduleId) {
          throw new Error('missingInfo');
        }

        const response = await getVehicleLayout(String(bus.vehicleId), String(bus.scheduleId));
        if (cancelled) return;

        if (response && response.seats && Array.isArray(response.seats)) {
          setSeatLayout({
            seats: response.seats,
            maxX: response.maxX || 4,
            maxY: response.maxY || 10,
          });
          onLoaded?.(response.seats);
        } else {
          throw new Error('noData');
        }
      } catch (err: any) {
        if (cancelled) return;
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
          errorMessage =
            typeof data === 'string'
              ? data.includes('No Seat Layout')
                ? t('seats.errors.notFound')
                : data
              : t('seats.errors.notAvailable');
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
        if (!cancelled) setLoading(false);
      }
    };

    fetchSeatLayout();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bus.vehicleId, bus.scheduleId, t]);

  return { seatLayout, loading, error };
}
