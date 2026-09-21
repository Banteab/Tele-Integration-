import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

/** Responsive mini-app shell: edge-to-edge on small phones, framed on tablet+ */
export default function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen flex justify-center" style={{ background: 'var(--surface-app)' }}>
      <div className="app-shell-inner">{children}</div>
    </div>
  );
}
