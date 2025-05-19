import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { BoardProvider } from './context/BoardContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Remove StrictMode to prevent double rendering with drag and drop
  <BoardProvider>
    <App />
  </BoardProvider>
);
