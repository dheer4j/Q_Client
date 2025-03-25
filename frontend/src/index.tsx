import React from 'react';
import ReactDOM from 'react-dom/client';
// Add basic styles directly to avoid dependency on external CSS files
import App from './App';
import reportWebVitals from './reportWebVitals';

// Add inline styles to ensure body/html take full height and a nice background color
const styleEl = document.createElement('style');
document.head.appendChild(styleEl);
styleEl.innerHTML = `
  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: #f5f7fb;
  }
`;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
