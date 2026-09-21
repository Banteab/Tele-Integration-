import { motion } from 'motion/react';
import { X, Loader2 } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { telebirrLogin, telebirrRegister } from '../../services/api';
import { User } from '../../types';
import { THEME } from '../../config/theme';

interface Props {
  mode: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: User) => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
  initialPhone?: string;
}

export default function AuthModal({
  mode,
  onClose,
  onSuccess,
  onSwitchMode,
  initialPhone = '',
}: Props) {
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(\+251|0)(9\d{8})$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!phoneNumber || !password) {
      setError(t('auth.fillRequired'));
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError(t('auth.invalidPhone'));
      return;
    }

    if (password.length < 8) {
      setError(t('auth.passwordMin8'));
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    try {
      setIsLoading(true);

      let response;
      if (mode === 'login') {
        response = await telebirrLogin(phoneNumber, password);
      } else {
        response = await telebirrRegister(phoneNumber, password);
      }

      if (response?.user) {
        toast.success(
          mode === 'login' ? t('auth.loginSuccess') : t('auth.registerSuccess'),
        );
        onSuccess(response.user);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || t('auth.authFailed');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? t('auth.login') : t('auth.register')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.phoneNumber')} *
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={t('auth.phonePlaceholder')}
              disabled={isLoading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500"
              style={{ ['--tw-ring-color' as string]: THEME.brand }}
            />
            <p className="text-xs text-gray-500 mt-1">{t('auth.phoneFormatHint')}</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.password')} *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              disabled={isLoading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500"
              style={{ ['--tw-ring-color' as string]: THEME.brand }}
            />
          </div>

          {/* Confirm Password (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.confirmPassword')} *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                disabled={isLoading}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500"
              style={{ ['--tw-ring-color' as string]: THEME.brand }}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: THEME.primary }}
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {mode === 'login' ? t('auth.login') : t('auth.register')}
          </button>

          {/* Switch Mode */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}
              {' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setPhoneNumber('');
                  setPassword('');
                  setConfirmPassword('');
                  onSwitchMode(mode === 'login' ? 'register' : 'login');
                }}
                disabled={isLoading}
                className="font-semibold disabled:opacity-50"
                style={{ color: THEME.brand }}
              >
                {mode === 'login' ? t('auth.register') : t('auth.login')}
              </button>
            </p>
          </div>
        </form>

        {/* Info */}
        <div className="px-6 pb-6 rounded-b-2xl" style={{ backgroundColor: THEME.primarySoft }}>
          <p className="text-xs" style={{ color: THEME.brandDeep }}>
            {mode === 'login' ? t('auth.loginInfo') : t('auth.registerInfo')}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
