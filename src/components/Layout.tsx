import { ScreenBoundary } from './ScreenBoundary';
import { Suspense } from 'react';
import { StateFeedback } from './StateFeedback';
import { Outlet } from 'react-router-dom';
import { Home, Database, BarChart2, Settings } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';

const items = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/database', icon: Database, label: 'Database' },
  { to: '/stats', icon: BarChart2, label: 'Statistics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  return <div className="app-shell bg-ui-page text-ui-text flex flex-col font-sans transition-colors duration-300">
    <main className="flex-1 min-w-0"><ScreenBoundary><Suspense fallback={<div className="app-page"><StateFeedback kind="loading" /></div>}><Outlet /></Suspense></ScreenBoundary></main>
    <BottomNavigation items={items} />
  </div>;
}
