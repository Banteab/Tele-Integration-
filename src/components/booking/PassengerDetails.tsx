import { User, Phone, AlertCircle, ChevronDown, ChevronUp, MapPin, ShieldCheck, Bus as BusIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Bus, PassengerInfo } from '../../types';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  ScreenCard,
  PrimaryButton,
  StickyFooter,
  fieldClass,
  labelClass,
} from '../ui/ScreenUI';
import { THEME, BRAND } from '../../config/theme';
import { isSelectableSeat, isUnavailableSeat, type SeatData } from '../../hooks/useSeatLayout';

interface Props {
  bus: Bus;
  selectedSeats: string[];
  onSubmit: (info: PassengerInfo) => void;
  onBack: () => void;
  initialData?: PassengerInfo;
  telebirrVerified?: boolean;
}

interface SeatMeta {
  row: number;
  label?: 'window' | 'aisle';
}

/** Mirrors the row/window-aisle derivation used on the seat-selection page,
 *  so the labels shown here for already-chosen seats always match what the
 *  rider saw there — computed from real x/y positions, never guessed. */
function buildSeatMetaMap(seatLayout: SeatData[] | undefined): Map<string, SeatMeta> {
  const map = new Map<string, SeatMeta>();
  if (!seatLayout || seatLayout.length === 0) return map;

  const seatsByRow = new Map<number, SeatData[]>();
  seatLayout.forEach((seat) => {
    if (!seatsByRow.has(seat.y)) seatsByRow.set(seat.y, []);
    seatsByRow.get(seat.y)!.push(seat);
  });

  let passengerRowCount = 0;
  Array.from(seatsByRow.keys())
    .sort((a, b) => a - b)
    .forEach((y) => {
      const sorted = [...seatsByRow.get(y)!].sort((a, b) => a.x - b.x);
      const bookable = sorted.filter(
        (s) => s.name && (isSelectableSeat(s.type) || isUnavailableSeat(s.type)),
      );
      if (bookable.length === 0) return;
      passengerRowCount += 1;

      const labels: Record<number, 'window' | 'aisle'> = {};
      if (bookable.length === 2) {
        labels[bookable[0].id] = 'window';
        labels[bookable[1].id] = 'window';
      } else if (bookable.length === 4) {
        labels[bookable[0].id] = 'window';
        labels[bookable[1].id] = 'aisle';
        labels[bookable[2].id] = 'aisle';
        labels[bookable[3].id] = 'window';
      }

      bookable.forEach((seat) => {
        map.set(seat.name, { row: passengerRowCount, label: labels[seat.id] });
      });
    });

  return map;
}

function formatDateTime(value: string | undefined, locale: string): { date: string; time: string } | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return {
    date: d.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString('en-ET', { hour: '2-digit', minute: '2-digit' }),
  };
}

