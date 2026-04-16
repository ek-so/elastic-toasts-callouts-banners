import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { EuiProvider } from '@elastic/eui';

import { App, type AppColorMode } from './App';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Missing #root element');
}

function Root() {
  const [colorMode, setColorMode] = useState<AppColorMode>('LIGHT');
  return (
    <EuiProvider colorMode={colorMode}>
      <App colorMode={colorMode} onColorModeChange={setColorMode} />
    </EuiProvider>
  );
}

createRoot(root).render(<Root />);
