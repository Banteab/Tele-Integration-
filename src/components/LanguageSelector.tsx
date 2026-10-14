import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, resolveLanguageCode } from '../config/languages';

interface Props {
  variant?: 'header' | 'default';
  /** Hides the globe glyph — for compact bars where plain text reads cleaner. */
  hideIcon?: boolean;
}

export default function LanguageSelector({ variant = 'default', hideIcon = false }: Props) {
  const { t, i18n } = useTranslation();
  const current = resolveLanguageCode(i18n.language);
  const currentLang = LANGUAGES.find((lang) => lang.code === current) ?? LANGUAGES[0];
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const isHeader = variant === 'header';

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const choose = (code: string) => {
    void i18n.changeLanguage(code);
    setOpen(false);
  };

  const menu = open && (
    <ul
      role="listbox"
      aria-label={t('common.selectLanguage')}
      className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[11rem] rounded-xl bg-white py-1 shadow-lg"
      style={{ border: '1px solid var(--border)' }}
    >
      {LANGUAGES.map((lang) => {
        const selected = lang.code === current;
        return (
          <li key={lang.code} role="option" aria-selected={selected}>
            <button
              type="button"
              onClick={() => choose(lang.code)}
              className="w-full text-left px-3 py-2.5 text-sm font-medium"
              style={{
                color: selected ? 'var(--blue-700)' : 'var(--text-primary)',
                backgroundColor: selected ? 'var(--blue-50)' : 'transparent',
              }}
            >
              {lang.label}
            </button>
          </li>
        );
      })}
    </ul>
  );

  if (!isHeader) {
    return (
      <div ref={rootRef} className="relative z-30 shrink-0">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={t('common.selectLanguage')}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={`inline-flex items-center gap-1 shrink-0 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] ${hideIcon ? 'text-[13px]' : 'px-2 text-sm'}`}
        >
          {!hideIcon && <Globe className="w-3.5 h-3.5 text-current" aria-hidden />}
          <span className="truncate max-w-[5.25rem] min-[375px]:max-w-[6rem]">{hideIcon ? currentLang.shortLabel : currentLang.label}</span>
          <ChevronDown className={`w-3 h-3 shrink-0 text-current transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
        {menu}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative z-30 shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t('common.selectLanguage')}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/30 px-2 py-1 text-[11px] font-semibold text-white"
      >
        <Globe className="w-3.5 h-3.5 text-white/90 shrink-0" aria-hidden />
        <span>{currentLang.shortLabel}</span>
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {menu}
    </div>
  );
}
