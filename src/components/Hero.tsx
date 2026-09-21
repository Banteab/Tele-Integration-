import { useState, useEffect, useRef, Fragment } from 'react';
import {
  MapPin,
  Calendar,
  Search,
  ArrowUpDown,
  ArrowRight,
  Clock,
  Loader2,
  Users,
  Bus,
  Armchair,
  Smartphone,
  Ticket,
  CreditCard,
  ShieldCheck,
  ClipboardCheck,
} from 'lucide-react';
import { SearchParams } from '../types';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getAllRoutes } from '../services/api';
import MobileHeader from './MobileHeader';
import DesktopNav from './DesktopNav';
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

interface RoutePair {
  from: string;
  to: string;
}

/** Client-side "recently searched" list — reflects the user's own real searches, never fabricated. */
const RECENT_ROUTES_KEY = 'menahariya_recent_routes';

function loadRecentRoutes(): RoutePair[] {
  try {
    const raw = localStorage.getItem(RECENT_ROUTES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is RoutePair => Boolean(r) && typeof r.from === 'string' && typeof r.to === 'string',
    );
  } catch {
    return [];
  }
}

function saveRecentRoute(route: RoutePair): RoutePair[] {
  try {
    const existing = loadRecentRoutes();
    const deduped = existing.filter((r) => !(r.from === route.from && r.to === route.to));
    const updated = [route, ...deduped].slice(0, 5);
    localStorage.setItem(RECENT_ROUTES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [route];
  }
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

interface Props {
  userName?: string;
  userPhone?: string;
  onSearch?: (params: SearchParams) => void;
}

export default function Hero({ userName, userPhone, onSearch }: Props) {
  const [activeTab, setActiveTab] = useState<HomeTab>('home');
  const [from, setFrom] = useState('Addis Ababa');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(todayIsoDate());
  const [seats, setSeats] = useState('1');
  const { t } = useTranslation();
  const [fromOptions, setFromOptions] = useState<string[]>([]);
  const [toOptions, setToOptions] = useState<string[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<RoutePair[]>([]);
  const [recentRoutes, setRecentRoutes] = useState<RoutePair[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);
  const routesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentRoutes(loadRecentRoutes().slice(0, 2));
  }, []);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoadingRoutes(true);
        const response = await getAllRoutes();
        if (!Array.isArray(response)) return;

        const fromSet = new Set<string>();
        const toSet = new Set<string>();
        const pairs: RoutePair[] = [];
        const seenPairs = new Set<string>();

        response.forEach((origin: { originCityName?: string; originTerminalName?: string; routes?: { destinationCityName?: string; destinationTerminalName?: string }[] }) => {
          const originName = (origin.originCityName || origin.originTerminalName || '').trim();
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

            const destName = (route.destinationCityName || route.destinationTerminalName || '').trim();
            if (originName && destName && originName !== destName) {
              const key = `${originName}→${destName}`;
              if (!seenPairs.has(key)) {
                seenPairs.add(key);
                pairs.push({ from: originName, to: destName });
              }
            }
          });
        });

        setFromOptions(Array.from(fromSet).sort());
        setToOptions(Array.from(toSet).sort());
        // Real route pairs only — never fabricated when the API has none.
        setPopularRoutes(pairs.slice(0, 6));
      } catch {
        const fallback = ['Addis Ababa', 'Hawassa', 'Bahir Dar', 'Dire Dawa', 'Adama'];
        setFromOptions(fallback);
        setToOptions(fallback);
        setPopularRoutes([]);
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
    setRecentRoutes(saveRecentRoute({ from, to }).slice(0, 2));
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

  /** Nav "Routes" click — jump to the popular-routes section, switching tabs first if needed. */
  const goToRoutes = () => {
    const scroll = () => routesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (activeTab !== 'home') {
      handleTabChange('home');
      requestAnimationFrame(() => requestAnimationFrame(scroll));
    } else {
      scroll();
    }
  };

  /** Picking a popular route prefills the real search fields — it never skips the date/search step. */
  const selectRoute = (route: RoutePair) => {
    setFrom(route.from);
    setTo(route.to);
    scrollToSearch();
  };

  const fieldClass =
    'w-full rounded-xl border border-[var(--border-strong)] bg-white py-3.5 pl-11 pr-4 text-[15px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--blue-100)]';

  const desktopFieldClass =
    'w-full rounded-lg border border-[var(--border-strong)] bg-white py-3 pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--blue-100)]';

  const whyFeatures = [
    { icon: Search, titleKey: 'about.featureSearchTitle', textKey: 'about.featureSearch' },
    { icon: Armchair, titleKey: 'about.featureSeatsTitle', textKey: 'about.featureSeats' },
    { icon: Smartphone, titleKey: 'about.featurePayTitle', textKey: 'about.featurePay' },
    { icon: Ticket, titleKey: 'about.featureTicketTitle', textKey: 'about.featureTicket' },
    { icon: ClipboardCheck, titleKey: 'about.featureInfoTitle', textKey: 'about.featureInfo' },
  ];

  const steps = [
    { n: 1, icon: Search, titleKey: 'howItWorks.step1Title', descKey: 'howItWorks.step1Desc' },
    { n: 2, icon: Bus, titleKey: 'howItWorks.step2Title', descKey: 'howItWorks.step2Desc' },
    { n: 3, icon: CreditCard, titleKey: 'howItWorks.step3Title', descKey: 'howItWorks.step3Desc' },
    { n: 4, icon: Ticket, titleKey: 'howItWorks.step4Title', descKey: 'howItWorks.step4Desc' },
  ] as const;

  const sampleRoute = popularRoutes[0] ?? { from: 'Addis Ababa', to: 'Hawassa' };
  const year = new Date().getFullYear();

  const bookingBar = (
    <div className="rounded-2xl bg-white p-3 flex flex-col xl:flex-row items-stretch gap-2" style={{ boxShadow: 'var(--shadow-md)' }}>
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
  );

  return (
    <div className="min-h-screen lg:min-h-0 flex flex-col" style={{ background: 'var(--surface-app)' }}>
      <DesktopNav
        userName={userName}
        userPhone={userPhone}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onBook={handleBook}
        onRoutesClick={goToRoutes}
        onBrandClick={() => handleTabChange('home')}
      />
      <MobileHeader
        userName={userName}
        userPhone={userPhone}
        title={TAB_TITLE_KEYS[activeTab] ? t(TAB_TITLE_KEYS[activeTab]!) : undefined}
        minimal={activeTab === 'home'}
      />

      {activeTab === 'home' && (
        <>
          {/* ============ MOBILE / TABLET — one focused screen ============ */}
          <div className="lg:hidden">
            <div className="relative z-10 app-gutter-x pt-5" ref={searchRef}>
              <div className="rounded-2xl bg-white p-4 space-y-4" style={{ boxShadow: 'var(--shadow-md)' }}>
                <h1 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight leading-snug">
                  {t('hero.searchHeadline')}
                </h1>

                <div className="space-y-1">
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: THEME.brandDeep }} />
                    <select value={from} onChange={(e) => setFrom(e.target.value)} disabled={loadingRoutes} className={fieldClass}>
                      <option value="">{loadingRoutes ? t('common.loading') : t('common.from')}</option>
                      {fromOptions.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative z-10 flex justify-center -my-4">
                    <button
                      type="button"
                      onClick={swapCities}
                      className="w-9 h-9 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center"
                      style={{ color: THEME.brand, boxShadow: '0 2px 6px rgba(16,39,71,0.15)' }}
                      aria-label={t('common.swap')}
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: THEME.brandDeep }} />
                    <select value={to} onChange={(e) => setTo(e.target.value)} disabled={loadingRoutes} className={fieldClass}>
                      <option value="">{loadingRoutes ? t('common.loading') : t('hero.selectDestination')}</option>
                      {toOptions.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
                </div>

                <PrimaryButton onClick={handleSearch} disabled={loadingRoutes}>
                  {loadingRoutes ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  {t('hero.searchBuses')}
                </PrimaryButton>
              </div>
            </div>

            {recentRoutes.length > 0 && (
              <section className="app-gutter-x pt-6">
                <h2 className="text-sm font-bold text-[var(--text-primary)] mb-2.5">{t('routes.recentTitle')}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {recentRoutes.map((route) => (
                    <Fragment key={`recent-${route.from}-${route.to}`}>
                      <RecentRouteCard route={route} onClick={() => selectRoute(route)} />
                    </Fragment>
                  ))}
                </div>
              </section>
            )}

            {popularRoutes.length > 0 && (
              <section className="app-gutter-x pt-6">
                <h2 className="text-sm font-bold text-[var(--text-primary)] mb-2.5">{t('routes.title')}</h2>
                <div className="space-y-3">
                  {popularRoutes.slice(0, 3).map((route) => (
                    <Fragment key={`popular-${route.from}-${route.to}`}>
                      <RouteCard route={route} onClick={() => selectRoute(route)} />
                    </Fragment>
                  ))}
                </div>
              </section>
            )}

            {/* Mini App stays a single, focused screen — booking + quick route access is the whole page.
                How it works / Why us / footer are desktop-web only (below). */}
            <div className="pb-28" />
          </div>

          {/* ============ DESKTOP / WEB ============ */}
          <div className="hidden lg:block">
            <section className="pt-14 pb-10 px-6">
              <PageContainer>
                <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
                  <div>
                    <span
                      className="text-eyebrow inline-block px-3 py-1.5 rounded-full mb-5"
                      style={{ backgroundColor: THEME.brandSoft, color: THEME.brandDeep }}
                    >
                      {t('hero.eyebrow')}
                    </span>
                    <h1
                      className="font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.1]"
                      style={{ fontSize: 'var(--text-display)' }}
                    >
                      {userName ? t('hero.headlineNamed', { name: userName.split(' ')[0] }) : t('hero.headline')}
                    </h1>
                    <p className="text-[var(--text-secondary)] text-base mt-4 max-w-lg">{t('hero.subcopy')}</p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6">
                      <TrustChip icon={ShieldCheck} text={t('payment.securePayment')} />
                      <TrustChip icon={Ticket} text={t('hero.journeyCta')} />
                    </div>
                  </div>

                  <JourneyVisual from={sampleRoute.from} to={sampleRoute.to} />
                </div>
              </PageContainer>
            </section>

            <section className="px-6" ref={searchRef}>
              <PageContainer>{bookingBar}</PageContainer>
            </section>

            {popularRoutes.length > 0 && (
              <section className="px-6 pt-20 pb-4" ref={routesRef}>
                <PageContainer>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('routes.title')}</h2>
                    <p className="text-[var(--text-secondary)] mt-1">{t('routes.subtitle')}</p>
                  </div>
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                    {popularRoutes.map((route) => (
                      <Fragment key={`${route.from}-${route.to}`}>
                        <RouteCard route={route} onClick={() => selectRoute(route)} />
                      </Fragment>
                    ))}
                  </div>
                </PageContainer>
              </section>
            )}

            <section className="px-6 py-20" style={{ backgroundColor: THEME.brandSoft }}>
              <PageContainer>
                <div className="text-center mb-12">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('howItWorks.title')}</h2>
                  <p className="text-[var(--text-secondary)] mt-1">{t('howItWorks.subtitle')}</p>
                </div>
                <div className="grid grid-cols-4 gap-6">
                  {steps.map((step, i) => (
                    <Fragment key={step.n}>
                      <DesktopStep step={step} isLast={i === steps.length - 1} />
                    </Fragment>
                  ))}
                </div>
              </PageContainer>
            </section>

            <section className="px-6 py-20">
              <PageContainer className="grid grid-cols-[0.8fr_1.2fr] gap-12 items-start">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('about.whyTitle')}</h2>
                  <p className="text-[var(--text-secondary)] mt-2">{t('about.whySubtitle')}</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-white divide-y divide-[var(--border)] overflow-hidden">
                  {whyFeatures.map((f) => (
                    <Fragment key={f.titleKey}>
                      <WhyRow feature={f} />
                    </Fragment>
                  ))}
                </div>
              </PageContainer>
            </section>

            <footer className="border-t border-[var(--border-strong)] px-6 py-10">
              <PageContainer>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: THEME.brandSoft }}>
                      <Bus className="w-4 h-4" style={{ color: THEME.brandDeep }} />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">{BRAND.name}</p>
                      <p className="text-xs text-[var(--text-muted)] am">{BRAND.nameAm}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-sm text-[var(--text-secondary)]">
                    <a href={`tel:${BRAND.phone}`} className="font-medium hover:text-[var(--text-primary)] transition-colors">
                      {t('support.hotline')}: {BRAND.phone}
                    </a>
                    <span className="w-px h-4 bg-[var(--border-strong)]" />
                    <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {t('footer.paymentBadge')}
                    </span>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-[var(--border)] text-xs text-[var(--text-muted)] text-center">
                  © {year} {BRAND.name}. {t('footer.rights')}
                </div>
              </PageContainer>
            </footer>
          </div>
        </>
      )}

      {activeTab === 'tickets' && <TicketHistory embedded />}
      {activeTab === 'support' && <SupportPanel />}
      {activeTab === 'about' && <AboutPanel />}

      <BottomNav active={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

/** Small inline trust signal under the hero headline — not a full card. */
function TrustChip({ icon: Icon, text }: { icon: typeof ShieldCheck; text: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
      <Icon className="w-3.5 h-3.5" style={{ color: THEME.brandDeep }} />
      {text}
    </div>
  );
}

/**
 * The hero's "transport visual" — a CSS/SVG journey panel (route pins, dashed
 * path, bus + ticket motifs) rather than a stock photo, so it renders
 * reliably without depending on external imagery.
 */
function JourneyVisual({ from, to }: { from: string; to: string }) {
  const { t } = useTranslation();
  return (
    <div className="relative rounded-3xl overflow-hidden p-8" style={{ backgroundColor: THEME.brandSoft }}>
      <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full opacity-60 pointer-events-none" style={{ backgroundColor: THEME.brandSurface }} />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full opacity-40 pointer-events-none" style={{ backgroundColor: THEME.brandSurface }} />

      <div className="relative">
        <span className="text-eyebrow inline-block mb-6" style={{ color: THEME.brandDeep }}>
          {t('hero.journeyLabel')}
        </span>

        <div className="flex items-stretch gap-4">
          <div className="flex flex-col items-center pt-1.5">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: THEME.brand }} />
            <span className="flex-1 w-0 border-l-2 border-dashed my-1" style={{ borderColor: THEME.brandBorder }} />
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
              <Bus className="w-4 h-4" style={{ color: THEME.brandDeep }} />
            </div>
            <span className="flex-1 w-0 border-l-2 border-dashed my-1" style={{ borderColor: THEME.brandBorder }} />
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: THEME.primary }} />
          </div>
          <div className="flex-1 flex flex-col justify-between py-0.5">
            <div>
              <p className="text-xs text-[var(--text-muted)]">{t('common.from')}</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{from}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">{t('common.to')}</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{to}</p>
            </div>
          </div>
        </div>

        <div
          className="mt-8 pt-5 border-t border-dashed flex items-center gap-2 text-sm font-semibold"
          style={{ borderColor: THEME.brandBorder, color: THEME.brandDeep }}
        >
          <Ticket className="w-4 h-4" />
          {t('hero.journeyCta')}
        </div>
      </div>
    </div>
  );
}

