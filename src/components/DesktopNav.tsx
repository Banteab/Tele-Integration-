import { Bus, User, ArrowLeft, TicketPlus } from 'lucide-react';
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
  flowTitle,
  onBack,
  onBrandClick,
}: Props) {
  const { t } = useTranslation();
  const isLoggedIn = Boolean(userName || userPhone);
  const initials = getInitials(userName);

  /** Desktop has room for fuller wording than the compact mobile tab bar. */
  const navItems: { id: string; labelKey: string; tab?: HomeTab; onClick?: () => void }[] = [
    { id: 'home', labelKey: 'desktopNav.home', tab: 'home' },
    { id: 'routes', labelKey: 'desktopNav.routes', onClick: onRoutesClick },
    { id: 'tickets', labelKey: 'desktopNav.myBooking', tab: 'tickets' },
    { id: 'about', labelKey: 'tabs.about', tab: 'about' },
    { id: 'support', labelKey: 'desktopNav.help', tab: 'support' },
  ];

  return (
    <header className="font-web hidden lg:block sticky top-0 z-40 bg-white/92 backdrop-blur border-b border-[var(--border)]">
      <div className="page-container-web flex items-center justify-between gap-6 px-6 h-16">
        <button
          type="button"
          onClick={onBrandClick}
          className="flex items-center gap-2.5 shrink-0 rounded-lg"
        >
          <div
            className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center"
            style={{ backgroundImage: `linear-gradient(145deg, ${THEME.brandMid}, ${THEME.brandDeep})`, boxShadow: 'var(--shadow-glow-brand)' }}
          >
            <Bus className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="font-display font-bold text-[15px] leading-tight tracking-tight" style={{ color: THEME.textPrimary }}>
              {BRAND.name}
            </p>
            <p className="text-[11px] leading-tight" style={{ color: THEME.webSoft }}>{BRAND.tagline}</p>
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
          <nav className="flex-1 flex items-center justify-center gap-1">
            {navItems.map(({ id, labelKey, tab, onClick }) => {
              const isActive = tab ? activeTab === tab : false;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={tab ? () => onTabChange?.(tab) : onClick}
                  className="relative font-display px-[13px] py-[7px] text-sm rounded-lg transition-all"
                  style={{
                    color: isActive ? THEME.brandDeep : THEME.webMuted,
                    backgroundColor: isActive ? THEME.brandSoft : 'transparent',
                    boxShadow: isActive ? '0 2px 8px -2px rgba(24,154,216,0.3)' : 'none',
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3 shrink-0">
          <LanguageSelector />

          {!flowTitle && (
            <button
              type="button"
              onClick={onBook}
              className="shine hidden xl:flex items-center gap-1.5 rounded-full font-display px-[18px] py-[9px] text-sm font-bold text-[#241100] transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundImage: `linear-gradient(135deg, #f9bb3f, ${THEME.primary} 55%, ${THEME.primaryHover})`, boxShadow: 'var(--shadow-glow-primary)' }}
            >
              <TicketPlus className="w-3.5 h-3.5" />
              {t('desktopNav.bookTrip')}
            </button>
          )}

          <div className="flex items-center gap-2 pl-3 border-l border-[var(--border)]">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0"
              style={
                isLoggedIn
                  ? { backgroundImage: `linear-gradient(145deg, ${THEME.brandMid}, ${THEME.brandDeep})`, color: THEME.white, boxShadow: 'var(--shadow-glow-brand)' }
                  : { backgroundColor: THEME.surfaceMuted, color: THEME.textMuted }
              }
              aria-label={userName ? t('common.profileNamed', { name: userName }) : t('common.profile')}
            >
              {initials || <User className="w-4 h-4" />}
            </div>
            {isLoggedIn && (
              <div className="hidden xl:block max-w-[9rem]">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{userName}</p>
                {userPhone && <p className="text-[11px] text-[var(--text-muted)] truncate tnum">{userPhone}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
