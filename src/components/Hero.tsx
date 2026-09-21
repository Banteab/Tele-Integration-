import { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Calendar,
  Search,
  ArrowUpDown,
  Loader2,
  Users,
} from 'lucide-react';
import { SearchParams } from '../types';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getAllRoutes } from '../services/api';
import MobileHeader from './MobileHeader';
import QuickActions from './QuickActions';
import BottomNav, { type HomeTab } from './BottomNav';
import AboutPanel from './home/AboutPanel';
import SupportPanel from './home/SupportPanel';
import TicketHistory from './TicketHistory';
import { THEME } from '../config/theme';

const TAB_TITLE_KEYS: Record<HomeTab, string | undefined> = {
  home: undefined,
  tickets: 'tabs.titles.tickets',
  support: 'tabs.titles.support',
  about: 'tabs.titles.about',
};

interface Props {
  userName?: string;
  userPhone?: string;
  onSearch?: (params: SearchParams) => void;
}

export default function Hero({ userName, userPhone, onSearch }: Props) {
  const [activeTab, setActiveTab] = useState<HomeTab>('home');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [seats, setSeats] = useState('1');
  const { t } = useTranslation();
  const [fromOptions, setFromOptions] = useState<string[]>([]);
  const [toOptions, setToOptions] = useState<string[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoadingRoutes(true);
        const response = await getAllRoutes();
        if (!Array.isArray(response)) return;

        const fromSet = new Set<string>();
        const toSet = new Set<string>();

        response.forEach((origin: { originCityName?: string; originTerminalName?: string; routes?: { destinationCityName?: string; destinationTerminalName?: string }[] }) => {
          if (origin.originCityName) fromSet.add(origin.originCityName.trim());
          if (origin.originTerminalName) fromSet.add(origin.originTerminalName.trim());
          origin.routes?.forEach((route) => {
            if (route.destinationCityName) {
              toSet.add(route.destinationCityName.trim());
              fromSet.add(route.destinationCityName.trim());
            }
            if (route.destinationTerminalName) {
              toSet.add(route.destinationTerminalName.trim());
              fromSet.add(route.destinationTerminalName.trim());
            }
          });
        });

        setFromOptions(Array.from(fromSet).sort());
        setToOptions(Array.from(toSet).sort());
      } catch {
        const fallback = ['Addis Ababa', 'Hawassa', 'Bahir Dar', 'Dire Dawa', 'Adama'];
        setFromOptions(fallback);
        setToOptions(fallback);
      } finally {
        setLoadingRoutes(false);
      }
    };
    fetchRoutes();
  }, []);

  const handleSearch = () => {
    if (!from || !to || !date) {
      toast.error(t('hero.fillRequired'));
      return;
    }
    onSearch?.({ from, to, date });
  };

  const scrollToSearch = () => {
    searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleTabChange = (tab: HomeTab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBook = () => {
    handleTabChange('home');
    scrollToSearch();
  };

  const fieldClass =
    'w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-[15px] text-gray-900 outline-none focus:border-[var(--blue-500)] focus:ring-2 focus:ring-[rgba(24,154,216,0.2)]';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface-app)' }}>
      <MobileHeader
        userName={userName}
        userPhone={userPhone}
        title={TAB_TITLE_KEYS[activeTab] ? t(TAB_TITLE_KEYS[activeTab]!) : undefined}
      />

      {activeTab === 'home' && (
        <>
      <div className="relative z-10 -mt-5 app-gutter-x" ref={searchRef}>
        <div
          className="rounded-2xl bg-white p-4 space-y-3"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <div className="relative">
            <MapPin
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: THEME.primary }}
            />
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              disabled={loadingRoutes}
              className={fieldClass}
            >
              <option value="">{loadingRoutes ? t('common.loading') : t('common.from')}</option>
              {fromOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setFrom(to);
                setTo(from);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-sm"
              style={{ color: THEME.brand }}
              aria-label={t('common.swap')}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <MapPin
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: THEME.primary }}
            />
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={loadingRoutes}
              className={fieldClass}
            >
              <option value="">{loadingRoutes ? t('common.loading') : t('common.to')}</option>
              {toOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                className={fieldClass}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={String(n)}>
                    {t('common.seat', { count: n })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={loadingRoutes}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-[16px] font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
            style={{
              backgroundColor: THEME.primary,
              boxShadow: THEME.shadowPrimary,
            }}
          >
            {loadingRoutes ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            {t('hero.searchBuses')}
          </button>
        </div>
      </div>

      <QuickActions onBook={handleBook} onManage={() => handleTabChange('tickets')} />
        </>
      )}

      {activeTab === 'tickets' && <TicketHistory embedded />}

      {activeTab === 'support' && <SupportPanel />}
      {activeTab === 'about' && <AboutPanel />}

      <BottomNav active={activeTab} onTabChange={handleTabChange} onBook={handleBook} />
    </div>
  );
}
