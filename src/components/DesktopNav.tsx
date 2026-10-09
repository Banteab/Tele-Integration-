import { Bus, User, ArrowLeft, Ticket, Phone, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BRAND, THEME } from '../config/theme';
import LanguageSelector from './LanguageSelector';
import type { HomeTab } from './BottomNav';

interface Props {
  userName?: string;
  userPhone?: string;
  /** Home-tab navigation — omit when rendering the booking-flow bar. */
  activeTab?: HomeTab;
  onTabChange?: (tab: HomeTab) => void;
  onBook?: () => void;
  /** Scrolls to the popular-routes section on the home tab. */
  onRoutesClick?: () => void;
  /** Scrolls to the How It Works section on the home tab. */
  onHowItWorksClick?: () => void;
  /** Scrolls to the telebirr trust section on the home tab. */
  onTelebirrClick?: () => void;
  /** Booking-flow context — when set, shows a back button + step title instead of tabs. */
  flowTitle?: string;
  onBack?: () => void;
  onBrandClick?: () => void;
}

function getInitials(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/**
 * Professional top navigation for the desktop/web experience. Mirrors the
 * mobile MobileHeader + BottomNav in purpose but is composed for a mouse
 * and keyboard, wide-viewport audience — hidden below the lg breakpoint.
 */
export default function DesktopNav({
  userName,
  userPhone,
  activeTab,
  onTabChange,
  onBook,
  onRoutesClick,
  onHowItWorksClick,
  onTelebirrClick,
  flowTitle,
  onBack,
  onBrandClick,
}: Props) {
  const { t } = useTranslation();
  const isLoggedIn = Boolean(userName || userPhone);
  const initials = getInitials(userName);

  /** Home / Routes / How it Works / Terminals / telebirr Pay, plus My Booking
   *  kept so ticket history stays reachable. "Terminals" has no dedicated
   *  content yet, so it opens the About page as the closest real destination. */
  const navItems: { id: string; labelKey: string; tab?: HomeTab; onClick?: () => void }[] = [
    { id: 'home', labelKey: 'desktopNav.home', tab: 'home' },
    { id: 'routes', labelKey: 'desktopNav.routes', onClick: onRoutesClick },
    { id: 'how-it-works', labelKey: 'desktopNav.howItWorksNav', onClick: onHowItWorksClick },
    { id: 'terminals', labelKey: 'desktopNav.terminals', tab: 'about' },
    { id: 'telebirr', labelKey: 'desktopNav.telebirrPay', onClick: onTelebirrClick },
    { id: 'tickets', labelKey: 'desktopNav.myBooking', tab: 'tickets' },
  ];

  return (
    <header className="font-web hidden lg:block sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
      <div className="page-container-web flex items-center justify-between gap-6 px-6 h-20">
        <button
          type="button"
          onClick={onBrandClick}
          className="flex items-center gap-3 shrink-0 rounded-lg group"
        >
          <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
            <Bus className="w-[18px] h-[18px] text-sky-600" />
          </div>
          <div className="text-left">
            <p className="font-display font-bold text-[17px] leading-tight tracking-tight flex items-center gap-1.5" style={{ color: THEME.textPrimary }}>
              {BRAND.name}
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {t('common.poweredBy', { defaultValue: 'Powered by' })}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200/60 text-[9px] font-bold text-amber-700 leading-none">
                telebirr
              </span>
            </div>
          </div>
        </button>

        {flowTitle ? (
          <div className="flex-1 flex items-center gap-3 min-w-0">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-9 h-9 rounded-full border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] shrink-0 transition-colors"
                aria-label={t('desktopNav.back')}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="font-display font-bold text-[var(--text-primary)] text-[15px] truncate">{flowTitle}</h1>
          </div>
        ) : (
          <nav className="flex-1 flex items-center justify-center gap-7">
            {navItems.map(({ id, labelKey, tab, onClick }) => {
              const isActive = tab ? activeTab === tab : false;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={tab ? () => onTabChange?.(tab) : onClick}
                  className="relative font-display py-[7px] text-[15px] transition-colors"
                  style={{
                    color: isActive ? THEME.brand : THEME.textSecondary,
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {t(labelKey)}
                  <span
                    className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full transition-opacity"
                    style={{ backgroundColor: THEME.brand, opacity: isActive ? 1 : 0 }}
                  />
                </button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/80 hover:bg-slate-200/80 px-3 py-2 rounded-xl border border-slate-200/70 transition-all">
            <LanguageSelector />
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>

          {isLoggedIn ? (
            <div className="hidden lg:flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0"
                style={{ backgroundImage: `linear-gradient(145deg, ${THEME.brandMid}, ${THEME.brandDeep})`, color: THEME.white, boxShadow: 'var(--shadow-glow-brand)' }}
                aria-label={t('common.profileNamed', { name: userName })}
              >
                {initials || <User className="w-4 h-4" />}
              </div>
              <div className="max-w-[9rem]">
                <p className="text-xs font-semibold text-slate-700 truncate">{userName}</p>
                {userPhone && <p className="text-[11px] text-slate-400 truncate tnum">{userPhone}</p>}
              </div>
            </div>
          ) : (
            <a
              href={`tel:${BRAND.phone}`}
              className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-600 px-2 py-1.5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <span>{BRAND.phone}</span>
            </a>
          )}

          {!flowTitle && (
            <button
              type="button"
              onClick={onBook}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 transform hover:-translate-y-0.5"
              style={{ boxShadow: '0 8px 20px -4px rgba(245,158,11,0.45)' }}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>{t('desktopNav.bookTicket')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
