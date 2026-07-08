import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Database, BarChart2, Settings } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-500">
      {/* Main Content */}
      <main className="flex-1 pb-24 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-around px-2 z-50">
        <NavItem to="/home" icon={<Home size={22} />} label="Home" />
        <NavItem to="/database" icon={<Database size={22} />} label="Database" />
        <NavItem to="/stats" icon={<BarChart2 size={22} />} label="Stats" />
        <NavItem to="/settings" icon={<Settings size={22} />} label="Settings" />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center space-y-1 w-16 h-16 rounded-2xl transition-all duration-200",
          isActive 
            ? "text-black dark:text-white" 
            : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400"
        )
      }
    >
      <div className="flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </NavLink>
  );
}
