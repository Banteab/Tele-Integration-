import App from './App.tsx';
import TicketQrView from './pages/TicketQrView';
import { parseScannedTicketFromUrl } from './utils/ticketQrLink';

/** Query-based entry: the normal booking app, or a scanned ticket's QR link. */
export default function RootApp() {
  const scannedTicket = parseScannedTicketFromUrl();
  if (scannedTicket) {
    return <TicketQrView ticket={scannedTicket} />;
  }
  return <App />;
}
