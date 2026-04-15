import { createRoot } from 'react-dom/client';
import { EuiProvider } from '@elastic/eui';

import { App } from './App';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Missing #root element');
}

createRoot(root).render(
  <EuiProvider>
    <App />
  </EuiProvider>
);
