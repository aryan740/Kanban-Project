import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { state, dispatch } = useTasks();
  const isDark = state.theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
      className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all cursor-pointer flex items-center justify-center"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
    </button>
  );
}