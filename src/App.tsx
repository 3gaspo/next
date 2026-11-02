import { ScreenBoundary } from './components/ScreenBoundary';
import { StateFeedback } from './components/StateFeedback';
import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
const Database = lazy(() => import('./pages/Database'));
const Stats = lazy(() => import('./pages/Stats'));
const Settings = lazy(() => import('./pages/Settings'));
const Auth = lazy(() => import('./pages/Auth'));
import { useData } from './hooks/useData';

export default function App() {
  const { user, settings, loading } = useData();

  useEffect(() => {
    // Apply initial theme
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  if (loading) return <div className="min-h-screen bg-ui-page flex items-center justify-center"><StateFeedback kind="loading" /></div>;

  if (!user) {
    return <ScreenBoundary><Suspense fallback={<StateFeedback kind="loading" />}><Auth /></Suspense></ScreenBoundary>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="database" element={<Database />} />
          <Route path="stats" element={<Stats />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
