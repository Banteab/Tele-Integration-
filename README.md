# Menahariya — React Website

Bus booking website for Menahariya, connected to the Telebirr miniapp backend.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS 4
- i18n (English, Amharic, Afaan Oromoo)
- Backend: `engida_telebirr/telebirr-miniapp`

## Setup

```bash
cd engida_telebirr/menahariya
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | NestJS API (default `https://telebirr-miniapp.onrender.com`) |

Telebirr merchant app id for H5 auto-login is set in `src/config/api.ts` (`telebirrMerchantAppId`), not in `.env`.

## Booking flow

1. Search routes → select bus → pick seats
2. Enter phone + full name (optional fields available)
3. **Telebirr auto-login** — `js_fun_h5GetAccessToken` → `POST /auth/telebirr` (no manual login/register)
4. **Pay with Telebirr** — InApp via Super App (`consumerapp.evaluate` / `js_fun_start_pay`)
5. Backend webhook confirms ticket → poll status → success page

Integration follows **`payment_flow.txt` (H5 only)** at the repo root:

| Step | Spec | Implementation |
|------|------|----------------|
| 1 | Apply fabric token | Backend `applyFabricToken` |
| 2 | H5 auto-login | `js_fun_h5GetAccessToken` → `POST /auth/telebirr` → `payment.applyh5token` |
| 3 | PreOrder | `POST /payment/preorder` → `rawRequest` |
| 4 | Start pay | `js_fun_start_pay` via `consumerapp.evaluate` |
| 5–7 | Notify / query | Backend webhook + `query-order` |

> Open the site **inside the Telebirr Super App** — H5 requires `window.consumerapp.evaluate`. Normal browsers can search/book but cannot pay.

## SuperAppTestBed.apk

When testing in **SuperAppTestBed.apk**, the backend **must** use the **testbed** Telebirr gateway (not production):

| Backend env (Render / `.env`) | TestBed value |
|-------------------------------|---------------|
| `TELEBIRR_BASE_URL` | `https://developerportal.ethiotelebirr.et:38443/apiaccess/payment/gateway` |
| `TELEBIRR_FABRIC_APP_ID` | Testbed **X-APP-Key** from Telebirr developer portal |
| `TELEBIRR_APP_SECRET` | Testbed **appSecret** from portal |
| `TELEBIRR_MERCHANT_APP_ID` | `1362421376768000` (must match `telebirrMerchantAppId` in `src/config/api.ts`) |

**Common errors**

| Error | Cause |
|-------|--------|
| `Parameter verification failed. 333check` | TestBed token sent to **production** Telebirr URL (or wrong fabric credentials) |
| `Telebirr callback timed out` | H5 URL not registered in portal, wrong merchant app id, or bridge did not callback — retry after whitelisting |

Redeploy `telebirr-miniapp` on Render after changing env vars, then rebuild/redeploy Menahariya `dist/`.

## Build

```bash
npm run build
npm run preview
```

Output: `dist/` — deploy to your web host or register the URL in the Telebirr portal.

## Related

| Folder | Purpose |
|--------|---------|
| `pages/` | Legacy Macle miniapp |
| `src/` | This React website |
