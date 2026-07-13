import React, { useState } from 'react';
import { useTasks } from './context/TaskContext';
import Auth from './components/auth/Auth';
import Header from './components/layout/Header';
import Board from './components/layout/Board';
import Modal from './components/shared/Modal';
import Analytics from './components/dashboard/Analytics';
import AuditSidebar from './components/dashboard/AuditSidebar';
import GlobalLogCenter from './components/dashboard/GlobalLogCenter';

export default function App() {
  const { user, profile, loading } = useTasks();
  const [modalState, setModalState] = useState(null);
  const [activeAuditTask, setActiveAuditTask] = useState(null);
  
  // State hook to toggle the soft-delete retention center modal
  const [showGeneralLogs, setShowGeneralLogs] = useState(false);

  const handleOpenModal = (task = null) => {
    if (task) {
      setModalState({ mode: 'edit', task });
    } else {
      setModalState({ mode: 'create' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase animate-pulse">
          Hydrating Cloud Instance...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased flex flex-col relative overflow-hidden">
      {/* Interactive Layout Header with Retention Center Trigger */}
      <Header 
        onOpenModal={handleOpenModal} 
        onOpenGeneralLogs={() => setShowGeneralLogs(true)} 
      />
      
      {profile?.role === 'admin' && <Analytics />}
      
      <div className="flex-1 overflow-x-auto">
        <Board onOpenModal={handleOpenModal} onOpenAudit={setActiveAuditTask} />
      </div>

      {modalState && (
        <Modal 
          mode={modalState.mode} 
          taskToEdit={modalState.task} 
          onClose={() => setModalState(null)} 
        />
      )}

      {/* Global Right Side System Drawer Viewport Portals */}
      {activeAuditTask && (
        <AuditSidebar 
          task={activeAuditTask} 
          onClose={() => setActiveAuditTask(null)} 
        />
      )}

      {/* General 48-Hour Soft-Delete Retention Modal View */}
      <GlobalLogCenter 
        isOpen={showGeneralLogs} 
        onClose={() => setShowGeneralLogs(false)} 
      />
    </div>
  );
}
