import { Bus, Home, Ticket, Headset, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { THEME } from '../config/theme';

export type HomeTab = 'home' | 'tickets' | 'support' | 'about';

interface Props {
  active?: HomeTab;
  onTabChange: (tab: HomeTab) => void;
  onBook?: () => void;
}

export default function BottomNav({
  active = 'home',
  onTabChange,
  onBook,
}: Props) {
  const { t } = useTranslation();

  const items: { id: HomeTab; labelKey: string; icon: typeof Home }[] = [
    { id: 'home', labelKey: 'tabs.home', icon: Home },
    { id: 'tickets', labelKey: 'tabs.tickets', icon: Ticket },
    { id: 'support', labelKey: 'tabs.support', icon: Headset },
    { id: 'about', labelKey: 'tabs.about', icon: Info },
  ];

  const handleBook = () => {
    onTabChange('home');
    onBook?.();
  };

  return (
    <nav className="lg:hidden app-fixed-shell bottom-0 z-50 bg-white border-t border-gray-100 pb-safe">
      <div className="relative app-gutter-x pt-2 pb-3">
        <button
          type="button"
          onClick={handleBook}
          className="absolute left-1/2 -translate-x-1/2 -top-6 min-[375px]:-top-7 w-12 h-12 min-[375px]:w-14 min-[375px]:h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{
            backgroundColor: THEME.brand,
            boxShadow: `0 8px 24px ${THEME.brand}55`,
          }}
          aria-label={t('tabs.bookBus')}
        >
          <Bus className="w-6 h-6 min-[375px]:w-7 min-[375px]:h-7 text-white" />
        </button>

        <div className="grid grid-cols-4 gap-0.5 min-[375px]:gap-1 pt-3 min-[375px]:pt-4">
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
                  style={{ color: isActive ? THEME.primary : '#9CA3AF' }}
                />
                <span
                  className="text-[10px] font-medium"
                  style={{ color: isActive ? THEME.primary : '#9CA3AF' }}
                >
                  {t(labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
