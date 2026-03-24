// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import MobileScan from './components/scanner/MobileScan';
import './index.css';
import './theme.css';  // or add @import './theme.css' to your index.css

const isScanRoute = window.location.pathname === '/scan';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isScanRoute ? <MobileScan /> : <App />}
  </React.StrictMode>
);