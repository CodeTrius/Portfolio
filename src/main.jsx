import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SupabaseProvider } from './context/SupabaseContext';
import App from './App';
import './services/i18n'; // Initialize i18next
import './assets/globalStyles.css'; // Import global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SupabaseProvider>
        <App />
      </SupabaseProvider>
    </BrowserRouter>
  </React.StrictMode>
);