/** A real origin → destination pair, presented as a bookable journey, not a generic feature card. */
function RouteCard({ route, onClick }: { route: RoutePair; onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left w-full rounded-2xl bg-white border border-[var(--border)] p-5 transition-all duration-150 hover:border-[var(--color-brand-border)] hover:shadow-md active:scale-[0.99]"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME.brand }} />
        <p className="font-bold text-[var(--text-primary)] text-[15px] truncate">{route.from}</p>
      </div>
      <div className="flex items-center gap-2 pl-[3px] mb-3">
        <span className="w-0 border-l-2 border-dashed h-4" style={{ borderColor: THEME.brandBorder }} />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME.primary }} />
        <p className="font-bold text-[var(--text-primary)] text-[15px] truncate">{route.to}</p>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] text-xs">
        <span className="text-[var(--text-muted)]">{t('routes.multipleDepartures')}</span>
        <span className="inline-flex items-center gap-1 font-semibold shrink-0" style={{ color: THEME.brandDeep }}>
          {t('routes.viewBuses')}
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
}

/** Compact quick-tap card for a route the user actually searched before. */
function RecentRouteCard({ route, onClick }: { route: RoutePair; onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-xl bg-white border border-[var(--border)] p-3 transition-colors hover:border-[var(--color-brand-border)] active:scale-[0.99]"
    >
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
        <Clock className="w-3 h-3" />
        {t('routes.recentTitle')}
      </div>
      <p className="text-sm font-bold text-[var(--text-primary)] truncate">{route.from}</p>
      <ArrowRight className="w-3 h-3 my-0.5" style={{ color: THEME.brandDeep }} />
      <p className="text-sm font-bold text-[var(--text-primary)] truncate">{route.to}</p>
    </button>
  );
}

