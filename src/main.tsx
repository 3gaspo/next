import { MotionConfig } from 'motion/react';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { DataProvider } from './hooks/useData';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><MotionConfig reducedMotion="user" transition={{ duration: 0.15 }}>
    <DataProvider>
      <App />
    </DataProvider>
  </MotionConfig></StrictMode>,
);
