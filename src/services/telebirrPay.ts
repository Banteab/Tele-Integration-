/**
 * Telebirr H5 bridge — payment_flow.txt only
 * Step 2 (H5 Get Access Token): js_fun_h5GetAccessToken via consumerapp.evaluate
 * Step 4.2 (Start Pay): js_fun_start_pay via consumerapp.evaluate
 */

declare global {
  interface Window {
    consumerapp?: {
      evaluate: (payload: string) => void;
    };
  }
}

const PAY_CALLBACK = 'menahariyaH5PayCallback';
const TOKEN_CALLBACK = 'menahariyaH5TokenCallback';

let accessTokenPromise: Promise<string | undefined> | null = null;

export function isTelebirrH5Host(): boolean {
  return Boolean(window.consumerapp?.evaluate);
}

/** @deprecated use isTelebirrH5Host */
export const isTelebirrSuperApp = isTelebirrH5Host;

export function parseH5AccessToken(result: unknown): string | undefined {
  if (result == null) return undefined;

  if (typeof result === 'string') {
    const trimmed = result.trim();
    return trimmed || undefined;
  }

  if (typeof result === 'object') {
    const record = result as Record<string, unknown>;
    for (const key of ['accessToken', 'access_token', 'token']) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
  }

  return undefined;
}

function evaluateConsumerApp(
  functionName: string,
  params: Record<string, unknown>,
  callbackName: string,
  timeoutMs = 5 * 60 * 1000,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (!window.consumerapp?.evaluate) {
      reject(new Error('Telebirr consumerapp bridge not available'));
      return;
    }

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Telebirr callback timed out'));
    }, timeoutMs);

    const cleanup = () => {
      clearTimeout(timer);
      delete (window as unknown as Record<string, unknown>)[callbackName];
    };

    const callback = (...args: unknown[]) => {
      cleanup();
      resolve(args.length <= 1 ? args[0] : args);
    };

    (window as unknown as Record<string, unknown>)[callbackName] = callback;

    try {
      window.consumerapp.evaluate(
        JSON.stringify({
          functionName,
          params: {
            ...params,
            functionCallBackName: callbackName,
          },
        }),
      );
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
}

/**
 * H5 Get Access Token — payment_flow.txt
 * js_fun_h5GetAccessToken with appId + functionCallBackName
 */
export function getH5AccessToken(
  merchantAppId: string,
  options?: { force?: boolean },
): Promise<string | undefined> {
  const appId = (merchantAppId || '').trim();
  if (!appId || !window.consumerapp?.evaluate) {
    return Promise.resolve(undefined);
  }

  if (accessTokenPromise && !options?.force) {
    return accessTokenPromise;
  }

  accessTokenPromise = evaluateConsumerApp(
    'js_fun_h5GetAccessToken',
    { appId },
    TOKEN_CALLBACK,
    60_000,
  )
    .then((result) => {
      const token = parseH5AccessToken(result);
      if (!token) {
        const preview =
          result == null
            ? 'null'
            : typeof result === 'string'
              ? result.slice(0, 120)
              : JSON.stringify(result).slice(0, 200);
        throw new Error(
          `js_fun_h5GetAccessToken callback returned no token. Raw: ${preview}`,
        );
      }
      return token;
    })
    .finally(() => {
      accessTokenPromise = null;
    });

  return accessTokenPromise;
}

/**
 * Step 4.2 Start Pay — payment_flow.txt
 */
export function startTelebirrPay(rawRequest: string): Promise<void> {
  const trimmed = (rawRequest || '').trim();
  if (!trimmed) {
    return Promise.reject(new Error('Invalid payment request'));
  }

  if (!window.consumerapp?.evaluate) {
    return Promise.reject(
      new Error(
        'Open Menahariya inside the Telebirr Super App (H5) to complete payment.',
      ),
    );
  }

  return evaluateConsumerApp(
    'js_fun_start_pay',
    { rawRequest: trimmed },
    PAY_CALLBACK,
  ).then(() => undefined);
}

/** Return the raw Telebirr/backend error message for debugging. */
export function extractTelebirrAuthError(err: unknown): string {
  const data = (err as { response?: { data?: { message?: string; msg?: string } } })
    ?.response?.data;

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }

  if (typeof data?.msg === 'string' && data.msg.trim()) {
    return data.msg.trim();
  }

  if (err instanceof Error && err.message.trim()) {
    return err.message.trim();
  }

  return 'Telebirr sign-in failed.';
}
