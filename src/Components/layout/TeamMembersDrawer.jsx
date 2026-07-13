import React from 'react';
import { X, Users } from 'lucide-react';

function initials(username) {
  return (username || '?').slice(0, 1).toUpperCase();
}

export default function TeamMembersDrawer({ isOpen, onClose, members, activePresence, tasks }) {
  if (!isOpen) return null;

  const onlineNames = new Set((activePresence || []).map((presence) => presence.name));

  return (
    <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900" aria-label="Team members">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Team members</h2>
            <p className="text-xs text-slate-400">{members.length} workspace members</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200" aria-label="Close team members">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {members.map((member) => {
          const isOnline = onlineNames.has(member.username);
          const assignedCount = tasks.filter((task) => !task.isDeleted && task.assignedTo === member.username).length;
          return (
            <div key={member.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                {initials(member.username)}
                <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-800 ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{member.username || 'Unnamed member'}</p>
                <p className="text-xs capitalize text-slate-400">{member.role || 'member'} · {assignedCount} assigned</p>
              </div>
              <span className={`text-[10px] font-semibold ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          );
        })}
        {members.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400 dark:border-slate-700">No organization members are available.</p>}
      </div>
    </aside>
  );
}
