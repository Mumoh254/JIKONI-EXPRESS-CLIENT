import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './Context/authContext.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
      
          <App />
       
      </AuthProvider>
    </HashRouter>
  </StrictMode>
);
