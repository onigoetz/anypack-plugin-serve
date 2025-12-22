import React from 'react';
import { hydrateRoot } from 'react-dom/client';

import Root from './Root';

const elem = document.getElementById('react');

const root = hydrateRoot(elem, <Root />);

if (module.hot) {
  module.hot.accept('./Root', () => {
    const NextRoot = require('./Root').default;
    root.render(<NextRoot />);
  });
}
