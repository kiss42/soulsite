import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Get the root element
const rootElement = document.getElementById('root');

// Create the root with ReactDOM.createRoot
const root = ReactDOM.createRoot(rootElement);

// Render the App component
root.render(<App />);
