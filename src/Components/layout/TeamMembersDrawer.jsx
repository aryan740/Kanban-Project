import React, { useState, useEffect } from 'react';
import { useTasks } from '../../Context/TaskContext';
import { X, Users, Search, Copy, Check, User } from 'lucide-react';

function getInitials(name) {
  if (!name) return '?';
  return name.slice(0, 1).toUpperCase();
}

export default function TeamMembersDrawer({ isOpen, onClose, members, activePresence, tasks }) {
  const { state, profile } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const memberList = Array.isArray(members) && members.length > 0
    ? members
    : (Array.isArray(state?.orgMembers) ? state.orgMembers : []);
  const presenceList = Array.isArray(activePresence) ? activePresence : (Array.isArray(state?.activePresence) ? state.activePresence : []);
  const taskList = Array.isArray(tasks) ? tasks : (Array.isArray(state?.tasks) ? state.tasks : []);

  const onlineUsernames = new Set(presenceList.map(p => p?.name));

  const filteredMembers = memberList.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const usernameMatch = m?.username && m.username.toLowerCase().includes(q);
    const emailMatch = m?.email && m.email.toLowerCase().includes(q);
    const roleMatch = m?.role && m.role.toLowerCase().includes(q);
    return usernameMatch || emailMatch || roleMatch;
  });

  const handleCopyOrgId = () => {
    if (!profile?.org_id) return;
    navigator.clipboard.writeText(profile.org_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatJoinDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, {
      month: 'short',
      year: 'numeric'
    });
  };

  const getRoleBadgeStyle = (roleStr) => {
    const r = String(roleStr || '').toLowerCase();
    if (r === 'admin') return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
    if (r === 'manager') return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end transition-opacity"
      onClick={onClose}
    >
      <aside 
        className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col select-none relative"
        onClick={(e) => e.stopPropagation()}
        aria-label="Team members"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Team Members</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {memberList.length}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Manage workspace members and their roles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {profile?.org_id && (
              <button
                type="button"
                onClick={handleCopyOrgId}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors cursor-pointer"
                title="Copy Organization ID"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Org ID'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              aria-label="Close team members"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members by username or role..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Member Roster List */}
        <div className="flex-1 space-y-2.5 overflow-y-auto p-4 bg-slate-50/30 dark:bg-slate-900">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => {
              const username = member?.username || member?.display_name || member?.email || 'Unnamed member';
              const isOnline = onlineUsernames.has(username);
              const assignedCount = taskList.filter((t) => !t?.isDeleted && (t?.assigned_to === username || t?.assignedTo === username)).length;
              const isCurrentUser = profile?.username === username || profile?.id === member?.id;
              const joinDate = formatJoinDate(member?.created_at);

              return (
                <div 
                  key={member.id || username} 
                  className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-800/60 transition-all"
                >
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-sm">
                    {getInitials(username)}
                    <span 
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-800 ${
                        isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                      }`} 
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                        {username}
                      </p>
                      {isCurrentUser && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          You
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{assignedCount} tasks assigned</span>
                      {joinDate && (
                        <>
                          <span>•</span>
                          <span>Joined {joinDate}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${getRoleBadgeStyle(member?.role)}`}>
                      {member?.role || 'member'}
                    </span>
                    <span className={`text-[9px] font-semibold ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-white dark:border-slate-800 dark:bg-slate-800/40">
              <User className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                No organization members found.
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {searchQuery ? 'Try clearing your search query.' : 'Share the Org ID to invite team members.'}
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
