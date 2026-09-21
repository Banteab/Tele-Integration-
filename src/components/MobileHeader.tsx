import { ArrowLeft, Bus, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BRAND, THEME } from '../config/theme';
import LanguageSelector from './LanguageSelector';

interface Props {
  title?: string;
  subtitle?: string;
  userName?: string;
  userPhone?: string;
  onBack?: () => void;
  showBack?: boolean;
}

function getInitials(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function ProfileChip({
  userName,
  userPhone,
  compact,
}: {
  userName?: string;
  userPhone?: string;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const isLoggedIn = Boolean(userName || userPhone);
  const initials = getInitials(userName);

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-1.5 min-[375px]:gap-2 shrink-0">
        <div className="text-right max-[360px]:hidden">
          <p className="text-[11px] text-white/75 font-medium">{t('common.guest')}</p>
          <p className="text-[10px] text-white/55">{t('common.viaTelebirr')}</p>
        </div>
        <div className="w-9 h-9 min-[375px]:w-10 min-[375px]:h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/25">
          <User className="w-4 h-4 min-[375px]:w-5 min-[375px]:h-5 text-white/90" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 min-[375px]:gap-2 shrink-0 max-w-[42%] min-[400px]:max-w-[46%]">
      <div className="text-right min-w-0">
        {!compact && (
          <p className="text-[10px] text-white/70 font-medium uppercase tracking-wide max-[380px]:hidden">
            {t('common.selam')}
          </p>
        )}
        {userName && (
          <p className="text-[11px] min-[375px]:text-xs font-semibold text-white truncate">{userName}</p>
        )}
        {userPhone && !compact && (
          <p className="text-[10px] text-white/75 tnum truncate max-[400px]:hidden">{userPhone}</p>
        )}
      </div>
      <div
        className="w-9 h-9 min-[375px]:w-10 min-[375px]:h-10 rounded-full bg-white flex items-center justify-center shadow-md shrink-0 font-bold text-xs min-[375px]:text-sm"
        style={{ color: THEME.brand }}
        aria-label={userName ? t('common.profileNamed', { name: userName }) : t('common.profile')}
      >
        {initials || <User className="w-5 h-5" />}
      </div>
    </div>
  );
}

export default function MobileHeader({
  title,
  subtitle,
  userName,
  userPhone,
  onBack,
  showBack = false,
}: Props) {
  const { t } = useTranslation();

  return (
    <header
      className="lg:hidden relative overflow-hidden app-gutter-x pt-4 min-[375px]:pt-5 pb-8 min-[375px]:pb-10"
      style={{
        background: `linear-gradient(160deg, ${THEME.brand} 0%, ${THEME.brandLight} 55%, ${THEME.brandDeep} 100%)`,
      }}
    >
      <div
        className="absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-25"
        style={{ backgroundColor: '#fff' }}
      />
      <div
        className="absolute right-8 top-20 w-28 h-28 rounded-full opacity-10"
        style={{ backgroundColor: '#fff' }}
      />

      <div className="relative flex items-center justify-between gap-2 min-[375px]:gap-3 mb-3 min-[375px]:mb-4">
        <div className="flex items-center gap-2 min-[375px]:gap-3 min-w-0 flex-1">
          {showBack ? (
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 min-[375px]:w-10 min-[375px]:h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10 h-10 min-[375px]:w-11 min-[375px]:h-11 rounded-full bg-white flex items-center justify-center shadow-md shrink-0">
              <Bus className="w-5 h-5 min-[375px]:w-6 min-[375px]:h-6" style={{ color: THEME.brand }} />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 min-[375px]:gap-2 flex-wrap">
              <span className="font-extrabold text-base min-[375px]:text-lg" style={{ color: THEME.primary }}>
                {BRAND.name}
              </span>
              <span className="am text-white/95 text-xs min-[375px]:text-sm font-semibold max-[340px]:hidden">
                {BRAND.nameAm}
              </span>
            </div>
            <p className="text-[10px] text-white/75 tracking-wide max-[360px]:hidden">{BRAND.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 min-[375px]:gap-2 shrink-0">
          <LanguageSelector variant="header" />
          <ProfileChip userName={userName} userPhone={userPhone} compact={showBack} />
        </div>
      </div>

      <h1 className="relative text-lg min-[375px]:text-xl min-[400px]:text-[22px] font-bold text-white leading-snug tracking-tight">
        {title ||
          (userName
            ? t('header.greetingNamed', { name: userName.split(' ')[0] })
            : t('header.greeting'))}
      </h1>
      {subtitle && (
        <p className="relative text-white/80 text-sm mt-1">{subtitle}</p>
      )}
    </header>
  );
}
