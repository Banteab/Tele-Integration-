import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STEPS = [
  { id: 1, key: 'search' },
  { id: 2, key: 'seats' },
  { id: 3, key: 'passenger' },
  { id: 4, key: 'payment' },
  { id: 5, key: 'success' },
] as const;

export default function BookingSteps({ currentStep }: { currentStep: number }) {
  const { t } = useTranslation();

  const labels: Record<string, string> = {
    search: t('booking.steps.search'),
    seats: t('booking.steps.seats'),
    passenger: t('booking.steps.passenger'),
    payment: t('booking.steps.payment'),
    success: t('booking.steps.success'),
  };

  return (
    <nav aria-label={t('booking.progress')} className="mb-5 lg:mb-10">
      <div className="flex items-center justify-between gap-1 lg:max-w-2xl lg:mx-auto">
        {STEPS.map((step) => {
          const done = step.id < currentStep;
          const active = step.id === currentStep;
          return (
            <div key={step.id} className="flex-1 flex flex-col items-center gap-1 lg:gap-2 min-w-0">
              <div
                className={`w-7 h-7 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-[11px] lg:text-sm font-bold transition-colors duration-300 ${
                  done
                    ? 'text-white'
                    : active
                      ? 'text-[var(--text-primary)]'
                      : 'bg-[var(--surface-muted)] text-[var(--text-muted)]'
                }`}
                style={
                  done
                    ? { backgroundColor: 'var(--color-brand)' }
                    : active
                      ? { backgroundColor: 'var(--color-primary)', boxShadow: `0 0 0 4px var(--color-primary-soft)` }
                      : undefined
                }
              >
                {done ? <Check className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> : step.id}
              </div>
              <span
                className="text-[9px] lg:text-xs font-semibold uppercase tracking-wide truncate w-full text-center"
                style={{ color: active || done ? 'var(--color-brand-deep)' : 'var(--text-muted)' }}
              >
                {labels[step.key]}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 h-1 rounded-full bg-[var(--surface-muted)] overflow-hidden lg:max-w-2xl lg:mx-auto">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`, backgroundColor: 'var(--color-brand)' }}
        />
      </div>
    </nav>
  );
}