/** Estimated journey time from the real departure/arrival timestamps — never fabricated. */
function formatDuration(departure?: string, arrival?: string): string | null {
  if (!departure || !arrival) return null;
  const dep = new Date(departure);
  const arr = new Date(arrival);
  if (Number.isNaN(dep.getTime()) || Number.isNaN(arr.getTime())) return null;
  const minutes = Math.round((arr.getTime() - dep.getTime()) / 60000);
  if (minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function PassengerDetails({
  bus,
  selectedSeats,
  onSubmit,
  onBack,
  initialData,
  telebirrVerified,
}: Props) {
  const { t, i18n } = useTranslation();
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
    }
    if (phone.trim() && !/^09\d{8}$/.test(cleanPhone)) {
      newErrors.phone = t('passenger.errors.phoneInvalid');
    }
    if (fullName.trim() && fullName.trim().length < 2) {
      newErrors.fullName = t('passenger.errors.fullNameInvalid');
    }
    if (email.trim() && !email.includes('@')) {
      newErrors.email = t('passenger.errors.emailInvalidOptional');
    }

    setErrors(newErrors);
    if (newErrors.email) setShowOptional(true);
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
    toast.error(errors.form || errors.phone || errors.fullName || errors.email || t('passenger.errors.fixForm'));
  };

  const locale = i18n.language === 'am' ? 'am-ET' : 'en-ET';
  const seatMeta = buildSeatMetaMap(bus.seatLayout);
  const total = bus.price * selectedSeats.length;
  const departure = formatDateTime(bus.departureTime, locale);
  const arrival = formatDateTime(bus.arrivalTime, locale);
  const duration = formatDuration(bus.departureTime, bus.arrivalTime);

  const seatSummary = (
    <div className="space-y-2">
      {selectedSeats.map((name) => {
        const meta = seatMeta.get(name);
        return (
          <div key={name} className="p-2.5 rounded-xl flex items-center gap-2.5 bg-[var(--surface-muted)]">
            <div
              className="w-8 h-8 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0"
              style={{ backgroundImage: `linear-gradient(145deg, ${THEME.brand}, ${THEME.brandHover})` }}
            >
              {name}
            </div>
            {meta && (
              <div className="text-xs">
                <p className="font-bold text-[var(--text-primary)]">{t('seats.rowLabel', { row: meta.row })}</p>
                {meta.label && (
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {t(meta.label === 'window' ? 'seats.windowSeat' : 'seats.aisleSeat')}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const fareSummary = (
    <>
      <div className="space-y-2 text-xs border-t border-[var(--border)] pt-3">
        <div className="flex justify-between text-[var(--text-secondary)]">
          <span>{t('seats.baseFare', { count: selectedSeats.length })}</span>
          <span className="font-bold text-[var(--text-primary)] tnum">ETB {total}</span>
        </div>
      </div>
      <div className="flex items-baseline justify-between pt-2">
        <span className="text-xs uppercase font-extrabold tracking-wider text-[var(--text-muted)]">{t('passenger.totalPayable')}</span>
        <span className="font-display text-xl font-black tnum" style={{ color: THEME.brand }}>ETB {total}</span>
      </div>
    </>
  );

  return (
    <div className="pb-28 lg:pb-10">
      <ScreenCard className="mb-4 lg:p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl text-white flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: THEME.brand }}
            >
              <BusIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[15px] font-bold text-[var(--text-primary)] truncate">{bus.from} → {bus.to}</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: THEME.brandSoft, color: THEME.brandDeep }}>
                  {bus.type}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {bus.operator}{bus.sideNumber ? ` · Side ${bus.sideNumber}` : ''}
                {departure ? ` · ${departure.date} · ${t('seats.departsAt', { time: departure.time })}` : ''}
                {duration ? ` · ${duration}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold border"
            style={{ color: THEME.brandDeep, borderColor: THEME.brandBorder, backgroundColor: 'white' }}
          >
            {t('passenger.changeSeats')}
          </button>
        </div>
      </ScreenCard>

      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 lg:items-start">
        <form id="passenger-form" onSubmit={handleSubmit} className="space-y-4">
          <ScreenCard className="lg:p-5">
            <p
              className="text-xs rounded-xl px-3 py-2 border border-[var(--color-brand-border)]"
              style={{ backgroundColor: 'var(--color-brand-soft)', color: 'var(--color-brand-deep)' }}
            >
              {t('passenger.syncNotice')}
            </p>
          </ScreenCard>

          <ScreenCard className="space-y-5 lg:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span
                  className="w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0"
                  style={{ backgroundColor: THEME.brandSoft, color: THEME.brandDeep }}
                >
                  1
                </span>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)] leading-none">{t('passenger.formTitle')}</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{t('passenger.seatsSelectedBadge', { count: selectedSeats.length })}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelClass} htmlFor="phone-number" style={{ marginBottom: 0 }}>
                    {t('passenger.phoneLabel')}
                  </label>
                  {telebirrVerified && (
                    <span className="text-[10px] font-bold text-emerald-600">{t('passenger.telebirrVerifiedTag')}</span>
                  )}
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id="phone-number"
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
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">{t('passenger.phoneHint')}</p>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass} htmlFor="full-name">{t('passenger.fullNameLabel')}</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id="full-name"
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
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">{t('passenger.fullNameHint')}</p>
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>
                {t('passenger.gender')} <span className="text-[var(--text-muted)] font-normal">({t('passenger.genderOptionalTag')})</span>
              </label>
              <div className="grid grid-cols-2 gap-3" role="radiogroup">
                {genderOptions.map((opt) => {
                  const selected = gender === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className="relative flex items-center justify-center p-2.5 rounded-xl cursor-pointer text-xs font-bold border transition-colors"
                      style={
                        selected
                          ? { borderColor: THEME.brand, backgroundColor: THEME.brandSoft, color: THEME.brandDeep }
                          : { borderColor: 'var(--border-strong)', backgroundColor: 'white', color: 'var(--text-secondary)' }
                      }
                    >
                      <input
                        type="radio"
                        name="gender"
                        className="sr-only"
                        checked={selected}
                        onChange={() => setGender(opt.value)}
                      />
                      <span>{t(opt.labelKey)}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl flex items-start gap-2.5 bg-[var(--surface-muted)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{t('seats.boardingPoint')}</p>
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">{bus.from}</p>
                  {departure && <p className="text-[11px] text-[var(--text-muted)]">{t('seats.departsAt', { time: departure.time })}</p>}
                </div>
              </div>
              <div className="p-3 rounded-xl flex items-start gap-2.5 bg-[var(--surface-muted)]">
                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{t('seats.dropOffPoint')}</p>
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">{bus.to}</p>
                  {arrival && <p className="text-[11px] text-[var(--text-muted)]">{t('seats.arrivesAt', { time: arrival.time })}</p>}
                </div>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                <MapPin className="w-3 h-3 shrink-0" />
                {t('seats.arriveEarly')}
              </p>
            </div>

            <details className="group border border-[var(--border)] rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between p-3.5 cursor-pointer select-none bg-[var(--surface-muted)] font-bold text-xs text-[var(--text-secondary)]">
                <span className="flex items-center gap-2">
                  <ChevronDown className="w-4 h-4 group-open:hidden" style={{ color: THEME.brand }} />
                  <ChevronUp className="w-4 h-4 hidden group-open:block" style={{ color: THEME.brand }} />
                  {t('passenger.optionalDetails')}
                </span>
              </summary>
              <div className="p-4 bg-white border-t border-[var(--border)] grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('passenger.email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    className={`${fieldClass} ${errors.email ? 'border-red-300 bg-red-50' : ''}`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>{t('passenger.dateOfBirth')}</label>
                  <input
                    type="date"
                    value={dob}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setDob(e.target.value)}
                    className={fieldClass}
                  />
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
            </details>
          </ScreenCard>
        </form>

        <div className="hidden lg:block lg:sticky lg:top-24 space-y-4">
          <ScreenCard className="p-0 overflow-hidden">
            <div className="p-5 text-white" style={{ background: `linear-gradient(135deg, ${THEME.textPrimary}, ${THEME.brandDeep})` }}>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-300">{t('passenger.orderOverview')}</span>
              <h3 className="text-lg font-bold mt-0.5">{t('passenger.fareSummaryTitle')}</h3>
              <p className="text-xs text-slate-200 mt-1.5">{bus.from} → {bus.to}</p>
            </div>
            <div className="p-5 space-y-4">
              {seatSummary}
              {fareSummary}
              <PrimaryButton type="submit" form="passenger-form">{t('passenger.proceedToPayment')}</PrimaryButton>
            </div>
            <div className="p-4 flex items-start gap-2.5 bg-[var(--surface-muted)] border-t border-[var(--border)]">
              <ShieldCheck className="w-7 h-7 shrink-0" style={{ color: THEME.brand }} />
              <div>
                <p className="text-xs font-extrabold text-[var(--text-primary)]">{t('passenger.trustTitle')}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{t('passenger.trustBody')}</p>
              </div>
            </div>
          </ScreenCard>

          <ScreenCard className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">{t('passenger.helpPrompt')}</span>
            <a href={`tel:${BRAND.phone}`} className="font-bold" style={{ color: THEME.brandDeep }}>
              {t('passenger.dialSupport', { phone: BRAND.phone })}
            </a>
          </ScreenCard>
        </div>
      </div>

      <StickyFooter>
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-[var(--text-muted)]">{t('passenger.seatsSelectedBadge', { count: selectedSeats.length })}</span>
          <span className="font-display font-bold tnum" style={{ color: THEME.brand }}>ETB {total}</span>
        </div>
        <PrimaryButton type="submit" form="passenger-form">
          {t('passenger.proceedToPayment')}
        </PrimaryButton>
      </StickyFooter>
    </div>
  );
}
