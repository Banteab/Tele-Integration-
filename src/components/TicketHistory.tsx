import { Download, Eye, Printer } from 'lucide-react';
import { useState, useEffect, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getTicketHistory } from '../services/api';
import { API_CONFIG } from '../config/api';
import { ScreenCard } from './ui/ScreenUI';
import { THEME } from '../config/theme';

interface Ticket {
  id: string;
  refNumber: string;
  operator: string;
  route: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  seats: string[];
  passengers: string[];
  totalAmount: number;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: string;
}

interface Props {
  embedded?: boolean;
  onBack?: () => void;
}

export default function TicketHistory({ embedded = false, onBack }: Props) {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(API_CONFIG.authTokenKey);
    if (!token) {
      setLoading(false);
      setTickets([]);
      return;
    }

    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getTicketHistory();
        setTickets(response.data || response || []);
      } catch (err: unknown) {
        console.error('Failed to fetch ticket history:', err);
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          localStorage.removeItem(API_CONFIG.authTokenKey);
          setError(null);
          setTickets([]);
        } else {
          const message = t('ticketHistory.loadError');
          setError(message);
          toast.error(message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [t]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrint = (ticket: Ticket) => {
    window.print();
  };

  const getStatusLabel = (status: string) => {
    const key = `ticketHistory.status${status.charAt(0).toUpperCase()}${status.slice(1)}` as
      | 'ticketHistory.statusCompleted'
      | 'ticketHistory.statusPending'
      | 'ticketHistory.statusCancelled';
    return t(key, { defaultValue: status });
  };

  const handleDownload = () => {
    toast.success(t('ticketHistory.downloadStarted'));
  };

  return (
    <div className={`space-y-4 ${embedded ? 'app-gutter-x pb-28 -mt-2' : 'space-y-6'}`}>
      {!embedded && onBack && (
        <div className="flex items-center gap-4 mb-2">
          <button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {t('ticketHistory.title')}
            </h2>
            <p className="text-gray-500 text-sm">
              {t('ticketHistory.subtitle')}
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div
            className="animate-spin rounded-full h-10 w-10 border-b-2"
            style={{ borderColor: THEME.brand }}
          />
        </div>
      )}

      {error && (
        <ScreenCard>
          <p className="text-sm text-red-700">{error}</p>
        </ScreenCard>
      )}

      {!loading && tickets.length > 0 && (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Fragment key={ticket.id}>
            <ScreenCard className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-gray-900 text-[15px]">{ticket.operator}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(ticket.status)}`}
                >
                  {getStatusLabel(ticket.status)}
                </span>
              </div>
              <p className="text-sm text-gray-600">{ticket.route}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-400">{t('common.ref')}</p>
                  <p className="font-semibold text-gray-900 tnum">{ticket.refNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400">{t('common.date')}</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(ticket.departureDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">{t('payment.seatsLabel')}</p>
                  <p className="font-semibold text-gray-900">{ticket.seats.join(', ')}</p>
                </div>
                <div>
                  <p className="text-gray-400">{t('common.amount')}</p>
                  <p className="font-semibold tnum" style={{ color: THEME.brand }}>
                    ETB {ticket.totalAmount}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-1 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(ticket)}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg"
                  style={{ backgroundColor: `${THEME.brand}14`, color: THEME.brand }}
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1" />
                  {t('common.view')}
                </button>
                <button
                  type="button"
                  onClick={() => handlePrint(ticket)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-50"
                  title={t('common.print')}
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(ticket)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-50"
                  title={t('common.download')}
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </ScreenCard>
            </Fragment>
          ))}
        </div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <ScreenCard className="text-center py-10">
          <p className="text-gray-500">{t('ticketHistory.noTickets')}</p>
          <p className="text-xs text-gray-400 mt-2">{t('ticketHistory.bookFromHome')}</p>
        </ScreenCard>
      )}

      {selectedTicket && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedTicket.operator}</h3>
                <p className="text-sm text-gray-500">{selectedTicket.route}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400 text-xs">{t('common.reference')}</p>
                  <p className="font-semibold tnum">{selectedTicket.refNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">{t('common.status')}</p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(selectedTicket.status)}`}
                  >
                    {getStatusLabel(selectedTicket.status)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Date</p>
                  <p className="font-semibold">
                    {new Date(selectedTicket.departureDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">{t('common.time')}</p>
                  <p className="font-semibold">{selectedTicket.departureTime}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                {selectedTicket.passengers.map((passenger, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-xs"
                  >
                    <span>{passenger}</span>
                    <span className="text-gray-500">{t('common.seatNumber', { seat: selectedTicket.seats[idx] })}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="font-bold">{t('common.total')}</span>
                <span className="text-xl font-bold tnum" style={{ color: THEME.brand }}>
                  ETB {selectedTicket.totalAmount}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
