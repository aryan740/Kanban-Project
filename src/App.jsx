import React, { useState } from 'react';
import { useTasks } from './Context/TaskContext';
import Auth from './Components/auth/Auth';
import Header from './Components/layout/Header';
import Board from './Components/layout/Board';
import Modal from './Components/shared/Modal';
import Analytics from './Components/dashboard/Analytics';
import AuditSidebar from './Components/dashboard/AuditSidebar';
import GlobalLogCenter from './Components/dashboard/GlobalLogCenter';

export default function App() {
  const { user, profile, loading } = useTasks();
  const [modalState, setModalState] = useState(null);
  const [activeAuditTask, setActiveAuditTask] = useState(null);
  const [showGeneralLogs, setShowGeneralLogs] = useState(false);

  const handleOpenModal = (task = null) => {
    if (task) {
      setModalState({ mode: 'edit', task });
    } else {
      setModalState({ mode: 'create' });
    }
  };

  // Jab tak initial auth check ya profile hydration chal rahi ho
  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col items-center justify-center gap-3 select-none">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 tracking-wide">
          Loading your workspace...
        </span>
      </div>
    );
  }

  // Agar user signed in nahi hai
  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased flex flex-col relative overflow-hidden">
      {/* Header */}
      <Header 
        onOpenModal={handleOpenModal} 
        onOpenGeneralLogs={() => setShowGeneralLogs(true)} 
      />
      
      {/* Admin Analytics Bar */}
      {profile?.role === 'admin' && <Analytics />}
      
      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <Board onOpenModal={handleOpenModal} onOpenAudit={setActiveAuditTask} />
      </div>

      {/* Task Modal */}
      {modalState && (
        <Modal 
          mode={modalState.mode} 
          taskToEdit={modalState.task} 
          onClose={() => setModalState(null)} 
        />
      )}

      {/* Audit Logs Sidebar */}
      {activeAuditTask && (
        <AuditSidebar 
          task={activeAuditTask} 
          onClose={() => setActiveAuditTask(null)} 
        />
      )}

      {/* General Workspace Retention Modal */}
      <GlobalLogCenter 
        isOpen={showGeneralLogs} 
        onClose={() => setShowGeneralLogs(false)} 
      />
    </div>
  );
}