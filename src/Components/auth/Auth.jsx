import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Layers, Lock, Mail, ArrowRight, UserPlus, LogIn, ShieldAlert, Briefcase } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('admin'); // admin or worker selector state
  const [targetOrgId, setTargetOrgId] = useState(''); // Only evaluated if target is worker role
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !username)) return;

    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        // Step 1: Initialize Auth instance state
        const { data: authData, error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { display_name: username } }
        });
        
        if (signUpError) throw signUpError;

        if (authData?.user) {
          // Generate deterministic Organization links
          const resolvedOrgId = role === 'admin' ? `org_${Math.random().toString(36).substr(2, 9)}` : targetOrgId.trim();
          
          if (role === 'worker' && !resolvedOrgId) {
            throw new Error('Valid target Organization Token/ID is mandatory for Worker deployment.');
          }

          // Step 2: Push structural details directly into profiles schema table
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: authData.user.id,
              username: username,
              role: role,
              org_id: resolvedOrgId,
              updated_at: new Date().toISOString()
            }]);

          if (profileError) throw profileError;

          // Step 3: Initialize the Org Matrix Row if User registers as Admin
          if (role === 'admin') {
            const { error: boardError } = await supabase
              .from('boards')
              .insert([{ org_id: resolvedOrgId, tasks: [], updated_at: new Date().toISOString() }]);
            if (boardError) console.error("Initial Board Matrix creation skipped:", boardError.message);
            
            alert(`Organization created! Token for your Workers to join: ${resolvedOrgId}`);
          } else {
            alert('Worker registration query successful! Awaiting verification link validation.');
          }
        }
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
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-950 px-4 relative overflow-hidden select-none transition-colors duration-300">
      
      {/* 3D Ambient Blur Lighting Vector Layers */}
      <div className="absolute top-[-25%] left-[-15%] w-[600px] h-[600px] bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[500px] h-[500px] bg-sky-200/30 dark:bg-sky-900/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-35 dark:opacity-20 pointer-events-none" />

      {/* Structured Glassmorphic 3D Component Node */}
      <div className="w-full max-w-[400px] bg-white/85 dark:bg-slate-900/80 border border-white/80 dark:border-slate-800/80 rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.08)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-lg relative z-10 transform transition-all duration-300">
        
        {/* Central Clean Branding Core */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-[0_6px_16px_-4px_rgba(79,70,229,0.35)] mb-3">
            <Layers className="w-[18px] h-[18px]" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Synapse Enterprise Matrix</h2>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400 max-w-[260px] mt-1 leading-normal">
            High-performance workspace orchestration module with unified user access rules.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100/60 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 p-2.5 rounded-xl text-[11px] font-semibold mb-4 text-center">
            {errorMsg}
          </div>
        )}

        {/* Action Direct Input Fields Stack */}
        <form onSubmit={handleAuth} className="space-y-3">
          {isSignUp && (
            <>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-0.5">
                  Display Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., aryan_admin"
                  className="w-full px-3.5 py-2 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-medium focus:border-indigo-600 focus:outline-none text-slate-800 dark:text-white transition-all"
                  required
                />
              </div>

              {/* Dynamic RBAC Selector Switch Matrix */}
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-0.5">
                  Corporate Security Role
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${role === 'admin' ? 'bg-slate-950 border-slate-950 text-white dark:bg-indigo-600 dark:border-indigo-600' : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-800'}`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" /> Workspace Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('worker')}
                    className={`p-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${role === 'worker' ? 'bg-slate-950 border-slate-950 text-white dark:bg-indigo-600 dark:border-indigo-600' : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-800'}`}
                  >
                    <Briefcase className="w-3.5 h-3.5" /> Org Worker
                  </button>
                </div>
              </div>

              {role === 'worker' && (
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-0.5">
                    Target Organization Token
                  </label>
                  <input
                    type="text"
                    value={targetOrgId}
                    onChange={(e) => setTargetOrgId(e.target.value)}
                    placeholder="Paste org_xxxxx token given by your Admin"
                    className="w-full px-3.5 py-2 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-medium focus:border-indigo-600 focus:outline-none text-slate-800 dark:text-white transition-all placeholder:text-rose-400/70"
                    required={role === 'worker'}
                  />
                </div>
              )}
            </>
          )}

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
                className="w-full pl-[40px] pr-4 py-2 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-medium focus:border-indigo-600 focus:outline-none text-slate-800 dark:text-white transition-all"
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
                className="w-full pl-[40px] pr-4 py-2 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-medium focus:border-indigo-600 focus:outline-none text-slate-800 dark:text-white transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:bg-slate-200 dark:disabled:bg-slate-800 mt-4 cursor-pointer"
          >
            {isSignUp ? <UserPlus className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
            <span>{loading ? 'Processing...' : isSignUp ? 'Create Corporate Node' : 'Initialize Session'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5 ml-0.5" />}
          </button>
        </form>

        <div className="text-center mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors cursor-pointer"
          >
            {isSignUp ? 'Return to Unified Sign In Log' : "Provision New Account Workspace"}
          </button>
        </div>

      </div>
    </div>
  );
}