import React from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';

export default function NotificationCenter({ isOpen, onClose, notifications, unreadCount, onMarkAllRead }) {
  if (!isOpen) return null;

  return (
    <section className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900" aria-label="Notifications">
      <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-700">
        <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-indigo-500" /><div><h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h2><p className="text-xs text-slate-400">{unreadCount} unread</p></div></div>
        <div className="flex items-center gap-1"><button type="button" onClick={onMarkAllRead} className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800" title="Mark all as read"><CheckCheck className="h-4 w-4" /></button><button type="button" onClick={onClose} className="rounded-md p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close notifications"><X className="h-4 w-4" /></button></div>
      </div>
      <div className="max-h-96 overflow-y-auto p-2">
        {notifications.map((notification) => <article key={notification.id} className="rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800"><p className="text-sm font-medium text-slate-800 dark:text-slate-100">{notification.title}</p><p className="mt-0.5 text-xs text-slate-400">{notification.detail}</p><time className="mt-1 block text-[10px] font-medium text-slate-400">{new Date(notification.timestamp).toLocaleString()}</time></article>)}
        {notifications.length === 0 && <div className="p-8 text-center text-xs text-slate-400">No task or membership events are available yet.</div>}
      </div>
    </section>
  );
}
