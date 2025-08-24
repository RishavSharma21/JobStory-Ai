import React from 'react';
import ReactDOM from 'react-dom/client';
// --- 1. Import BrowserRouter ---
import { BrowserRouter } from 'react-router-dom'; 
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* --- 2. Wrap your App component like this --- */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);