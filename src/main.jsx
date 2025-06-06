import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ReactDOM from 'react-dom/client';

import { HashRouter } from 'react-router-dom'
import  {AuthProvider}  from  './Context/authContext.jsx'

const  root   =  ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
         <App  />
      </AuthProvider>
   
    </HashRouter>
  </React.StrictMode>
)


