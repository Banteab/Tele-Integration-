import { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Calendar,
  Search,
  ArrowUpDown,
  Loader2,
  Users,
  Bus,
  Shield,
  Smartphone,
} from 'lucide-react';
import { SearchParams } from '../types';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getAllRoutes } from '../services/api';
import MobileHeader from './MobileHeader';
import DesktopNav from './DesktopNav';
import QuickActions from './QuickActions';
import BottomNav, { type HomeTab } from './BottomNav';
import AboutPanel from './home/AboutPanel';
import SupportPanel from './home/SupportPanel';
import TicketHistory from './TicketHistory';
import { PageContainer, PrimaryButton } from './ui/ScreenUI';
import { BRAND, THEME } from '../config/theme';

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

  const swapCities = () => {
    setFrom(to);
    setTo(from);
  };

  const fieldClass =
    'w-full rounded-xl border border-[var(--border-strong)] bg-white py-3.5 pl-11 pr-4 text-[15px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--blue-100)]';

  const desktopFieldClass =
    'w-full rounded-lg border border-[var(--border-strong)] bg-white py-3 pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--blue-100)]';

  const trustFeatures = [
    { icon: Bus, textKey: 'about.featureSearch' },
    { icon: Smartphone, textKey: 'about.featurePay' },
    { icon: Shield, textKey: 'about.featureSecure' },
  ];

  return (
    <div className="min-h-screen lg:min-h-0 flex flex-col" style={{ background: 'var(--surface-app)' }}>
      <DesktopNav
        userName={userName}
        userPhone={userPhone}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onBook={handleBook}
        onBrandClick={() => handleTabChange('home')}
      />
      <MobileHeader
        userName={userName}
        userPhone={userPhone}
        title={TAB_TITLE_KEYS[activeTab] ? t(TAB_TITLE_KEYS[activeTab]!) : undefined}
      />

      {activeTab === 'home' && (
        <>
          {/* ---------- Mobile / tablet: compact stacked search card ---------- */}
          <div className="lg:hidden relative z-10 -mt-5 app-gutter-x" ref={searchRef}>
            <div className="rounded-2xl bg-white p-4 space-y-3" style={{ boxShadow: 'var(--shadow-md)' }}>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: THEME.brandDeep }} />
                <select value={from} onChange={(e) => setFrom(e.target.value)} disabled={loadingRoutes} className={fieldClass}>
                  <option value="">{loadingRoutes ? t('common.loading') : t('common.from')}</option>
                  {fromOptions.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={swapCities}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-[var(--border-strong)] bg-white flex items-center justify-center shadow-sm"
                  style={{ color: THEME.brand }}
                  aria-label={t('common.swap')}
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: THEME.brandDeep }} />
                <select value={to} onChange={(e) => setTo(e.target.value)} disabled={loadingRoutes} className={fieldClass}>
                  <option value="">{loadingRoutes ? t('common.loading') : t('common.to')}</option>
                  {toOptions.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
                </div>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <select value={seats} onChange={(e) => setSeats(e.target.value)} className={fieldClass}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={String(n)}>{t('common.seat', { count: n })}</option>
                    ))}
                  </select>
                </div>
              </div>

              <PrimaryButton onClick={handleSearch} disabled={loadingRoutes}>
                {loadingRoutes ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {t('hero.searchBuses')}
              </PrimaryButton>
            </div>
          </div>

          <div className="lg:hidden">
            <QuickActions onBook={handleBook} onManage={() => handleTabChange('tickets')} />
          </div>

          {/* ---------- Desktop / web: split hero + horizontal search bar ---------- */}
          <div className="hidden lg:block">
            <section className="pt-14 pb-10 px-6">
              <PageContainer className="text-center max-w-3xl">
                <span
                  className="text-eyebrow inline-block px-3 py-1.5 rounded-full mb-5"
                  style={{ backgroundColor: THEME.primarySoft, color: THEME.primaryPressed }}
                >
                  {BRAND.tagline}
                </span>
                <h1
                  className="font-extrabold text-[var(--text-primary)] tracking-tight leading-tight"
                  style={{ fontSize: 'var(--text-display)' }}
                >
                  {userName ? t('header.greetingNamed', { name: userName.split(' ')[0] }) : t('header.greeting')}
                </h1>
                <p className="text-[var(--text-secondary)] text-base mt-4 max-w-xl mx-auto">{t('about.description')}</p>
              </PageContainer>
            </section>

            <section className="px-6" ref={searchRef}>
              <PageContainer>
                <div
                  className="rounded-2xl bg-white p-3 flex flex-col xl:flex-row items-stretch gap-2"
                  style={{ boxShadow: 'var(--shadow-md)' }}
                >
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: THEME.brandDeep }} />
                    <select value={from} onChange={(e) => setFrom(e.target.value)} disabled={loadingRoutes} className={desktopFieldClass}>
                      <option value="">{loadingRoutes ? t('common.loading') : t('common.from')}</option>
                      {fromOptions.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={swapCities}
                    className="w-10 h-10 self-center rounded-full border border-[var(--border-strong)] bg-white flex items-center justify-center shrink-0 hover:bg-[var(--surface-muted)] transition-colors"
                    style={{ color: THEME.brand }}
                    aria-label={t('common.swap')}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>

                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: THEME.brandDeep }} />
                    <select value={to} onChange={(e) => setTo(e.target.value)} disabled={loadingRoutes} className={desktopFieldClass}>
                      <option value="">{loadingRoutes ? t('common.loading') : t('common.to')}</option>
                      {toOptions.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={desktopFieldClass} />
                  </div>

                  <div className="relative w-full xl:w-40 shrink-0">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <select value={seats} onChange={(e) => setSeats(e.target.value)} className={desktopFieldClass}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={String(n)}>{t('common.seat', { count: n })}</option>
                      ))}
                    </select>
                  </div>

                  <PrimaryButton
                    onClick={handleSearch}
                    disabled={loadingRoutes}
                    fullWidth={false}
                    className="w-full xl:w-auto px-6 !py-3 text-sm shrink-0"
                  >
                    {loadingRoutes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {t('hero.searchBuses')}
                  </PrimaryButton>
                </div>
              </PageContainer>
            </section>

            <section className="px-6 pt-16 pb-20">
              <PageContainer className="grid grid-cols-3 gap-6">
                {trustFeatures.map(({ icon: Icon, textKey }) => (
                  <div
                    key={textKey}
                    className="rounded-2xl bg-white border border-[var(--border)] p-6 flex items-start gap-4"
                    style={{ boxShadow: 'var(--shadow-sm)' }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: THEME.brandSoft, color: THEME.brandDeep }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed pt-2">{t(textKey)}</p>
                  </div>
                ))}
              </PageContainer>
            </section>

            <footer className="border-t border-[var(--border-strong)] px-6 py-8">
              <PageContainer className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                <span>
                  {BRAND.name} <span className="am">{BRAND.nameAm}</span> — {BRAND.tagline}
                </span>
                <a href={`tel:${BRAND.phone}`} className="font-medium hover:text-[var(--text-secondary)] transition-colors">
                  {t('support.hotline')}: {BRAND.phone}
                </a>
              </PageContainer>
            </footer>
          </div>
        </>
      )}

      {activeTab === 'tickets' && <TicketHistory embedded />}
      {activeTab === 'support' && <SupportPanel />}
      {activeTab === 'about' && <AboutPanel />}

      <BottomNav active={activeTab} onTabChange={handleTabChange} onBook={handleBook} />
    </div>
  );
}
