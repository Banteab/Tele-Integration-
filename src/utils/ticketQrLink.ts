/**
 * Builds and parses the URL encoded into a ticket's QR code. Scanning it
 * with a phone camera opens this same app at `/` with the ticket's key
 * details in the query string — a real link a browser recognizes and opens,
 * rather than plain text a camera app just shows as a note. `RootApp` reads
 * these params to render a standalone, read-only ticket page straight away,
 * with no backend round-trip, since there's no endpoint to look a ticket up
 * by reference.
 */

export interface ScannedTicket {
  ref: string;
  operator: string;
  route: string;
  seats: string;
}

const TICKET_QUERY_KEY = 'ticket';

export function buildTicketQrUrl(ticket: ScannedTicket): string {
  const params = new URLSearchParams({
    [TICKET_QUERY_KEY]: '1',
    ref: ticket.ref,
    op: ticket.operator,
    route: ticket.route,
    seats: ticket.seats,
  });
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

export function parseScannedTicketFromUrl(
  search: string = window.location.search,
): ScannedTicket | null {
  const params = new URLSearchParams(search);
  const ref = params.get('ref');
  if (params.get(TICKET_QUERY_KEY) !== '1' || !ref) return null;
  return {
    ref,
    operator: params.get('op') || '',
    route: params.get('route') || '',
    seats: params.get('seats') || '',
  };
}
