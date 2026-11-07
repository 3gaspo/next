import { ScreenBoundary } from './ScreenBoundary';
import { Suspense } from 'react';
import { StateFeedback } from './StateFeedback';
import { Outlet } from 'react-router-dom';
import { Home, Database, BarChart2, Settings } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';
import { ActionButton } from '@3gaspo/app-ui/ActionButton';
import { ACTIONS } from '@3gaspo/app-ui/labels';
import { useData } from '../hooks/useData';

const items = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/database', icon: Database, label: 'Database' },
  { to: '/stats', icon: BarChart2, label: 'Statistics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const { loadError, fetchData } = useData();
  return <div className="app-shell bg-ui-page text-ui-text flex flex-col font-sans transition-colors duration-300">
    <main className="flex-1 min-w-0"><ScreenBoundary>{loadError ? (
      <div className="app-page">
        <StateFeedback kind="error" title={loadError}>
          <ActionButton onClick={fetchData} busyLabel="Loading…" className="ui-button ui-button-primary">{ACTIONS.retry}</ActionButton>
        </StateFeedback>
      </div>
    ) : <Suspense fallback={<div className="app-page"><StateFeedback kind="loading" /></div>}><Outlet /></Suspense>}</ScreenBoundary></main>
    <BottomNavigation items={items} />
  </div>;
}
