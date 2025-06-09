import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './Context/authContext.jsx';
import { SocketProvider } from './components/context/notificationContext.jsx'; // adjust path

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>
);
