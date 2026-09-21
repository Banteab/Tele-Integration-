import { API_CONFIG } from '../config/api';
import { telebirrGetCurrentUser, telebirrTelebirrLogin } from './api';
import { getH5AccessToken, isTelebirrH5Host } from './telebirrPay';
import type { User } from '../types';

export interface TelebirrProfile {
  open_id?: string;
  identityId?: string;
  nickName?: string;
  identifier?: string;
  status?: string;
}

export interface AuthInitResult {
  user: User | null;
  telebirrProfile?: TelebirrProfile;
}

export async function performTelebirrAutoLogin(options?: {
  forceToken?: boolean;
}): Promise<AuthInitResult> {
  if (!isTelebirrH5Host()) {
    throw new Error('Telebirr consumerapp bridge not available');
  }

  if (!API_CONFIG.telebirrMerchantAppId) {
    throw new Error('Telebirr merchant app id is not configured');
  }

  const accessToken = await getH5AccessToken(API_CONFIG.telebirrMerchantAppId, {
    force: options?.forceToken,
  });

  if (!accessToken) {
    throw new Error(
      'Super App did not return an H5 access token (js_fun_h5GetAccessToken empty response)',
    );
  }

  const loginResult = await telebirrTelebirrLogin(accessToken);
  if (!loginResult?.user) {
    throw new Error('Backend /auth/telebirr succeeded but returned no user');
  }

  return {
    user: loginResult.user,
    telebirrProfile: loginResult.telebirr,
  };
}

export async function tryTelebirrAutoLogin(options?: {
  forceToken?: boolean;
}): Promise<AuthInitResult> {
  try {
    return await performTelebirrAutoLogin(options);
  } catch (error) {
    console.warn('Telebirr auto-login failed:', error);
    return { user: null };
  }
}

async function restoreSessionFromJwt(): Promise<AuthInitResult | null> {
  const existingToken = localStorage.getItem(API_CONFIG.authTokenKey);
  if (!existingToken) {
    return null;
  }

  try {
    const currentUser = await telebirrGetCurrentUser();
    return { user: currentUser };
  } catch {
    localStorage.removeItem(API_CONFIG.authTokenKey);
    return null;
  }
}

async function tryTelebirrAutoLoginWithTimeout(
  timeoutMs: number,
): Promise<AuthInitResult> {
  if (!isTelebirrH5Host()) {
    return { user: null };
  }

  try {
    return await Promise.race([
      performTelebirrAutoLogin(),
      new Promise<AuthInitResult>((_, reject) => {
        setTimeout(() => reject(new Error('Telebirr auth init timed out')), timeoutMs);
      }),
    ]);
  } catch (error) {
    console.warn('Telebirr auto-login failed:', error);
    return { user: null };
  }
}

export async function initializeAuth(): Promise<AuthInitResult> {
  const restored = await restoreSessionFromJwt();
  if (restored?.user) {
    return restored;
  }

  if (isTelebirrH5Host()) {
    return tryTelebirrAutoLoginWithTimeout(30_000);
  }

  return { user: null };
}

export function buildPassengerPrefill(
  user: User | null,
  telebirrProfile?: TelebirrProfile,
) {
  const phone =
    user?.phoneNumber ||
    (telebirrProfile?.identifier
      ? normalizeDisplayPhone(telebirrProfile.identifier)
      : '');

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    telebirrProfile?.nickName ||
    '';

  if (!phone && !fullName) return undefined;

  return { phone, fullName };
}

function normalizeDisplayPhone(identifier: string): string {
  const digits = identifier.replace(/\D/g, '');
  if (digits.startsWith('251') && digits.length >= 12) {
    return `0${digits.slice(3)}`;
  }
  return digits;
}

export function formatDisplayPhone(identifier?: string): string | undefined {
  if (!identifier) return undefined;
  const normalized = normalizeDisplayPhone(identifier);
  return normalized || undefined;
}

export function getDisplayName(
  user: User | null,
  telebirrProfile?: TelebirrProfile,
): string | undefined {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  return fullName || telebirrProfile?.nickName || undefined;
}

export function getDisplayPhone(
  user: User | null,
  telebirrProfile?: TelebirrProfile,
): string | undefined {
  return (
    user?.phoneNumber ||
    formatDisplayPhone(telebirrProfile?.identifier) ||
    undefined
  );
}
