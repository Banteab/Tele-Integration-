import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, resolveLanguageCode } from '../config/languages';

interface Props {
  variant?: 'header' | 'default';
}

export default function LanguageSelector({ variant = 'default' }: Props) {
  const { t, i18n } = useTranslation();
  const current = resolveLanguageCode(i18n.language);

  const isHeader = variant === 'header';

  return (
    <label
      className={`inline-flex items-center gap-1 shrink-0 ${
        isHeader
          ? 'rounded-full bg-white/15 border border-white/25 px-2 py-1'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2'
      }`}
    >
      <Globe
        className={`w-3.5 h-3.5 ${isHeader ? 'text-white/90' : 'text-current'}`}
        aria-hidden
      />
      <select
        value={current}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        aria-label={t('common.selectLanguage')}
        className={`bg-transparent border-none focus:ring-0 cursor-pointer outline-none font-medium max-w-[6.5rem] min-[400px]:max-w-[7.5rem] truncate ${
          isHeader
            ? 'text-[11px] min-[375px]:text-xs text-white'
            : 'text-sm'
        }`}
      >
        {LANGUAGES.map(({ code, label }) => (
          <option key={code} value={code} className="text-[var(--text-primary)]">
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
