import { Bus, Shield, Smartphone, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BRAND, THEME } from '../../config/theme';
import { PageContainer, ScreenCard } from '../ui/ScreenUI';

const IMPACT_STATS = [
  { value: '5M+', label: 'Passengers Served' },
  { value: '1B+', label: 'Transactions Processed' },
  { value: '7', label: 'Years of Experience' },
] as const;

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
          style={{ backgroundImage: `linear-gradient(145deg, ${THEME.primarySoft}, #fdecc8)`, boxShadow: 'var(--shadow-depth-sm)' }}
        >
          <Bus className="w-7 h-7 lg:w-8 lg:h-8" style={{ color: THEME.brand }} />
        </div>
        <div>
          <h2 className="font-display text-lg lg:text-2xl font-bold text-[var(--text-primary)]">{BRAND.name}</h2>
          <p className="am text-sm font-semibold text-[var(--text-muted)]">{BRAND.nameAm}</p>
        </div>
        <p className="text-sm lg:text-base text-[var(--text-secondary)] leading-relaxed lg:max-w-lg lg:mx-auto">
          {t('about.description')}
        </p>
      </ScreenCard>

      <ScreenCard className="space-y-3 lg:p-8">
        <h3 className="font-display text-sm lg:text-base font-bold text-[var(--text-primary)] lg:mb-2">{t('about.whatYouCanDo')}</h3>
        <div className="lg:grid lg:grid-cols-3 lg:gap-4 space-y-3 lg:space-y-0">
          {features.map(({ icon: Icon, textKey }) => (
            <div key={textKey} className="flex items-center gap-3 lg:flex-col lg:text-center lg:items-center lg:gap-3 lg:p-2">
              <div
                className="w-9 h-9 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${THEME.brand}14`, color: THEME.brand, boxShadow: '0 4px 10px -3px rgba(24,154,216,0.25)' }}
              >
                <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{t(textKey)}</p>
            </div>
          ))}
        </div>
      </ScreenCard>

      <ScreenCard className="space-y-4 lg:p-8">
        <h3 className="text-center font-display text-base lg:text-xl font-bold text-[var(--text-primary)]">
          Connecting Global Transport, One Journey at a Time
        </h3>
        <div className="space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
          <p>
            LiyuBus was founded with a mission to transform passenger transportation through accessible, transparent,
            and technology-driven travel solutions. Over the past seven years, we have served more than 5 million
            passengers and processed over 1 billion transactions, contributing to the digital transformation of the
            transportation sector.
          </p>
          <p>
            Starting in Ethiopia, our vision extends across Africa, South America, and Southeast Asia, with a
            commitment to supporting digital transport operations in Tanzania, Uganda, Rwanda, Nigeria, Ghana, the
            Philippines, Cambodia, Peru, and Bolivia.
          </p>
          <p>
            Through partnerships with transport associations, fleet owners, and government authorities, we provide
            integrated digital infrastructure that helps modernize transportation operations, streamline ticketing,
            and improve the passenger experience.
          </p>
        </div>

        <div className="pt-1">
          <h4 className="text-center text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Our Impact
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {IMPACT_STATS.map(({ value, label }) => (
              <div
                key={label}
                className="rounded-xl text-center p-3"
                style={{ backgroundColor: THEME.brandSoft }}
              >
                <p className="font-display text-lg lg:text-xl font-black" style={{ color: THEME.brand }}>{value}</p>
                <p className="text-[10.5px] lg:text-xs font-semibold text-[var(--text-secondary)] leading-tight mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </ScreenCard>

      <ScreenCard className="space-y-3 text-center lg:p-8">
        <h3 className="font-display text-sm lg:text-base font-bold text-[var(--text-primary)]">Travel with LiyuBus</h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Whether you are planning your next journey or need assistance with your booking, LiyuBus makes travel more
          convenient through technology and customer-focused service.
        </p>
        <a
          href={`tel:${BRAND.phone}`}
          className="inline-flex items-center gap-2 font-bold text-sm"
          style={{ color: THEME.brand }}
        >
          <Phone className="w-4 h-4" />
          Call our toll-free call center: {BRAND.phone}
        </a>
        <p className="text-xs font-semibold text-[var(--text-muted)] pt-1">LiyuBus — Connecting People, Empowering Journeys.</p>
      </ScreenCard>

      <p className="text-center text-[11px] text-[var(--text-muted)] pt-2">{BRAND.tagline}</p>
    </PageContainer>
  );
}
