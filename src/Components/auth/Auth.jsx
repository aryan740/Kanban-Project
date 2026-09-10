import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Layers, Lock, Mail, ArrowRight, UserPlus, LogIn, Building2, User } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('admin'); // 'admin' = create org, 'employee' = join org
  const [targetOrgId, setTargetOrgId] = useState('');
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !username)) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        if (role === 'admin' && !orgName.trim()) {
          throw new Error('Please provide an Organization Name.');
        }
        if (role === 'employee' && !targetOrgId.trim()) {
          throw new Error('Please provide the Organization ID given by your Admin.');
        }

        // 1. Sign up user in Supabase Auth
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: username.trim() } }
        });

        if (signUpError) throw signUpError;
        if (!authData?.user) throw new Error('Signup failed. Please try again.');

        let resolvedOrgId = targetOrgId.trim();

        // 2. If Admin, create the organization row first
        if (role === 'admin') {
          const generatedOrgId = `org_${Math.random().toString(36).substring(2, 10)}`;
          const { error: orgError } = await supabase
            .from('organizations')
            .insert([{
              id: generatedOrgId,
              name: orgName.trim(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);

          if (orgError) throw orgError;
          resolvedOrgId = generatedOrgId;
        }

        // 3. Create user profile in profiles table (Must complete before proceeding)
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([{
            id: authData.user.id,
            username: username.trim(),
            role: role === 'admin' ? 'admin' : 'employee',
            org_id: resolvedOrgId,
            updated_at: new Date().toISOString()
          }]);

        if (profileError) {
          console.error('Profile insertion error:', profileError.message);
          throw new Error(`Profile setup failed: ${profileError.message}`);
        }

        // 4. If Supabase email confirmation is required, inform user
        if (!authData.session) {
          setSuccessMsg('Please check your email to confirm your account before logging in.');
          return;
        }

        if (role === 'admin') {
          alert(`Organization created! Your Org ID is: ${resolvedOrgId}\n(You can copy this from Organization settings later)`);
        }
      } else {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 relative overflow-hidden select-none transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-sky-200/30 dark:bg-sky-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative z-10">
        
        {/* Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-md shadow-indigo-600/20 mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isSignUp ? 'Create an Account' : 'Welcome to Synapse'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSignUp ? 'Get started with your team workspace' : 'Sign in to manage your tasks'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs font-semibold mb-4 text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 p-3 rounded-xl text-xs font-semibold mb-4 text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-3.5">
          {isSignUp && (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. aryan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:border-indigo-600 focus:outline-none text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-indigo-600 dark:border-indigo-600'
                        : 'bg-transparent text-slate-600 border-slate-200 dark:border-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" /> New Org (Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('employee')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      role === 'employee'
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-indigo-600 dark:border-indigo-600'
                        : 'bg-transparent text-slate-600 border-slate-200 dark:border-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" /> Join Team
                  </button>
                </div>
              </div>

              {role === 'admin' ? (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Acme Studio"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:border-indigo-600 focus:outline-none text-slate-800 dark:text-white"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Organization ID
                  </label>
                  <input
                    type="text"
                    value={targetOrgId}
                    onChange={(e) => setTargetOrgId(e.target.value)}
                    placeholder="Paste Org ID from your admin"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:border-indigo-600 focus:outline-none text-slate-800 dark:text-white"
                    required
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:border-indigo-600 focus:outline-none text-slate-800 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:border-indigo-600 focus:outline-none text-slate-800 dark:text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 mt-4 shadow-sm cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" /> Sign Up
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}