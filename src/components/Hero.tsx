import { useState, useEffect, useRef, Fragment } from 'react';
import {
  MapPin,
  Calendar,
  Search,
  ArrowUpDown,
  ArrowRight,
  Clock,
  Loader2,
  Bus,
  Armchair,
  Smartphone,
  Ticket,
  CreditCard,
  ShieldCheck,
  ClipboardCheck,
  Compass,
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
import { PrimaryButton, EmptyState } from './ui/ScreenUI';
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
  const { t } = useTranslation();
  const [fromOptions, setFromOptions] = useState<string[]>([]);
  const [toOptions, setToOptions] = useState<string[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<RoutePair[]>([]);
  const [recentRoutes, setRecentRoutes] = useState<RoutePair[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);
  const routesRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

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
        toast.error(t('hero.routesLoadFailed'));
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
    if (from === to) {
      toast.error(t('hero.sameOriginDestination'));
      return;
    }
    if (date < todayIsoDate()) {
      toast.error(t('hero.pastDate'));
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

  /** Footer "How it works" link — jump to that section, switching tabs first if needed. */
  const goToHowItWorks = () => {
    const scroll = () => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const year = new Date().getFullYear();

  /** Field style matching the reference design: label above, no visible border until hover/focus. */
  const webField = 'flex-1 min-w-0 flex flex-col justify-center px-[18px] py-3.5 rounded-xl transition-colors hover:bg-[var(--surface-muted)] focus-within:bg-[var(--surface-muted)]';
  const webLabel = 'text-[11px] font-medium tracking-wide mb-0.5';
  const webInput = 'border-0 bg-transparent text-[15px] font-semibold text-[var(--text-primary)] outline-none w-full p-0 appearance-none';

  const bookingBar = (
    <div
      className="rounded-[18px] bg-white p-2.5 flex flex-col xl:flex-row items-stretch"
      style={{ border: 'var(--border-bold)', boxShadow: 'var(--shadow-hard-lg)' }}
    >
      <div className={webField}>
        <label className={webLabel} style={{ color: THEME.webSoft }}>{t('common.from')}</label>
        <select value={from} onChange={(e) => setFrom(e.target.value)} disabled={loadingRoutes} className={webInput} aria-label={t("common.from")}>
          <option value="">{loadingRoutes ? t('common.loading') : t('common.from')}</option>
          {fromOptions.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={swapCities}
        className="hidden xl:flex w-[38px] h-[38px] self-center rounded-full flex-shrink-0 mx-1 items-center justify-center transition-transform duration-200 hover:rotate-180"
        style={{ border: 'var(--border-bold)', color: THEME.textPrimary, backgroundColor: THEME.primarySoft }}
        aria-label={t('common.swap')}
      >
        <ArrowUpDown className="w-3.5 h-3.5" />
      </button>

      <div className={webField}>
        <label className={webLabel} style={{ color: THEME.webSoft }}>{t('common.to')}</label>
        <select value={to} onChange={(e) => setTo(e.target.value)} disabled={loadingRoutes} className={webInput} aria-label={t("common.to")}>
          <option value="">{loadingRoutes ? t('common.loading') : t('hero.selectDestination')}</option>
          {toOptions.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="hidden xl:block w-px my-3.5 shrink-0" style={{ backgroundColor: THEME.webLine }} />

      <div className={webField}>
        <label className={webLabel} style={{ color: THEME.webSoft }}>{t('common.date')}</label>
        <input type="date" value={date} min={todayIsoDate()} onChange={(e) => setDate(e.target.value)} className={webInput} aria-label={t("common.date")} />
      </div>

      <PrimaryButton
        onClick={handleSearch}
        disabled={loadingRoutes}
        fullWidth={false}
        className="w-full xl:w-auto px-7 !py-0 xl:h-[52px] text-[15px] shrink-0 ml-0 xl:ml-1.5 mt-2 xl:mt-0 !rounded-xl"
      >
        {loadingRoutes ? <Loader2 className="w-[17px] h-[17px] animate-spin" /> : <Search className="w-[17px] h-[17px]" />}
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
            <div className="relative z-10 app-gutter-x -mt-7" ref={searchRef}>
              <div className="rounded-2xl bg-white overflow-hidden" style={{ border: 'var(--border-bold)', boxShadow: 'var(--shadow-hard-lg)' }}>
                <div className="h-1.5" style={{ backgroundColor: THEME.primary }} />
                <div className="p-4 space-y-4">
                <h1 className="font-display text-[22px] font-bold text-[var(--text-primary)] tracking-tight leading-snug">
                  {t('hero.searchHeadline')}
                </h1>

                <div className="space-y-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">{t('common.from')}</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: THEME.brandDeep }} />
                      <select value={from} onChange={(e) => setFrom(e.target.value)} disabled={loadingRoutes} className={fieldClass} aria-label={t("common.from")}>
                        <option value="">{loadingRoutes ? t('common.loading') : t('common.from')}</option>
                        {fromOptions.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="relative z-10 flex justify-center -my-4">
                    <button
                      type="button"
                      onClick={swapCities}
                      className="w-9 h-9 rounded-full border-4 border-white flex items-center justify-center"
                      style={{ backgroundColor: THEME.primary, color: THEME.textPrimary, boxShadow: '0 0 0 2px var(--ink), 0 2px 6px rgba(16,39,71,0.2)' }}
                      aria-label={t('common.swap')}
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">{t('common.to')}</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: THEME.brandDeep }} />
                      <select value={to} onChange={(e) => setTo(e.target.value)} disabled={loadingRoutes} className={fieldClass} aria-label={t("hero.selectDestination")}>
                        <option value="">{loadingRoutes ? t('common.loading') : t('hero.selectDestination')}</option>
                        {toOptions.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">{t('common.date')}</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input type="date" value={date} min={todayIsoDate()} onChange={(e) => setDate(e.target.value)} className={fieldClass} aria-label={t("common.date")} />
                  </div>
                </div>

                <PrimaryButton onClick={handleSearch} disabled={loadingRoutes}>
                  {loadingRoutes ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  {t('hero.searchBuses')}
                </PrimaryButton>
                </div>
              </div>
            </div>

            <div className="app-gutter-x pt-4 grid grid-cols-3 gap-2">
              <TrustPill icon={ShieldCheck} text={t('hero.trustSecure')} />
              <TrustPill icon={Ticket} text={t('hero.trustTicket')} />
              <TrustPill icon={Clock} text={t('hero.trustSupport')} />
            </div>

            {recentRoutes.length > 0 && (
              <section className="app-gutter-x pt-6">
                <h2 className="font-display text-sm font-bold text-[var(--text-primary)] mb-2.5">{t('routes.recentTitle')}</h2>
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
                <h2 className="font-display text-sm font-bold text-[var(--text-primary)] mb-2.5">{t('routes.title')}</h2>
                <div className="space-y-3">
                  {popularRoutes.slice(0, 3).map((route) => (
                    <Fragment key={`popular-${route.from}-${route.to}`}>
                      <RouteCard route={route} onClick={() => selectRoute(route)} />
                    </Fragment>
                  ))}
                </div>
              </section>
            )}

            {!loadingRoutes && recentRoutes.length === 0 && popularRoutes.length === 0 && (
              <div className="app-gutter-x pt-6">
                <EmptyState
                  icon={<Compass className="w-6 h-6" style={{ color: THEME.brandDeep }} />}
                  title={t('hero.exploreTitle')}
                  description={t('hero.exploreDesc')}
                  className="rounded-2xl bg-white"
                  style={{ border: 'var(--border-bold)' }}
                />
              </div>
            )}

            {/* Mini App stays a single, focused screen — booking + quick route access is the whole page.
                How it works / Why us / footer are desktop-web only (below). */}
            <div className="pb-28" />
          </div>

          {/* ============ DESKTOP / WEB ============ */}
          <div className="hidden lg:block font-web">
            {/* Hero band — centered eyebrow + headline, search is the focal point below */}
            <section
              className="pt-14 px-6"
              style={{ background: `radial-gradient(ellipse 80% 60% at 50% -10%, ${THEME.brandSoft} 0%, transparent 60%)` }}
            >
              <div className="page-container-web text-center pb-7">
                <span
                  className="inline-block px-[13px] py-[5px] bg-white rounded-full text-[11px] font-bold uppercase tracking-wider mb-[18px]"
                  style={{ border: '1.5px solid var(--ink)', color: THEME.brand }}
                >
                  {t('hero.eyebrow')}
                </span>
                <h1
                  className="font-display font-bold text-[var(--text-primary)]"
                  style={{ fontSize: 'clamp(34px, 4.6vw, 52px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
                >
                  {userName ? t('hero.headlineNamed', { name: userName.split(' ')[0] }) : t('hero.headline')}
                </h1>
              </div>
            </section>

            {/* Search — the focal point */}
            <section className="relative z-[5] px-6 pb-14" ref={searchRef}>
              <div className="page-container-web">{bookingBar}</div>
            </section>

            {/* How it works */}
            <section className="px-6 py-14" ref={howItWorksRef}>
              <div className="page-container-web">
                <div className="text-center mb-10">
                  <h2 className="font-display text-[28px] font-bold tracking-tight text-[var(--text-primary)]">{t('howItWorks.title')}</h2>
                  <p className="mt-1.5" style={{ color: THEME.webMuted }}>{t('howItWorks.subtitle')}</p>
                </div>
                <div className="relative grid grid-cols-4 gap-4">
                  <div
                    className="hidden xl:block absolute top-[22px] left-[12%] right-[12%] h-px pointer-events-none"
                    style={{ backgroundImage: `linear-gradient(90deg, transparent, ${THEME.webLine} 15%, ${THEME.webLine} 85%, transparent)` }}
                  />
                  {steps.map((step) => (
                    <Fragment key={step.n}>
                      <DesktopStep step={step} />
                    </Fragment>
                  ))}
                </div>
              </div>
            </section>

            {/* Why book with Menahariya */}
            <section className="bg-white border-y" style={{ borderColor: THEME.webLine }}>
              <div className="page-container-web px-6 py-14">
                <div className="grid grid-cols-[0.85fr_1.15fr] gap-14 items-center">
                  <div>
                    <h2 className="font-display text-[28px] font-bold tracking-tight text-[var(--text-primary)] mb-2.5">{t('about.whyTitle')}</h2>
                    <p className="mb-7 max-w-[280px] leading-relaxed" style={{ color: THEME.webMuted }}>{t('about.whySubtitle')}</p>
                    <button
                      type="button"
                      onClick={handleBook}
                      className="inline-flex items-center gap-1.5 rounded-full px-[18px] py-[9px] text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-px"
                      style={{ backgroundColor: THEME.primary, boxShadow: `0 2px 10px ${THEME.webGoldGlow}` }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = THEME.webGoldHover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = THEME.primary; }}
                    >
                      {t('desktopNav.bookTrip')}
                    </button>

                    <div className="flex flex-col gap-3 mt-9 pt-7 border-t" style={{ borderColor: THEME.webLine }}>
                      <div className="flex items-center gap-2.5 text-sm" style={{ color: THEME.webMuted }}>
                        <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: THEME.brand }} />
                        {t('payment.securePayment')}
                      </div>
                      <div className="flex items-center gap-2.5 text-sm" style={{ color: THEME.webMuted }}>
                        <Clock className="w-4 h-4 shrink-0" style={{ color: THEME.brand }} />
                        {t('hero.trustSupport')}
                      </div>
                      <div className="flex items-center gap-2.5 text-sm" style={{ color: THEME.webMuted }}>
                        <Ticket className="w-4 h-4 shrink-0" style={{ color: THEME.brand }} />
                        {t('hero.trustTicket')}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    {whyFeatures.map((f) => (
                      <Fragment key={f.titleKey}>
                        <WhyRow feature={f} />
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Popular routes — real origin/destination pairs from the API only */}
            <section className="px-6 py-14" ref={routesRef}>
              <div className="page-container-web">
                <div className="text-center mb-10">
                  <h2 className="font-display text-[28px] font-bold tracking-tight text-[var(--text-primary)]">{t('routes.title')}</h2>
                  <p className="mt-1.5" style={{ color: THEME.webMuted }}>{t('routes.subtitle')}</p>
                </div>
                {popularRoutes.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {popularRoutes.map((route) => (
                      <Fragment key={`${route.from}-${route.to}`}>
                        <RouteCard route={route} onClick={() => selectRoute(route)} />
                      </Fragment>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Compass className="w-6 h-6" style={{ color: THEME.brandDeep }} />}
                    title={t('hero.exploreTitle')}
                    description={t('hero.exploreDesc')}
                    className="rounded-2xl bg-white"
                    style={{ border: 'var(--border-bold)' }}
                  />
                )}
              </div>
            </section>

            <footer className="bg-white border-t px-6 pt-10 pb-6" style={{ borderColor: THEME.webLine }}>
              <div className="page-container-web">
                <div className="flex justify-between gap-10 pb-7 border-b mb-[18px]" style={{ borderColor: THEME.webLine }}>
                  <div className="max-w-[240px]">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center"
                        style={{ backgroundImage: `linear-gradient(145deg, ${THEME.brandMid}, ${THEME.brandDeep})`, boxShadow: '0 2px 8px rgba(12,108,166,0.22)' }}
                      >
                        <Bus className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-[15px] leading-tight text-[var(--text-primary)]">{BRAND.name}</p>
                        <p className="text-[11px] leading-tight" style={{ color: THEME.webSoft }}>{BRAND.tagline}</p>
                      </div>
                    </div>
                    <p className="text-[13px] mt-3 leading-relaxed" style={{ color: THEME.webMuted }}>{t('footer.blurb')}</p>
                  </div>

                  <div className="flex gap-11 shrink-0">
                    <FooterCol
                      titleKey="footer.product"
                      links={[
                        { labelKey: 'desktopNav.routes', onClick: goToRoutes },
                        { labelKey: 'desktopNav.myBooking', onClick: () => handleTabChange('tickets') },
                        { labelKey: 'howItWorks.title', onClick: goToHowItWorks },
                      ]}
                    />
                    <FooterCol
                      titleKey="footer.company"
                      links={[
                        { labelKey: 'tabs.about', onClick: () => handleTabChange('about') },
                        { labelKey: 'desktopNav.help', onClick: () => handleTabChange('support') },
                      ]}
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs" style={{ color: THEME.webSoft }}>
                  <span>© {year} {BRAND.name}. {t('footer.rights')}</span>
                  <div className="flex items-center gap-4">
                    <a href={`tel:${BRAND.phone}`} className="font-semibold transition-colors" style={{ color: THEME.brandDeep }}>
                      {t('support.hotline')}: {BRAND.phone}
                    </a>
                    <span>{t('footer.paymentBadge')}</span>
                  </div>
                </div>
              </div>
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

/** Compact mobile trust badge — fills the space below the search card with real value props instead of empty gray. */
function TrustPill({ icon: Icon, text }: { icon: typeof ShieldCheck; text: string }) {
  return (
    <div className="rounded-xl bg-white px-2 py-2.5 flex flex-col items-center gap-1.5 text-center" style={{ border: 'var(--border-bold)', boxShadow: 'var(--shadow-hard-sm)' }}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: THEME.brandSoft, color: THEME.brandDeep, border: '1.5px solid var(--ink)' }}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="text-[10.5px] font-bold text-[var(--text-secondary)] leading-tight">{text}</span>
    </div>
  );
}

/** Footer link column — every link is a real in-app destination, never a dead "#" anchor. */
function FooterCol({ titleKey, links }: { titleKey: string; links: { labelKey: string; onClick: () => void }[] }) {
  const { t } = useTranslation();
  return (
    <div>
      <h5 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: THEME.webSoft }}>
        {t(titleKey)}
      </h5>
      {links.map((link) => (
        <Fragment key={link.labelKey}>
          <button
            type="button"
            onClick={link.onClick}
            className="block text-left text-[13px] mb-2 transition-colors hover:text-[var(--text-primary)]"
            style={{ color: THEME.webMuted }}
          >
            {t(link.labelKey)}
          </button>
        </Fragment>
      ))}
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
      className="text-left w-full rounded-xl bg-white p-5 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
      style={{ border: 'var(--border-bold)', boxShadow: 'var(--shadow-hard-sm)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <p className="font-semibold text-[var(--text-primary)] text-[14px] leading-snug flex items-center flex-wrap gap-1.5">
          <span className="truncate">{route.from}</span>
          <ArrowRight className="w-3 h-3 shrink-0" style={{ color: THEME.webSoft }} />
          <span className="truncate">{route.to}</span>
        </p>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: THEME.webMuted }}>{t('routes.multipleDepartures')}</span>
        <span className="inline-flex items-center gap-1 font-semibold shrink-0" style={{ color: THEME.brandDeep }}>
          {t('routes.viewBuses')}
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
      className="text-left rounded-xl bg-white p-3 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
      style={{ border: 'var(--border-bold)', boxShadow: 'var(--shadow-hard-sm)' }}
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

/** Desktop "how it works" — a numbered node on the connecting line, matching the reference design. */
function DesktopStep({ step }: { step: { n: number; titleKey: string; descKey: string } }) {
  const { t } = useTranslation();
  return (
    <div className="relative z-10 flex flex-col items-center text-center">
      <div
        className="w-11 h-11 mb-4 rounded-full flex items-center justify-center font-display text-[15px] font-bold"
        style={{ backgroundColor: THEME.primary, border: '2px solid var(--ink)', color: THEME.textPrimary, boxShadow: '0 0 0 6px var(--surface-app)' }}
      >
        {step.n}
      </div>
      <p className="font-display font-bold text-[var(--text-primary)]">{t(step.titleKey)}</p>
      <p className="text-[13px] mt-1 leading-relaxed max-w-[160px]" style={{ color: THEME.webMuted }}>{t(step.descKey)}</p>
    </div>
  );
}

/** One row of a divided feature panel — never a standalone floating card. */
function WhyRow({ feature }: { feature: { icon: typeof Search; titleKey: string; textKey: string } }) {
  const { t } = useTranslation();
  const Icon = feature.icon;
  return (
    <div
      className="flex items-start gap-4 py-[18px] border-b transition-[padding] duration-150 hover:pl-1 last:border-b-0"
      style={{ borderColor: THEME.webLine }}
    >
      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: THEME.brandSoft, border: '1.5px solid var(--ink)' }}>
        <Icon className="w-[18px] h-[18px]" style={{ color: THEME.brand }} />
      </div>
      <div className="min-w-0">
        <p className="font-display font-bold text-[14px] text-[var(--text-primary)]">{t(feature.titleKey)}</p>
        <p className="text-[13px] mt-0.5" style={{ color: THEME.webMuted }}>{t(feature.textKey)}</p>
      </div>
    </div>
  );
}
