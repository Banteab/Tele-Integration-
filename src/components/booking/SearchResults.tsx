import { motion } from 'motion/react';
import { Clock, MapPin, Users, AlertCircle, Bus as BusIcon } from 'lucide-react';
import { SearchParams, Bus } from '../../types';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, Fragment } from 'react';
import { searchTrips, getAllRoutes } from '../../services/api';
import { toast } from 'sonner';
import {
  ScreenCard,
  TripBanner,
  PrimaryButton,
  Skeleton,
} from '../ui/ScreenUI';
import { THEME } from '../../config/theme';

interface Props {
  searchParams: SearchParams;
  onSelectBus: (bus: Bus) => void;
  onBack: () => void;
  isLoading?: boolean;
}

function formatBusTime(value: string) {
  if (!value || value === 'N/A') return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString('en-ET', { hour: '2-digit', minute: '2-digit' });
}

export default function SearchResults({
  searchParams,
  onSelectBus,
  onBack,
  isLoading,
}: Props) {
  const { t, i18n } = useTranslation();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(isLoading || false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllRoutes().catch(() => undefined);
  }, []);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        setError(null);
        const dateObj = new Date(searchParams.date);
        const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        const response = await searchTrips(
          searchParams.from,
          searchParams.to,
          formattedDate,
        );

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
        if (transformedBuses.length === 0) {
          setError(t('booking.noResults'));
        }
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ||
          (err as Error)?.message ||
          t('search.searchFailed');
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.from && searchParams.to && searchParams.date) {
      fetchBuses();
    }
  }, [searchParams, t]);

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

  const tripMeta = `${formatDate(searchParams.date)} · ${loading ? '...' : t('search.busCount', { count: buses.length })}`;

  if (loading) {
    return (
      <div className="pb-6">
        <TripBanner from={searchParams.from} to={searchParams.to} meta={t('common.searching')} />
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
          {[1, 2, 3].map((i) => (
            <Fragment key={i}>
              <ScreenCard className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </ScreenCard>
            </Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (error && buses.length === 0) {
    return (
      <div className="pb-6">
        <TripBanner from={searchParams.from} to={searchParams.to} meta={tripMeta} />
        <ScreenCard>
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
        </ScreenCard>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-6"
    >
      <TripBanner from={searchParams.from} to={searchParams.to} meta={tripMeta} />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
      {buses.map((bus) => (
        <Fragment key={bus.id}>
          <ScreenCard className="space-y-4 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <BusIcon className="w-4 h-4 shrink-0" style={{ color: THEME.brand }} />
                <h3 className="font-bold text-[var(--text-primary)] text-[15px]">{bus.operator}</h3>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: THEME.primarySoft, color: THEME.primaryHover }}
                >
                  {bus.type}
                </span>
              </div>
              {bus.sideNumber && (
                <p className="text-xs text-[var(--text-muted)] mt-1">{t('search.sideNumber', { number: bus.sideNumber })}</p>
              )}
            </div>
            <p className="text-xl font-extrabold tnum shrink-0" style={{ color: THEME.brand }}>
              {bus.price}
              <span className="text-xs font-semibold ml-0.5">ETB</span>
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 py-3 border-y border-[var(--border)]">
            <div className="text-center flex-1">
              <p className="text-lg font-bold text-[var(--text-primary)] tnum">
                {formatBusTime(bus.departureTime)}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {bus.from}
              </p>
            </div>
            <div className="flex flex-col items-center px-2">
              <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <div className="w-10 h-px bg-[var(--border-strong)] my-1" />
            </div>
            <div className="text-center flex-1">
              <p className="text-lg font-bold text-[var(--text-primary)] tnum">
                {formatBusTime(bus.arrivalTime)}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {bus.to}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {t('search.seatsLeft', { count: bus.availableSeats })}
            </span>
          </div>

          <div className="mt-auto pt-1">
            <PrimaryButton
              onClick={() => onSelectBus(bus)}
              disabled={bus.availableSeats === 0}
            >
              {bus.availableSeats === 0 ? t('booking.noSeats') : t('booking.viewSeats')}
            </PrimaryButton>
          </div>
          </ScreenCard>
        </Fragment>
      ))}
      </div>
    </motion.div>
  );
}
