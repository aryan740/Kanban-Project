import React, { useState, useEffect } from 'react';
import { useTasks } from '../../context/TaskContext';
import { supabase } from '../../lib/supabaseClient';
import { Building2, X, Edit2, Check } from 'lucide-react';

export default function OrganizationPanel({ isOpen, onClose, profile: propProfile, memberCount }) {
  const { state, dispatch, profile: contextProfile } = useTasks();

  // Prefer context profile but fallback to prop profile to maintain existing props contracts securely
  const currentProfile = contextProfile || propProfile;
  const isAdmin = currentProfile?.role === 'admin';

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(state.orgName || '');
  const [submitting, setSubmitting] = useState(false);

  // Keep internal input value synchronized when global real-time state mutations occur
  useEffect(() => {
    setInputValue(state.orgName || '');
  }, [state.orgName]);

  if (!isOpen) return null;

  const handleSaveOrgName = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert('RBAC Authorization Error: Mutation permission locked to Administrative scope.');
    if (!inputValue.trim()) return alert('Organization name string sequence cannot be blank.');

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .upsert({
          id: currentProfile.org_id,
          name: inputValue.trim(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;

      // Local context modification dispatch to guarantee zero-refresh screen updates
      dispatch({ type: 'SET_ORG_NAME', payload: inputValue.trim() });
      setIsEditing(false);
    } catch (err) {
      console.error("Multi-tenant organization modification query failure:", err.message);
      alert(`Database operation rejected: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm select-none animate-fade-in">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 transition-all duration-300" aria-labelledby="organization-panel-title">
        
        {/* Header Block Layer */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-500" />
            <h2 id="organization-panel-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Organization
            </h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors" 
            aria-label="Close organization panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Data Matrix Grid Display */}
        <dl className="grid grid-cols-2 gap-4 p-5 text-sm">
          <div className="col-span-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80">
            <dt className="text-xs font-medium text-slate-400">Organization name</dt>
            
            {isEditing && isAdmin ? (
              <form onSubmit={handleSaveOrgName} className="flex items-center gap-2 mt-1.5">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter organization title..."
                  className="flex-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:border-indigo-600 focus:outline-none text-slate-800 dark:text-white transition-all"
                  maxLength={50}
                  required
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm cursor-pointer disabled:opacity-50"
                  title="Commit changes"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setInputValue(state.orgName || ''); }}
                  className="p-1.5 bg-slate-200 dark:bg-slate-750 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                  title="Cancel editing"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className={state.orgName ? '' : 'text-rose-400/80 italic font-medium text-xs px-0.5'}>
                  {state.orgName || 'Not configured'}
                </span>
                
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-colors cursor-pointer"
                    title="Edit organization profile signature"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </dd>
            )}
          </div>

          <div>
            <dt className="text-xs font-medium text-slate-400">Organization ID</dt>
            <dd className="mt-1 break-all font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {currentProfile?.org_id || 'Unavailable'}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium text-slate-400">Members</dt>
            <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
              {memberCount} Operators
            </dd>
          </div>

          <div className="col-span-2">
            <dt className="text-xs font-medium text-slate-400">Your role</dt>
            <dd className="mt-1 inline-flex rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold capitalize text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30">
              {currentProfile?.role || 'Unavailable'}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}