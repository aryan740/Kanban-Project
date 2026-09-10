import React, { useState, useEffect, useCallback } from 'react';
import { useTasks } from '../../Context/TaskContext';
import { supabase } from '../../lib/supabaseClient';
import { X, RefreshCw, Trash2, History, CheckCircle2, Clock } from 'lucide-react';

export default function GlobalLogCenter({ isOpen, onClose }) {
  const { state, dispatch, profile, fetchTasks } = useTasks();
  const [activeTab, setActiveTab] = useState('deleted');
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [loadingDeleted, setLoadingDeleted] = useState(false);

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

  const fetchDeletedTasks = useCallback(async () => {
    if (!profile?.org_id) return;
    setLoadingDeleted(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('org_id', profile.org_id)
        .eq('is_deleted', true)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setDeletedTasks(data);
      } else if (error) {
        console.error('Failed to fetch deleted tasks:', error.message);
      }
    } catch (err) {
      console.error('Error fetching deleted tasks:', err.message);
    } finally {
      setLoadingDeleted(false);
    }
  }, [profile?.org_id]);

  useEffect(() => {
    if (isOpen) {
      fetchDeletedTasks();
    }
  }, [isOpen, fetchDeletedTasks]);

  if (!isOpen) return null;

  const tasks = Array.isArray(state?.tasks) ? state.tasks : [];

  const activeTasks = tasks.filter(
    task => !task?.is_deleted && !task?.isDeleted && task?.status !== 'archived'
  );

  const recentTasks = [...activeTasks].sort((a, b) => {
    const dateA = new Date(a.updated_at || a.updatedAt || a.created_at || a.createdAt || 0);
    const dateB = new Date(b.updated_at || b.updatedAt || b.created_at || b.createdAt || 0);
    return dateB - dateA;
  }).slice(0, 15);

  const canPermanentlyDelete = profile?.role === 'admin' || profile?.role === 'manager';

  const handleRestore = async (taskId) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_deleted: false, status: 'todo', updated_at: new Date().toISOString() })
      .eq('id', taskId);

    if (error) {
      console.error('Failed to restore task:', error.message);
      alert(`Restore failed: ${error.message}`);
      return;
    }

    setDeletedTasks(prev => prev.filter(t => t.id !== taskId));

    if (fetchTasks) {
      await fetchTasks();
    }
  };

  const handlePermanentDelete = async (taskId) => {
    if (!window.confirm('Permanently delete this task from Supabase? This cannot be undone.')) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Permanent deletion failed:', error.message);
      alert(`Permanent deletion failed: ${error.message}`);
      return;
    }

    setDeletedTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStatus = (statusStr) => {
    if (!statusStr) return 'Backlog';
    const s = String(statusStr).toLowerCase();
    if (s === 'in_progress' || s === 'in-progress') return 'In Progress';
    if (s === 'todo') return 'To Do';
    if (s === 'done') return 'Done';
    if (s === 'backlog') return 'Backlog';
    return statusStr.charAt(0).toUpperCase() + statusStr.slice(1);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-slate-200 rounded-[24px] shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col dark:bg-slate-900 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 rounded-t-[24px] dark:border-slate-800 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide dark:text-slate-100">
                Workspace Activity & Trash
              </h3>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Manage deleted tasks and view recent workspace activity
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-slate-50/30 dark:bg-slate-900/40">
          <button
            onClick={() => setActiveTab('deleted')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'deleted'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Deleted Tasks ({deletedTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'recent'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Recent Changes ({recentTasks.length})
          </button>
        </div>

        {/* Content Stream */}
        <div className="p-6 flex-1 overflow-y-auto space-y-3">
          {activeTab === 'deleted' && (
            deletedTasks.length > 0 ? (
              deletedTasks.map(task => (
                <div 
                  key={task.id} 
                  className="border border-slate-200 bg-slate-50/50 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 dark:border-slate-800 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-700 tracking-tight line-through decoration-slate-400 dark:text-slate-300">
                        {task.title || 'Untitled Task'}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        Deleted
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Assigned: <span className="text-slate-600 dark:text-slate-400">{task.assigned_to || task.assignedTo || 'Unassigned'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleRestore(task.id)}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Restore Task</span>
                    </button>

                    {canPermanentlyDelete && (
                      <button
                        type="button"
                        onClick={() => handlePermanentDelete(task.id)}
                        className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Permanently Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-48 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs gap-2 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-800/30">
                <CheckCircle2 className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                <span className="font-medium text-xs text-slate-500 dark:text-slate-400">
                  No deleted tasks found. Everything is active.
                </span>
              </div>
            )
          )}

          {activeTab === 'recent' && (
            recentTasks.length > 0 ? (
              recentTasks.map(task => (
                <div 
                  key={task.id}
                  className="border border-slate-100 bg-white p-3.5 rounded-xl flex items-center justify-between gap-4 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="space-y-0.5 max-w-md">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {task.title || 'Untitled Task'}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                      <span>Status: <strong className="text-slate-600 dark:text-slate-300">{formatStatus(task.status)}</strong></span>
                      <span>•</span>
                      <span>Assigned: <strong className="text-slate-600 dark:text-slate-300">{task.assigned_to || task.assignedTo || 'Unassigned'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formatDateTime(task.updated_at || task.updatedAt || task.created_at || task.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-48 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs gap-2 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-800/30">
                <Clock className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                <span className="font-medium text-xs text-slate-500 dark:text-slate-400">
                  No recent changes logged.
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
