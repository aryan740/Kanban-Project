import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Layers, Lock, Mail, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Verification email dispatched! Active parameters updating.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setErrorMsg(err.message || 'System identity validation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 relative overflow-hidden select-none">
      
      {/* 3D Ambient Blur Lighting Vector Layers */}
      <div className="absolute top-[-25%] left-[-15%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-35 pointer-events-none" />

      {/* Structured Glassmorphic 3D Component Node */}
      <div className="w-full max-w-[380px] bg-white/85 border border-white/80 rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.01)] backdrop-blur-lg relative z-10 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-10px_rgba(15,23,42,0.12)]">
        
        {/* Central Clean Branding Core */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-[0_6px_16px_-4px_rgba(79,70,229,0.35)] mb-3 transform transition-transform hover:rotate-6">
            <Layers className="w-[18px] h-[18px]" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Synapse</h2>
          <p className="text-[11px] font-medium text-slate-400/90 max-w-[240px] mt-1 leading-normal">
            Keep your tasks organized, track progress, and manage work effortlessly.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100/60 text-rose-600 p-2.5 rounded-xl text-[11px] font-semibold mb-4 text-center">
            {errorMsg}
          </div>
        )}

        {/* Action Direct Input Fields Stack */}
        <form onSubmit={handleAuth} className="space-y-3.5">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-0.5">
              Account Email
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-[40px] pr-4 py-2.5 bg-slate-50/60 border border-slate-200/60 rounded-xl text-xs font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 focus:outline-none text-slate-800 transition-all placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-0.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-[40px] pr-4 py-2.5 bg-slate-50/60 border border-slate-200/60 rounded-xl text-xs font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 focus:outline-none text-slate-800 transition-all placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold shadow-[0_4px_10px_rgba(15,23,42,0.12)] transition-all flex items-center justify-center gap-1.5 disabled:bg-slate-200 mt-4 cursor-pointer"
          >
            {isSignUp ? <UserPlus className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
            <span>{loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5 ml-0.5" />}
          </button>
        </form>

        {/* Dynamic Context Matrix Toggler */}
        <div className="text-center mt-5 pt-4 border-t border-slate-100">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}