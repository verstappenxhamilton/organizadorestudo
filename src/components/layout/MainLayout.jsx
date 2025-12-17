import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from '../ui/ToastContainer';

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200 font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopHeader onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
             <Outlet />
          </div>
        </main>

        <ToastContainer />
      </div>
    </div>
  );
};
