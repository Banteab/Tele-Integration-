import { Bus, Shield, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BRAND, THEME } from '../../config/theme';
import { ScreenCard } from '../ui/ScreenUI';

export default function AboutPanel() {
  const { t } = useTranslation();

  const features = [
    { icon: Bus, textKey: 'about.featureSearch' },
    { icon: Smartphone, textKey: 'about.featurePay' },
    { icon: Shield, textKey: 'about.featureSecure' },
  ];

  return (
    <div className="app-gutter-x pb-28 space-y-3 -mt-2">
      <ScreenCard className="text-center space-y-3">
        <div
          className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
          style={{ backgroundColor: THEME.primarySoft }}
        >
          <Bus className="w-7 h-7" style={{ color: THEME.brand }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{BRAND.name}</h2>
          <p className="am text-sm font-semibold text-gray-500">{BRAND.nameAm}</p>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{t('about.description')}</p>
      </ScreenCard>

      <ScreenCard className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900">{t('about.whatYouCanDo')}</h3>
        {features.map(({ icon: Icon, textKey }) => (
          <div key={textKey} className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${THEME.brand}14`, color: THEME.brand }}
            >
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-sm text-gray-700">{t(textKey)}</p>
          </div>
        ))}
      </ScreenCard>

      <p className="text-center text-[11px] text-gray-400 pt-2">{BRAND.tagline}</p>
    </div>
  );
}
