import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './Context/authContext.jsx';
import { HashRouter } from 'react-router-dom';
import ScrollToTop from './handler/goToTop.jsx';
import { ThemeProvider } from 'styled-components';

// Define your theme
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

// Create and mount the root
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <HashRouter>
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
