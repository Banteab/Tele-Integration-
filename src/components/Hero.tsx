import { useState, useEffect, useRef, Fragment } from 'react';
import {
  MapPin,
  Navigation,
  Calendar,
  Search,
  ArrowUpDown,
  ArrowRight,
  Clock,
  Loader2,
  Bus,
  Ticket,
  CreditCard,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Luggage,
  Zap,
  Wallet,
  RotateCcw,
  Headphones,
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

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

interface Props {
  userName?: string;
  userPhone?: string;
  onSearch?: (params: SearchParams) => void;
  /** True when the persistent 3D hero scene is rendering behind this screen — drop the opaque page background so it shows through. */
  has3DBackground?: boolean;
}

export default function Hero({ userName, userPhone, onSearch, has3DBackground = false }: Props) {
  const [activeTab, setActiveTab] = useState<HomeTab>('home');
  const [from, setFrom] = useState('Addis Ababa');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(todayIsoDate());
  const { t } = useTranslation();
  const [fromOptions, setFromOptions] = useState<string[]>([]);
  const [toOptions, setToOptions] = useState<string[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<RoutePair[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);
  const routesRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const telebirrRef = useRef<HTMLDivElement>(null);

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

  /** Nav "telebirr Pay" click — jump to the telebirr trust section, switching tabs first if needed. */
  const goToTelebirr = () => {
    const scroll = () => telebirrRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const steps = [
    { n: 1, icon: Search, titleKey: 'howItWorks.step1Title', descKey: 'howItWorks.step1Desc', bg: 'bg-sky-100/80 group-hover:bg-sky-600', text: 'text-sky-600' },
    { n: 2, icon: Bus, titleKey: 'howItWorks.step2Title', descKey: 'howItWorks.step2Desc', bg: 'bg-amber-100/80 group-hover:bg-amber-500', text: 'text-amber-600' },
    { n: 3, icon: CreditCard, titleKey: 'howItWorks.step3Title', descKey: 'howItWorks.step3Desc', bg: 'bg-emerald-100/80 group-hover:bg-emerald-600', text: 'text-emerald-600' },
    { n: 4, icon: Luggage, titleKey: 'howItWorks.step4Title', descKey: 'howItWorks.step4Desc', bg: 'bg-indigo-100/80 group-hover:bg-indigo-600', text: 'text-indigo-600' },
  ] as const;

  const year = new Date().getFullYear();

  const bookingBar = (
    <div className="rounded-3xl bg-white p-5 sm:p-7 border border-slate-100" style={{ boxShadow: '0 25px 50px -12px rgba(15,23,42,0.15)' }}>
      <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-sky-50 text-sky-700 font-bold text-xs rounded-xl flex items-center gap-2 border border-sky-100">
            <Bus className="w-3.5 h-3.5" /> {t('searchWidget.intercityCoach')}
          </span>
          <span className="hidden sm:flex px-3 py-1.5 text-slate-400 font-medium text-xs items-center gap-1.5">
            {t('searchWidget.roundTripSoon')}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
          <ShieldCheck className="w-3.5 h-3.5" /> {t('searchWidget.telebirrProtected')}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-center">
        <div className="xl:col-span-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/90 rounded-2xl p-3 transition-all focus-within:ring-2 focus-within:ring-sky-500 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <MapPin className="w-[18px] h-[18px]" />
          </div>
          <div className="min-w-0 flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('common.from')}</label>
            <select value={from} onChange={(e) => setFrom(e.target.value)} disabled={loadingRoutes} className="border-0 bg-transparent text-slate-900 font-bold text-[15px] outline-none w-full p-0 appearance-none" aria-label={t("common.from")}>
              <option value="">{loadingRoutes ? t('common.loading') : t('common.from')}</option>
              {fromOptions.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="hidden xl:flex justify-center xl:col-span-1">
          <button
            type="button"
            onClick={swapCities}
            aria-label={t('common.swap')}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 text-sky-600 hover:bg-sky-600 hover:text-white hover:border-sky-600 transition-all flex items-center justify-center shadow-sm transform hover:rotate-180"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        <div className="xl:col-span-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/90 rounded-2xl p-3 transition-all focus-within:ring-2 focus-within:ring-sky-500 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Navigation className="w-[18px] h-[18px]" />
          </div>
          <div className="min-w-0 flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('common.to')}</label>
            <select value={to} onChange={(e) => setTo(e.target.value)} disabled={loadingRoutes} className="border-0 bg-transparent text-slate-900 font-bold text-[15px] outline-none w-full p-0 appearance-none" aria-label={t("common.to")}>
              <option value="">{loadingRoutes ? t('common.loading') : t('hero.selectDestination')}</option>
              {toOptions.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="xl:col-span-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/90 rounded-2xl p-3 transition-all focus-within:ring-2 focus-within:ring-sky-500 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
            <Calendar className="w-[18px] h-[18px]" />
          </div>
          <div className="min-w-0 flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('common.date')}</label>
            <input type="date" value={date} min={todayIsoDate()} onChange={(e) => setDate(e.target.value)} className="border-0 bg-transparent text-slate-900 font-bold text-[15px] outline-none w-full p-0 appearance-none" aria-label={t("common.date")} />
          </div>
        </div>

        <div className="xl:col-span-2">
          <button
            type="button"
            onClick={handleSearch}
            disabled={loadingRoutes}
            className="w-full min-h-[56px] bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 font-black rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 text-base"
            style={{ boxShadow: '0 8px 20px -4px rgba(245,158,11,0.45)' }}
          >
            {loadingRoutes ? <Loader2 className="w-[17px] h-[17px] animate-spin" /> : <Search className="w-[17px] h-[17px]" />}
            <span>{t('hero.searchBuses')}</span>
          </button>
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 font-medium px-1">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> {t('searchWidget.instantSms')}
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> {t('searchWidget.verifiedOperators')}
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <Wallet className="w-3.5 h-3.5 text-emerald-600" /> {t('searchWidget.zeroFees')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">{t('searchWidget.supportedLabel')}</span>
          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
            {t('searchWidget.supportedPayment')}
          </span>
        </div>
      </div>
    </div>
  );

  /** Home tab on mobile is a single, fixed-height app screen — no scrolling.
   *  Other tabs (tickets/support/about) keep normal page scroll. */
  const mobileHomeScreen = activeTab === 'home';

  return (
    <div
      className={`flex flex-col lg:min-h-0 ${mobileHomeScreen ? 'h-[100dvh] overflow-hidden lg:h-auto lg:overflow-visible' : 'min-h-screen'}`}
      style={{ background: has3DBackground && activeTab === 'home' ? 'transparent' : 'var(--surface-app)' }}
    >
      <DesktopNav
        userName={userName}
        userPhone={userPhone}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onBook={handleBook}
        onHowItWorksClick={goToHowItWorks}
        onTelebirrClick={goToTelebirr}
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
          {/* ============ MOBILE / TABLET — one fixed app screen, no scroll ============ */}
          <div className="lg:hidden relative flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Illustrated hero band — the same teal/amber scene as desktop, scaled for mobile.
                flex-1 so it absorbs whatever space is left after the card/trust row below,
                instead of a fixed height that could force the screen to scroll. */}
            <section className="relative overflow-hidden flex-1 min-h-0">
              <div
                className="absolute inset-0"
                style={{ backgroundImage: 'linear-gradient(180deg, #bfe3fa 0%, #e8f5fd 42%, #fdf1de 100%)' }}
              />
              <div
                className="absolute pointer-events-none"
                style={{ top: '6%', right: '10%', width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,210,135,0.85), rgba(255,210,135,0) 70%)', filter: 'blur(3px)' }}
              />
              <div className="absolute pointer-events-none" style={{ top: '10%', left: '8%', width: 90, height: 30, borderRadius: 999, background: 'rgba(255,255,255,0.8)', filter: 'blur(1.5px)' }} />
              <div
                className="absolute inset-x-0 bottom-[30%] pointer-events-none"
                style={{ height: '36%', backgroundColor: '#aecee3', clipPath: 'polygon(0% 100%, 0% 58%, 12% 30%, 24% 50%, 38% 16%, 52% 46%, 68% 20%, 82% 48%, 100% 28%, 100% 100%)' }}
              />
              <div
                className="absolute inset-x-0 bottom-[25%] pointer-events-none"
                style={{ height: '30%', backgroundColor: '#86b4d8', clipPath: 'polygon(0% 100%, 0% 64%, 15% 32%, 30% 56%, 48% 18%, 64% 52%, 80% 26%, 100% 50%, 100% 100%)' }}
              />
              <div className="absolute inset-x-0 bottom-0" style={{ height: '25%', backgroundColor: '#263650' }}>
                <div
                  className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
                  style={{ height: 4, backgroundImage: `repeating-linear-gradient(90deg, ${THEME.primary} 0 22px, transparent 22px 40px)` }}
                />
              </div>
              <HeroBusSilhouette scale={0.62} />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, rgba(14,116,144,0.28) 0%, rgba(2,132,199,0.35) 40%, rgba(248,250,252,0.95) 92%, #ffffff 100%), radial-gradient(circle at 75% 25%, rgba(254,240,138,0.25) 0%, transparent 40%), linear-gradient(90deg, rgba(12,74,110,0.6) 0%, rgba(12,74,110,0.15) 50%, rgba(15,23,42,0.4) 100%)',
                }}
              />
              <div className="relative h-full flex flex-col items-center justify-center text-center app-gutter-x">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-sky-100 font-bold text-[9px] uppercase tracking-wider mb-2.5 border border-white/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <Bus className="w-3 h-3" />
                  <span>{t('hero.eyebrow')}</span>
                </span>
                <h1
                  className="font-display font-bold text-white text-[24px] min-[400px]:text-[26px] leading-tight tracking-tight"
                  style={{ textShadow: '0 2px 16px rgba(0,0,0,0.35)' }}
                >
                  {userName ? t('hero.headlineNamed', { name: userName.split(' ')[0] }) : t('hero.headline')}
                </h1>
              </div>
            </section>

            <div className="relative z-10 app-gutter-x -mt-14 tilt-wrap shrink-0" ref={searchRef}>
              <div className="tilt-card glass-surface rounded-3xl overflow-hidden" style={{ boxShadow: 'var(--shadow-depth-lg)' }}>
                <div className="h-1.5" style={{ backgroundImage: `linear-gradient(90deg, #f9bb3f, ${THEME.primary})` }} />
                <div className="p-4 space-y-4">
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
                      className="w-9 h-9 rounded-full border-4 border-white flex items-center justify-center transition-transform duration-200 hover:rotate-180"
                      style={{ backgroundImage: `linear-gradient(145deg, #f9bb3f, ${THEME.primaryHover})`, color: '#241100', boxShadow: '0 6px 16px -4px rgba(242,168,28,0.5)' }}
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

            {/* Trust row — the only thing below the card on this fixed, non-scrolling
                screen. Recent/popular route suggestions stay desktop-only (below); on
                mobile the From/To fields already cover that job without needing scroll. */}
            <div className="app-gutter-x grid grid-cols-3 gap-2 pt-3 shrink-0" style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}>
              <TrustPill icon={ShieldCheck} text={t('hero.trustSecure')} />
              <TrustPill icon={Ticket} text={t('hero.trustTicket')} />
              <TrustPill icon={Clock} text={t('hero.trustSupport')} />
            </div>
          </div>

          {/* ============ DESKTOP / WEB ============ */}
          <div className="hidden lg:block font-web">
            {/* Hero band — an illustrated sky/road scene (no stock photo dependency) with the eyebrow badge + headline over it */}
            <section className="relative overflow-hidden" style={{ height: 'clamp(540px, 58vw, 680px)' }}>
              <div
                className="absolute inset-0"
                style={{ backgroundImage: 'linear-gradient(180deg, #bfe3fa 0%, #e8f5fd 42%, #fdf1de 100%)' }}
              />
              <div
                className="absolute pointer-events-none"
                style={{ top: '7%', right: '14%', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,210,135,0.85), rgba(255,210,135,0) 70%)', filter: 'blur(4px)' }}
              />
              <div className="absolute pointer-events-none" style={{ top: '13%', left: '9%', width: 150, height: 48, borderRadius: 999, background: 'rgba(255,255,255,0.8)', filter: 'blur(2px)' }} />
              <div className="absolute pointer-events-none" style={{ top: '21%', left: '22%', width: 96, height: 34, borderRadius: 999, background: 'rgba(255,255,255,0.65)', filter: 'blur(2px)' }} />
              <div
                className="absolute inset-x-0 bottom-[30%] pointer-events-none"
                style={{ height: '36%', backgroundColor: '#aecee3', clipPath: 'polygon(0% 100%, 0% 58%, 12% 30%, 24% 50%, 38% 16%, 52% 46%, 68% 20%, 82% 48%, 100% 28%, 100% 100%)' }}
              />
              <div
                className="absolute inset-x-0 bottom-[25%] pointer-events-none"
                style={{ height: '30%', backgroundColor: '#86b4d8', clipPath: 'polygon(0% 100%, 0% 64%, 15% 32%, 30% 56%, 48% 18%, 64% 52%, 80% 26%, 100% 50%, 100% 100%)' }}
              />
              <div className="absolute inset-x-0 bottom-0" style={{ height: '25%', backgroundColor: '#263650' }}>
                <div
                  className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
                  style={{ height: 5, backgroundImage: `repeating-linear-gradient(90deg, ${THEME.primary} 0 34px, transparent 34px 62px)` }}
                />
              </div>
              <HeroBusSilhouette />
              {/* Teal/amber color-grade matching the approved mockup's .hero-ethiopia-bg recipe,
                  layered over the illustrated scene instead of a hotlinked stock photo. */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, rgba(14,116,144,0.28) 0%, rgba(2,132,199,0.35) 40%, rgba(248,250,252,0.95) 92%, #ffffff 100%), radial-gradient(circle at 75% 30%, rgba(254,240,138,0.25) 0%, transparent 40%), linear-gradient(90deg, rgba(12,74,110,0.6) 0%, rgba(12,74,110,0.15) 50%, rgba(15,23,42,0.4) 100%)',
                }}
              />
              <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
                <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-sky-100 font-bold text-xs uppercase tracking-wider mb-6 border border-white/25">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <Bus className="w-3.5 h-3.5" />
                  <span>{t('hero.eyebrow')}</span>
                </span>
                <h1
                  className="font-display font-bold text-white"
                  style={{ fontSize: 'clamp(34px, 4.6vw, 54px)', letterSpacing: '-0.02em', lineHeight: 1.12, textShadow: '0 2px 20px rgba(0,0,0,0.35)' }}
                >
                  {userName ? t('hero.headlineNamed', { name: userName.split(' ')[0] }) : t('hero.headline')}
                </h1>
                <p className="mt-4 text-base sm:text-lg text-sky-100 max-w-2xl mx-auto font-normal leading-relaxed">
                  {t('hero.subcopy')}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-sky-100">
                  <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {t('hero.trustVerifiedOperators')}</span>
                  <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {t('hero.trustGuaranteedSeat')}</span>
                  <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {t('hero.trustInstantTicket')}</span>
                </div>
              </div>
            </section>

            {/* Search — floating card overlapping the hero photo's bottom edge */}
            <section className="relative z-[5] px-6" style={{ marginTop: '-52px' }} ref={searchRef}>
              <div className="page-container-web tilt-wrap">{bookingBar}</div>
            </section>
            <div className="h-14" aria-hidden="true" />

            {/* How it works */}
            <section className="py-20 bg-white relative" ref={howItWorksRef}>
              <div className="page-container-web px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <span className="text-sky-600 font-bold text-xs uppercase tracking-wider px-3 py-1 bg-sky-50 rounded-full border border-sky-100">
                    {t('howItWorks.eyebrow')}
                  </span>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">{t('howItWorks.title')}</h2>
                  <p className="mt-2.5 text-slate-500 text-base">{t('howItWorks.subtitle')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {steps.map((step) => (
                    <Fragment key={step.n}>
                      <DesktopStep step={step} />
                    </Fragment>
                  ))}
                </div>
              </div>
            </section>

            {/* Popular routes — real origin/destination pairs from the API only */}
            <section className="py-20 bg-slate-50 border-t border-slate-100" ref={routesRef}>
              <div className="page-container-web px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                  <div>
                    <span className="text-sky-600 font-bold text-xs tracking-wider uppercase bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                      {t('routes.eyebrow')}
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{t('routes.title')}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t('routes.subtitle')}</p>
                  </div>
                </div>
                {popularRoutes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className="bg-white rounded-3xl"
                    style={{ boxShadow: 'var(--shadow-depth-sm)' }}
                  />
                )}
              </div>
            </section>

            {/* Telebirr trust CTA — real product copy; fabricated vanity stats (passenger counts,
                star ratings, "N partner fleets") from the mockup are deliberately omitted. */}
            <section className="py-16 bg-white border-t border-slate-100" ref={telebirrRef}>
              <div className="page-container-web px-6">
                <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-8 lg:p-12 text-white shadow-xl relative overflow-hidden border border-slate-800">
                  <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                    <div className="lg:col-span-8">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-amber-400 text-xs font-bold mb-4 uppercase tracking-wider border border-white/10 backdrop-blur-md">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {t('telebirrSection.badge')}
                      </div>
                      <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                        {t('telebirrSection.title')}
                      </h2>
                      <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                        {t('telebirrSection.body')}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10"><Zap className="w-3.5 h-3.5 text-amber-400" /> {t('telebirrSection.chipInstant')}</span>
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10"><RotateCcw className="w-3.5 h-3.5 text-emerald-400" /> {t('telebirrSection.chipRefund')}</span>
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10"><Headphones className="w-3.5 h-3.5 text-sky-400" /> {t('telebirrSection.chipSupport')}</span>
                      </div>
                    </div>
                    <div className="lg:col-span-4 flex justify-start lg:justify-end w-full">
                      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 w-full max-w-sm shadow-inner space-y-3">
                        <div className="flex items-center gap-2.5 text-sm text-slate-100">
                          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" /> {t('telebirrSection.trustSecure')}
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-slate-100">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> {t('telebirrSection.trustLicensed')}
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-slate-100">
                          <Ticket className="w-4 h-4 text-amber-400 shrink-0" /> {t('telebirrSection.trustDigital')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <footer className="bg-slate-900 text-slate-400 text-sm pt-16 pb-12 border-t border-slate-800">
              <div className="page-container-web px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-xl">
                        <Bus className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-black text-white">{BRAND.name}</span>
                    </div>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mb-6">
                      {t('footer.blurb')}
                    </p>
                  </div>

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
                  <div>
                    <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
                      {t('support.title')}
                    </h4>
                    <ul className="space-y-2 text-xs">
                      <li>
                        <a href={`tel:${BRAND.phone}`} className="text-white font-bold block text-sm hover:text-sky-400 transition-colors">
                          {BRAND.phone}
                        </a>
                      </li>
                      <li className="pt-2">
                        <button type="button" onClick={() => handleTabChange('support')} className="hover:text-white transition-colors text-left">
                          {t('desktopNav.helpCenter')}
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
                  <p>© {year} {BRAND.name}. {t('footer.paymentBadge')}. {t('footer.rights')}</p>
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
    <div className="glass-surface rounded-2xl px-2 py-2.5 flex flex-col items-center gap-1.5 text-center" style={{ boxShadow: 'var(--shadow-depth-sm)' }}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundImage: `linear-gradient(145deg, ${THEME.brandSoft}, #dceefb)`, color: THEME.brandDeep }}>
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
      <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">{t(titleKey)}</h4>
      <ul className="space-y-2 text-xs">
        {links.map((link) => (
          <li key={link.labelKey}>
            <button type="button" onClick={link.onClick} className="hover:text-white transition-colors text-left">
              {t(link.labelKey)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A real origin → destination pair, presented as a bookable journey, not a generic feature card. */
/** Shows only the real origin/destination pair from the API — no invented
 *  operator names, departure counts, durations, or prices. */
function RouteCard({ route, onClick }: { route: RoutePair; onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-lg hover:border-sky-500 transition-all duration-300 group flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 align-middle" />
            {t('routes.multipleDepartures')}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors flex items-center gap-2 flex-wrap">
          <span className="truncate">{route.from}</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{route.to}</span>
        </h3>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
        <button
          type="button"
          onClick={onClick}
          className="px-4 py-2 bg-slate-100 group-hover:bg-amber-500 group-hover:text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm"
        >
          {t('routes.viewBuses')}
        </button>
      </div>
    </div>
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

/** Desktop "how it works" — icon circle with an overlapping step-number badge, matching the reference design. */
function DesktopStep({
  step,
}: {
  step: { n: number; icon: typeof Search; titleKey: string; descKey: string; bg: string; text: string };
}) {
  const { t } = useTranslation();
  const Icon = step.icon;
  return (
    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/70 hover:shadow-lg transition-all duration-300 relative group flex flex-col items-center text-center">
      <div className={`w-14 h-14 rounded-2xl ${step.bg} ${step.text} group-hover:text-white flex items-center justify-center text-xl mb-4 transition-all shadow-sm`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs mb-2">
        {t('common.stepN', { n: step.n })}
      </span>
      <h3 className="text-lg font-bold text-slate-900 mb-1.5">{t(step.titleKey)}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{t(step.descKey)}</p>
    </div>
  );
}

/** A flat, iconographic bus silhouette sitting on the hero's illustrated road —
 *  built from plain divs so the hero has no stock-photo/asset dependency. */
function HeroBusSilhouette({ scale = 1 }: { scale?: number }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ right: '8%', bottom: '13%', width: 230, height: 92, transform: `scale(${scale})`, transformOrigin: 'bottom right' }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-x-0 bottom-0 rounded-[16px]"
        style={{ top: 14, backgroundColor: THEME.brand, boxShadow: '0 18px 34px -10px rgba(12,108,166,0.5)' }}
      />
      <div className="absolute left-2 right-2 top-0 rounded-t-[14px]" style={{ height: 18, backgroundColor: THEME.brandDeep }} />
      <div className="absolute left-3 right-3 rounded-[8px] flex gap-[5px] px-[5px]" style={{ top: 24, height: 24, backgroundColor: '#eaf6ff' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-1" style={i ? { borderLeft: '2px solid rgba(12,108,166,0.3)' } : undefined} />
        ))}
      </div>
      <div className="absolute left-3 right-3 rounded-full" style={{ top: 54, height: 5, backgroundColor: THEME.primary }} />
      <div
        className="absolute rounded-full"
        style={{ width: 24, height: 24, left: 20, bottom: -9, backgroundColor: '#1b2434', boxShadow: '0 0 0 4px #4b5566 inset' }}
      />
      <div
        className="absolute rounded-full"
        style={{ width: 24, height: 24, right: 20, bottom: -9, backgroundColor: '#1b2434', boxShadow: '0 0 0 4px #4b5566 inset' }}
      />
    </div>
  );
}
