import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { Laptop, Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { state, dispatch } = useTasks();
  const modes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Laptop },
  ];

  return (
    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800" role="group" aria-label="Theme preference">
      {modes.map(({ value, label, icon }) => {
        const isSelected = state.theme === value;
        const ThemeIcon = icon;
        return <button
          key={value}
          type="button"
          onClick={() => {
            localStorage.setItem('synapse_theme', value);
            dispatch({ type: 'SET_THEME', payload: value });
          }}
          className={`rounded-lg p-1.5 transition-colors ${isSelected ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300' : 'text-slate-500 hover:bg-white hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'}`}
          title={`${label} theme`}
          aria-label={`${label} theme`}
          aria-pressed={isSelected}
        >
          <ThemeIcon className="h-3.5 w-3.5" />
        </button>;
      })}
    </div>
  );
}
