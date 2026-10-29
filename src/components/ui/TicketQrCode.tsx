import { useEffect, useState } from 'react';
import * as QRCode from 'qrcode';
import { useTranslation } from 'react-i18next';
import { THEME } from '../../config/theme';

/** A real, scannable QR code encoding the same plain-text ticket summary
 *  already shown on screen — no fabricated verification link, since no
 *  backend endpoint exists to resolve one.
 *
 *  `margin: 1` (below the spec-recommended 4-module quiet zone) and a small
 *  render size previously made this unreadable by real phone cameras —
 *  scanning it just did nothing. The quiet zone is restored to the library's
 *  own default and the default size raised so each module is large enough
 *  to resolve reliably off a phone screen. */
export default function TicketQrCode({ text, size = 220 }: { text: string; size?: number }) {
  const { t } = useTranslation();
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(text, { width: size, margin: 4, color: { dark: THEME.textPrimary, light: '#ffffff' } })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
      });
    return () => {
      cancelled = true;
    };
  }, [text, size]);

  return (
    <div
      className="mx-auto flex items-center justify-center bg-white rounded-xl p-3"
      style={{ width: size, height: size, boxShadow: 'var(--shadow-depth-sm)' }}
    >
      {dataUrl ? (
        <img src={dataUrl} width={size - 24} height={size - 24} alt={t('ticketSuccess.qrAlt')} />
      ) : (
        <div className="w-full h-full rounded-lg animate-pulse" style={{ backgroundColor: 'var(--surface-muted)' }} />
      )}
    </div>
  );
}
