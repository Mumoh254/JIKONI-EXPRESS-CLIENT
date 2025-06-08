import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ReactDOM from 'react-dom/client';

import { HashRouter } from 'react-router-dom'
import  {AuthProvider}  from  './Context/authContext.jsx'
import { SocketProvider } from './components/context/notificationContext.jsx'; // adjust path
const  root   =  ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        
        <SocketProvider>
              <App  />
        </SocketProvider>
        
      </AuthProvider>
   
    </HashRouter>
  </React.StrictMode>
)


