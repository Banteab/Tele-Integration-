import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

/**
 * Responsive app shell: edge-to-edge on small phones, framed like a device
 * on tablet, and a full-width professional web canvas at desktop widths
 * (see index.css breakpoints) — each screen paints its own background there.
 */
export default function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen lg:min-h-0 flex justify-center" style={{ background: 'var(--surface-app)' }}>
      <div className="app-shell-inner">{children}</div>
    </div>
  );
}
