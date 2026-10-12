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
  /** Compact brand bar only — no greeting/title line below it. */
  minimal?: boolean;
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
}: {
  userName?: string;
  userPhone?: string;
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
        <p className="text-[10px] text-white/70 font-medium uppercase tracking-wide max-[380px]:hidden">
          {t('common.selam')}
        </p>
        {userName && (
          <p className="text-[11px] min-[375px]:text-xs font-semibold text-white truncate">{userName}</p>
        )}
        {userPhone && (
          <p className="text-[10px] text-white/75 tnum truncate max-[400px]:hidden">{userPhone}</p>
        )}
      </div>
      <div
        className="w-9 h-9 min-[375px]:w-10 min-[375px]:h-10 rounded-full bg-white flex items-center justify-center shrink-0 font-display font-bold text-xs min-[375px]:text-sm"
        style={{ color: THEME.brand, boxShadow: '0 4px 14px rgba(16,39,71,0.22)' }}
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
  minimal = false,
}: Props) {
  const { t } = useTranslation();

  /** Back-navigation screens (booking flow) get a compact nav bar — the
      BookingSteps stepper right below already carries the step context,
      so a full hero-height header with a duplicate title is just weight. */
  if (showBack) {
    return (
      <header
        className="lg:hidden relative app-gutter-x py-3 overflow-hidden"
        style={{ backgroundImage: `linear-gradient(135deg, ${THEME.brandDeep}, ${THEME.brand})`, boxShadow: '0 8px 24px -8px rgba(16,39,71,0.3)' }}
      >
        <div className="relative flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0"
            aria-label={t('desktopNav.back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 min-w-0 truncate font-display text-[16px] min-[375px]:text-[17px] font-bold text-white">
            {title}
          </h1>
        </div>
      </header>
    );
  }

  /** Home-tab bar: a compact, neutral brand strip — the illustrated hero
   *  band rendered below it now carries the greeting/headline and color. */
  if (minimal) {
    const isLoggedIn = Boolean(userName || userPhone);
    const initials = getInitials(userName);
    return (
      <header className="lg:hidden relative app-gutter-x py-3 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between gap-2 min-[375px]:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
              <Bus className="w-4 h-4 text-sky-600" />
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-[14px] leading-tight flex items-center gap-1.5" style={{ color: THEME.textPrimary }}>
                {BRAND.name}
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              </p>
              <span className="inline-flex items-center px-1 py-0.5 rounded bg-amber-50 border border-amber-200/60 text-[8px] font-bold text-amber-700 leading-none">
                telebirr
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSelector />
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-[11px] shrink-0"
              style={
                isLoggedIn
                  ? { backgroundImage: `linear-gradient(145deg, ${THEME.brandMid}, ${THEME.brandDeep})`, color: THEME.white }
                  : { backgroundColor: THEME.surfaceMuted, color: THEME.textMuted }
              }
              aria-label={userName ? t('common.profileNamed', { name: userName }) : t('common.profile')}
            >
              {initials || <User className="w-3.5 h-3.5" />}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className="lg:hidden relative app-gutter-x pt-4 min-[375px]:pt-5 pb-8 min-[375px]:pb-10 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, ${THEME.brandDeep} 0%, ${THEME.brand} 60%, ${THEME.brandMid ?? THEME.brand} 100%)`,
        boxShadow: '0 12px 32px -10px rgba(16,39,71,0.32)',
      }}
    >
      <div className="float-blob" style={{ position: 'absolute', top: -50, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.18), rgba(255,255,255,0) 70%)' }} />
      <div className="relative flex items-center justify-between gap-2 min-[375px]:gap-3 mb-3 min-[375px]:mb-4">
        <div className="flex items-center gap-2 min-[375px]:gap-3 min-w-0 flex-1">
          <div
            className="w-10 h-10 min-[375px]:w-11 min-[375px]:h-11 rounded-xl bg-white flex items-center justify-center shrink-0"
            style={{ boxShadow: '0 6px 16px rgba(16,39,71,0.25)' }}
          >
            <Bus className="w-5 h-5 min-[375px]:w-6 min-[375px]:h-6" style={{ color: THEME.brand }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 min-[375px]:gap-2 flex-wrap">
              <span className="font-display font-bold text-base min-[375px]:text-lg" style={{ color: THEME.primary }}>
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
          <ProfileChip userName={userName} userPhone={userPhone} />
        </div>
      </div>

      <h1 className="relative font-display text-lg min-[375px]:text-xl min-[400px]:text-[22px] font-bold text-white leading-snug tracking-tight">
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
