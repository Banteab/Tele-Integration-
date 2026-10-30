import { lazy, Suspense } from 'react';
import { parseScannedTicketFromUrl } from './utils/ticketQrLink';
import { LoadingScreen } from './components/ui/ScreenUI';

// Lazy-loaded: RootApp renders exactly one of these two screens per page
// load, decided entirely from the URL below — there's no reason the other
// one (and everything it pulls in) should ever be in the initial bundle.
const App = lazy(() => import('./App.tsx'));
const TicketQrView = lazy(() => import('./pages/TicketQrView'));

/** Query-based entry: the normal booking app, or a scanned ticket's QR link. */
export default function RootApp() {
  const scannedTicket = parseScannedTicketFromUrl();
  return (
    <Suspense fallback={<LoadingScreen />}>
      {scannedTicket ? <TicketQrView ticket={scannedTicket} /> : <App />}
    </Suspense>
  );
}
