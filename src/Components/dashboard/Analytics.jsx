import React from 'react';
import { useTasks } from '../../Context/TaskContext';
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, ListTodo } from 'lucide-react';

export default function Analytics() {
  const { state } = useTasks();
  const tasks = Array.isArray(state?.tasks) ? state.tasks : [];

  // Exclude tasks flagged as deleted
  const activeTasks = tasks.filter(t => !t?.isDeleted);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Metrics Calculation
  const totalTasks = activeTasks.length;

  const inProgressTasks = activeTasks.filter(
    t => t?.status === 'in_progress' || t?.status === 'in-progress' || t?.status === 'In Progress'
  ).length;

  const completedTasks = activeTasks.filter(
    t => t?.status === 'done' || t?.status === 'Done'
  ).length;

  const highPriorityTasks = activeTasks.filter(
    t => (t?.priority === 'high' || t?.priority === 'High') && t?.status !== 'done' && t?.status !== 'Done'
  ).length;

  const overdueTasks = activeTasks.filter(t => {
    const isDone = t?.status === 'done' || t?.status === 'Done';
    if (isDone) return false;

    const dueDateVal = t?.due_date || t?.dueDate;
    if (!dueDateVal) return false;

    let taskDate;
    if (typeof dueDateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dueDateVal)) {
      const [year, month, day] = dueDateVal.split('-').map(Number);
      taskDate = new Date(year, month - 1, day);
    } else {
      taskDate = new Date(dueDateVal);
    }

    if (isNaN(taskDate.getTime())) return false;

    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today;
  }).length;

  const metricCards = [
    {
      title: 'Total Issues',
      value: totalTasks,
      icon: <ListTodo className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      bg: 'bg-indigo-50/60 border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/60',
    },
    {
      title: 'In Progress',
      value: inProgressTasks,
      icon: <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      bg: 'bg-blue-50/60 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/60',
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50/60 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/60',
    },
    {
      title: 'Overdue',
      value: overdueTasks,
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-50/60 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/60',
    },
    {
      title: 'High Severity',
      value: highPriorityTasks,
      icon: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      bg: 'bg-rose-50/60 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/60',
    },
  ];

  return (
    <div className="px-6 pt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in select-none">
      {metricCards.map((card, idx) => (
        <div 
          key={idx}
          className={`p-4 bg-white border ${card.bg} rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md flex flex-col justify-between dark:bg-slate-900 dark:hover:bg-slate-800`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {card.title}
            </span>
            {card.icon}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-700 tracking-tight leading-none dark:text-slate-200">
              {card.value}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
}
