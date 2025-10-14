import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { loadProdigySansFonts } from './fonts';

// Load fonts before rendering
loadProdigySansFonts();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      {/* <ZoomInSection sectionNumber={1} text="Welcome to Section One" /> */}
      {/* <ZoomInSection sectionNumber={1} text="Welcome to the Future" />
      <ZoomInSection sectionNumber={2} text="Experience the Zoom Effect" />
      <ZoomInSection sectionNumber={3} text="Scroll to Explore More" /> */}
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
