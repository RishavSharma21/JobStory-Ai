import React from 'react';
import ReactDOM from 'react-dom/client';
// --- 1. Import BrowserRouter ---
import { BrowserRouter } from 'react-router-dom';
import App from './App';



import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "958189206560-nuarhptk9ja3vo5qv9p5ags7m8cmouse.apps.googleusercontent.com"}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);