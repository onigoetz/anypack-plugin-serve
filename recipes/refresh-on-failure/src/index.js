import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import name from './another';

const root = createRoot(document.getElementById('app'));

root.render(<App>{name}</App>);
