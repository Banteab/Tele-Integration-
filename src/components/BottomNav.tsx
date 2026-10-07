import { Home, Ticket, Headset, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { THEME } from '../config/theme';

export type HomeTab = 'home' | 'tickets' | 'support' | 'about';

interface Props {
  active?: HomeTab;
  onTabChange: (tab: HomeTab) => void;
}

/** Clean, flat 4-tab bar — no floating action button. */
export default function BottomNav({ active = 'home', onTabChange }: Props) {
  const { t } = useTranslation();

  const items: { id: HomeTab; labelKey: string; icon: typeof Home }[] = [
    { id: 'home', labelKey: 'tabs.home', icon: Home },
    { id: 'tickets', labelKey: 'tabs.tickets', icon: Ticket },
    { id: 'support', labelKey: 'tabs.support', icon: Headset },
    { id: 'about', labelKey: 'tabs.about', icon: Info },
  ];

  return (
    <nav
      className="lg:hidden app-fixed-shell bottom-0 z-50 pb-safe"
      style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(var(--glass-blur))', WebkitBackdropFilter: 'blur(var(--glass-blur))', borderTop: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 -8px 24px rgba(16,39,71,0.1)' }}
    >
      <div className="grid grid-cols-4 gap-0.5 min-[375px]:gap-1 app-gutter-x py-2.5">
        {items.map(({ id, labelKey, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className="flex flex-col items-center gap-1 py-1"
            >
              <Icon
                className="w-5 h-5"
                style={{ color: isActive ? THEME.primaryPressed : THEME.textMuted }}
              />
              <span
                className="font-display text-[10px] font-bold"
                style={{ color: isActive ? THEME.primaryPressed : THEME.textMuted }}
              >
                {t(labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
