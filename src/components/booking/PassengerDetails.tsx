import { User, Phone, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';
import { PassengerInfo } from '../../types';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  ScreenCard,
  TripBanner,
  PrimaryButton,
  fieldClass,
  labelClass,
} from '../ui/ScreenUI';

interface Props {
  selectedSeats: string[];
  onSubmit: (info: PassengerInfo) => void;
  onBack: () => void;
  initialData?: PassengerInfo;
  routeLabel?: string;
}

export default function PassengerDetails({
  selectedSeats,
  onSubmit,
  onBack,
  initialData,
  routeLabel,
}: Props) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [dob, setDob] = useState(initialData?.dob || '');
  const [gender, setGender] = useState(initialData?.gender || '');
  const [maritalStatus, setMaritalStatus] = useState(
    initialData?.maritalStatus || '',
  );
  const [showOptional, setShowOptional] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const genderOptions = [
    { value: '', labelKey: 'passenger.notSpecified' },
    { value: '181', labelKey: 'passenger.genderOptions.male' },
    { value: '182', labelKey: 'passenger.genderOptions.female' },
  ];

  const maritalOptions = [
    { value: '', labelKey: 'passenger.notSpecified' },
    { value: '183', labelKey: 'passenger.single' },
    { value: '184', labelKey: 'passenger.married' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const cleanPhone = phone.replace(/[\s-]/g, '');

    if (!phone.trim() || !fullName.trim()) {
      newErrors.form = t('passenger.errors.formRequired');
    } else if (!/^09\d{8}$/.test(cleanPhone)) {
      newErrors.phone = t('passenger.errors.phoneInvalid');
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = t('passenger.errors.fullNameInvalid');
    } else if (email.trim() && !email.includes('@')) {
      newErrors.email = t('passenger.errors.emailInvalidOptional');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        phone: phone.replace(/[\s-]/g, ''),
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        dob: dob.trim() || undefined,
        gender: gender || undefined,
        maritalStatus: maritalStatus || undefined,
      });
      return;
    }
    toast.error(errors.form || t('passenger.errors.fixForm'));
  };

  return (
    <div className="pb-6">
      <TripBanner
        from={routeLabel?.split('→')[0]?.trim() || t('common.trip')}
        to={routeLabel?.split('→')[1]?.trim() || ''}
        meta={t('passenger.seatsMeta', { seats: selectedSeats.join(', ') })}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <ScreenCard className="space-y-4">
          <p
            className="text-xs rounded-xl px-3 py-2"
            style={{ backgroundColor: 'var(--amber-50)', color: '#a86f0a' }}
          >
            {t('passenger.hint')}
          </p>

          <div>
            <label className={labelClass}>{t('passenger.phoneLabel')}</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors((prev) => ({ ...prev, phone: '', form: '' }));
                }}
                className={`${fieldClass} pl-10 ${errors.phone ? 'border-red-300 bg-red-50' : ''}`}
                placeholder={t('passenger.phonePlaceholder')}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>{t('passenger.fullNameLabel')}</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setErrors((prev) => ({ ...prev, fullName: '', form: '' }));
                }}
                className={`${fieldClass} pl-10 ${errors.fullName ? 'border-red-300 bg-red-50' : ''}`}
                placeholder={t('passenger.fullNamePlaceholder')}
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowOptional((v) => !v)}
            className="flex items-center gap-1 text-sm font-semibold text-[#189ad8]"
          >
            {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showOptional ? t('passenger.hideOptional') : t('passenger.optionalDetails')}
          </button>

          {showOptional && (
            <div className="space-y-3 pt-1">
              <div>
                <label className={labelClass}>{t('passenger.email')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>{t('passenger.dateOfBirth')}</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>{t('passenger.gender')}</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className={fieldClass}>
                  {genderOptions.map((opt) => (
                    <option key={opt.value || 'unset'} value={opt.value}>{t(opt.labelKey)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('passenger.maritalStatus')}</label>
                <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className={fieldClass}>
                  {maritalOptions.map((opt) => (
                    <option key={opt.value || 'unset'} value={opt.value}>{t(opt.labelKey)}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </ScreenCard>

        <PrimaryButton type="submit">
          {t('passenger.proceedToPayment')}
        </PrimaryButton>
      </form>
    </div>
  );
}
