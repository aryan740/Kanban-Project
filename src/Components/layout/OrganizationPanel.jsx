import React from 'react';
import { Building2, X } from 'lucide-react';

export default function OrganizationPanel({ isOpen, onClose, profile, memberCount }) {
  if (!isOpen) return null;

  const organizationName = profile?.organization_name || profile?.org_name || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900" aria-labelledby="organization-panel-title">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-700">
          <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-indigo-500" /><h2 id="organization-panel-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">Organization</h2></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200" aria-label="Close organization panel"><X className="h-4 w-4" /></button>
        </div>
        <dl className="grid grid-cols-2 gap-4 p-5 text-sm">
          <div className="col-span-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><dt className="text-xs font-medium text-slate-400">Organization name</dt><dd className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{organizationName || 'Not configured'}</dd></div>
          <div><dt className="text-xs font-medium text-slate-400">Organization ID</dt><dd className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-300">{profile?.org_id || 'Unavailable'}</dd></div>
          <div><dt className="text-xs font-medium text-slate-400">Members</dt><dd className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{memberCount}</dd></div>
          <div className="col-span-2"><dt className="text-xs font-medium text-slate-400">Your role</dt><dd className="mt-1 inline-flex rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold capitalize text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">{profile?.role || 'Unavailable'}</dd></div>
        </dl>
      </section>
    </div>
  );
}
