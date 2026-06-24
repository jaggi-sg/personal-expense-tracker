// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import MobileScan from './components/scanner/MobileScan.jsx';
import LoginGate from './components/layout/LoginGate.jsx';
import './index.css';

const isScanRoute = window.location.pathname === '/scan';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isScanRoute
      ? <MobileScan />
      : <LoginGate><App /></LoginGate>
    }
  </React.StrictMode>
);