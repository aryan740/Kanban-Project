import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { AlertCircle, CheckCircle2, ListTodo, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const { state } = useTasks();
  const tasks = state.tasks || [];

  // Data processing mathematics layers
  const totalTasks = tasks.length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const doneTasks = tasks.filter(t => t.status === 'done' || t.status === 'Done').length;
  
  // Prevent division by zero runtime crash
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const metricCards = [
    {
      title: 'Total Tracked Logs',
      value: totalTasks,
      icon: <ListTodo className="w-4 h-4 text-indigo-600" />,
      bg: 'bg-indigo-50/60 border-indigo-100',
    },
    {
      title: 'Urgency Threshold',
      value: highPriorityTasks,
      icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
      bg: 'bg-rose-50/60 border-rose-100',
      subtitle: 'High Priority items locked',
    },
    {
      title: 'Completed Nodes',
      value: doneTasks,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-50/60 border-emerald-100',
    },
    {
      title: 'Efficiency Vector',
      value: `${completionRate}%`,
      icon: <TrendingUp className="w-4 h-4 text-amber-600" />,
      bg: 'bg-amber-50/60 border-amber-100',
      subtitle: 'Overall execution rate',
    },
  ];

  return (
    <div className="px-6 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in select-none">
      {metricCards.map((card, idx) => (
        <div 
          key={idx}
          className={`p-4 bg-white border ${card.bg} rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {card.title}
            </span>
            {card.icon}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">
              {card.value}
            </h3>
            {card.subtitle && (
              <p className="text-[9px] font-medium text-slate-400 mt-1">
                {card.subtitle}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}