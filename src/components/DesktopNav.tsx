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
  flowTitle,
  onBack,
  onBrandClick,
}: Props) {
  const { t } = useTranslation();
  const isLoggedIn = Boolean(userName || userPhone);
  const initials = getInitials(userName);

  const tabs: { id: HomeTab; labelKey: string }[] = [
    { id: 'home', labelKey: 'tabs.home' },
    { id: 'tickets', labelKey: 'tabs.tickets' },
    { id: 'support', labelKey: 'tabs.support' },
    { id: 'about', labelKey: 'tabs.about' },
  ];

  return (
    <header className="hidden lg:block sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="page-container flex items-center justify-between gap-6 px-6 h-[72px]">
        <button
          type="button"
          onClick={onBrandClick}
          className="flex items-center gap-3 shrink-0 rounded-lg"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
            style={{ backgroundColor: THEME.primarySoft }}
          >
            <Bus className="w-5 h-5" style={{ color: THEME.brand }} />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-base leading-tight" style={{ color: THEME.brandDeep }}>
              {BRAND.name}
            </p>
            <p className="text-[11px] text-gray-400 leading-tight">{BRAND.tagline}</p>
          </div>
        </button>

        {flowTitle ? (
          <div className="flex-1 flex items-center gap-3 min-w-0">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 shrink-0 transition-colors"
                aria-label={t('desktopNav.back')}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="font-bold text-gray-900 text-[15px] truncate">{flowTitle}</h1>
          </div>
        ) : (
          <nav className="flex-1 flex items-center justify-center gap-1">
            {tabs.map(({ id, labelKey }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onTabChange?.(id)}
                  className="relative px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
                  style={{
                    color: isActive ? THEME.brand : '#6b7280',
                    backgroundColor: isActive ? THEME.primarySoft : 'transparent',
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
              className="hidden xl:flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-transform active:scale-[0.98]"
              style={{ backgroundColor: THEME.primary, boxShadow: THEME.shadowPrimary }}
            >
              <TicketPlus className="w-4 h-4" />
              {t('desktopNav.bookTrip')}
            </button>
          )}

          <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
              style={
                isLoggedIn
                  ? { backgroundColor: THEME.brand, color: '#fff' }
                  : { backgroundColor: '#f3f4f6', color: '#9CA3AF' }
              }
              aria-label={userName ? t('common.profileNamed', { name: userName }) : t('common.profile')}
            >
              {initials || <User className="w-4 h-4" />}
            </div>
            {isLoggedIn && (
              <div className="hidden xl:block max-w-[9rem]">
                <p className="text-xs font-semibold text-gray-900 truncate">{userName}</p>
                {userPhone && <p className="text-[11px] text-gray-400 truncate tnum">{userPhone}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
