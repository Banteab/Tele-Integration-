import { useEffect, useState } from 'react';
import { Loader2, Smartphone, RefreshCw } from 'lucide-react';
import { performTelebirrAutoLogin, type TelebirrProfile } from '../../services/telebirrAuth';
import { extractTelebirrAuthError, isTelebirrH5Host } from '../../services/telebirrPay';
import type { User } from '../../types';
import { ScreenCard } from '../ui/ScreenUI';
import { THEME } from '../../config/theme';

interface Props {
  onAuthenticated: (user: User, telebirrProfile?: TelebirrProfile) => void;
  onBack: () => void;
}

export default function TelebirrAuthGate({ onAuthenticated, onBack }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const inSuperApp = isTelebirrH5Host();

  const signIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await performTelebirrAutoLogin({ forceToken: true });
      onAuthenticated(result.user!, result.telebirrProfile);
    } catch (err) {
      setError(extractTelebirrAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    signIn();
  }, []);

  return (
    <ScreenCard className="text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: inSuperApp ? '#ecfdf3' : THEME.primarySoft }}
      >
        <Smartphone
          className="w-7 h-7"
          style={{ color: inSuperApp ? '#16a34a' : THEME.brand }}
        />
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-1">Telebirr Sign-In</h2>
      <p className="text-sm text-gray-500 mb-5">
        {inSuperApp
          ? 'Signing you in automatically — no password needed.'
          : 'Open from Telebirr Super App for auto sign-in.'}
      </p>

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: THEME.brand }} />
          <p className="text-xs text-gray-400">Connecting to Telebirr...</p>
        </div>
      ) : (
        <>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-700"
            >
              Back
            </button>
            {inSuperApp && (
              <button
                type="button"
                onClick={signIn}
                className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: THEME.primary }}
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            )}
          </div>
        </>
      )}
    </ScreenCard>
  );
}
