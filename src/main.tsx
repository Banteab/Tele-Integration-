import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import RootApp from './RootApp.tsx';
import './index.css';
import './i18n';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
);
