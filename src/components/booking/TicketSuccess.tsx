import { CheckCircle, Home, Copy, Check, Download, Share2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Bus, PassengerInfo } from '../../types';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PageContainer, ScreenCard, PrimaryButton, SecondaryButton, StatusBadge } from '../ui/ScreenUI';
import { BRAND, THEME } from '../../config/theme';

interface Props {
  bus: Bus;
  selectedSeats: string[];
  passengerInfo: PassengerInfo;
  reference: string;
  onHome: () => void;
}

/** A deterministic placeholder QR-style pattern seeded from the ticket
 *  reference — not a scannable code, but structured so a real one (an
 *  <img> of a generated QR, same size) drops in without touching layout. */
function QrPlaceholder({ seed }: { seed: string }) {
  const size = 7;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells = Array.from({ length: size * size }, (_, i) => {
    h = (h * 1103515245 + 12345) >>> 0;
    return (h >> 16) % 3 !== 0;
  });
  return (
    <div
      className="grid gap-[3px] p-3 bg-white rounded-xl mx-auto"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, width: 148, boxShadow: 'var(--shadow-depth-sm)' }}
      role="img"
      aria-label="Digital ticket QR code"
    >
      {cells.map((on, i) => (
        <div key={i} className="aspect-square rounded-[2px]" style={{ backgroundColor: on ? THEME.textPrimary : 'transparent' }} />
      ))}
    </div>
  );
}

export default function TicketSuccess({
  bus,
  selectedSeats,
  passengerInfo,
  reference,
  onHome,
}: Props) {
  const { t } = useTranslation();
  const total = bus.price * selectedSeats.length;
  const [copied, setCopied] = useState(false);

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silently ignore, reference is still visible on screen.
    }
  };

  /** Builds a plain-text ticket summary from data already on screen — no fabricated fields, no server round-trip. */
  const ticketText = () => [
    `${BRAND.name} — ${t('ticketSuccess.title')}`,
    `${t('ticketSuccess.reference')}: ${reference}`,
    `${t('ticketSuccess.details.operator')}: ${bus.operator}${bus.sideNumber ? ` (${bus.sideNumber})` : ''}`,
    `${bus.from} → ${bus.to}`,
    `${t('ticketSuccess.details.contact')}: ${passengerInfo.fullName}`,
    `${t('ticketSuccess.details.seats')}: ${selectedSeats.join(', ')}`,
    `${t('ticketSuccess.amountPaid')}: ETB ${total}`,
  ].join('\n');

  const handleDownload = () => {
    const blob = new Blob([ticketText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `menahariya-ticket-${reference}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const text = ticketText();
    if (navigator.share) {
      try {
        await navigator.share({ title: `${BRAND.name} ticket`, text });
      } catch {
        // User cancelled the share sheet — not an error.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('ticketSuccess.copyReference'));
    } catch {
      // No share API and no clipboard — nothing more we can do silently.
    }
  };

  return (
    <PageContainer narrow className="pb-6 lg:pt-10 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <div
          className="w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundImage: `linear-gradient(145deg, ${THEME.primarySoft}, #fdecc8)`, boxShadow: '0 10px 24px -10px rgba(242,168,28,0.5)' }}
        >
          <CheckCircle className="w-9 h-9 lg:w-11 lg:h-11" style={{ color: THEME.primaryPressed }} />
        </div>

        <h2 className="font-display text-lg lg:text-2xl font-bold text-[var(--text-primary)] mb-1">{t('ticketSuccess.title')}</h2>
        <p className="text-sm lg:text-base text-[var(--text-muted)] mb-6">{t('ticketSuccess.thankYou')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="font-display text-4xl lg:text-5xl font-bold tnum mb-1" style={{ color: THEME.brand }}>
          ETB {total}
        </p>
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-6">
          {t('ticketSuccess.amountPaid')}
        </p>

        <ScreenCard className="text-left space-y-4 mb-4 lg:p-8">
          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-sm" style={{ color: THEME.brandDeep }}>{BRAND.name}</span>
            <StatusBadge status="success" />
          </div>
          <div className="space-y-3">
            <Row
              label={t('ticketSuccess.reference')}
              value={reference}
              mono
              action={
                <button
                  type="button"
                  onClick={copyReference}
                  className="shrink-0 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors"
                  aria-label={t('ticketSuccess.copyReference')}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5" style={{ color: THEME.brand }} />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              }
            />
            <Row label={t('ticketSuccess.details.operator')} value={`${bus.operator}${bus.sideNumber ? ` · ${bus.sideNumber}` : ''}`} />
            <Row label={t('common.route', { defaultValue: 'Route' })} value={`${bus.from} → ${bus.to}`} />
            <Row label={t('ticketSuccess.details.contact')} value={passengerInfo.fullName} />
            <Row label={t('ticketSuccess.details.seats')} value={selectedSeats.join(', ')} />
          </div>
          <div className="pt-3 border-t border-[var(--border)]">
            <QrPlaceholder seed={reference} />
          </div>
        </ScreenCard>

        <div className="grid grid-cols-2 gap-2 mb-6 lg:max-w-xs lg:mx-auto">
          <SecondaryButton onClick={handleDownload}>
            <Download className="w-4 h-4" />
            {t('common.download')}
          </SecondaryButton>
          <SecondaryButton onClick={handleShare}>
            <Share2 className="w-4 h-4" />
            {t('common.share', { defaultValue: 'Share' })}
          </SecondaryButton>
        </div>

        <div className="lg:max-w-xs lg:mx-auto">
          <PrimaryButton onClick={onHome}>
            <Home className="w-5 h-5" />
            {t('ticketSuccess.backHome')}
          </PrimaryButton>
        </div>
      </motion.div>
    </PageContainer>
  );
}

function Row({
  label,
  value,
  mono,
  action,
}: {
  label: string;
  value: string;
  mono?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="flex justify-between items-center gap-3 text-sm">
      <span className="text-[var(--text-muted)] shrink-0">{label}</span>
      <div className="flex items-center gap-1 min-w-0">
        <span className={`font-semibold text-[var(--text-primary)] text-right truncate ${mono ? 'tnum text-xs' : ''}`}>
          {value}
        </span>
        {action}
      </div>
    </div>
  );
}
