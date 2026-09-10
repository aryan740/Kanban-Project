import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { X, Clock, User, Activity, Download, Calendar, UserCheck } from 'lucide-react';

export default function AuditSidebar({ task, onClose }) {
  const [dbLogs, setDbLogs] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!task?.id) return;
    let isMounted = true;

    const fetchTaskLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('task_logs')
          .select('*')
          .eq('task_id', task.id)
          .order('created_at', { ascending: false });

        if (!error && data && isMounted) {
          setDbLogs(data);
        } else if (isMounted) {
          setDbLogs([]);
        }
      } catch (err) {
        if (isMounted) setDbLogs([]);
      }
    };

    fetchTaskLogs();
    return () => { isMounted = false; };
  }, [task?.id]);

  if (!task) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    let date;
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-').map(Number);
      date = new Date(y, m - 1, d);
    } else {
      date = new Date(dateStr);
    }
    if (isNaN(date.getTime())) return 'No due date';
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  const formatPriority = (priorityStr) => {
    if (!priorityStr) return 'Medium';
    const p = String(priorityStr).toLowerCase();
    return p.charAt(0).toUpperCase() + p.slice(1);
  };

  const getStatusBadgeStyle = (statusStr) => {
    const s = String(statusStr || '').toLowerCase();
    if (s === 'done') return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    if (s === 'in_progress' || s === 'in-progress') return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
    if (s === 'todo') return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
    return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  };

  const getPriorityBadgeStyle = (priorityStr) => {
    const p = String(priorityStr || '').toLowerCase();
    if (p === 'high') return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    if (p === 'medium') return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  };

  const getTimelineEvents = () => {
    if (dbLogs.length > 0) {
      return dbLogs.map((log) => ({
        title: log.action || 'Activity Logged',
        details: log.details || 'Task record updated.',
        timestamp: log.created_at || log.timestamp,
        user: log.operator || 'System'
      }));
    }

    const rawLogs = Array.isArray(task.logs) && task.logs.length > 0
      ? task.logs
      : (Array.isArray(task.activity) && task.activity.length > 0 ? task.activity : null);

    if (rawLogs) {
      return rawLogs.map((log) => ({
        title: log.action || log.title || 'Activity Logged',
        details: log.details || log.message || log.description || 'Task record updated.',
        timestamp: log.timestamp || log.created_at || task.updated_at || task.created_at,
        user: log.user || log.operator || log.created_by || 'System'
      }));
    }

    const fallback = [];

    if (task.created_at || task.createdAt) {
      fallback.push({
        title: 'Task Created',
        details: `Created task "${task.title || 'Untitled'}"`,
        timestamp: task.created_at || task.createdAt,
        user: task.creator || task.created_by || 'System'
      });
    }

    const assignee = task.assigned_to || task.assignedTo;
    fallback.push({
      title: 'Assigned To',
      details: assignee ? `Assigned to ${assignee}` : 'Task is unassigned',
      timestamp: task.updated_at || task.updatedAt || task.created_at || task.createdAt,
      user: assignee || 'Unassigned'
    });

    fallback.push({
      title: 'Current Status',
      details: `Status is currently ${formatStatus(task.status || 'todo')}`,
      timestamp: task.updated_at || task.updatedAt || task.created_at || task.createdAt,
      user: 'System'
    });

    return fallback;
  };

  const timelineEvents = getTimelineEvents();

  const exportActivityData = (format) => {
    let fileContent = '';
    let mimeType = '';
    let fileExtension = '';

    if (format === 'json') {
      const exportObject = {
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assigned_to || task.assignedTo || 'Unassigned',
        dueDate: task.due_date || task.dueDate || null,
        exportedAt: new Date().toISOString(),
        activityHistory: timelineEvents
      };
      fileContent = JSON.stringify(exportObject, null, 2);
      mimeType = 'application/json';
      fileExtension = 'json';
    } else if (format === 'csv') {
      const headers = ['Timestamp', 'Activity', 'User', 'Details'];
      const rows = timelineEvents.map(event => [
        `"${event.timestamp ? formatDateTime(event.timestamp) : ''}"`,
        `"${event.title || ''}"`,
        `"${event.user || ''}"`,
        `"${event.details || ''}"`
      ]);
      fileContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      mimeType = 'text/csv';
      fileExtension = 'csv';
    }

    const blob = new Blob([fileContent], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `task_activity_${task.id || 'export'}.${fileExtension}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const assignedUser = task.assigned_to || task.assignedTo || 'Unassigned';
  const dueDateDisplay = formatDate(task.due_date || task.dueDate);

  return (
    <div 
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end transition-opacity"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col select-none relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Task Activity & Details
              </h3>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                History and details for this task
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Close activity sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task Details Summary */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/60 space-y-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
              {task.title || 'Untitled Task'}
            </h4>
            {task.description && (
              <p className="text-xs font-normal text-slate-600 dark:text-slate-400 mt-1 line-clamp-3">
                {task.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Status:</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadgeStyle(task.status)}`}>
                {formatStatus(task.status)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Priority:</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityBadgeStyle(task.priority)}`}>
                {formatPriority(task.priority)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-medium truncate">{assignedUser}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-medium">{dueDateDisplay}</span>
            </div>
          </div>

          {/* Export Activity Actions */}
          <div className="pt-2 flex items-center gap-2 border-t border-dashed border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Download className="w-3 h-3" /> Export Activity:
            </span>
            <button 
              onClick={() => exportActivityData('csv')}
              className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded transition-all cursor-pointer"
            >
              CSV
            </button>
            <button 
              onClick={() => exportActivityData('json')}
              className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded transition-all cursor-pointer"
            >
              JSON
            </button>
          </div>
        </div>

        {/* Timeline View */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white dark:bg-slate-900">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            Timeline History
          </h4>

          {timelineEvents.map((event, index) => (
            <div key={index} className="relative flex gap-3.5 items-start group">
              {index !== timelineEvents.length - 1 && (
                <span className="absolute left-[11px] top-6 bottom-[-16px] w-0.5 bg-slate-100 dark:bg-slate-800" />
              )}

              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 z-10 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 group-hover:border-indigo-200 dark:group-hover:border-indigo-800 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all">
                <Clock className="w-3.5 h-3.5" />
              </div>

              <div className="flex-1 space-y-1 bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {event.title}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
                    {event.timestamp ? formatDateTime(event.timestamp) : ''}
                  </span>
                </div>

                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-normal">
                  {event.details}
                </p>

                <div className="pt-1.5 flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <User className="w-3 h-3" />
                  <span className="truncate max-w-[180px] text-slate-600 dark:text-slate-400">{event.user}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
