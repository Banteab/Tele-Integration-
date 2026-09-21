function normalizeBaseUrl(value: string | undefined): string {
  return (value ?? '').trim().replace(/\/$/, '');
}

/** Must match CLIENT_API_KEY on telebirr-miniapp backend. */
export const API_CONFIG = {
  baseUrl: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
  apiKey: (import.meta.env.VITE_API_KEY ?? '').trim(),
  authTokenKey: 'telebirr_auth_token',
  /** Telebirr merchant app id (portal) — must match backend TELEBIRR_MERCHANT_APP_ID */
  telebirrMerchantAppId: (
    import.meta.env.VITE_TELEBIRR_MERCHANT_APP_ID ?? '1655506416947201'
  ).trim(),
};

if (import.meta.env.PROD && API_CONFIG.baseUrl && !API_CONFIG.apiKey) {
  console.error(
    'VITE_API_KEY is not set. Set it to the same value as CLIENT_API_KEY on the API server.',
  );
}

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    telebirr: '/auth/telebirr',
  },
  users: {
    getCurrentUser: '/users/me',
  },
  tickets: {
    create: '/tickets',
    getHistory: '/tickets/history',
    getStatus: (reference: string) => `/tickets/status/${reference}`,
    proxy: {
      routes: '/tickets/proxy/routes',
      schedules: '/tickets/proxy/schedules',
      seatLayout: (vehicleId: string | number, routeScheduleId: string | number) =>
        `/tickets/proxy/seat-layout/${vehicleId}/${routeScheduleId}`,
    },
  },
  payment: {
    preorder: '/payment/preorder',
    queryOrder: '/payment/query-order',
  },
};

export const buildUrl = (endpoint: string): string => {
  if (!API_CONFIG.baseUrl) {
    throw new Error(
      'VITE_API_BASE_URL is not set. Add it to your .env file before calling the API.',
    );
  }
  return `${API_CONFIG.baseUrl}${endpoint}`;
};

export const getApiKeyHeaders = (): Record<string, string> => {
  if (!API_CONFIG.apiKey) {
    return {};
  }
  return { 'x-api-key': API_CONFIG.apiKey };
};

export function requireApiKeyHeaders(): Record<string, string> {
  if (!API_CONFIG.apiKey) {
    throw new Error(
      'VITE_API_KEY is not set. It must match CLIENT_API_KEY on the API server.',
    );
  }
  return { 'x-api-key': API_CONFIG.apiKey };
}

export const getAuthHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getApiKeyHeaders(),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};