/** Mobile "how it works" — a vertical connected list rather than four identical cards. */
function StepItem({
  step,
  isLast,
}: {
  step: { n: number; icon: typeof Search; titleKey: string; descKey: string };
  isLast: boolean;
}) {
  const { t } = useTranslation();
  const Icon = step.icon;
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: THEME.brandSoft, color: THEME.brandDeep }}
        >
          <Icon className="w-4.5 h-4.5" />
        </div>
        {!isLast && <span className="flex-1 w-0 border-l-2 border-dashed my-1" style={{ borderColor: THEME.brandBorder, minHeight: '20px' }} />}
      </div>
      <div className={isLast ? '' : 'pb-6'}>
        <p className="font-bold text-[var(--text-primary)] text-sm">
          {step.n}. {t(step.titleKey)}
        </p>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t(step.descKey)}</p>
      </div>
    </div>
  );
}

/** Desktop "how it works" — numbered icon nodes connected by arrows, showing progression. */
function DesktopStep({
  step,
  isLast,
}: {
  step: { n: number; icon: typeof Search; titleKey: string; descKey: string };
  isLast: boolean;
}) {
  const { t } = useTranslation();
  const Icon = step.icon;
  return (
    <div className="relative flex flex-col items-center text-center">
      {!isLast && (
        <ArrowRight
          className="hidden xl:block absolute top-7 -right-3 w-6 h-6 translate-x-1/2"
          style={{ color: THEME.brandBorder }}
        />
      )}
      <div className="relative mb-4">
        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <Icon className="w-6 h-6" style={{ color: THEME.brandDeep }} />
        </div>
        <span
          className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-[var(--text-primary)]"
          style={{ backgroundColor: THEME.primary }}
        >
          {step.n}
        </span>
      </div>
      <p className="font-bold text-[var(--text-primary)]">{t(step.titleKey)}</p>
      <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-[200px]">{t(step.descKey)}</p>
    </div>
  );
}

/** One row of a divided feature panel — never a standalone floating card. */
function WhyRow({ feature }: { feature: { icon: typeof Search; titleKey: string; textKey: string } }) {
  const { t } = useTranslation();
  const Icon = feature.icon;
  return (
    <div className="flex items-start gap-4 p-5">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: THEME.brandSoft, color: THEME.brandDeep }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="font-bold text-[var(--text-primary)] text-sm">{t(feature.titleKey)}</p>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t(feature.textKey)}</p>
      </div>
    </div>
  );
}
