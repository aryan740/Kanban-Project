import React, { useMemo, useState } from 'react';
import { canAssignTasks, useTasks } from '../../Context/TaskContext';
import {
  Search,
  Plus,
  Filter,
  Layers,
  LogOut,
  Trash2,
  Bell,
  Users,
  Building2,
  Shield,
  User,
  ChevronDown,
  Building,
  CheckCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import ThemeToggle from '../shared/ThemeToggle';
import TeamMembersDrawer from './TeamMembersDrawer';
import OrganizationPanel from './OrganizationPanel';
import NotificationCenter from './NotificationCenter';

function getNotifications(tasks, members) {
  const taskNotifications = tasks.flatMap((task) => (task.logs || []).flatMap((log, index) => {
    const assigned = (log.action === 'INITIALIZATION' && task.assignedTo) || log.details?.includes('Assigned Resource');
    const updated = ['METADATA_UPDATE', 'PIPELINE_SHIFT'].includes(log.action);
    if (!assigned && !updated) return [];
    return [{
      id: `${task.id}-${log.timestamp || index}-${log.action}`,
      title: assigned ? 'Task assigned' : 'Task updated',
      detail: `${task.title}: ${log.details || 'Task activity recorded.'}`,
      timestamp: log.timestamp || task.createdAt || new Date(0).toISOString(),
    }];
  }));
  const memberNotifications = members.flatMap((member) => {
    const timestamp = member.joined_at || member.joinedAt || member.created_at || member.createdAt;
    if (!timestamp) return [];
    return [{ id: `member-${member.id}-${timestamp}`, title: 'Member joined', detail: `${member.username || 'A member'} joined the organization.`, timestamp }];
  });
  return [...taskNotifications, ...memberNotifications].sort((first, second) => new Date(second.timestamp) - new Date(first.timestamp));
}

export default function Header({ onOpenModal, onOpenGeneralLogs }) {
  const { state, dispatch, profile } = useTasks();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [isOrganizationOpen, setIsOrganizationOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('synapse_read_notifications') || '[]')); } catch { return new Set(); }
  });

  const handleSearchChange = (e) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value });
  };

  const handleFilterChange = (e) => {
    dispatch({ type: 'SET_FILTERS', payload: { priority: e.target.value } });
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to terminate your secure cloud workspace session?')) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (err) {
        alert('Logout lifecycle failed: ' + err.message);
      }
    }
  };

  const onlineCount = state.activePresence?.length || 0;
  const displayName = profile?.username || 'User';
  const roleLabel = profile?.role || 'member';
  const roleIsAdmin = roleLabel === 'admin';
  const canCreateIssue = canAssignTasks(roleLabel);
  const notifications = useMemo(() => getNotifications(state.tasks || [], state.orgMembers || []), [state.tasks, state.orgMembers]);
  const unreadCount = notifications.filter((notification) => !readNotificationIds.has(notification.id)).length;

  const markAllNotificationsRead = () => {
    const ids = new Set(notifications.map((notification) => notification.id));
    setReadNotificationIds(ids);
    localStorage.setItem('synapse_read_notifications', JSON.stringify([...ids]));
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-4 shadow-sm select-none sm:px-6 dark:border-slate-700 dark:bg-slate-900 transition-colors duration-200">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-100 transform transition-transform hover:rotate-6">
              <Layers className="w-[18px] h-[18px]" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none mb-1 truncate dark:text-slate-100">
                Synapse
              </h1>
              <p className="text-[10px] font-semibold text-slate-400 truncate">
                Workspace Pipeline Matrix
              </p>
            </div>

            <button type="button" onClick={() => setIsOrganizationOpen(true)} className="hidden lg:flex items-center gap-2 ml-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800 cursor-pointer">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <div className="min-w-0">
                <p className="text-[9px] uppercase text-slate-400 font-bold leading-none">Organization</p>
                <p className="text-xs font-bold text-slate-700 truncate dark:text-slate-200">{profile?.org_id || 'No Org'}</p>
              </div>
            </button>

            <div
              className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl border ${
                roleIsAdmin
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300'
              }`}
            >
              {roleIsAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
              <div className="min-w-0">
                <p className="text-[9px] uppercase font-bold leading-none">Role</p>
                <p className="text-xs font-bold capitalize truncate">{roleLabel}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks or tickets..."
                value={state.searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>

            {/* 🛠️ [FIX MATRIX]: Re-styled select layout container to perfectly visibility options items inside Dark mode engine natively */}
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all">
              <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 mr-2" />
              <select
                value={state.filters.priority}
                onChange={handleFilterChange}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-4 appearance-none dark:[&>option]:bg-slate-900 dark:[&>option]:text-white"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={onOpenGeneralLogs}
              className="p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-500 hover:text-indigo-600 rounded-lg transition-all shadow-sm flex items-center justify-center cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:border-indigo-500 dark:text-slate-400 dark:hover:text-indigo-300"
              title="Open General Retention Logs (Recycle Bin)"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {canCreateIssue && <button
              onClick={() => onOpenModal(null)}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full sm:w-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Issue</span>
            </button>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          <button type="button" onClick={() => setIsTeamOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 dark:border-slate-700 dark:bg-slate-800 cursor-pointer" title="View team members">
            <Users className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold leading-none">Online</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{onlineCount}</p>
            </div>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen((open) => !open)}
              className="p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-all shadow-sm flex items-center justify-center cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold px-1">{unreadCount}</span>}
            <NotificationCenter isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} notifications={notifications} unreadCount={unreadCount} onMarkAllRead={markAllNotificationsRead} />
          </div>

          <ThemeToggle />

          <div className="relative">
            <button type="button" onClick={() => setIsProfileOpen((open) => !open)} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-white dark:border-slate-700 dark:bg-slate-900 cursor-pointer text-slate-700 dark:text-slate-200" aria-expanded={isProfileOpen}>
              <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-slate-700 truncate dark:text-slate-100">{displayName}</p>
                <p className="text-[10px] text-slate-400 capitalize truncate">{roleLabel}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>
            {isProfileOpen && <div className="absolute right-0 top-12 z-40 w-52 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <button type="button" onClick={() => { setIsOrganizationOpen(true); setIsProfileOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"><Building className="h-4 w-4" />Organization details</button>
              <button type="button" onClick={markAllNotificationsRead} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"><CheckCheck className="h-4 w-4" />Mark notifications read</button>
            </div>}
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg text-slate-500 hover:text-rose-600 transition-all shadow-sm flex items-center justify-center cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-rose-950/40 dark:hover:border-rose-900 dark:text-slate-400 dark:hover:text-rose-300"
            title="Sign Out Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
      <TeamMembersDrawer isOpen={isTeamOpen} onClose={() => setIsTeamOpen(false)} members={state.orgMembers || []} activePresence={state.activePresence || []} tasks={state.tasks || []} />
      <OrganizationPanel isOpen={isOrganizationOpen} onClose={() => setIsOrganizationOpen(false)} profile={profile} memberCount={state.orgMembers?.length || 0} />
    </header>
  );
}