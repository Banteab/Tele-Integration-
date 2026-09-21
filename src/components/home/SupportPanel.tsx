import { Headset, Phone, Clock, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BRAND, THEME } from '../../config/theme';
import { PageContainer, PrimaryButton, ScreenCard } from '../ui/ScreenUI';

export default function SupportPanel() {
  const { t } = useTranslation();

  const callSupport = () => {
    window.location.href = `tel:${BRAND.phone}`;
  };

  const infoRows = [
    { icon: Phone, labelKey: 'support.hotline', value: BRAND.phone },
    { icon: Clock, labelKey: 'support.hours', valueKey: 'support.hoursValue' },
    { icon: MessageCircle, labelKey: 'support.forLabel', valueKey: 'support.forValue' },
  ];

  return (
    <PageContainer narrow className="app-gutter-x pb-28 lg:pb-16 lg:pt-10 space-y-3 lg:space-y-6 -mt-2 lg:mt-0">
      <ScreenCard className="text-center space-y-3 lg:p-10">
        <div
          className="w-14 h-14 lg:w-16 lg:h-16 rounded-full mx-auto flex items-center justify-center"
          style={{ backgroundColor: THEME.brandSoft }}
        >
          <Headset className="w-7 h-7 lg:w-8 lg:h-8" style={{ color: THEME.brandDeep }} />
        </div>
        <h2 className="text-lg lg:text-2xl font-bold text-[var(--text-primary)]">{t('support.title')}</h2>
        <p className="text-sm lg:text-base text-[var(--text-secondary)] lg:max-w-md lg:mx-auto">{t('support.description')}</p>
      </ScreenCard>

      <ScreenCard className="lg:p-8">
        <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
          {infoRows.map(({ icon: Icon, labelKey, value, valueKey }) => (
            <div key={labelKey} className="flex items-start gap-3 lg:flex-col lg:items-center lg:text-center">
              <Icon className="w-4 h-4 lg:w-6 lg:h-6 mt-0.5 lg:mt-0 shrink-0" style={{ color: THEME.brand }} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {t(labelKey)}
                </p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {valueKey ? t(valueKey) : value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScreenCard>

      <div className="lg:max-w-xs lg:mx-auto">
        <PrimaryButton onClick={callSupport}>
          <Phone className="w-5 h-5" />
          {t('support.call', { phone: BRAND.phone })}
        </PrimaryButton>
      </div>
    </PageContainer>
  );
}
