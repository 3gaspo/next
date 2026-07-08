import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { authProvider, firebaseReady } from '../services/providerFactory';
import { DEFAULT_PRIORITY_SETTINGS, UserSettings } from '../types';
import { downloadTasksAsCSV } from '../lib/export';
import { AnimatePresence } from 'motion/react';
import ResetModal from '../components/ResetModal';
import { 
  Settings as SettingsIcon, 
  Moon, 
  LogOut, 
  Download, 
  RotateCcw, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Heart,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const SUPPORT_URL = "https://ko-fi.com/3gaspo";

export default function Settings() {
  const { user, settings, updateSettings, tasks, clearHistory, resetAll } = useData();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '', isLogin: true, showPass: false, error: '' });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthForm(f => ({ ...f, error: '' }));
    try {
      if (authForm.isLogin) {
        await authProvider.signIn(authForm.email, authForm.password);
      } else {
        await authProvider.signUp(authForm.email, authForm.password);
      }
    } catch (err: any) {
      setAuthForm(f => ({ ...f, error: err.message || 'Authentication failed' }));
    }
  };

  const handlePriorityChange = (key: keyof typeof settings.priority, val: string) => {
    const num = Number(val);
    if (!isNaN(num)) {
      updateSettings({
        ...settings,
        priority: { ...settings.priority, [key]: num }
      });
    }
  };

  const toggleDarkMode = () => {
    const newMode = !settings.darkMode;
    updateSettings({ ...settings, darkMode: newMode });
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  return (
    <div className="px-6 pt-12 pb-24 max-w-lg mx-auto space-y-10">
      <header className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        {!firebaseReady && (
          <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-full">Dev Mode</span>
        )}
      </header>

      {/* Priority Settings */}
      <section className="bg-black/5 dark:bg-white/5 p-8 rounded-[32px] space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Priority Engine</h2>
          <button 
            onClick={() => updateSettings({ ...settings, priority: DEFAULT_PRIORITY_SETTINGS })}
            className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white"
          >
            Reset
          </button>
        </div>
        <div className="space-y-4">
          <WeightInput label="Deadline weight" value={settings.priority.deadlineWeight} onChange={(v) => handlePriorityChange('deadlineWeight', v)} />
          <WeightInput label="Age weight" value={settings.priority.ageWeight} onChange={(v) => handlePriorityChange('ageWeight', v)} />
          <WeightInput label="Importance weight" value={settings.priority.importanceWeight} onChange={(v) => handlePriorityChange('importanceWeight', v)} />
          <WeightInput label="Duration weight" value={settings.priority.durationWeight} onChange={(v) => handlePriorityChange('durationWeight', v)} />
          <WeightInput label="Effort weight" value={settings.priority.effortWeight} onChange={(v) => handlePriorityChange('effortWeight', v)} />
          <WeightInput label="Appreciation weight" value={settings.priority.appreciationWeight} onChange={(v) => handlePriorityChange('appreciationWeight', v)} />
        </div>
      </section>

      {/* Appearance */}
      <section className="bg-black/5 dark:bg-white/5 p-8 rounded-[32px] space-y-6">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Appearance</h2>
        <button 
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-[24px] shadow-sm active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500">
              <Moon size={20} />
            </div>
            <span className="font-bold">Dark Mode</span>
          </div>
          <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.darkMode ? 'bg-black dark:bg-white' : 'bg-zinc-200'}`}>
            <div className={`w-4 h-4 rounded-full transition-transform ${settings.darkMode ? 'translate-x-6 bg-white dark:bg-black' : 'bg-white'}`} />
          </div>
        </button>
      </section>

      {/* Account */}
      <section className="bg-black/5 dark:bg-white/5 p-8 rounded-[32px] space-y-6">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Account</h2>
        {user ? (
          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[24px] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-black">
                {user.email?.[0].toUpperCase() || <User size={24} />}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-0.5">Signed in as</p>
                <p className="font-bold truncate max-w-[200px] text-zinc-900 dark:text-zinc-100">{user.email}</p>
              </div>
            </div>
            <SettingsAction 
              icon={<LogOut size={20} />} 
              label="Disconnect" 
              onClick={() => authProvider.signOut()} 
            />
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-4 bg-white dark:bg-zinc-900 p-6 rounded-[24px] shadow-sm">
              <h3 className="font-bold text-lg">{authForm.isLogin ? 'Sign in' : 'Create account'}</h3>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="email" 
                  value={authForm.email} 
                  required
                  onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Email address"
                  className="w-full h-14 pl-12 pr-4 bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type={authForm.showPass ? 'text' : 'password'} 
                  value={authForm.password} 
                  required
                  onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Password"
                  className="w-full h-14 pl-12 pr-12 bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setAuthForm(f => ({ ...f, showPass: !f.showPass }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {authForm.showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {authForm.error && <p className="text-red-500 text-xs font-bold px-2">{authForm.error}</p>}
              <button 
                type="submit"
                className="w-full h-14 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold active:scale-[0.98] transition-all"
              >
                {authForm.isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>
            <button 
              type="button"
              onClick={() => setAuthForm(f => ({ ...f, isLogin: !f.isLogin }))}
              className="w-full text-center text-sm font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              {authForm.isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </form>
        )}
      </section>

      {/* Actions */}
      <section className="bg-black/5 dark:bg-white/5 p-8 rounded-[32px] space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Actions</h2>
        
        <SettingsAction 
          icon={<Download size={20} />} 
          label="Download as CSV" 
          onClick={() => downloadTasksAsCSV(tasks, settings.priority)} 
        />
        
        <SettingsAction 
          icon={<RotateCcw size={20} />} 
          label="Reset Data" 
          destructive
          onClick={() => setIsResetModalOpen(true)}
        />
      </section>

      <footer className="flex flex-col items-center gap-8 py-12 opacity-80 transition-opacity">
        <div className="flex flex-col items-center text-center gap-2">
           <img 
            src="/gaspo_logo.svg" 
            alt="Logo" 
            className="w-40 h-40 dark:invert transition-all"
            onError={(e) => {
              (e.target as any).src = 'https://placehold.co/160x160?text=Next';
            }}
          />
          <div>
            <p className="font-bold">Next — version 0.0.0</p>
            <p className="text-sm font-medium">GASPARD BERTHELIER</p>
            <p className="text-xs">gberthelier.projet@gmail.com</p>
          </div>
        </div>

        <a 
          href={SUPPORT_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 h-12 bg-black dark:bg-zinc-100 text-white dark:text-black rounded-full font-bold shadow-lg active:scale-95 transition-all"
        >
          <Heart size={16} fill="currentColor" />
          Support the project
        </a>
      </footer>

      <AnimatePresence>
        {isResetModalOpen && (
          <ResetModal 
            onClose={() => setIsResetModalOpen(false)} 
            onClearHistory={clearHistory}
            onResetAll={resetAll}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function WeightInput({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-[24px] shadow-sm">
      <span className="font-bold text-zinc-600 dark:text-zinc-300">{label}</span>
      <input 
        type="number" 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-20 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl text-right font-black focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-zinc-900 dark:text-zinc-100"
      />
    </div>
  );
}

function SettingsAction({ icon, label, onClick, destructive }: { icon: React.ReactNode; label: string; onClick: () => void; destructive?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-6 rounded-[24px] transition-all bg-white dark:bg-zinc-900 shadow-sm active:scale-[0.99] group ${destructive ? 'hover:bg-red-50 dark:hover:bg-red-950/20' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${destructive ? 'bg-red-50 dark:bg-red-950/30 text-red-500' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500'}`}>
          {icon}
        </div>
        <span className={`font-bold transition-colors ${destructive ? 'text-red-500' : ''}`}>{label}</span>
      </div>
      <ChevronRight size={20} className={destructive ? 'text-red-300' : 'text-zinc-300'} />
    </button>
  );
}
