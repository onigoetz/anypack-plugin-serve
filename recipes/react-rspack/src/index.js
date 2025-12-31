// biome-ignore lint/correctness/noUnusedImports: false positive
import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

const render = () => {
  const rootElement = document.createElement('div');
  document.body.appendChild(rootElement);

  const root = createRoot(rootElement);

  root.render(<App />);
};

render();
