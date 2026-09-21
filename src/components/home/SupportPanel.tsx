import { Headset, Phone, Clock, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BRAND, THEME } from '../../config/theme';
import { PrimaryButton, ScreenCard } from '../ui/ScreenUI';

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
    <div className="app-gutter-x pb-28 space-y-3 -mt-2">
      <ScreenCard className="text-center space-y-3">
        <div
          className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
          style={{ backgroundColor: THEME.primarySoft }}
        >
          <Headset className="w-7 h-7" style={{ color: THEME.primary }} />
        </div>
        <h2 className="text-lg font-bold text-gray-900">{t('support.title')}</h2>
        <p className="text-sm text-gray-600">{t('support.description')}</p>
      </ScreenCard>

      <ScreenCard className="space-y-4">
        {infoRows.map(({ icon: Icon, labelKey, value, valueKey }) => (
          <div key={labelKey} className="flex items-start gap-3">
            <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: THEME.brand }} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {t(labelKey)}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {valueKey ? t(valueKey) : value}
              </p>
            </div>
          </div>
        ))}
      </ScreenCard>

      <PrimaryButton onClick={callSupport}>
        <Phone className="w-5 h-5" />
        {t('support.call', { phone: BRAND.phone })}
      </PrimaryButton>
    </div>
  );
}
