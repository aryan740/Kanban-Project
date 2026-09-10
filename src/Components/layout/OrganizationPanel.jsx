import React, { useState, useEffect } from 'react';
import { useTasks } from '../../Context/TaskContext';
import { supabase } from '../../lib/supabaseClient';
import { Building2, X, Edit2, Check, Copy } from 'lucide-react';

export default function OrganizationPanel({ isOpen, onClose, profile: propProfile, memberCount }) {
  const { state, dispatch, profile: contextProfile } = useTasks();

  const currentProfile = contextProfile || propProfile;
  const isAdmin = currentProfile?.role === 'admin';

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(state.orgName || '');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInputValue(state.orgName || '');
  }, [state.orgName]);

  if (!isOpen) return null;

  const handleCopyOrgId = async () => {
    const orgId = currentProfile?.org_id;
    if (!orgId) return;

    try {
      await navigator.clipboard.writeText(orgId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy Org ID:', err);
    }
  };

  const handleSaveOrgName = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert('Only admins can update the organization name.');
    if (!inputValue.trim()) return alert('Please enter an organization name.');

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

      dispatch({ type: 'SET_ORG_NAME', payload: inputValue.trim() });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update organization:', err.message);
      alert(`Update failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm select-none animate-fade-in">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 transition-all duration-300" aria-labelledby="organization-panel-title">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-500" />
            <h2 id="organization-panel-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Organization Settings
            </h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors" 
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Details */}
        <dl className="grid grid-cols-2 gap-4 p-5 text-sm">
          {/* Org Name */}
          <div className="col-span-2 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80">
            <dt className="text-xs font-medium text-slate-400">Organization Name</dt>
            
            {isEditing && isAdmin ? (
              <form onSubmit={handleSaveOrgName} className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter organization name..."
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:border-indigo-600 focus:outline-none text-slate-800 dark:text-white transition-all"
                  maxLength={50}
                  required
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm cursor-pointer disabled:opacity-50"
                  title="Save"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setInputValue(state.orgName || ''); }}
                  className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <dd className="mt-1.5 font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                <span className={state.orgName ? '' : 'text-slate-400 italic font-normal text-xs'}>
                  {state.orgName || 'Unnamed Organization'}
                </span>
                
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-colors cursor-pointer"
                    title="Edit name"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </dd>
            )}
          </div>

          {/* Org ID with Copy Button */}
          <div className="col-span-2 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80">
            <dt className="text-xs font-medium text-slate-400">Organization ID</dt>
            <dd className="mt-1.5 flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                {currentProfile?.org_id || 'Unavailable'}
              </span>
              {currentProfile?.org_id && (
                <button
                  type="button"
                  onClick={handleCopyOrgId}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors cursor-pointer"
                  title="Copy Org ID"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[11px]">Copy ID</span>
                    </>
                  )}
                </button>
              )}
            </dd>
          </div>

          {/* Member Count */}
          <div>
            <dt className="text-xs font-medium text-slate-400">Team Size</dt>
            <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
              {memberCount || 1} {memberCount === 1 ? 'member' : 'members'}
            </dd>
          </div>

          {/* User Role */}
          <div>
            <dt className="text-xs font-medium text-slate-400">Your Role</dt>
            <dd className="mt-1 inline-flex rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30">
              {currentProfile?.role || 'Member'}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}