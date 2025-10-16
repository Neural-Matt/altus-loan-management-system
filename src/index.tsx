import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './api/quickTester'; // Import quickTester to expose functions to console
import './api/corsTestHelper'; // Import CORS test helpers for development

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}