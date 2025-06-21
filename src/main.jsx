import React, { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './Context/authContext.jsx';
import { HashRouter } from 'react-router-dom'; // ✅ Use HashRouter
import ScrollToTop from './handler/goToTop.jsx';
import { ThemeProvider } from 'styled-components';

// ✅ Unregister any existing service workers to avoid stale cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

// ✅ Define your theme
const theme = {
  colors: {
    primary: '#6366f1',
    secondary: '#10b981',
    danger: '#ef4444',
    text: '#1f2937',
    background: '#f8fafc',
  },
  fonts: {
    main: "'Poppins', sans-serif",
  },
};

// ✅ Get the root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element not found");
}

// ✅ Render your app
createRoot(rootElement).render(
  <StrictMode>
    <HashRouter> {/* ✅ Switched from BrowserRouter to HashRouter */}
      <ScrollToTop />
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <Suspense fallback={<div>Loading Jikoni Express…</div>}>
            <App />
          </Suspense>
        </ThemeProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>
);
