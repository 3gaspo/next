import React, { useState } from 'react';
import { motion } from 'motion/react';
import { authProvider } from '../services/providerFactory';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useData } from '../hooks/useData';

export default function Auth() {
  const { settings } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await authProvider.signIn(email, password);
      } else {
        await authProvider.signUp(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col justify-between p-6 transition-colors duration-300">
      {/* Top Header */}
      <header className="flex items-center gap-2.5 w-full max-w-md mx-auto">
        <img 
          src="/next.svg" 
          alt="Next Icon" 
          className="w-8 h-8 dark:invert transition-all"
          onError={(e) => {
            (e.target as any).src = 'https://placehold.co/32x32?text=Next';
          }}
        />
        <span className="font-bold tracking-tight text-lg">Next</span>
      </header>

      {/* Auth Card Container */}
      <main className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-white dark:bg-zinc-900 p-8 sm:p-10 rounded-[32px] shadow-xl border border-zinc-100 dark:border-zinc-800/50 space-y-8"
        >
          {/* Headline */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              {isLogin ? 'Welcome back' : 'Get started'}
            </h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium">
              {isLogin 
                ? 'Sign in to access your priority task matrix.' 
                : 'Create an account to start prioritizing deterministically.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
              <input 
                type="email" 
                value={email} 
                required
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                disabled={loading}
                className="w-full h-14 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
              <input 
                type={showPass ? 'text' : 'password'} 
                value={password} 
                required
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                disabled={loading}
                className="w-full h-14 pl-12 pr-12 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all text-zinc-900 dark:text-zinc-100"
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 dark:text-red-400 text-xs font-semibold px-2"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Tab */}
          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer credit */}
      <footer className="w-full max-w-md mx-auto text-center text-xs text-zinc-400 dark:text-zinc-500 py-4 font-medium">
        Next — Deterministic Priority-Based Task Management
      </footer>
    </div>
  );
}
