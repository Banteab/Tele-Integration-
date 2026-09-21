import { Bus, Shield, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BRAND, THEME } from '../../config/theme';
import { PageContainer, ScreenCard } from '../ui/ScreenUI';

export default function AboutPanel() {
  const { t } = useTranslation();

  const features = [
    { icon: Bus, textKey: 'about.featureSearch' },
    { icon: Smartphone, textKey: 'about.featurePay' },
    { icon: Shield, textKey: 'about.featureSecure' },
  ];

  return (
    <PageContainer narrow className="app-gutter-x pb-28 lg:pb-16 lg:pt-10 space-y-3 lg:space-y-6 -mt-2 lg:mt-0">
      <ScreenCard className="text-center space-y-3 lg:p-10">
        <div
          className="w-14 h-14 lg:w-16 lg:h-16 rounded-full mx-auto flex items-center justify-center"
          style={{ backgroundColor: THEME.primarySoft }}
        >
          <Bus className="w-7 h-7 lg:w-8 lg:h-8" style={{ color: THEME.brand }} />
        </div>
        <div>
          <h2 className="text-lg lg:text-2xl font-bold text-[var(--text-primary)]">{BRAND.name}</h2>
          <p className="am text-sm font-semibold text-[var(--text-muted)]">{BRAND.nameAm}</p>
        </div>
        <p className="text-sm lg:text-base text-[var(--text-secondary)] leading-relaxed lg:max-w-lg lg:mx-auto">
          {t('about.description')}
        </p>
      </ScreenCard>

      <ScreenCard className="space-y-3 lg:p-8">
        <h3 className="text-sm lg:text-base font-bold text-[var(--text-primary)] lg:mb-2">{t('about.whatYouCanDo')}</h3>
        <div className="lg:grid lg:grid-cols-3 lg:gap-4 space-y-3 lg:space-y-0">
          {features.map(({ icon: Icon, textKey }) => (
            <div key={textKey} className="flex items-center gap-3 lg:flex-col lg:text-center lg:items-center lg:gap-3 lg:p-2">
              <div
                className="w-9 h-9 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${THEME.brand}14`, color: THEME.brand }}
              >
                <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{t(textKey)}</p>
            </div>
          ))}
        </div>
      </ScreenCard>

      <p className="text-center text-[11px] text-[var(--text-muted)] pt-2">{BRAND.tagline}</p>
    </PageContainer>
  );
}
