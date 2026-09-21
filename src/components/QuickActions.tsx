import { TicketPlus, TicketCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { THEME } from '../config/theme';

interface Props {
  onBook?: () => void;
  onManage?: () => void;
}

export default function QuickActions({ onBook, onManage }: Props) {
  const { t } = useTranslation();

  const actions = [
    {
      titleKey: 'quickActions.bookTitle',
      subtitleKey: 'quickActions.bookSubtitle',
      icon: TicketPlus,
      highlighted: true,
      onClick: onBook,
    },
    {
      titleKey: 'quickActions.manageTitle',
      subtitleKey: 'quickActions.manageSubtitle',
      icon: TicketCheck,
      highlighted: false,
      onClick: onManage,
    },
  ];

  return (
    <section className="app-gutter-x pb-28">
      <h2 className="text-sm min-[375px]:text-base font-bold text-[var(--text-primary)] mb-3">
        {t('quickActions.title')}
      </h2>
      <div className="grid grid-cols-2 gap-2 min-[375px]:gap-3">
        {actions.map(({ titleKey, subtitleKey, icon: Icon, highlighted, onClick }) => (
          <button
            key={titleKey}
            type="button"
            onClick={onClick}
            className={`rounded-2xl p-3 min-[375px]:p-4 text-left transition-all duration-150 active:scale-[0.98] ${
              highlighted ? 'border-2' : 'bg-white border hover:border-[var(--border-strong)]'
            }`}
            style={
              highlighted
                ? { backgroundColor: THEME.primarySoft, borderColor: THEME.primaryBorder }
                : { borderColor: 'var(--border)', boxShadow: THEME.shadowSm }
            }
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{
                backgroundColor: highlighted ? THEME.primaryBorder : THEME.brandSoft,
                color: highlighted ? THEME.primaryPressed : THEME.brandDeep,
              }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-semibold text-sm text-[var(--text-primary)]">{t(titleKey)}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{t(subtitleKey)}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
