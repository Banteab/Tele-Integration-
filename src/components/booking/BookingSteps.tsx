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
                    ? 'bg-[#189ad8] text-white'
                    : active
                      ? 'bg-[#f2a81c] text-white ring-4 ring-[#fef6e7]'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> : step.id}
              </div>
              <span
                className={`text-[9px] lg:text-xs font-semibold uppercase tracking-wide truncate w-full text-center ${
                  active || done ? 'text-[#189ad8]' : 'text-gray-400'
                }`}
              >
                {labels[step.key]}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 h-1 rounded-full bg-gray-100 overflow-hidden lg:max-w-2xl lg:mx-auto">
        <div
          className="h-full rounded-full bg-[#189ad8] transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </nav>
  );
}
